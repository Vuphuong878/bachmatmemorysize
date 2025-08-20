
import React from 'react';
import { WorldCreationState } from '../../types';
import Button from '../ui/Button';

interface IntroductoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldContext: WorldCreationState;
  confirmText: string;
}

const IntroductoryModal: React.FC<IntroductoryModalProps> = ({ isOpen, onClose, worldContext, confirmText }) => {
  if (!isOpen) return null;

  const renderTextWithParagraphs = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in-fast">
      <div 
        className="bg-[#1d1526] rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] mx-auto border border-[#3a2d47] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-white text-center p-6 border-b-2 border-[#3a2d47] flex-shrink-0 theme-h1">
          Bối Cảnh Vị Diện
        </h2>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-8 prose-custom">
          <div>
            <h3 className="text-2xl font-semibold text-[#e02585] mb-3">Mô Tả Thế Giới</h3>
            <div className="text-lg leading-relaxed text-[#e8dff5]">
              {renderTextWithParagraphs(worldContext.description)}
            </div>
          </div>
          
          <hr className="border-t-2 border-[#3a2d47]/50" />

          <div>
            <h3 className="text-2xl font-semibold text-[#e02585] mb-3">Tiểu Sử Nhân Vật: {worldContext.character.name}</h3>
             <div className="text-lg leading-relaxed text-[#e8dff5]">
              {renderTextWithParagraphs(worldContext.character.biography)}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#3a2d47] flex-shrink-0 bg-[#1d1526]">
          <Button onClick={onClose} variant="primary" className="w-full max-w-sm mx-auto flex justify-center">
            {confirmText}
          </Button>
        </div>
      </div>
       <style>{`
        .theme-h1 { text-shadow: 0 0 8px rgba(224, 37, 133, 0.8); }
        .prose-custom {
            scrollbar-width: thin;
            scrollbar-color: #e02585 #120c18;
        }
        .prose-custom::-webkit-scrollbar {
            width: 8px;
        }
        .prose-custom::-webkit-scrollbar-track {
            background: #120c18;
        }
        .prose-custom::-webkit-scrollbar-thumb {
            background-color: #e02585;
            border-radius: 10px;
            border: 2px solid #120c18;
        }
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default IntroductoryModal;
