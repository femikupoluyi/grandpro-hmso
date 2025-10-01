import { FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Table, Select } from '../../components/ui';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useApi } from '../../hooks';

interface Application {
  id: string;
  applicationNumber: string;
  hospitalName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  proposedLocation: any;
  proposedBedCapacity: number;
  status: string;
  submittedAt: string;
  evaluationScore?: number;
  documents?: any[];
}

const OnboardingList: FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { loading, execute } = useApi(apiService.onboarding.getApplications);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, currentPage]);

  const fetchApplications = async () => {
    const params: any = {
      page: currentPage,
      limit: 10,
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }

    const response = await execute(params);
    if (response) {
      setApplications(response.applications || []);
      setTotalPages(response.pagination?.pages || 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      DOCUMENTS_REQUESTED: 'bg-orange-100 text-orange-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    
    let colorClass = 'bg-gray-100 text-gray-700';
    if (score >= 70) colorClass = 'bg-green-100 text-green-700';
    else if (score >= 50) colorClass = 'bg-yellow-100 text-yellow-700';
    else colorClass = 'bg-red-100 text-red-700';

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {score}/100
      </span>
    );
  };

  const columns = [
    {
      key: 'applicationNumber',
      header: 'Application #',
      render: (item: Application) => (
        <span className="font-mono text-sm">{item.applicationNumber}</span>
      ),
    },
    {
      key: 'hospitalName',
      header: 'Hospital Name',
      render: (item: Application) => (
        <div>
          <div className="font-semibold">{item.hospitalName}</div>
          <div className="text-xs text-gray-500">{item.contactPerson}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: Application) => (
        <div className="text-sm">
          <div>{item.proposedLocation?.city}</div>
          <div className="text-xs text-gray-500">{item.proposedLocation?.state}</div>
        </div>
      ),
    },
    {
      key: 'bedCapacity',
      header: 'Beds',
      render: (item: Application) => (
        <span className="text-sm">{item.proposedBedCapacity}</span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (item: Application) => (
        <span className="text-sm">{formatDate(item.submittedAt)}</span>
      ),
    },
    {
      key: 'evaluationScore',
      header: 'Score',
      render: (item: Application) => getScoreBadge(item.evaluationScore),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Application) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Application) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/dashboard/onboarding/${item.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'DOCUMENTS_REQUESTED', label: 'Documents Requested' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'WITHDRAWN', label: 'Withdrawn' },
  ];

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'SUBMITTED').length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage hospital applications and onboarding process</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/dashboard/onboarding/new')}
        >
          New Application
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card padding="sm">
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Applications</h2>
            <div className="flex gap-4">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            columns={columns}
            data={applications}
            keyExtractor={(item) => item.id}
            loading={loading}
            emptyMessage="No applications found"
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OnboardingList;
