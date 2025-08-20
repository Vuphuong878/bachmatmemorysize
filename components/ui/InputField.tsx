import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-[#e8dff5] mb-2">{label}</label>}
      <input
        id={id}
        className="w-full px-4 py-3 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white placeholder:text-[#a08cb6]/50 focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585] transition-all"
        {...props}
      />
    </div>
  );
};

export default InputField;
