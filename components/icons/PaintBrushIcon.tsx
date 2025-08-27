import React from 'react';

export const PaintBrushIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1z" />
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2h-1.172a1 1 0 00-.707.293l-4.243 4.243a1 1 0 01-1.414 0L4.172 9.293A1 1 0 003.465 9H3a2 2 0 01-2-2V5zm10.707 3.707l-4.243-4.243a1 1 0 00-1.414 0l-4.243 4.243L8.586 10l4.121-4.293z" clipRule="evenodd" />
    </svg>
);
