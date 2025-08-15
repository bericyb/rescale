import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  title?: string;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  title = "Failed to update job status",
  className = "mb-4" 
}: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <div className={`${className} p-3 bg-red-50 border border-red-200 rounded-md flex items-start`}>
      <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-red-700 font-medium">{title}</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    </div>
  );
}