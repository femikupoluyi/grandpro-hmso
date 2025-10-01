# GrandPro HMSO Platform

## Tech-Driven Hospital Management Platform

GrandPro HMSO is a comprehensive, modular, secure, and scalable platform that enables GrandPro HMSO to recruit and manage hospitals, run daily operations, engage owners and patients, integrate with partners, and provide real-time oversight and analytics.

## 🏥 Project Overview

This platform is designed specifically for the Nigerian healthcare context, supporting local currencies (NGN), time zones (Africa/Lagos), and healthcare systems (NHIS, HMOs).

## 📋 Modules

### 1. Digital Sourcing & Partner Onboarding
- Web portal for hospital applications
- Automated evaluation and scoring
- Digital contract generation and signing
- Onboarding progress tracking

### 2. CRM & Relationship Management
- Owner CRM for contracts and payouts
- Patient CRM for appointments and feedback
- Integrated communication (WhatsApp, SMS, Email)
- Loyalty programs

### 3. Hospital Management (Core Operations)
- Electronic Medical Records (EMR)
- Billing and revenue management
- Inventory management
- HR and staff rostering
- Real-time analytics

### 4. Centralized Operations & Development
- Operations Command Centre
- Real-time monitoring across hospitals
- Alert system for anomalies
- Project management for expansions

### 5. Partner & Ecosystem Integrations
- Insurance and HMO integration
- Pharmacy and supplier integration
- Telemedicine capabilities
- Government and NGO reporting

### 6. Data & Analytics
- Centralized data lake
- Predictive analytics
- AI/ML capabilities (triage, fraud detection, risk scoring)

### 7. Security & Compliance
- HIPAA/GDPR compliant
- End-to-end encryption
- Role-based access control
- Disaster recovery

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **API**: RESTful APIs

### Frontend
- **Framework**: React with Vite
- **UI Library**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM

### Infrastructure
- **Database**: Neon PostgreSQL
- **Version Control**: GitHub
- **Environment**: Docker-ready

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- PostgreSQL (Neon account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/femiorokun/grandpro-hmso-new.git
cd grandpro-hmso-new
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
- Copy `.env.example` to `.env` in both backend and frontend directories
- Configure database connection and other settings

5. Run database migrations:
```bash
cd backend
npm run migrate
```

6. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
grandpro-hmso-new/
├── backend/              # Backend API server
│   ├── src/             # Source code
│   ├── migrations/      # Database migrations
│   └── tests/          # Test files
├── frontend/            # React frontend application
│   ├── src/            # Source code
│   └── public/         # Static assets
├── shared/             # Shared utilities and types
├── docs/               # Documentation
└── scripts/            # Utility scripts
```

## 🔒 Security

- All data is encrypted at rest and in transit
- Role-based access control implemented
- Regular security audits
- HIPAA/GDPR compliant architecture

## 📊 Nigerian Context

The platform is specifically configured for Nigerian operations:
- Currency: Nigerian Naira (₦)
- Time Zone: Africa/Lagos
- Phone format: +234 validation
- NHIS integration ready
- Support for Nigerian states and LGAs

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

Developed for GrandPro HMSO by Femi Orokun

## 📞 Support

For support, please contact the development team.

---

© 2025 GrandPro HMSO. All rights reserved.
