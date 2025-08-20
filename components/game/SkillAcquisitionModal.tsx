import React from 'react';
import { Skill } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface SkillAcquisitionModalProps {
  isOpen: boolean;
  onConfirm: (skill: Skill) => void;
  onDecline: (skill: Skill) => void;
  skill: Skill | null;
}

const SkillAcquisitionModal: React.FC<SkillAcquisitionModalProps> = ({ isOpen, onConfirm, onDecline, skill }) => {
  if (!isOpen || !skill) return null;

  const handleConfirm = () => {
    onConfirm(skill);
  };

  const handleDecline = () => {
    onDecline(skill);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDecline} title="Lĩnh Ngộ Kỹ Năng Mới">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#e02585] mb-2">{skill.name}</h3>
        <p className="text-gray-300 italic mb-4">{skill.description}</p>
        
        {skill.abilities && skill.abilities.length > 0 && (
            <div className="text-left bg-black/20 p-3 rounded-lg mb-6 max-h-48 overflow-y-auto prose-custom">
                <h4 className="font-semibold text-white mb-2">Chiêu thức:</h4>
                <ul className="space-y-2">
                    {skill.abilities.map(ability => (
                        <li key={ability.name}>
                            <strong className="text-gray-200">{ability.name}:</strong>
                            <p className="text-sm text-gray-400 pl-2">{ability.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <p className="text-lg text-gray-300 mb-6">Bạn có muốn lĩnh ngộ kỹ năng này ngay lập tức không?</p>
        <div className="flex flex-col sm:flex-row-reverse gap-4">
          <Button onClick={handleConfirm} variant="primary">
            Lĩnh Ngộ Ngay
          </Button>
          <Button onClick={handleDecline} variant="secondary">
            Tạm Cất Đi
          </Button>
        </div>
      </div>
       <style>{`
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
      `}</style>
    </Modal>
  );
};

export default SkillAcquisitionModal;