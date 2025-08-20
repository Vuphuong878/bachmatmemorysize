
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { CharacterStat } from '../../types';

interface StatEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldStatName: string, newStat: { name: string, value: string, duration: string }) => void;
  statData: { statName: string, stat: CharacterStat } | null;
  isLoading: boolean;
}

const StatEditModal: React.FC<StatEditModalProps> = ({ isOpen, onClose, onSave, statData, isLoading }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (isOpen && statData) {
      setName(statData.statName);
      setValue(String(statData.stat.value));
      setDuration(statData.stat.duration !== undefined ? String(statData.stat.duration) : '');
    } else {
      // Reset form when modal closes or data is null
      setName('');
      setValue('');
      setDuration('');
    }
  }, [isOpen, statData]);

  const handleSave = () => {
    if (name.trim() && statData) {
      onSave(statData.statName, { name: name.trim(), value: value, duration: duration });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh Sửa Trạng Thái">
      <div className="space-y-6">
        <p className="text-gray-300">Thay đổi tên, giá trị hoặc thời gian tồn tại của chỉ số.</p>
        <InputField
          id="stat-name"
          label="Tên Chỉ Số"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <TextareaField
          id="stat-value"
          label="Giá Trị (Mô tả)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
         <InputField
          id="stat-duration"
          label="Thời gian tồn tại (số lượt, bỏ trống nếu vĩnh viễn)"
          type="number"
          placeholder="VD: 5"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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

export default StatEditModal;
