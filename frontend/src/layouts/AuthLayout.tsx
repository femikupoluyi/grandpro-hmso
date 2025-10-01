import { FC } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { config } from '../config';

export const AuthLayout: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-4xl font-bold text-primary-600">
                {config.app.name}
              </h1>
            </Link>
            <p className="mt-2 text-gray-600">
              Healthcare Management Platform
            </p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white shadow-xl rounded-lg p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              © 2025 {config.app.name}. All rights reserved.
            </p>
            <p className="mt-2">
              Powered by Nigerian Innovation 🇳🇬
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
