import { statusOptions } from '../../constants/jobStatus';

interface StatusSelectorProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
  label?: string;
}

export function StatusSelector({ 
  selectedStatus, 
  onStatusChange, 
  disabled = false,
  label = "New Status"
}: StatusSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="space-y-2">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={selectedStatus === option.value}
              onChange={(e) => onStatusChange(e.target.value)}
              className="mr-3 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
            />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}