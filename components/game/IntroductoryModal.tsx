
import React, { useState } from 'react';
import { WorldCreationState } from '../../types';
import Button from '../ui/Button';

interface IntroductoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldContext: WorldCreationState;
  confirmText: string;
}

type Tab = 'world' | 'character';

const InfoItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-4 mb-3">
            <dt className="text-sm font-semibold text-[#a08cb6] col-span-1 text-right">{label}:</dt>
            <dd className="text-sm text-[#e8dff5] col-span-2">{value}</dd>
        </div>
    );
};

const IntroductoryModal: React.FC<IntroductoryModalProps> = ({ isOpen, onClose, worldContext, confirmText }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<Tab>('world');

  const renderTextWithParagraphs = (text: string) => {
    if (!text) return <p className="text-sm italic text-gray-500">Chưa có thông tin.</p>;
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-3">{paragraph}</p>
    ));
  };

  const getCharacterGender = () => {
    if (worldContext.character.gender === 'Tự định nghĩa') {
        return worldContext.character.customGender || 'Tự định nghĩa';
    }
    return worldContext.character.gender;
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

        <div className="flex-shrink-0 flex border-b-2 border-[#3a2d47] bg-black/20">
            <button
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-3 text-lg font-bold transition-all duration-300 ${activeTab === 'world' ? 'text-white bg-[#e02585]/30' : 'text-[#a08cb6] hover:bg-white/5'}`}
            >
                Thế Giới
            </button>
            <button
                onClick={() => setActiveTab('character')}
                className={`flex-1 py-3 text-lg font-bold transition-all duration-300 ${activeTab === 'character' ? 'text-white bg-[#e02585]/30' : 'text-[#a08cb6] hover:bg-white/5'}`}
            >
                Nhân Vật
            </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto prose-custom">
            {activeTab === 'world' && (
                <div className="animate-fade-in-fast">
                    <h3 className="text-2xl font-semibold text-[#e02585] mb-4 text-center">Thông Tin Thế Giới</h3>
                    <dl className="mb-6">
                        <InfoItem label="Tên Truyện" value={worldContext.storyName} />
                        <InfoItem label="Thể Loại" value={worldContext.genre} />
                        <InfoItem label="Ngôi Kể" value={worldContext.narrativePerspective} />
                    </dl>
                    <hr className="border-t-2 border-[#3a2d47]/50 my-6" />
                    <h4 className="text-xl font-semibold text-white mb-3">Mô Tả Bối Cảnh</h4>
                    <div className="text-base leading-relaxed text-[#e8dff5] prose-text">
                        {renderTextWithParagraphs(worldContext.description)}
                    </div>
                </div>
            )}
             {activeTab === 'character' && (
                <div className="animate-fade-in-fast">
                    <h3 className="text-2xl font-semibold text-[#e02585] mb-4 text-center">Thông Tin Nhân Vật</h3>
                     <dl className="mb-6">
                        <InfoItem label="Tên" value={worldContext.character.name} />
                        <InfoItem label="Giới Tính" value={getCharacterGender()} />
                        <InfoItem label="Tính Cách" value={worldContext.character.personality} />
                        <InfoItem label="Kỹ Năng Khởi Đầu" value={worldContext.character.skills} />
                    </dl>
                    <hr className="border-t-2 border-[#3a2d47]/50 my-6" />
                    <h4 className="text-xl font-semibold text-white mb-3">Tiểu Sử</h4>
                    <div className="text-base leading-relaxed text-[#e8dff5] prose-text">
                        {renderTextWithParagraphs(worldContext.character.biography)}
                    </div>
                </div>
            )}
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
        .prose-text p {
            text-indent: 1.5rem; /* Thụt lề đầu dòng */
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
