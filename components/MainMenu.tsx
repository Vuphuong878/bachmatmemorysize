
import React from 'react';
import Button from './ui/Button';
import ChangelogModal from './ChangelogModal';
import { GameState } from '../types';
import * as GameSaveService from '../services/GameSaveService';


interface MainMenuProps {
  onStart: () => void;
  onContinueManualSave: () => void;
  onContinueAutoSave: () => void;
  onSettings: () => void;
  onLoadFromFile: (state: GameState) => void;
  manualSaveDisabled: boolean;
  autoSaveDisabled: boolean;
}

const changelogs = [
  {
    version: '1.2.0',
    date: '2025-08-22',
    content: [
      '- Thêm nút "Wiki" nhỏ bên phải nút Thông Tin, mở tài liệu hướng dẫn ở tab mới.',
      '- Sửa giao diện nút Thông Tin/Wiki cho đồng bộ, nhỏ gọn.',
      '- Tùy chỉnh/ẩn/thay đổi màu sắc thanh cuộn trong changelog modal.',
      '- Sửa lỗi và đồng bộ lại các thay đổi giao diện chính.',
      '- Cập nhật lại changelog cho các thay đổi mới nhất.'
    ].join('\n'),
  },
  {
    version: '1.1.0',
    date: '2025-08-21',
    content: [
      '- Thêm trường "Trinh tiết/Nguyên âm" cho NPC nữ, hiển thị có điều kiện.',
      '- Bổ sung trường "Thân phận" và "Ngoại hình" cho NPC.',
      '- Đồng bộ schema, interface, UI cho các trường mới.',
      '- Thêm nút "Thông Tin" cạnh nút Thiết lập, giao diện nhỏ gọn.',
      '- Tạo modal hiển thị changelog, có thể cuộn từng bản cập nhật.',
      '- Cải thiện layout và trải nghiệm giao diện chính.'
    ].join('\n'),
  },
  {
    version: '1.0.0',
    date: '2025-08-20',
    content: [
      '- Ra mắt phiên bản đầu tiên với các tính năng cơ bản phụ thuộc vào phiên bản "Bách Mật 2.6"',
      '- Thay đổi cách hệ thống kiểm tra và phân loại ký ức (memory) cho NPC và người chơi, hỗ trợ phân loại ký ức quan trọng, ký ức tạm thời, và ký ức cốt truyện.'
    ].join('\n'),
  },
];

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onContinueManualSave, onContinueAutoSave, onLoadFromFile, onSettings, manualSaveDisabled, autoSaveDisabled }) => {
  const [changelogOpen, setChangelogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const gameState = await GameSaveService.loadFromFile(file);
        onLoadFromFile(gameState);
      } catch (error: any) {
        alert(error.message || "Không thể tải file save.");
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen p-4 overflow-hidden menu-bg">
       <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-wider title-glow font-lora">
            Bách Mật Sáng Thế Giả
          </h1>
          <p className="text-lg text-[#a08cb6] mt-6 subtitle-style">Cuộc phiêu lưu nhục cảm của bạn đang chờ</p>
        </div>
  <div className="w-full max-w-sm space-y-5 animate-fade-in-up">
          <Button onClick={onStart}>Bắt đầu Game Mới</Button>
          <Button onClick={onContinueManualSave} disabled={manualSaveDisabled}>
            Tiếp tục (Lưu &amp; Thoát)
          </Button>
          <Button onClick={onContinueAutoSave} disabled={autoSaveDisabled}>
            Tiếp tục (Lưu tự động gần nhất)
          </Button>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <Button onClick={triggerFileLoad} variant="secondary">
            Tải game từ file...
          </Button>
          <div className="flex flex-row gap-3">
            <Button onClick={onSettings} variant="secondary" style={{ minWidth: 120, fontSize: 16, padding: '10px 0' }}>
              Thiết lập
            </Button>
            <Button onClick={() => setChangelogOpen(true)} variant="secondary" style={{ minWidth: 120, fontSize: 16, padding: '10px 0' }}>
              Thông Tin
            </Button>
            <Button
              variant="secondary"
              style={{ minWidth: 90, fontSize: 15, padding: '10px 0' }}
              onClick={() => window.open('https://docs.google.com/document/d/1xqN7Qmy7XV3X7P0wNjHsZcN-6kxHnPXi-c-FXT5cfuM/edit?usp=sharing', '_blank', 'noopener,noreferrer')}
            >
              Wiki
            </Button>
          </div>
  <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} changelogs={changelogs} />
        </div>
      </div>
      <style>{`
        .font-lora {
          font-family: 'Lora', serif;
        }
        .menu-bg {
          background-color: #0d0612;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(224, 37, 133, 0.25), transparent 40%),
            radial-gradient(circle at 85% 70%, rgba(127, 59, 155, 0.25), transparent 40%);
          animation: background-pan 45s linear infinite;
        }
        @keyframes background-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .title-glow {
            animation: title-pulse 5s ease-in-out infinite;
        }
        
        @keyframes title-pulse {
            0%, 100% {
                text-shadow: 
                    0 0 5px rgba(255, 255, 255, 0.7), 
                    0 0 10px rgba(224, 37, 133, 0.8), 
                    0 0 20px rgba(224, 37, 133, 0.6), 
                    0 0 40px rgba(224, 37, 133, 0.4);
            }
            50% {
                text-shadow: 
                    0 0 8px rgba(255, 255, 255, 0.9), 
                    0 0 18px rgba(224, 37, 133, 1), 
                    0 0 30px rgba(224, 37, 133, 0.8), 
                    0 0 55px rgba(224, 37, 133, 0.6);
            }
        }
        
        .subtitle-style {
            font-family: 'Rajdhani', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #a08cb6;
            text-shadow: 0 0 5px rgba(160, 140, 182, 0.5);
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.2s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default MainMenu;
