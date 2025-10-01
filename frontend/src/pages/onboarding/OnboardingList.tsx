import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/ui';
import { Table } from '../../components/Table';
import { SelectSimple as Select } from '../../components/SelectSimple';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  applicationNumber: string;
  hospitalName: string;
  state: string;
  city: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  submittedAt: string;
  evaluationScores: Array<{ totalScore: number }>;
  progress: {
    currentStage: string;
    overallProgress: number;
  };
  _count: {
    documents: number;
    checklists: number;
  };
}

const STATUS_COLORS = {
  DRAFT: 'gray',
  SUBMITTED: 'blue',
  UNDER_REVIEW: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'gray'
};

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function OnboardingList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    state: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  const { execute: fetchApplications, loading } = useApi(
    apiService.onboarding.getApplications
  );

  const { execute: updateStatus } = useApi(
    apiService.onboarding.updateApplicationStatus
  );

  const { execute: exportApplications } = useApi(
    apiService.onboarding.exportApplications
  );

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    const result = await fetchApplications(filters);
    if (result) {
      setApplications(result.data);
      setPagination(result.pagination);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleStatusUpdate = async (id: string, newStatus: string, reason?: string) => {
    const result = await updateStatus(id, { status: newStatus, reason });
    if (result) {
      await loadApplications();
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    await exportApplications(format, filters);
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedApplications.length === applications.length && applications.length > 0}
          onChange={handleSelectAll}
          className="rounded"
        />
      ),
      render: (app: Application) => (
        <input
          type="checkbox"
          checked={selectedApplications.includes(app.id)}
          onChange={() => handleSelectApplication(app.id)}
          className="rounded"
        />
      )
    },
    {
      key: 'applicationNumber',
      header: 'Application #',
      render: (app: Application) => (
        <span className="font-mono text-sm">{app.applicationNumber}</span>
      )
    },
    {
      key: 'hospitalName',
      header: 'Hospital',
      render: (app: Application) => (
        <div>
          <p className="font-medium">{app.hospitalName}</p>
          <p className="text-xs text-gray-500">{app.city}, {app.state}</p>
        </div>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (app: Application) => (
        <div>
          <p className="text-sm">{app.ownerName}</p>
          <p className="text-xs text-gray-500">{app.ownerEmail}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: Application) => (
        <Badge color={STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] as any}>
          {app.status}
        </Badge>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (app: Application) => (
        <div className="w-20">
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${app.progress.overallProgress}%` }}
              />
            </div>
            <span className="ml-2 text-xs text-gray-600">
              {app.progress.overallProgress}%
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'evaluation',
      header: 'Score',
      render: (app: Application) => {
        const score = app.evaluationScores[0]?.totalScore;
        if (!score) return <span className="text-gray-400">-</span>;
        
        const color = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{score.toFixed(1)}</span>;
      }
    },
    {
      key: 'documents',
      header: 'Docs',
      render: (app: Application) => (
        <span className="text-sm">{app._count.documents}</span>
      )
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (app: Application) => (
        <span className="text-sm">
          {new Date(app.submittedAt).toLocaleDateString('en-NG')}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (app: Application) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/onboarding/applications/${app.id}`)}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {app.status === 'SUBMITTED' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const reason = prompt('Rejection reason:');
                  if (reason) handleStatusUpdate(app.id, 'REJECTED', reason);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hospital Onboarding Applications</h1>
            <p className="text-gray-600 mt-1">Manage and review hospital applications</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="relative group">
              <Button variant="outline">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <Button
              onClick={() => navigate('/onboarding/apply')}
              className="bg-primary-600 hover:bg-primary-700"
            >
              New Application
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <option value="">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
              <Select
                value={filters.state}
                onChange={(value) => handleFilterChange('state', value)}
              >
                <option value="">All States</option>
                {NIGERIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  state: '',
                  page: 1,
                  limit: 10
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={applications}
          loading={loading}
          emptyMessage="No applications found"
        />
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={filters.page}
              totalPages={pagination.pages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          </div>
        )}
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedApplications.length} application(s) selected
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setSelectedApplications([])}>
                Clear Selection
              </Button>
              <Button
                onClick={() => {
                  // Implement bulk approve
                  console.log('Bulk approve:', selectedApplications);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Bulk Approve
              </Button>
              <Button
                onClick={() => {
                  // Implement bulk reject
                  console.log('Bulk reject:', selectedApplications);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Bulk Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
