import { FC, useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUpload: (file: File) => void | Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  loading?: boolean;
  multiple?: boolean;
  className?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  onUpload,
  accept = '*',
  maxSize = 10,
  loading = false,
  multiple = false,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    setError('');
    
    // Validate file size
    const oversizedFiles = fileList.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    if (multiple) {
      setFiles(fileList);
      fileList.forEach(file => onUpload(file));
    } else {
      const file = fileList[0];
      setFiles([file]);
      onUpload(file);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={loading}
        />
        
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={handleButtonClick}
              className="font-semibold text-primary-600 hover:text-primary-500"
              disabled={loading}
            >
              Click to upload
            </button>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept !== '*' && `Accepted: ${accept} • `}
            Max size: {maxSize}MB
          </p>
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm text-gray-900">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
