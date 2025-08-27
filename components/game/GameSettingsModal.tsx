import React from 'react';
import Modal from '../ui/Modal';
import ToggleSwitch from '../ui/ToggleSwitch';
import Button from '../ui/Button';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoHideActionPanel: boolean;
  setAutoHideActionPanel: (enabled: boolean) => void;
  isImageGenerationEnabled: boolean;
  setIsImageGenerationEnabled: (enabled: boolean) => void;
}

const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  autoHideActionPanel, 
  setAutoHideActionPanel,
  isImageGenerationEnabled,
  setIsImageGenerationEnabled
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cài Đặt Trong Game">
      <div className="space-y-8">
        <div>
            <h3 className="text-xl font-rajdhani uppercase tracking-wider font-bold text-white mb-4">Giao Diện</h3>
            <div className="p-4 bg-[#2a2135] rounded-lg space-y-4">
                <ToggleSwitch
                    id="auto-hide-panel-toggle"
                    label="Tự động ẩn Bảng Hành Động"
                    description="Tự động thu gọn bảng lựa chọn và hành động sau khi bạn gửi đi một lựa chọn."
                    enabled={autoHideActionPanel}
                    setEnabled={setAutoHideActionPanel}
                />
                 <ToggleSwitch
                    id="image-generation-toggle"
                    label="Kích hoạt tạo hình ảnh"
                    description="AI sẽ tự động tạo một hình ảnh minh họa khi yêu cầu cho lượt truyện mới nhất. (Tính năng thử nghiệm)"
                    enabled={isImageGenerationEnabled}
                    setEnabled={setIsImageGenerationEnabled}
                />
            </div>
        </div>
        
        <div className="pt-4">
           <Button onClick={onClose} variant="secondary" className="w-full">
             Đóng
           </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GameSettingsModal;