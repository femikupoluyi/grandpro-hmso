import { FC, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Modal } from '../../components/ui';
import { apiService } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useApi } from '../../hooks';

interface ApplicationDetails {
  id: string;
  applicationNumber: string;
  hospitalName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  proposedLocation: any;
  proposedBedCapacity: number;
  proposedSpecializations: string[];
  businessPlan?: string;
  status: string;
  submittedAt: string;
  evaluationScore?: number;
  evaluationCriteria?: any;
  evaluationNotes?: string;
  documents?: any[];
  hospital?: any;
}

interface OnboardingProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  steps: {
    applicationSubmitted: boolean;
    documentsUploaded: boolean;
    evaluationCompleted: boolean;
    contractGenerated: boolean;
    contractSigned: boolean;
    onboardingComplete: boolean;
  };
}

const OnboardingDetails: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractContent, setContractContent] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  
  const { loading, execute: fetchApplication } = useApi(apiService.onboarding.getApplicationById);
  const { execute: fetchProgress } = useApi(apiService.onboarding.getOnboardingProgress);

  useEffect(() => {
    if (id) {
      loadApplicationData();
    }
  }, [id]);

  const loadApplicationData = async () => {
    const [appResponse, progressResponse] = await Promise.all([
      fetchApplication(id!),
      fetchProgress(id!)
    ]);
    
    if (appResponse) {
      setApplication(appResponse);
    }
    if (progressResponse) {
      setProgress(progressResponse.progress);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !application) return;

    setUploadingDocument(true);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', getDocumentType(file.name));

    try {
      await apiService.onboarding.uploadDocument(application.id, formData);
      await loadApplicationData(); // Refresh data
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const getDocumentType = (fileName: string): string => {
    if (fileName.includes('license')) return 'MEDICAL_LICENSE';
    if (fileName.includes('registration')) return 'BUSINESS_REGISTRATION';
    if (fileName.includes('tax')) return 'TAX_CERTIFICATE';
    if (fileName.includes('plan')) return 'BUSINESS_PLAN';
    return 'OTHER';
  };

  const handleGenerateContract = async () => {
    if (!application) return;

    try {
      const contractData = {
        applicationId: application.id,
        contractType: 'SERVICE_AGREEMENT',
        contractDuration: 1, // 1 year
        contractValue: application.proposedBedCapacity * 1000000, // ₦1M per bed
        commissionRate: 10,
        paymentTerms: 'Monthly',
      };

      const response = await apiService.onboarding.generateContract(contractData);
      
      if (response.data.documentUrl) {
        // Fetch and display contract
        const contractResponse = await fetch(response.data.documentUrl);
        const contractHtml = await contractResponse.text();
        setContractContent(contractHtml);
        setShowContractModal(true);
      }
      
      await loadApplicationData(); // Refresh data
    } catch (error) {
      alert('Failed to generate contract. Please try again.');
    }
  };

  const handleSignContract = async () => {
    if (!application?.hospital?.contracts?.[0]) return;

    setSigningContract(true);
    
    try {
      const signatureData = {
        contractId: application.hospital.contracts[0].id,
        signatureData: btoa(`${application.contactPerson}-${new Date().toISOString()}`), // Base64 encode
        signatoryName: application.contactPerson,
        signatoryRole: 'Hospital Administrator',
        signatoryEmail: application.contactEmail,
      };

      await apiService.onboarding.signContract(signatureData);
      await loadApplicationData(); // Refresh data
      alert('Contract signed successfully!');
      setShowContractModal(false);
    } catch (error) {
      alert('Failed to sign contract. Please try again.');
    } finally {
      setSigningContract(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'text-blue-600 bg-blue-50',
      UNDER_REVIEW: 'text-yellow-600 bg-yellow-50',
      DOCUMENTS_REQUESTED: 'text-orange-600 bg-orange-50',
      APPROVED: 'text-green-600 bg-green-50',
      REJECTED: 'text-red-600 bg-red-50',
      WITHDRAWN: 'text-gray-600 bg-gray-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (loading || !application) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard/onboarding')}>
          ← Back to Applications
        </Button>
      </div>

      {/* Application Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {application.hospitalName}
            </h1>
            <p className="text-gray-600">
              Application #{application.applicationNumber}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(application.status)}`}>
            {application.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Onboarding Progress</h2>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{progress.completedSteps} of {progress.totalSteps} steps completed</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(progress.steps).map(([step, completed]) => (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`w-5 h-5 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {completed && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-semibold">{application.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{application.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{application.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-semibold">{formatDate(application.submittedAt)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Location Details</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="font-semibold">{application.proposedLocation?.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">LGA</p>
                  <p className="font-semibold">{application.proposedLocation?.localGovernment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-semibold">{application.proposedLocation?.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bed Capacity</p>
                  <p className="font-semibold">{application.proposedBedCapacity} beds</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{application.proposedLocation?.address}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Specializations</h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {application.proposedSpecializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Evaluation Score */}
          {application.evaluationScore && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Evaluation Results</h2>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      Overall Score: {application.evaluationScore}/100
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      application.evaluationScore >= 70
                        ? 'bg-green-100 text-green-700'
                        : application.evaluationScore >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {application.evaluationScore >= 70 ? 'Excellent' : application.evaluationScore >= 50 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                
                {application.evaluationCriteria && (
                  <div className="space-y-3">
                    {Object.entries(application.evaluationCriteria).map(([criterion, score]) => (
                      <div key={criterion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{criterion.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>{score as number}/20</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${((score as number) / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {application.evaluationNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{application.evaluationNotes}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">{doc.documentName}</p>
                          <p className="text-xs text-gray-500">{doc.documentType}</p>
                        </div>
                      </div>
                      {doc.isVerified && (
                        <span className="text-green-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded yet</p>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleDocumentUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => fileInputRef.current?.click()}
                loading={uploadingDocument}
                disabled={uploadingDocument}
              >
                Upload Document
              </Button>
            </CardBody>
          </Card>

          {/* Contract Actions */}
          {application.status === 'APPROVED' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Contract</h2>
              </CardHeader>
              <CardBody>
                {application.hospital?.contracts?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium">
                        Contract #{application.hospital.contracts[0].contractNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {application.hospital.contracts[0].status}
                      </p>
                      {application.hospital.contracts[0].contractValue && (
                        <p className="text-sm font-semibold mt-1">
                          Value: {formatCurrency(application.hospital.contracts[0].contractValue)}
                        </p>
                      )}
                    </div>
                    
                    {application.hospital.contracts[0].status === 'DRAFT' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => setShowContractModal(true)}
                      >
                        Review & Sign Contract
                      </Button>
                    )}
                    
                    {application.hospital.contracts[0].status === 'ACTIVE' && (
                      <div className="text-center p-3 bg-green-50 rounded">
                        <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-semibold text-green-700">Contract Active</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">No contract generated yet</p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleGenerateContract}
                    >
                      Generate Contract
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Business Plan */}
          {application.businessPlan && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Business Plan</h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {application.businessPlan}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      <Modal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        title="Service Agreement"
        size="xl"
      >
        <div className="max-h-96 overflow-y-auto mb-6">
          {contractContent ? (
            <div dangerouslySetInnerHTML={{ __html: contractContent }} />
          ) : (
            <p>Loading contract...</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowContractModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSignContract}
            loading={signingContract}
            disabled={signingContract}
          >
            Sign Contract
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OnboardingDetails;
