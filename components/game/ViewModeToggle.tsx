import React from 'react';
import { ViewMode } from '../../types';
import { DesktopIcon } from '../icons/DesktopIcon';
import { MobileIcon } from '../icons/MobileIcon';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  disabled: boolean;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode, disabled }) => {
  const isDesktop = viewMode === 'desktop';

  return (
    <div className="flex items-center rounded-lg border border-solid border-[#3a2d47]/50 overflow-hidden" title="Chuyển đổi giao diện Desktop/Mobile">
      <button
        onClick={() => setViewMode('desktop')}
        disabled={disabled}
        className={`p-2 transition-colors duration-200 ${isDesktop ? 'bg-[#e02585] text-white' : 'bg-[#1d1526]/80 text-[#a08cb6] hover:bg-[#3a2d47]'}`}
        aria-pressed={isDesktop}
      >
        <DesktopIcon />
      </button>
      <button
        onClick={() => setViewMode('mobile')}
        disabled={disabled}
        className={`p-2 transition-colors duration-200 ${!isDesktop ? 'bg-[#e02585] text-white' : 'bg-[#1d1526]/80 text-[#a08cb6] hover:bg-[#3a2d47]'}`}
        aria-pressed={!isDesktop}
      >
        <MobileIcon />
      </button>
    </div>
  );
};

export default ViewModeToggle;
