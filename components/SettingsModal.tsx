
import React from 'react';
import { Settings, ApiKeySource } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setApiKeySource: (source: ApiKeySource) => void;
  setCustomApiKeys: (keys: string[]) => void;
  isKeyConfigured: boolean;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setApiKeySource, setCustomApiKeys, isKeyConfigured }) => {
  const isCustomKeySelected = settings.apiKeySource === ApiKeySource.CUSTOM;
  const handleOpenGuide = () => {
    window.open('https://www.youtube.com/shorts/M_HODruvqd0', '_blank');
  };

  const handleAddKey = () => {
    setCustomApiKeys([...settings.customApiKeys, '']);
  };

  const handleKeyChange = (index: number, value: string) => {
    const newKeys = [...settings.customApiKeys];
    newKeys[index] = value;
    setCustomApiKeys(newKeys);
  };

  const handleRemoveKey = (index: number) => {
    const newKeys = settings.customApiKeys.filter((_, i) => i !== index);
    setCustomApiKeys(newKeys);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thiết lập API">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-rajdhani uppercase tracking-wider font-bold text-white">Nguồn Khóa API</h3>
            <Button
              onClick={handleOpenGuide}
              variant="secondary"
              className="border-2 border-[#e02585] text-[#e02585] font-semibold px-4 py-2 rounded-lg ml-4 hover:bg-[#e02585]/10 transition-colors"
              style={{ minWidth: 0 }}
            >
              Hướng Dẫn Lấy API KEY
            </Button>
          </div>
          <div className="space-y-3">
            <label className={`flex items-center p-4 bg-[#2a2135] rounded-lg cursor-pointer hover:bg-[#3a2d47] transition-all duration-300 border-2 ${settings.apiKeySource === ApiKeySource.DEFAULT ? 'border-[#e02585] shadow-[0_0_10px_rgba(224,37,133,0.3)]' : 'border-transparent'}`}>
              <input
                type="radio"
                name="apiKeySource"
                className="h-5 w-5 text-[#e02585] bg-[#120c18] border-[#3a2d47] focus:ring-[#e02585] focus:ring-offset-[#2a2135]"
                checked={settings.apiKeySource === ApiKeySource.DEFAULT}
                onChange={() => setApiKeySource(ApiKeySource.DEFAULT)}
              />
              <span className="ml-4 text-white font-semibold">Dùng khóa Gemini mặc định</span>
            </label>
            <label className={`flex items-center p-4 bg-[#2a2135] rounded-lg cursor-pointer hover:bg-[#3a2d47] transition-all duration-300 border-2 ${settings.apiKeySource === ApiKeySource.CUSTOM ? 'border-[#e02585] shadow-[0_0_10px_rgba(224,37,133,0.3)]' : 'border-transparent'}`}>
              <input
                type="radio"
                name="apiKeySource"
                className="h-5 w-5 text-[#e02585] bg-[#120c18] border-[#3a2d47] focus:ring-[#e02585] focus:ring-offset-[#2a2135]"
                checked={isCustomKeySelected}
                onChange={() => setApiKeySource(ApiKeySource.CUSTOM)}
              />
              <span className="ml-4 text-white font-semibold">Dùng khóa API riêng (Tự động luân phiên)</span>
            </label>
          </div>
        </div>

        <div className={`transition-opacity duration-500 ${isCustomKeySelected ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="text-xl font-rajdhani uppercase tracking-wider font-bold text-white mb-4">
            Danh sách khóa API tùy chỉnh
          </h3>
          <div className="space-y-3">
            {settings.customApiKeys.map((key, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-[#a08cb6] font-mono text-lg">{index + 1}.</span>
                <input
                  type="password"
                  placeholder={isCustomKeySelected ? "Nhập khóa API của bạn ở đây" : "Bị vô hiệu hóa"}
                  value={key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  disabled={!isCustomKeySelected}
                  className="flex-grow px-4 py-3 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585] transition-all disabled:bg-[#2a2135] disabled:border-[#3a2d47] disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={() => handleRemoveKey(index)}
                  disabled={!isCustomKeySelected}
                  className="p-2 text-[#a08cb6] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  aria-label={`Xóa khóa ${index + 1}`}
                >
                    <TrashIcon />
                </button>
              </div>
            ))}
      <Button onClick={handleAddKey} variant="primary" disabled={!isCustomKeySelected} className="w-full mt-2">
        + Thêm khóa API
      </Button>
      {/* Nút hướng dẫn đã được đưa lên đầu */}
          </div>
        </div>

        <div className="pt-4">
           {!isKeyConfigured && (
             <div className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-4 text-center">
                Chưa có khóa API nào được cấu hình. Vui lòng cung cấp khóa API tùy chỉnh hoặc đảm bảo khóa mặc định được thiết lập.
             </div>
           )}
           <Button onClick={onClose} variant="secondary" className="w-full">
             Đóng
           </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
