#!/bin/bash

# Create placeholder pages
pages=(
  "onboarding/HospitalOnboarding"
  "onboarding/OnboardingList"
  "onboarding/OnboardingDetails"
  "hospitals/HospitalList"
  "hospitals/HospitalDetails"
  "patients/PatientList"
  "patients/PatientDetails"
  "patients/PatientRegistration"
  "appointments/AppointmentScheduler"
  "appointments/AppointmentList"
  "billing/BillingDashboard"
  "billing/InvoiceList"
  "billing/PaymentProcessing"
  "inventory/InventoryDashboard"
  "inventory/StockManagement"
  "analytics/AnalyticsDashboard"
  "analytics/Reports"
  "operations/OperationsCenter"
  "operations/AlertsManagement"
)

for page in "${pages[@]}"; do
  dir=$(dirname "src/pages/$page")
  filename=$(basename "$page")
  filepath="src/pages/$page.tsx"
  
  echo "import { FC } from 'react';" > "$filepath"
  echo "const $filename: FC = () => <div className=\"p-4\">$filename - Coming Soon</div>;" >> "$filepath"
  echo "export default $filename;" >> "$filepath"
  
  echo "Created $filepath"
done
