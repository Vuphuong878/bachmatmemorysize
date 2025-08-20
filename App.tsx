

import React, { useState, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import MainMenu from './components/MainMenu';
import GameScreen from './components/screens/GameScreen';
import SettingsModal from './components/SettingsModal';
import WorldCreatorScreen from './components/screens/WorldCreatorScreen';
import * as GameSaveService from './services/GameSaveService';
import { GameState, WorldCreationState } from './types';
import ConfirmationModal from './components/ui/ConfirmationModal';

type Screen = 'menu' | 'game' | 'world-creator';

const App: React.FC = () => {
  const settingsHook = useSettings();
  const { isKeyConfigured } = settingsHook;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStartData, setGameStartData] = useState<WorldCreationState | GameState | null>(null);
  const [hasManualSave, setHasManualSave] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);

  useEffect(() => {
    setHasManualSave(GameSaveService.hasManualSave());
    setHasAutoSave(GameSaveService.hasAutoSave());
    if (!isKeyConfigured && !localStorage.getItem('appSettings')) {
      setIsSettingsOpen(true);
    }
  }, [isKeyConfigured]);

  const startNewGameFlow = () => {
    setGameStartData(null);
    setCurrentScreen('world-creator');
  };

  const handleStartGame = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    if (GameSaveService.hasManualSave() || GameSaveService.hasAutoSave()) {
      setIsNewGameConfirmOpen(true);
    } else {
      startNewGameFlow();
    }
  };
  
  const handleConfirmStartNewGame = () => {
    GameSaveService.deleteAllLocalSaves();
    setHasManualSave(false);
    setHasAutoSave(false);
    setIsNewGameConfirmOpen(false);
    startNewGameFlow();
  };
  
  const handleContinueManualSave = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    const savedGame = GameSaveService.loadManualSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu thủ công nào.");
      setHasManualSave(false);
    }
  };

  const handleContinueAutoSave = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    const savedGame = GameSaveService.loadAutoSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu tự động nào.");
      setHasAutoSave(false);
    }
  };

  const handleLoadFromFile = (loadedState: GameState) => {
    if (!isKeyConfigured) {
        setIsSettingsOpen(true);
        return;
    }
    setGameStartData(loadedState);
    setCurrentScreen('game');
  };

  const handleWorldCreated = (state: WorldCreationState) => {
    setGameStartData(state);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setHasManualSave(GameSaveService.hasManualSave());
    setHasAutoSave(GameSaveService.hasAutoSave());
    setCurrentScreen('menu');
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'world-creator':
        return <WorldCreatorScreen 
                  onBackToMenu={() => setCurrentScreen('menu')} 
                  onWorldCreated={handleWorldCreated}
                  settingsHook={settingsHook}
                />;
      case 'game':
        if (!gameStartData) {
          // Fallback if somehow game screen is reached without data
          return <MainMenu
            onStart={handleStartGame}
            onContinueManualSave={handleContinueManualSave}
            onContinueAutoSave={handleContinueAutoSave}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            manualSaveDisabled={!hasManualSave}
            autoSaveDisabled={!hasAutoSave}
          />;
        }
        return <GameScreen 
                  onBackToMenu={handleBackToMenu} 
                  initialData={gameStartData}
                  settingsHook={settingsHook}
               />;
      case 'menu':
      default:
        return (
          <MainMenu
            onStart={handleStartGame}
            onContinueManualSave={handleContinueManualSave}
            onContinueAutoSave={handleContinueAutoSave}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            manualSaveDisabled={!hasManualSave}
            autoSaveDisabled={!hasAutoSave}
          />
        );
    }
  };

  return (
    <>
      {renderScreen()}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settingsHook.settings}
        setApiKeySource={settingsHook.setApiKeySource}
        setCustomApiKeys={settingsHook.setCustomApiKeys}
        isKeyConfigured={isKeyConfigured}
      />
      <ConfirmationModal
        isOpen={isNewGameConfirmOpen}
        onClose={() => setIsNewGameConfirmOpen(false)}
        onConfirm={handleConfirmStartNewGame}
        title="Xác nhận Hành động"
        confirmText="Xóa và Bắt đầu"
        cancelText="Hủy"
      >
        <p>Hành động này sẽ xóa vĩnh viễn các file lưu thủ công và tự động hiện tại.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn tiếp tục không?</p>
      </ConfirmationModal>
    </>
  );
};

export default App;
