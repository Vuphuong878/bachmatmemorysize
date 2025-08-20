import React from 'react';

interface FormSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
    return (
        <section className="form-section p-6 rounded-2xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            <p className="text-[#a08cb6] mb-6">{description}</p>
            <div className="space-y-5">
                {children}
            </div>
        </section>
    )
}

export default FormSection;
