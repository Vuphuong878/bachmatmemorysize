

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
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(GameSaveService.hasLocalSave());
    // This check is now less aggressive, won't pop up on every load if a key is already set.
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
    if (GameSaveService.hasLocalSave()) {
      setIsNewGameConfirmOpen(true);
    } else {
      startNewGameFlow();
    }
  };
  
  const handleConfirmStartNewGame = () => {
    GameSaveService.deleteLocalSave();
    setHasSave(false);
    setIsNewGameConfirmOpen(false);
    startNewGameFlow();
  };
  
  const handleContinueGame = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    const savedGame = GameSaveService.loadFromLocalStorage();
    if (savedGame) {
      // Ensure loaded save data has an 'npcs' array
      if (!savedGame.npcs) {
          savedGame.npcs = [];
      }
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu tự động nào.");
      setHasSave(false);
    }
  };

  const handleLoadFromFile = (loadedState: GameState) => {
    if (!isKeyConfigured) {
        setIsSettingsOpen(true);
        return;
    }
    // Ensure loaded save data has an 'npcs' array
    if (!loadedState.npcs) {
        loadedState.npcs = [];
    }
    setGameStartData(loadedState);
    setCurrentScreen('game');
  };

  const handleWorldCreated = (state: WorldCreationState) => {
    setGameStartData(state);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setHasSave(GameSaveService.hasLocalSave());
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
            onContinue={handleContinueGame}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            continueDisabled={!hasSave}
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
            onContinue={handleContinueGame}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            continueDisabled={!hasSave}
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
        <p>Hành động này sẽ xóa vĩnh viễn file lưu tự động hiện tại.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn tiếp tục không?</p>
      </ConfirmationModal>
    </>
  );
};

export default App;
