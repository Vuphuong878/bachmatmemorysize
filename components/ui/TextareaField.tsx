import React from 'react';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  button?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, id, button, ...props }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-[#e8dff5] mb-2">{label}</label>
      <textarea
        id={id}
        className="w-full px-4 py-3 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white placeholder:text-[#a08cb6]/50 focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585] transition-all resize-y"
        {...props}
      />
      {button}
    </div>
  );
};

export default TextareaField;
