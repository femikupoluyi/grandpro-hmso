import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));

// Dashboard pages
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));

// Module pages
const HospitalOnboarding = lazy(() => import('../pages/onboarding/HospitalOnboarding'));
const OnboardingList = lazy(() => import('../pages/onboarding/OnboardingList'));
const OnboardingDetails = lazy(() => import('../pages/onboarding/OnboardingDetails'));

const HospitalList = lazy(() => import('../pages/hospitals/HospitalList'));
const HospitalDetails = lazy(() => import('../pages/hospitals/HospitalDetails'));

const PatientList = lazy(() => import('../pages/patients/PatientList'));
const PatientDetails = lazy(() => import('../pages/patients/PatientDetails'));
const PatientRegistration = lazy(() => import('../pages/patients/PatientRegistration'));

const AppointmentScheduler = lazy(() => import('../pages/appointments/AppointmentScheduler'));
const AppointmentList = lazy(() => import('../pages/appointments/AppointmentList'));

const BillingDashboard = lazy(() => import('../pages/billing/BillingDashboard'));
const InvoiceList = lazy(() => import('../pages/billing/InvoiceList'));
const PaymentProcessing = lazy(() => import('../pages/billing/PaymentProcessing'));

const InventoryDashboard = lazy(() => import('../pages/inventory/InventoryDashboard'));
const StockManagement = lazy(() => import('../pages/inventory/StockManagement'));

const AnalyticsDashboard = lazy(() => import('../pages/analytics/AnalyticsDashboard'));
const Reports = lazy(() => import('../pages/analytics/Reports'));

const OperationsCenter = lazy(() => import('../pages/operations/OperationsCenter'));
const AlertsManagement = lazy(() => import('../pages/operations/AlertsManagement'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardHome />
          </Suspense>
        ),
      },
      {
        path: 'onboarding',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <OnboardingList />
              </Suspense>
            ),
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <HospitalOnboarding />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <OnboardingDetails />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'hospitals',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <HospitalList />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <HospitalDetails />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'patients',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PatientList />
              </Suspense>
            ),
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PatientRegistration />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PatientDetails />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'appointments',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AppointmentList />
              </Suspense>
            ),
          },
          {
            path: 'schedule',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AppointmentScheduler />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'billing',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BillingDashboard />
              </Suspense>
            ),
          },
          {
            path: 'invoices',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InvoiceList />
              </Suspense>
            ),
          },
          {
            path: 'payments',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <PaymentProcessing />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <InventoryDashboard />
              </Suspense>
            ),
          },
          {
            path: 'stock',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <StockManagement />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AnalyticsDashboard />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <Reports />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'operations',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <OperationsCenter />
              </Suspense>
            ),
          },
          {
            path: 'alerts',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AlertsManagement />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
