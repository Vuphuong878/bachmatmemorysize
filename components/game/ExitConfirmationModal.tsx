
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ExitConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveAndExit: () => void;
    onExitWithoutSaving: () => void;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
    isOpen,
    onClose,
    onSaveAndExit,
    onExitWithoutSaving
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận Thoát">
            <div className="text-center">
                <p className="text-lg text-gray-300 mb-6">
                    Bạn có muốn lưu lại tiến trình trước khi thoát không?
                </p>
                <div className="space-y-4">
                    <Button onClick={onSaveAndExit} variant="primary">
                        Lưu và Thoát
                    </Button>
                    <Button onClick={onExitWithoutSaving} variant="secondary">
                        Không Lưu và Thoát
                    </Button>
                     <Button onClick={onClose} variant="secondary">
                        Hủy
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ExitConfirmationModal;
