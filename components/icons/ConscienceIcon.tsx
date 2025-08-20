import React from 'react';

// A simple shield icon for "Lương Tâm" (Conscience/Protection)
export const ConscienceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2L3 5v5c0 3.87 3.13 7 7 7s7-3.13 7-7V5l-7-3z" />
    </svg>
);
