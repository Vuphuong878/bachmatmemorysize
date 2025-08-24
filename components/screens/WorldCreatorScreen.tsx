import React, { useState, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import WorldInfoForm from '../world-creator/WorldInfoForm';
import CharacterInfoForm from '../world-creator/CharacterInfoForm';
import { WorldCreationState } from '../../types';
import * as WorldPresetService from '../../services/WorldPresetService';


interface WorldCreatorScreenProps {
  onBackToMenu: () => void;
  onWorldCreated: (state: WorldCreationState) => void;
  settingsHook: ReturnType<typeof useSettings>;
}

const WorldCreatorScreen: React.FC<WorldCreatorScreenProps> = ({ onBackToMenu, onWorldCreated, settingsHook }) => {
  const [state, setState] = useState<WorldCreationState>({
    storyName: '',
    genre: '',
    description: '',
    isNsfw: true,
    narrativePerspective: 'Ngôi thứ ba Giới hạn',
    character: {
      name: '',
      gender: 'Nam',
      customGender: '',
      personality: '',
      biography: '',
      skills: '',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateWorld = () => {
    // Basic validation could be added here
    onWorldCreated(state);
  };

  const handleSavePreset = () => {
    WorldPresetService.savePresetToFile(state);
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const preset = await WorldPresetService.loadPresetFromFile(file);
        setState(preset);
      } catch (error: any) {
        alert(error.message || "Không thể tải file thiết lập.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#120c18] text-[#e8dff5] p-4 sm:p-6 md:p-8">
       <style>{`
        .theme-sensual-bg {
          background-image: radial-gradient(circle at top right, rgba(127, 59, 155, 0.4), transparent 40%),
                            radial-gradient(circle at bottom left, rgba(224, 37, 133, 0.3), transparent 50%);
        }
        .form-section {
          background-color: #1d1526;
          border: 1px solid #3a2d47;
          box-shadow: 0 0 25px rgba(224, 37, 133, 0.1);
        }
        .theme-h1 {
            text-shadow: 0 0 8px rgba(224, 37, 133, 0.8);
        }
       `}</style>
      <div className="absolute inset-0 theme-sensual-bg"></div>
      <div className="relative max-w-4xl mx-auto">
        <header className="text-center my-8 animate-fade-in-down">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider theme-h1">Bách Mật Sáng Thế Giả</h1>
          <p className="text-lg text-[#a08cb6] mt-2">Kiến tạo vị diện mới của bạn.</p>
        </header>
        
        <main className="space-y-8">
          <WorldInfoForm state={state} setState={setState} settingsHook={settingsHook} />
          <CharacterInfoForm state={state} setState={setState} settingsHook={settingsHook} />

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
             <Button onClick={handleSavePreset} variant="secondary">Lưu Thiết Lập</Button>
             <Button onClick={triggerFileLoad} variant="secondary">Tải Thiết Lập</Button>
             <Button onClick={onBackToMenu} variant="secondary">Quay về Menu</Button>
             <Button onClick={handleCreateWorld}>Tạo Thế Giới</Button>
          </div>
        </main>
      </div>
    </div>
  );
};


export default WorldCreatorScreen;