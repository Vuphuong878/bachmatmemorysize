
import React from 'react';
import Button from './ui/Button';
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

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onContinueManualSave, onContinueAutoSave, onLoadFromFile, onSettings, manualSaveDisabled, autoSaveDisabled }) => {
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
          <Button onClick={onSettings} variant="secondary">
            Thiết lập
          </Button>
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
