import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Card, CardHeader, CardBody } from '../../components/ui';
import { apiService } from '../../services/api';
import { config } from '../../config';
import { validatePhoneNumber, validateEmail } from '../../utils/validators';
import { formatPhoneNumber } from '../../utils/formatters';

interface ApplicationForm {
  hospitalName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  state: string;
  localGovernment: string;
  city: string;
  address: string;
  proposedBedCapacity: string;
  specializations: string[];
  businessPlan: string;
}

const HospitalOnboarding: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<ApplicationForm>({
    hospitalName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    state: '',
    localGovernment: '',
    city: '',
    address: '',
    proposedBedCapacity: '',
    specializations: [],
    businessPlan: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<ApplicationForm>>({});

  const nigerianStates = config.nigerianStates;

  const specializationOptions = [
    'General Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Internal Medicine',
    'Orthopedics',
    'Cardiology',
    'Neurology',
    'Psychiatry',
    'Radiology',
    'Anesthesiology',
    'Emergency Medicine',
    'Family Medicine',
    'Ophthalmology',
    'ENT (Ear, Nose, Throat)',
    'Dermatology',
    'Urology',
    'Oncology',
  ];

  const localGovernments: Record<string, string[]> = {
    'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
    'FCT': ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
    'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
    // Add more states and LGAs as needed
  };

  const validateStep = (step: number): boolean => {
    const errors: Partial<ApplicationForm> = {};
    
    if (step === 1) {
      if (!formData.hospitalName) errors.hospitalName = 'Hospital name is required';
      if (!formData.contactPerson) errors.contactPerson = 'Contact person is required';
      if (!formData.contactEmail) {
        errors.contactEmail = 'Email is required';
      } else if (!validateEmail(formData.contactEmail)) {
        errors.contactEmail = 'Invalid email format';
      }
      if (!formData.contactPhone) {
        errors.contactPhone = 'Phone number is required';
      } else if (!validatePhoneNumber(formData.contactPhone)) {
        errors.contactPhone = 'Invalid Nigerian phone number';
      }
    }
    
    if (step === 2) {
      if (!formData.state) errors.state = 'State is required';
      if (!formData.localGovernment) errors.localGovernment = 'Local government is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.address) errors.address = 'Address is required';
    }
    
    if (step === 3) {
      if (!formData.proposedBedCapacity) {
        errors.proposedBedCapacity = 'Bed capacity is required';
      } else if (parseInt(formData.proposedBedCapacity) < 5) {
        errors.proposedBedCapacity = 'Minimum bed capacity is 5';
      }
      if (formData.specializations.length === 0) {
        errors.specializations = ['At least one specialization is required'];
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !validateStep(4)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const applicationData = {
        hospitalName: formData.hospitalName,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        proposedLocation: {
          state: formData.state,
          localGovernment: formData.localGovernment,
          city: formData.city,
          address: formData.address,
        },
        proposedBedCapacity: parseInt(formData.proposedBedCapacity),
        proposedSpecializations: formData.specializations,
        businessPlan: formData.businessPlan,
      };

      const response = await apiService.onboarding.submitApplication(applicationData);
      
      if (response.data.application) {
        setSuccess(true);
        // Store application ID for tracking
        localStorage.setItem('applicationId', response.data.application.id);
        localStorage.setItem('applicationNumber', response.data.application.applicationNumber);
        
        // Redirect to progress page after 3 seconds
        setTimeout(() => {
          navigate(`/dashboard/onboarding/${response.data.application.id}`);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your application has been received and is under review.
              </p>
              <p className="text-sm text-gray-500">
                Application Number: <span className="font-mono font-bold">{localStorage.getItem('applicationNumber')}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to your application dashboard...
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hospital Onboarding Application
        </h1>
        <p className="text-gray-600">
          Join the GrandPro HMSO network and transform your healthcare delivery
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 ${step < 4 ? 'border-t-2' : ''} ${
                step <= currentStep ? 'border-primary-500' : 'border-gray-300'
              }`}
            >
              <div className="relative -mt-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600">
                    {step === 1 && 'Contact Info'}
                    {step === 2 && 'Location'}
                    {step === 3 && 'Facility Details'}
                    {step === 4 && 'Business Plan'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {currentStep === 1 && 'Contact Information'}
            {currentStep === 2 && 'Hospital Location'}
            {currentStep === 3 && 'Facility Details'}
            {currentStep === 4 && 'Business Plan'}
          </h2>
        </CardHeader>
        <CardBody>
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Hospital Name"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                error={validationErrors.hospitalName}
                required
              />
              <Input
                label="Contact Person"
                placeholder="Full name of primary contact"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                error={validationErrors.contactPerson}
                required
              />
              <Input
                type="email"
                label="Contact Email"
                placeholder="email@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                error={validationErrors.contactEmail}
                required
              />
              <Input
                type="tel"
                label="Contact Phone"
                placeholder="+234 XXX XXX XXXX"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                error={validationErrors.contactPhone}
                helpText="Nigerian phone number format: +234XXXXXXXXXX or 0XXXXXXXXXX"
                required
              />
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Select
                label="State"
                options={nigerianStates.map(state => ({ value: state, label: state }))}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, localGovernment: '' })}
                error={validationErrors.state}
                required
              />
              {formData.state && localGovernments[formData.state] && (
                <Select
                  label="Local Government Area"
                  options={localGovernments[formData.state].map(lga => ({ value: lga, label: lga }))}
                  value={formData.localGovernment}
                  onChange={(e) => setFormData({ ...formData, localGovernment: e.target.value })}
                  error={validationErrors.localGovernment}
                  required
                />
              )}
              <Input
                label="City"
                placeholder="Enter city name"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={validationErrors.city}
                required
              />
              <Input
                label="Street Address"
                placeholder="Enter full street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                error={validationErrors.address}
                required
              />
            </div>
          )}

          {/* Step 3: Facility Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Input
                type="number"
                label="Proposed Bed Capacity"
                placeholder="Minimum 5 beds"
                value={formData.proposedBedCapacity}
                onChange={(e) => setFormData({ ...formData, proposedBedCapacity: e.target.value })}
                error={validationErrors.proposedBedCapacity}
                helpText="Enter the total number of beds in your facility"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.specializations && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.specializations[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Business Plan */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Plan & Vision
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={8}
                  placeholder="Describe your hospital's vision, services, target market, financial projections, and how you plan to serve your community..."
                  value={formData.businessPlan}
                  onChange={(e) => setFormData({ ...formData, businessPlan: e.target.value })}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Provide a brief overview of your business plan (minimum 100 characters)
                </p>
                {formData.businessPlan && formData.businessPlan.length < 100 && (
                  <p className="mt-1 text-sm text-amber-600">
                    {100 - formData.businessPlan.length} more characters needed
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < 4 ? (
              <Button variant="primary" onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading || formData.businessPlan.length < 100}
              >
                Submit Application
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Information Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Your application will be reviewed within 48 hours</li>
          <li>• You'll receive an email with your application status</li>
          <li>• If approved, you'll be invited to upload supporting documents</li>
          <li>• Contract generation and signing process will follow</li>
          <li>• Full onboarding typically completes within 7-10 business days</li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalOnboarding;
