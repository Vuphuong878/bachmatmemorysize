import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';

interface MemoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string, score?: number) => void;
  initialValue: string;
  initialScore?: number;
  title?: string;
  showScoreField?: boolean;
}

const MemoryEditModal: React.FC<MemoryEditModalProps> = ({ isOpen, onClose, onSave, initialValue, initialScore, title, showScoreField }) => {
  const [value, setValue] = useState(initialValue);
  const [score, setScore] = useState(initialScore ?? 5);

  // Reset value when modal opens
  React.useEffect(() => {
    setValue(initialValue);
    setScore(initialScore ?? 5);
  }, [initialValue, initialScore, isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
  <div className="p-8 w-full max-w-md bg-[#1d1526] rounded-xl border border-[#6d4e8e] shadow-2xl relative">
        <button
          className="absolute top-3 right-3 text-[#a08cb6] hover:text-white text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <div className="text-lg font-bold text-white mb-4">{title || 'Chỉnh Sửa Ký Ức'}</div>
        <label className="block text-sm text-[#a08cb6] mb-2">Nội dung ký ức</label>
        <textarea
          className="w-full bg-[#18141f] text-[#cfc6e0] rounded p-2 mb-4 border border-[#6d4e8e]/30 min-h-[253px] max-h-[460px] resize-vertical"
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={12}
        />
        {showScoreField && (
          <div className="mb-4">
            <label className="block text-sm text-[#a08cb6] mb-2">Điểm quan trọng (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-24 bg-[#18141f] text-[#ffd600] rounded p-2 border border-[#6d4e8e]/30 text-center"
              value={score}
              onChange={e => setScore(Number(e.target.value))}
            />
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={() => onSave(value, showScoreField ? score : undefined)} disabled={value.trim() === '' || (showScoreField && (score < 1 || score > 10))}>Lưu thay đổi</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MemoryEditModal;
