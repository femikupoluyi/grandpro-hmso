import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { FileUpload } from '../../components/FileUpload';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentIcon,
  ExclamationCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface OnboardingStatus {
  id: string;
  applicationNumber: string;
  hospitalName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  progress: {
    currentStage: string;
    overallProgress: number;
  };
  checklist: Array<{
    id: string;
    category: string;
    item: string;
    isRequired: boolean;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    documentName: string;
    uploadedAt: string;
    isVerified: boolean;
    verifiedAt?: string;
  }>;
}

const STAGE_LABELS: { [key: string]: string } = {
  APPLICATION: 'Application Submitted',
  DOCUMENT_SUBMISSION: 'Document Submission',
  EVALUATION: 'Under Evaluation',
  CONTRACT_NEGOTIATION: 'Contract Negotiation',
  CONTRACT_SIGNING: 'Contract Signing',
  SYSTEM_SETUP: 'System Setup',
  TRAINING: 'Staff Training',
  GO_LIVE: 'Go Live Preparation',
  COMPLETED: 'Onboarding Complete'
};

const STATUS_CONFIG = {
  DRAFT: { color: 'gray', icon: ClockIcon, label: 'Draft' },
  SUBMITTED: { color: 'blue', icon: ClockIcon, label: 'Submitted' },
  UNDER_REVIEW: { color: 'yellow', icon: ClockIcon, label: 'Under Review' },
  APPROVED: { color: 'green', icon: CheckCircleIcon, label: 'Approved' },
  REJECTED: { color: 'red', icon: XCircleIcon, label: 'Rejected' },
  WITHDRAWN: { color: 'gray', icon: XCircleIcon, label: 'Withdrawn' }
};

export default function OnboardingStatus() {
  const { applicationNumber } = useParams();
  const location = useLocation();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');

  const { execute: fetchStatus, loading } = useApi(
    () => apiService.onboarding.getApplicationStatus(applicationNumber!)
  );

  const { execute: uploadDocument } = useApi(
    apiService.onboarding.uploadDocument
  );

  useEffect(() => {
    loadStatus();
  }, [applicationNumber]);

  const loadStatus = async () => {
    const result = await fetchStatus();
    if (result) {
      setStatus(result);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!selectedDocType || !status) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', selectedDocType);
    formData.append('documentName', file.name);

    const result = await uploadDocument(status.id, formData);
    if (result) {
      await loadStatus(); // Reload to show new document
      setSelectedDocType('');
    }
    setUploadingDoc(false);
  };

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[status.status];
  const StatusIcon = statusConfig.icon;

  const groupedChecklist = status.checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof status.checklist>);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{status.hospitalName}</h1>
              <p className="text-gray-600">Application #{status.applicationNumber}</p>
              <p className="text-sm text-gray-500 mt-1">
                Submitted: {new Date(status.submittedAt).toLocaleDateString('en-NG')}
              </p>
            </div>
            <div className="text-right">
              <Badge color={statusConfig.color as any} size="lg">
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig.label}
              </Badge>
              {status.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg max-w-xs">
                  <p className="text-sm text-red-800">
                    <strong>Reason:</strong> {status.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Onboarding Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {STAGE_LABELS[status.progress.currentStage]}
                </span>
                <span className="text-sm text-gray-600">
                  {status.progress.overallProgress}%
                </span>
              </div>
              <ProgressBar value={status.progress.overallProgress} />
            </div>
            
            {/* Stage Timeline */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {Object.entries(STAGE_LABELS).slice(0, -1).map(([stage, label], index) => {
                  const stageIndex = Object.keys(STAGE_LABELS).indexOf(stage);
                  const currentIndex = Object.keys(STAGE_LABELS).indexOf(status.progress.currentStage);
                  const isCompleted = stageIndex < currentIndex;
                  const isCurrent = stageIndex === currentIndex;
                  
                  return (
                    <div key={stage} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs
                            ${isCompleted ? 'bg-green-500 text-white' : 
                              isCurrent ? 'bg-primary-500 text-white' : 
                              'bg-gray-200 text-gray-600'}
                          `}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <span className="text-xs text-center mt-1 absolute -bottom-5 whitespace-nowrap">
                          {label.split(' ')[0]}
                        </span>
                      </div>
                      {index < Object.keys(STAGE_LABELS).length - 2 && (
                        <div
                          className={`
                            absolute top-4 left-8 right-0 h-0.5
                            ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                          `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Section */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            
            {/* Document Upload */}
            {status.status === 'SUBMITTED' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <select
                  className="w-full p-2 border rounded-lg mb-2"
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                >
                  <option value="">Select Document Type</option>
                  <option value="LICENSE">Medical License</option>
                  <option value="REGISTRATION">CAC Registration</option>
                  <option value="TAX_CERTIFICATE">Tax Certificate</option>
                  <option value="INSURANCE">Insurance Certificate</option>
                  <option value="FACILITY_PHOTOS">Facility Photos</option>
                  <option value="OWNERSHIP_PROOF">Ownership Proof</option>
                  <option value="STAFF_CREDENTIALS">Staff Credentials</option>
                  <option value="OTHER">Other</option>
                </select>
                {selectedDocType && (
                  <FileUpload
                    onUpload={handleDocumentUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    maxSize={10}
                    loading={uploadingDoc}
                  />
                )}
              </div>
            )}
            
            {/* Document List */}
            <div className="space-y-2">
              {status.documents.length > 0 ? (
                status.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <DocumentIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{doc.documentName}</p>
                        <p className="text-xs text-gray-500">
                          {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {doc.isVerified ? (
                      <Badge color="green" size="sm">Verified</Badge>
                    ) : (
                      <Badge color="yellow" size="sm">Pending</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
              )}
            </div>
          </div>
        </Card>

        {/* Checklist Section */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Onboarding Checklist</h2>
            <div className="space-y-4">
              {Object.entries(groupedChecklist).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          {item.isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded mr-2" />
                          )}
                          <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {item.item}
                            {item.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </span>
                        </div>
                        {item.completedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      {status.status === 'APPROVED' && status.progress.currentStage === 'CONTRACT_SIGNING' && (
        <Card className="mt-6">
          <div className="p-6 text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Action Required</h3>
            <p className="text-gray-600 mb-4">
              Your application has been approved! Please review and sign the partnership agreement.
            </p>
            <Button
              onClick={() => window.location.href = `/contracts/sign/${status.applicationNumber}`}
              className="bg-green-600 hover:bg-green-700"
            >
              Review & Sign Contract
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
