import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { WorldLocation } from '../../types';

interface LocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalId: string, newData: { name: string; description: string }) => void;
  locationData: WorldLocation | null;
  isLoading: boolean;
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({ isOpen, onClose, onSave, locationData, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && locationData) {
      setName(locationData.name);
      setDescription(locationData.description);
    } else {
      // Reset form when modal closes or data is null
      setName('');
      setDescription('');
    }
  }, [isOpen, locationData]);

  const handleSave = () => {
    if (name.trim() && locationData) {
      onSave(locationData.id, { name: name.trim(), description: description.trim() });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh Sửa Địa Danh">
      <div className="space-y-6">
        <p className="text-gray-300">Thay đổi tên và mô tả của địa danh.</p>
        <InputField
          id="location-name"
          label="Tên Địa Danh"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <TextareaField
          id="location-description"
          label="Mô Tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
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

export default LocationEditModal;
