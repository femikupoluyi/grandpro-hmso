import { FC } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../config';

const LandingPage: FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to {config.app.name}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              A comprehensive, modular, and scalable hospital management platform
              transforming healthcare delivery across Nigeria 🇳🇬
            </p>
            <div className="space-x-4">
              <Link
                to="/auth/register"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
              <Link
                to="/auth/login"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏥',
                title: 'Digital Sourcing',
                description: 'Streamlined hospital onboarding with automated evaluation and digital contracts',
              },
              {
                icon: '👥',
                title: 'CRM & Relationships',
                description: 'Comprehensive management of owner and patient relationships',
              },
              {
                icon: '📋',
                title: 'Hospital Management',
                description: 'Complete EMR, billing, inventory, and HR management',
              },
              {
                icon: '🎛️',
                title: 'Operations Center',
                description: 'Real-time monitoring and alerts across all facilities',
              },
              {
                icon: '🤝',
                title: 'Partner Integration',
                description: 'Seamless integration with insurance, suppliers, and telemedicine',
              },
              {
                icon: '📊',
                title: 'Analytics & AI',
                description: 'Predictive analytics and AI-powered insights',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nigerian Context Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Nigeria 🇳🇬
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">{config.locale.currencySymbol}</div>
              <p className="font-semibold">Nigerian Naira</p>
              <p className="text-sm text-gray-600">Native currency support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏛️</div>
              <p className="font-semibold">NHIS Integration</p>
              <p className="text-sm text-gray-600">Government health insurance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-semibold">{config.locale.countryCode}</p>
              <p className="text-sm text-gray-600">Local phone validation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <p className="font-semibold">36 States + FCT</p>
              <p className="text-sm text-gray-600">Complete coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Healthcare Management?
          </h2>
          <p className="text-xl mb-8">
            Join the leading hospitals across Nigeria using {config.app.name}
          </p>
          <Link
            to="/auth/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
