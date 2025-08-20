import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { Ability } from '../../types';

interface AbilityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalName: string, newData: { name: string; description: string }) => void;
  abilityData: { skillName: string; ability: Ability } | null;
  isLoading: boolean;
}

const AbilityEditModal: React.FC<AbilityEditModalProps> = ({ isOpen, onClose, onSave, abilityData, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && abilityData) {
      setName(abilityData.ability.name);
      setDescription(abilityData.ability.description);
    } else {
      // Reset form when modal closes or data is null
      setName('');
      setDescription('');
    }
  }, [isOpen, abilityData]);

  const handleSave = () => {
    if (name.trim() && abilityData) {
      onSave(abilityData.ability.name, { name: name.trim(), description: description.trim() });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh Sửa Chiêu Thức">
      <div className="space-y-6">
        <p className="text-gray-300">Thay đổi tên và mô tả của chiêu thức trong bộ kỹ năng <span className="font-bold text-white">{abilityData?.skillName}</span>.</p>
        <InputField
          id="ability-name"
          label="Tên Chiêu Thức"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <TextareaField
          id="ability-description"
          label="Mô Tả Chiêu Thức"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isLoading}
        />
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
           <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
          </Button>
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AbilityEditModal;
