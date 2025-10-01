import { SelectHTMLAttributes, FC, forwardRef } from 'react';

interface SelectSimpleProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const SelectSimple: FC<SelectSimpleProps> = forwardRef<HTMLSelectElement, SelectSimpleProps>(
  ({ label, error, helpText, className = '', children, ...rest }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {rest.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            block w-full rounded-md border-gray-300 px-3 py-2
            text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-gray-300'}
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

SelectSimple.displayName = 'SelectSimple';
