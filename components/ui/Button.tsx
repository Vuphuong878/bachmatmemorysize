import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'choice';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = 'w-full rounded-lg transform transition-all duration-300 ease-in-out focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:scale-100';
  
  const variantClasses = {
    primary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold bg-transparent border-2 border-[#e02585] text-[#e02585] shadow-[0_0_8px_rgba(224,37,133,0.5),inset_0_0_8px_rgba(224,37,133,0.3)] hover:bg-[#e02585] hover:text-[#120c18] hover:shadow-[0_0_15px_#e02585,0_0_25px_#e02585] focus:ring-4 focus:ring-[#e02585]/50 disabled:shadow-none disabled:border-gray-700 disabled:text-gray-700 disabled:bg-transparent',
    secondary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold bg-transparent border-2 border-[#a08cb6] text-[#a08cb6] shadow-[0_0_8px_rgba(160,140,182,0.3),inset_0_0_8px_rgba(160,140,182,0.3)] hover:bg-[#a08cb6] hover:text-[#120c18] hover:shadow-[0_0_15px_#a08cb6,0_0_25px_#a08cb6] focus:ring-4 focus:ring-[#a08cb6]/50 disabled:shadow-none disabled:border-gray-700 disabled:text-gray-700 disabled:bg-transparent',
    choice: 'bg-[#2a2135] hover:bg-[#3a2d47] text-[#e8dff5] focus:ring-[#a08cb6]/50 shadow-md text-base py-2.5 font-semibold border border-transparent hover:border-[#a08cb6] disabled:bg-[#2a2135] disabled:text-gray-500 disabled:border-transparent disabled:hover:bg-[#2a2135]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;