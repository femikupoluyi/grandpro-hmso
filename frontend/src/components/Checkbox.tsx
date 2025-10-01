import { FC, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ 
  label, 
  className = '', 
  ...props 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className={`
          rounded border-gray-300 text-primary-600 
          focus:ring-primary-500 focus:ring-2
          ${className}
        `}
        {...props}
      />
      {label && (
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
};
