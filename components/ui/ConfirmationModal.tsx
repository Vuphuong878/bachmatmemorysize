
import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'primary'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="text-lg text-gray-300 mb-8">
          {children}
        </div>
        <div className="flex flex-col sm:flex-row-reverse gap-4">
          <Button onClick={onConfirm} variant={confirmVariant}>
            {confirmText}
          </Button>
          <Button onClick={onClose} variant="secondary">
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
