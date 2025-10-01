export class ContractTemplateService {
  /**
   * Generate HTML contract template
   */
  static generateHTMLContract(data: {
    contract: any;
    hospital: any;
    application: any;
  }): string {
    const { contract, hospital, application } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Agreement - ${contract.contractNumber}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.8;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px double #2c5530;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2c5530;
      margin-bottom: 10px;
    }
    h1 {
      color: #2c5530;
      font-size: 28px;
      margin: 20px 0;
    }
    h2 {
      color: #2c5530;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 1px solid #2c5530;
      padding-bottom: 5px;
    }
    .contract-info {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
    }
    .party {
      width: 45%;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .party h3 {
      color: #2c5530;
      margin-top: 0;
    }
    .terms {
      margin: 30px 0;
    }
    .terms table {
      width: 100%;
      border-collapse: collapse;
    }
    .terms td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .terms td:first-child {
      font-weight: bold;
      width: 40%;
      color: #555;
    }
    .services {
      margin: 30px 0;
    }
    .services ul {
      list-style-type: none;
      padding: 0;
    }
    .services li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .services li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #2c5530;
      font-weight: bold;
    }
    .obligations {
      margin: 30px 0;
    }
    .obligations ol {
      padding-left: 30px;
    }
    .obligations li {
      margin: 10px 0;
    }
    .payment-schedule {
      margin: 30px 0;
    }
    .payment-schedule table {
      width: 100%;
      border-collapse: collapse;
    }
    .payment-schedule th {
      background: #2c5530;
      color: white;
      padding: 10px;
      text-align: left;
    }
    .payment-schedule td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    .signatures {
      margin-top: 60px;
      page-break-inside: avoid;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
    }
    .signature-box {
      width: 45%;
    }
    .signature-line {
      border-top: 2px solid #333;
      margin: 50px 0 10px 0;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
    .seal-box {
      width: 150px;
      height: 150px;
      border: 2px solid #2c5530;
      border-radius: 50%;
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #2c5530;
    }
    @media print {
      body { margin: 0; }
      .header { page-break-after: avoid; }
      .signatures { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">GRANDPRO HMSO</div>
    <h1>HOSPITAL MANAGEMENT SERVICE AGREEMENT</h1>
    <div class="contract-info">
      <strong>Contract Number:</strong> ${contract.contractNumber}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString('en-NG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>SERVICE PROVIDER</h3>
      <p>
        <strong>GrandPro Hospital Management Services Organization</strong><br>
        Victoria Island, Lagos<br>
        Federal Republic of Nigeria<br>
        RC: 1234567<br>
        Email: contracts@grandprohmso.com<br>
        Phone: +234 800 GRANDPRO
      </p>
    </div>
    <div class="party">
      <h3>HOSPITAL</h3>
      <p>
        <strong>${hospital.name}</strong><br>
        ${hospital.addressLine1}<br>
        ${hospital.city}, ${hospital.state}<br>
        ${hospital.country}<br>
        Email: ${hospital.email}<br>
        Phone: ${hospital.phoneNumber}
      </p>
    </div>
  </div>

  <h2>RECITALS</h2>
  <p>
    WHEREAS, GrandPro HMSO is engaged in the business of providing comprehensive hospital 
    management services, technology solutions, and operational support to healthcare facilities 
    across Nigeria;
  </p>
  <p>
    WHEREAS, the Hospital desires to engage GrandPro HMSO to provide hospital management 
    services, systems, and expertise to enhance operational efficiency and patient care quality;
  </p>
  <p>
    NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, 
    and for other good and valuable consideration, the parties agree as follows:
  </p>

  <h2>1. TERM OF AGREEMENT</h2>
  <div class="terms">
    <table>
      <tr>
        <td>Contract Duration:</td>
        <td>${Math.floor((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} Year(s)</td>
      </tr>
      <tr>
        <td>Commencement Date:</td>
        <td>${new Date(contract.startDate).toLocaleDateString('en-NG')}</td>
      </tr>
      <tr>
        <td>Expiration Date:</td>
        <td>${new Date(contract.endDate).toLocaleDateString('en-NG')}</td>
      </tr>
      <tr>
        <td>Renewal Notice Period:</td>
        <td>60 days before expiration</td>
      </tr>
    </table>
  </div>

  <h2>2. SERVICES PROVIDED</h2>
  <div class="services">
    <p>GrandPro HMSO shall provide the following services to the Hospital:</p>
    <ul>
      <li>Hospital Management System (HMS) Software License and Access</li>
      <li>Electronic Medical Records (EMR) System Implementation and Management</li>
      <li>Patient Registration and Management System</li>
      <li>Billing, Insurance, and Revenue Cycle Management</li>
      <li>Pharmacy and Inventory Management System</li>
      <li>Laboratory Information Management System (LIMS)</li>
      <li>Human Resources and Payroll Management</li>
      <li>Financial Accounting and Reporting Systems</li>
      <li>Business Intelligence and Analytics Dashboard</li>
      <li>Telemedicine Platform Integration</li>
      <li>24/7 Technical Support and System Maintenance</li>
      <li>Staff Training and Continuous Education Programs</li>
      <li>Regulatory Compliance Support (NHIS, HMO, etc.)</li>
      <li>Quality Assurance and Accreditation Support</li>
      <li>Marketing and Patient Acquisition Services</li>
    </ul>
  </div>

  <h2>3. FINANCIAL TERMS</h2>
  <div class="terms">
    <table>
      <tr>
        <td>Total Contract Value:</td>
        <td>₦${Number(contract.contractValue).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Payment Terms:</td>
        <td>${contract.paymentTerms || 'Monthly in arrears'}</td>
      </tr>
      ${contract.commissionRate ? `
      <tr>
        <td>Commission Rate:</td>
        <td>${contract.commissionRate}% of gross revenue</td>
      </tr>
      ` : ''}
      ${contract.revenueShareRate ? `
      <tr>
        <td>Revenue Share:</td>
        <td>${contract.revenueShareRate}% of net revenue</td>
      </tr>
      ` : ''}
      <tr>
        <td>Setup Fee:</td>
        <td>₦${(Number(contract.contractValue) * 0.1).toLocaleString('en-NG', { minimumFractionDigits: 2 })} (One-time)</td>
      </tr>
      <tr>
        <td>Late Payment Penalty:</td>
        <td>1.5% per month on outstanding balance</td>
      </tr>
    </table>
  </div>

  <h2>4. PAYMENT SCHEDULE</h2>
  <div class="payment-schedule">
    <table>
      <thead>
        <tr>
          <th>Payment Milestone</th>
          <th>Due Date</th>
          <th>Amount (₦)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Initial Setup Fee</td>
          <td>Upon Contract Signing</td>
          <td>${(Number(contract.contractValue) * 0.1).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>Monthly Service Fee</td>
          <td>5th of Each Month</td>
          <td>${(Number(contract.contractValue) * 0.9 / 12).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>5. HOSPITAL INFORMATION</h2>
  <div class="terms">
    <table>
      <tr>
        <td>Bed Capacity:</td>
        <td>${hospital.bedCapacity || application.proposedBedCapacity || 'To be determined'}</td>
      </tr>
      <tr>
        <td>Specializations:</td>
        <td>${(hospital.specializations || application.proposedSpecializations || []).join(', ') || 'General Medicine'}</td>
      </tr>
      <tr>
        <td>Contact Person:</td>
        <td>${application.contactPerson}</td>
      </tr>
      <tr>
        <td>Location:</td>
        <td>${hospital.city}, ${hospital.state}</td>
      </tr>
    </table>
  </div>

  <h2>6. OBLIGATIONS OF GRANDPRO HMSO</h2>
  <div class="obligations">
    <ol>
      <li>Provide and maintain the hospital management software platform with 99.5% uptime SLA</li>
      <li>Ensure data security and compliance with Nigerian Data Protection Regulation (NDPR)</li>
      <li>Provide initial training for up to 20 hospital staff members</li>
      <li>Offer continuous technical support through phone, email, and on-site visits</li>
      <li>Perform regular system updates and security patches</li>
      <li>Maintain data backups with disaster recovery capabilities</li>
      <li>Provide monthly performance and analytics reports</li>
      <li>Assist with regulatory compliance and reporting requirements</li>
    </ol>
  </div>

  <h2>7. OBLIGATIONS OF THE HOSPITAL</h2>
  <div class="obligations">
    <ol>
      <li>Provide accurate and complete information for system setup</li>
      <li>Ensure staff participation in training programs</li>
      <li>Maintain necessary IT infrastructure (computers, internet connectivity)</li>
      <li>Comply with system usage policies and security protocols</li>
      <li>Make timely payments as per the agreed schedule</li>
      <li>Provide feedback for continuous improvement</li>
      <li>Maintain appropriate licenses and regulatory compliance</li>
      <li>Cooperate with GrandPro HMSO for system audits and assessments</li>
    </ol>
  </div>

  <h2>8. CONFIDENTIALITY</h2>
  <p>
    Both parties agree to maintain strict confidentiality regarding all proprietary information, 
    patient data, business strategies, and trade secrets shared during the term of this agreement. 
    This obligation shall survive the termination of this agreement for a period of five (5) years.
  </p>

  <h2>9. DATA PROTECTION AND PRIVACY</h2>
  <p>
    The parties shall comply with all applicable data protection laws including the Nigeria Data 
    Protection Regulation (NDPR) 2019. Patient data shall be processed only for the purposes of 
    providing the agreed services and shall not be shared with third parties without explicit consent.
  </p>

  <h2>10. INTELLECTUAL PROPERTY</h2>
  <p>
    All intellectual property rights in the hospital management system and related software remain 
    the exclusive property of GrandPro HMSO. The Hospital is granted a non-exclusive, 
    non-transferable license to use the system during the term of this agreement.
  </p>

  <h2>11. TERMINATION</h2>
  <p>
    Either party may terminate this agreement by providing sixty (60) days written notice. 
    Immediate termination may occur in cases of material breach, insolvency, or violation of law. 
    Upon termination, the Hospital's data shall be made available for export for a period of 
    ninety (90) days.
  </p>

  <h2>12. DISPUTE RESOLUTION</h2>
  <p>
    Any dispute arising from this agreement shall first be resolved through good faith negotiations. 
    If unsuccessful, the dispute shall be submitted to arbitration under the Arbitration and 
    Conciliation Act of Nigeria. The arbitration shall be conducted in Lagos, Nigeria.
  </p>

  <h2>13. GOVERNING LAW</h2>
  <p>
    This agreement shall be governed by and construed in accordance with the laws of the 
    Federal Republic of Nigeria.
  </p>

  <h2>14. ENTIRE AGREEMENT</h2>
  <p>
    This agreement constitutes the entire agreement between the parties and supersedes all prior 
    negotiations, representations, and agreements relating to its subject matter.
  </p>

  <div class="signatures">
    <h2>IN WITNESS WHEREOF</h2>
    <p>
      The parties have executed this Agreement as of the date first written above.
    </p>
    
    <div class="signature-section">
      <div class="signature-box">
        <h3>FOR GRANDPRO HMSO:</h3>
        <div class="signature-line"></div>
        <p>
          <strong>Name:</strong> _______________________<br>
          <strong>Title:</strong> Chief Executive Officer<br>
          <strong>Date:</strong> _______________________
        </p>
        <div class="seal-box">SEAL</div>
      </div>
      
      <div class="signature-box">
        <h3>FOR ${hospital.name.toUpperCase()}:</h3>
        <div class="signature-line"></div>
        <p>
          <strong>Name:</strong> _______________________<br>
          <strong>Title:</strong> _______________________<br>
          <strong>Date:</strong> _______________________
        </p>
        <div class="seal-box">SEAL</div>
      </div>
    </div>
    
    <div style="margin-top: 50px;">
      <h3>WITNESSES:</h3>
      <div class="signature-section">
        <div class="signature-box">
          <p><strong>Witness 1:</strong></p>
          <div class="signature-line"></div>
          <p>
            <strong>Name:</strong> _______________________<br>
            <strong>Address:</strong> _______________________<br>
            <strong>Date:</strong> _______________________
          </p>
        </div>
        
        <div class="signature-box">
          <p><strong>Witness 2:</strong></p>
          <div class="signature-line"></div>
          <p>
            <strong>Name:</strong> _______________________<br>
            <strong>Address:</strong> _______________________<br>
            <strong>Date:</strong> _______________________
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>
      This is a legally binding contract. Please ensure all parties have read and understood 
      all terms before signing.
    </p>
    <p>
      GrandPro HMSO | Transforming Healthcare Management in Nigeria<br>
      Contract Reference: ${contract.contractNumber} | Generated: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate PDF contract (placeholder - would use a PDF library in production)
   */
  static async generatePDFContract(htmlContent: string): Promise<Buffer> {
    // In production, you would use a library like puppeteer or pdfkit
    // For now, return a placeholder
    return Buffer.from('PDF contract would be generated here');
  }
}
