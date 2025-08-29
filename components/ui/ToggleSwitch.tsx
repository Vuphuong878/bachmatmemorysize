import React from 'react';

interface ToggleSwitchProps {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, description, enabled, setEnabled }) => {
  return (
    <div className="flex items-center justify-between">
        <div className="flex-grow">
            <label htmlFor={id} className="block text-sm font-medium text-[#e8dff5] cursor-pointer">
                {label}
            </label>
            <p className="text-xs text-[#a08cb6]">{description}</p>
        </div>
      <button
        id={id}
        type="button"
        className={`${
          enabled ? 'bg-[#e02585]' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:ring-offset-2 focus:ring-offset-[#1d1526]`}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
