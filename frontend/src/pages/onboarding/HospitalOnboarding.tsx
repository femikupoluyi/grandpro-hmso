import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/ui';
import { Checkbox } from '../../components/Checkbox';
import { SelectSimple as Select } from '../../components/SelectSimple';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';

// Nigerian states
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const FACILITY_TYPES = [
  'General Hospital',
  'Specialist Hospital',
  'Teaching Hospital',
  'Primary Healthcare Center',
  'Clinic',
  'Diagnostic Center',
  'Maternity Home'
];

const SERVICES_OFFERED = [
  'Emergency Care',
  'Outpatient Services',
  'Inpatient Services',
  'Surgery',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Internal Medicine',
  'Radiology',
  'Laboratory Services',
  'Pharmacy Services',
  'ICU',
  'Dialysis',
  'Oncology',
  'Cardiology',
  'Orthopedics',
  'Dentistry',
  'Ophthalmology',
  'ENT',
  'Physiotherapy',
  'Mental Health'
];

interface ApplicationData {
  // Hospital Information
  hospitalName: string;
  legalName: string;
  registrationNumber: string;
  taxId: string;
  establishedDate: string;
  
  // Contact Information
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  lga: string;
  postalCode: string;
  
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerNin: string;
  
  // Facility Information
  facilityType: string;
  bedCapacity: number;
  staffCount: number;
  servicesOffered: string[];
  specializations: string[];
  hasEmergency: boolean;
  hasPharmacy: boolean;
  hasLaboratory: boolean;
  hasRadiology: boolean;
}

export default function HospitalOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationData>({
    hospitalName: '',
    legalName: '',
    registrationNumber: '',
    taxId: '',
    establishedDate: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    postalCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerNin: '',
    facilityType: '',
    bedCapacity: 0,
    staffCount: 0,
    servicesOffered: [],
    specializations: [],
    hasEmergency: false,
    hasPharmacy: false,
    hasLaboratory: false,
    hasRadiology: false
  });

  const { execute: submitApplication, loading } = useApi(
    apiService.onboarding.submitApplication
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServicesChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.hospitalName || !formData.legalName || !formData.registrationNumber) {
          toast.error('Please fill in all required hospital information');
          return false;
        }
        return true;
      case 2:
        if (!formData.email || !formData.phone || !formData.address || 
            !formData.city || !formData.state || !formData.lga) {
          toast.error('Please fill in all required contact and address information');
          return false;
        }
        // Validate Nigerian phone number
        const phoneRegex = /^(\+234|0)[789]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error('Please enter a valid Nigerian phone number');
          return false;
        }
        return true;
      case 3:
        if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPhone) {
          toast.error('Please fill in all required owner information');
          return false;
        }
        return true;
      case 4:
        if (!formData.facilityType || formData.servicesOffered.length === 0) {
          toast.error('Please select facility type and at least one service');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    const result = await submitApplication(formData);
    
    if (result) {
      toast.success('Application submitted successfully!');
      // Navigate to status page with application number
      navigate(`/onboarding/status/${result.applicationNumber}`, {
        state: { applicationId: result.applicationId }
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Hospital Information</h3>
            
            <Input
              label="Hospital Name"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              required
              placeholder="Enter hospital name"
            />
            
            <Input
              label="Legal Name"
              name="legalName"
              value={formData.legalName}
              onChange={handleInputChange}
              required
              placeholder="Enter legal/registered name"
            />
            
            <Input
              label="CAC Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
              placeholder="RC123456"
            />
            
            <Input
              label="Tax Identification Number"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="TIN (Optional)"
            />
            
            <Input
              label="Established Date"
              name="establishedDate"
              type="date"
              value={formData.establishedDate}
              onChange={handleInputChange}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contact & Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="hospital@example.com"
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+234 XXX XXX XXXX"
              />
              
              <Input
                label="Alternate Phone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                placeholder="+234 XXX XXX XXXX"
              />
              
              <Input
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://www.hospital.com"
              />
            </div>
            
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="123 Hospital Road"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="City name"
              />
              
              <Select
                label="State"
                value={formData.state}
                onChange={(e) => handleSelectChange('state', e.target.value)}
                required
              >
                <option value="">Select State</option>
                {NIGERIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>
              
              <Input
                label="Local Government Area"
                name="lga"
                value={formData.lga}
                onChange={handleInputChange}
                required
                placeholder="LGA name"
              />
              
              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="100001"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
            
            <Input
              label="Owner Full Name"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              required
              placeholder="Dr. John Doe"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Owner Email"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                required
                placeholder="owner@example.com"
              />
              
              <Input
                label="Owner Phone"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                required
                placeholder="+234 XXX XXX XXXX"
              />
            </div>
            
            <Input
              label="National Identification Number (NIN)"
              name="ownerNin"
              value={formData.ownerNin}
              onChange={handleInputChange}
              placeholder="12345678901 (Optional)"
              maxLength={11}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Facility Information</h3>
            
            <Select
              label="Facility Type"
              value={formData.facilityType}
              onChange={(e) => handleSelectChange('facilityType', e.target.value)}
              required
            >
              <option value="">Select Facility Type</option>
              {FACILITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bed Capacity"
                name="bedCapacity"
                type="number"
                value={formData.bedCapacity}
                onChange={handleInputChange}
                placeholder="50"
                min="0"
              />
              
              <Input
                label="Staff Count"
                name="staffCount"
                type="number"
                value={formData.staffCount}
                onChange={handleInputChange}
                placeholder="25"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Available Facilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Checkbox
                  label="Emergency Services"
                  name="hasEmergency"
                  checked={formData.hasEmergency}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Pharmacy"
                  name="hasPharmacy"
                  checked={formData.hasPharmacy}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Laboratory"
                  name="hasLaboratory"
                  checked={formData.hasLaboratory}
                  onChange={handleInputChange}
                />
                <Checkbox
                  label="Radiology/Imaging"
                  name="hasRadiology"
                  checked={formData.hasRadiology}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Services Offered (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {SERVICES_OFFERED.map(service => (
                  <Checkbox
                    key={service}
                    label={service}
                    checked={formData.servicesOffered.includes(service)}
                    onChange={() => handleServicesChange(service)}
                  />
                ))}
              </div>
              {formData.servicesOffered.length > 0 && (
                <p className="text-sm text-gray-600">
                  Selected: {formData.servicesOffered.length} services
                </p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Hospital Onboarding Application</h2>
          <p className="text-gray-600 mb-6">
            Join GrandPro HMSO to transform your hospital operations
          </p>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${currentStep >= step 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`
                        w-full h-1 mx-2
                        ${currentStep > step ? 'bg-primary-600' : 'bg-gray-200'}
                      `}
                      style={{ width: '100px' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-600">Hospital Info</span>
              <span className="text-xs text-gray-600">Contact</span>
              <span className="text-xs text-gray-600">Owner</span>
              <span className="text-xs text-gray-600">Facility</span>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
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
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
