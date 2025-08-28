import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../../hooks/useSettings';
import { WorldCreationState, GameState, Skill, LustModeFlavor, ViewMode, NpcMindset, Ability, DestinyCompassMode, CharacterStats, WorldLocation } from '../../types';
import { useGameEngine } from '../../hooks/useGameEngine';
import CharacterSheet from '../game/CharacterSheet';
import StoryLog from '../game/StoryLog';
import ChoiceBox from '../game/ChoiceBox';
import Button from '../ui/Button';
import MemoryEditModal from '../game/MemoryEditModal';
import TokenCounter from '../game/TokenCounter';
import ExitConfirmationModal from '../game/ExitConfirmationModal';
import * as GameSaveService from '../../services/GameSaveService';
import NpcCodex from '../game/NpcCodex';
import RequestCounter from '../game/RequestCounter';
import IntroductoryModal from '../game/IntroductoryModal';
import { BookIcon } from '../icons/BookIcon';
import SkillCodex from '../game/SkillCodex';
import SkillAcquisitionModal from '../game/SkillAcquisitionModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import PowerCreationModal from '../game/PowerCreationModal';
import { WandIcon } from '../icons/WandIcon';
import StatEditModal from '../game/StatEditModal';
import useLocalStorage from '../../hooks/useLocalStorage';
import ViewModeToggle from '../game/ViewModeToggle';
import { UserIcon } from '../icons/UserIcon';
import { UsersIcon } from '../icons/UsersIcon';
import AbilityEditModal from '../game/AbilityEditModal';
import { CogIcon } from '../icons/CogIcon';
import GameSettingsModal from '../game/GameSettingsModal';
import InventorySheet from '../game/InventorySheet';
import AiControlPanelModal from '../game/AiControlPanelModal';
import WorldCodex from '../game/WorldCodex';
import LocationEditModal from '../game/LocationEditModal';


interface GameScreenProps {
  onBackToMenu: () => void;
  initialData: WorldCreationState | GameState;
  settingsHook: ReturnType<typeof useSettings>;
}

type LeftPanelTab = 'info' | 'skills' | 'inventory' | 'memory';
type RightPanelTab = 'npcs' | 'world';

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu, initialData, settingsHook }) => {
  const { 
      gameState, isLoading, error, handlePlayerChoice, initializeGame, 
      lastTurnTokenCount, totalTokenCount, triggerSaveToFile, 
      skillToLearn, confirmLearnSkill, declineLearnSkill, manuallyAcquireSkill,
      createPowerFromDescription,
      toggleNpcProtection, reorderNpc, npcToDelete, requestNpcDeletion, confirmNpcDeletion, cancelNpcDeletion,
      editingStat, deletingStat, requestStatEdit, cancelStatEdit, confirmStatEdit, requestStatDelete, cancelStatDelete, confirmStatDelete,
      skillToDelete, requestSkillDeletion, confirmSkillDeletion, cancelSkillDeletion,
      editingAbility, requestAbilityEdit, confirmAbilityEdit, cancelAbilityEdit,
      reorderPlayerStat, movePlayerStatToTop,
      recentlyUpdatedPlayerStats, recentlyUpdatedNpcStats,
      updatePlotChronicleEntry, updateShortTermMemoryTurn,
      generatedImageUrl, isGeneratingImage, imageGenerationError, regenerateLastImage,
      undoLastTurn,
      previousGameState,
      toggleLocationProtection, reorderLocation, locationToDelete, requestLocationDeletion, confirmLocationDeletion, cancelLocationDeletion,
      editingLocation, requestLocationEdit, confirmLocationEdit, cancelLocationEdit,
  } = useGameEngine(initialData, settingsHook);

  const [editingChronicleIdx, setEditingChronicleIdx] = useState<number | string | null>(null);
  const [editingChronicleValue, setEditingChronicleValue] = useState('');
  const [editingMemoryType, setEditingMemoryType] = useState<'long' | 'short' | null>(null);
  const [detailModal, setDetailModal] = useState<{ type: 'long' | 'short'; idx: number; content: string } | null>(null);

  // --- UI/gameplay settings state ---
  // ...existing useState hooks...

  // Restore UI settings from save (if any)
  useEffect(() => {
    if (gameState && gameState.uiSettings) {
      setDestinyCompassMode(gameState.uiSettings.destinyCompassMode);
      setLustModeFlavor(gameState.uiSettings.lustModeFlavor);
      setNpcMindset(gameState.uiSettings.npcMindset);
      setIsLogicModeOn(gameState.uiSettings.isLogicModeOn);
      setIsConscienceModeOn(gameState.uiSettings.isConscienceModeOn);
      setIsStrictInterpretationOn(gameState.uiSettings.isStrictInterpretationOn);
    }
  }, [gameState]);
  
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('bms-view-mode', 'desktop');
  const [autoHideActionPanel, setAutoHideActionPanel] = useLocalStorage<boolean>('bms-auto-hide-panel', false);
  const [isImageGenerationEnabled, setIsImageGenerationEnabled] = useLocalStorage<boolean>('bms-image-gen-enabled', false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isPowerCreationModalOpen, setIsPowerCreationModalOpen] = useState(false);
  const [isGameSettingsModalOpen, setIsGameSettingsModalOpen] = useState(false);
  const [isAiControlPanelOpen, setIsAiControlPanelOpen] = useState(false);
  const [isLogicModeOn, setIsLogicModeOn] = useState(true);
  const [lustModeFlavor, setLustModeFlavor] = useState<LustModeFlavor | null>(null);
  const [npcMindset, setNpcMindset] = useState<NpcMindset>('IRON_WILL');
  const [isConscienceModeOn, setIsConscienceModeOn] = useState(false);
  const [isStrictInterpretationOn, setIsStrictInterpretationOn] = useState(true);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [isGameInitialized, setIsGameInitialized] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<LeftPanelTab>('info');
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>('npcs');
  const [customAction, setCustomAction] = useState('');
  const [isActionsPanelCollapsed, setIsActionsPanelCollapsed] = useState(false);
  const [destinyCompassMode, setDestinyCompassMode] = useState<DestinyCompassMode>('NORMAL');
  const [activeMemoryTab, setActiveMemoryTab] = useState<'long' | 'short'>('long');
  
  const isNewGame = useMemo(() => initialData && !('history' in initialData), [initialData]);

  // Filter player stats into character stats and inventory items
  const { characterStats, inventoryItems } = useMemo(() => {
    if (!gameState) return { characterStats: {}, inventoryItems: {} };
    
    const charStats: CharacterStats = {};
    const invItems: CharacterStats = {};

    for (const key in gameState.playerStats) {
        if (Object.prototype.hasOwnProperty.call(gameState.playerStats, key)) {
            const stat = gameState.playerStats[key];
            if (stat.isItem) {
                invItems[key] = stat;
            } else {
                charStats[key] = stat;
            }
        }
    }
    return { characterStats: charStats, inventoryItems: invItems };
  }, [gameState?.playerStats]);

  // Filter the stat order array accordingly
  const { characterStatOrder, inventoryItemOrder } = useMemo(() => {
    if (!gameState || !gameState.playerStatOrder) return { characterStatOrder: [], inventoryItemOrder: [] };
    
    const charOrder: string[] = [];
    const invOrder: string[] = [];

    gameState.playerStatOrder.forEach(key => {
        const stat = gameState.playerStats[key];
        if (stat) {
            if (stat.isItem) {
                invOrder.push(key);
            } else {
                charOrder.push(key);
            }
        }
    });
    return { characterStatOrder: charOrder, inventoryItemOrder: invOrder };
  }, [gameState?.playerStats, gameState?.playerStatOrder]);

  useEffect(() => {
    if (isNewGame) {
      setIsIntroModalOpen(true);
    } else {
      setIsGameInitialized(true);
    }
  }, [isNewGame]);

  useEffect(() => {
      if (lustModeFlavor !== null) {
          // Khi chế độ Dục Vọng được kích hoạt, buộc tắt chế độ Diễn Giải Nghiêm Túc.
          setIsStrictInterpretationOn(false);
      }
  }, [lustModeFlavor]);

  const handleIntroModalClose = () => {
    setIsIntroModalOpen(false);
    if (isNewGame && !isGameInitialized) {
      initializeGame();
      setIsGameInitialized(true);
    }
  };

  const handleCreatePower = async (data: {name: string, description: string}) => {
    setIsPowerCreationModalOpen(false);
    await createPowerFromDescription(data.name, data.description);
  };

  const latestTurn = gameState?.history[gameState.history.length - 1];
  
  const handleSaveAndExit = () => {
    if (gameState) {
      const gameStateWithSettings = {
        ...gameState,
        uiSettings: {
          destinyCompassMode,
          lustModeFlavor,
          npcMindset,
          isLogicModeOn,
          isConscienceModeOn,
          isStrictInterpretationOn,
        }
      };
      GameSaveService.saveManualSave(gameStateWithSettings);
    }
    onBackToMenu();
  };
  
  const doPlayerChoice = async (choice: string) => {
    await handlePlayerChoice(choice, isLogicModeOn, lustModeFlavor, npcMindset, isConscienceModeOn, isStrictInterpretationOn, destinyCompassMode, isImageGenerationEnabled);
    setCustomAction(''); // Clear input after any action
    if (autoHideActionPanel) {
      setIsActionsPanelCollapsed(true);
    }
  };

  const handleUseSkill = (skill: Skill, abilityName: string) => {
     setCustomAction(`Sử dụng kỹ năng: ${skill.name} - ${abilityName}.`);
  };

  const totalRequests = gameState ? gameState.history.length * 2 : (isGameInitialized ? 2 : 0);
  const worldContextForModal = gameState?.worldContext || (isNewGame ? initialData as WorldCreationState : null);


  const TabButton: React.FC<{ tabId: string; currentTab: string; onClick: (tabId: any) => void; children: React.ReactNode }> = ({ tabId, currentTab, onClick, children }) => {
    const isActive = tabId === currentTab;
    return (
        <button
            onClick={() => onClick(tabId)}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive 
                    ? 'text-white bg-[#e02585] shadow-[0_0_8px_rgba(224,37,133,0.5)]' 
                    : 'text-[#a08cb6] bg-black/20 hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );
  };

  return (
    <div className="relative h-screen bg-[#120c18] text-[#e8dff5] flex flex-col p-2 sm:p-4 overflow-hidden">
       <div className="absolute inset-0 theme-sensual-bg opacity-70"></div>
       <style>{`
        .theme-sensual-bg {
          background-image: radial-gradient(circle at top right, rgba(127, 59, 155, 0.4), transparent 40%),
                            radial-gradient(circle at bottom left, rgba(224, 37, 133, 0.3), transparent 50%);
        }
        .main-grid {
          grid-template-columns: minmax(320px, 25%) 1fr minmax(300px, 22%);
        }
        .title-glow {
            animation: title-pulse 5s ease-in-out infinite;
        }
        @keyframes title-pulse {
            0%, 100% { text-shadow: 0 0 5px #fff, 0 0 10px #e02585, 0 0 20px #e02585; }
            50% { text-shadow: 0 0 8px #fff, 0 0 18px #e02585, 0 0 30px #e02585; }
        }
        @keyframes fade-in-fast {
          from { opacity: 0; } to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        /* Scrollbar style toàn cục giống nút thông tin */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #120c18;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #e02585;
          border-radius: 10px;
          border: 2px solid #120c18;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #633aab;
        }
        /* Firefox */
        html {
          scrollbar-width: thin;
          scrollbar-color: #e02585 #120c18;
        }
       `}</style>
      
      <header className={`relative w-full flex-shrink-0 z-20 transition-all duration-500 ease-in-out overflow-hidden ${
          viewMode === 'mobile' && isActionsPanelCollapsed ? 'max-h-0 mb-0' : 'max-h-40 mb-2 sm:mb-4'
        }`}>
          <div className="flex justify-between items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider title-glow">{gameState?.worldContext?.storyName || 'Bách Mật Sáng Thế Giả'}</h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} disabled={!isGameInitialized} />
               <button 
                  onClick={() => setIsGameSettingsModalOpen(true)}
                  disabled={!isGameInitialized}
                  className="p-2.5 rounded-lg border border-solid border-[#3a2d47]/50 bg-[#1d1526]/80 text-[#a08cb6] hover:bg-[#3a2d47] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  title="Cài đặt trong game">
                  <CogIcon />
              </button>
              {isGameInitialized && (
                   <button onClick={() => setIsPowerCreationModalOpen(true)} className="flex items-center gap-2 text-sm text-[#a08cb6] bg-gradient-to-br from-[#1d1526] to-[#2a2135] rounded-lg px-2 sm:px-3 py-1.5 border border-solid border-[#e02585]/50 hover:from-[#2a2135] hover:to-[#3a2d47] hover:text-white hover:border-[#e02585] transition-all duration-300 shadow-md" title="Sáng Tạo Năng Lực">
                       <WandIcon />
                       <span className="hidden sm:inline">Sáng Tạo Năng Lực</span>
                   </button>
              )}
              {worldContextForModal && (
                  <button onClick={() => setIsIntroModalOpen(true)} className="flex items-center gap-2 text-sm text-[#a08cb6] bg-[#1d1526]/80 rounded-lg px-2 sm:px-3 py-1.5 border border-solid border-[#3a2d47]/50 hover:bg-white/10 hover:text-white transition-colors" title="Sổ Tay Vị Diện">
                      <BookIcon />
                      <span className="hidden sm:inline">Sổ Tay</span>
                  </button>
              )}
              <TokenCounter lastTurn={lastTurnTokenCount} total={totalTokenCount} />
              <RequestCounter count={totalRequests} />
              <Button onClick={triggerSaveToFile} variant="secondary" className="!py-2 !px-3 !text-xs sm:!text-sm" disabled={!isGameInitialized}>Lưu File</Button>
              <Button onClick={() => setIsExitModalOpen(true)} variant="secondary" className="!py-2 !px-3 !text-xs sm:!text-sm">Thoát</Button>
            </div>
          </div>
      </header>

      <main className={`relative flex-grow w-full min-h-0 ${viewMode === 'desktop' ? 'grid main-grid gap-4' : 'flex flex-col'}`}>
        {/* Left Panel */}
        <div className={`${viewMode === 'desktop' 
            ? 'flex flex-col h-full min-h-0' 
            : `fixed z-40 inset-y-0 left-0 w-4/5 max-w-sm h-full transform transition-transform duration-300 ease-in-out ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}>
            <div className="bg-[#1d1526]/95 backdrop-blur-sm rounded-2xl border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] h-full flex flex-col">
        <div className="flex-shrink-0 flex overflow-hidden rounded-t-xl">
          <TabButton tabId="info" currentTab={activeLeftTab} onClick={setActiveLeftTab}>Nhân Vật</TabButton>
          <TabButton tabId="skills" currentTab={activeLeftTab} onClick={setActiveLeftTab}>Kỹ Năng</TabButton>
          <TabButton tabId="inventory" currentTab={activeLeftTab} onClick={setActiveLeftTab}>Hành Trang</TabButton>
          <TabButton tabId="memory" currentTab={activeLeftTab} onClick={setActiveLeftTab}>Ký Ức</TabButton>
        </div>
                <div className="flex-grow min-h-0 overflow-y-auto">
                    {gameState && isGameInitialized && (
                        <>
              <div style={{ display: activeLeftTab === 'info' ? 'block' : 'none' }}>
                <CharacterSheet 
                  stats={characterStats}
                  playerStatOrder={characterStatOrder}
                  playerSkills={gameState.playerSkills}
                  isLoading={isLoading}
                  onAcquireSkill={manuallyAcquireSkill}
                  onRequestStatEdit={(statName, stat) => requestStatEdit('player', statName, stat)}
                  onRequestStatDelete={(statName) => requestStatDelete('player', statName)}
                  onReorderStat={reorderPlayerStat}
                  onMoveStatToTop={movePlayerStatToTop}
                  recentlyUpdatedStats={recentlyUpdatedPlayerStats}
                />
              </div>
              <div style={{ display: activeLeftTab === 'skills' ? 'block' : 'none' }}>
                <SkillCodex
                  skills={gameState.playerSkills}
                  onUseSkill={handleUseSkill}
                  onRequestDelete={requestSkillDeletion}
                  onRequestEdit={requestAbilityEdit}
                />
              </div>
              <div style={{ display: activeLeftTab === 'inventory' ? 'block' : 'none' }}>
                <InventorySheet
                  items={inventoryItems}
                  itemOrder={inventoryItemOrder}
                  isLoading={isLoading}
                  onRequestStatEdit={(statName, stat) => requestStatEdit('player', statName, stat)}
                  onRequestStatDelete={(statName) => requestStatDelete('player', statName)}
                  onReorderStat={reorderPlayerStat}
                  onMoveStatToTop={movePlayerStatToTop}
                  recentlyUpdatedStats={recentlyUpdatedPlayerStats}
                />
              </div>
              <div style={{ display: activeLeftTab === 'memory' ? 'block' : 'none' }}>
                <div className="p-4 pt-2 text-[#a08cb6] flex flex-col h-full">
                  {/* Sub-tabs */}
                  <div className="flex-shrink-0 flex justify-center border-b border-[#3a2d47] mb-4">
                    <button
                        onClick={() => setActiveMemoryTab('long')}
                        className={`px-6 py-2 text-sm font-rajdhani uppercase tracking-wider font-bold transition-all duration-300 ${activeMemoryTab === 'long' ? 'text-white border-b-2 border-[#e02585] bg-[#e02585]/10' : 'text-[#a08cb6] border-b-2 border-transparent hover:text-white'}`}
                    >
                        Ký Ức Dài Hạn
                    </button>
                    <button
                        onClick={() => setActiveMemoryTab('short')}
                        className={`px-6 py-2 text-sm font-rajdhani uppercase tracking-wider font-bold transition-all duration-300 ${activeMemoryTab === 'short' ? 'text-white border-b-2 border-[#e02585] bg-[#e02585]/10' : 'text-[#a08cb6] border-b-2 border-transparent hover:text-white'}`}
                    >
                        Ký Ức Ngắn Hạn
                    </button>
                  </div>
                  
                  {/* Conditional content */}
                  <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                    {activeMemoryTab === 'long' && (
                      <>
                        {gameState.plotChronicle && gameState.plotChronicle.length > 0 ? (
                          <ul className="space-y-2">
                            {gameState.plotChronicle.map((entry, idx) => (
                              <li key={idx} className="bg-[#201a2a]/80 rounded p-2 text-left border-l-4 border-[#6d4e8e]/40 flex flex-col gap-1 shadow-none">
                                <div className="font-bold text-[#cfc6e0] truncate" title={entry.summary}>{entry.summary}</div>
                                <div className="text-xs text-[#a08cb6] mt-1 truncate">Loại: {entry.eventType}</div>
                                <div className="text-xs text-[#cfc6e0] mt-1">Điểm quan trọng: <span className="font-bold">{entry.plotSignificanceScore}</span></div>
                                <div className="flex gap-2 mt-1">
                                  <button
                                    className="px-2 py-1 rounded bg-[#6d4e8e] text-[#e8dff5] text-xs font-bold hover:bg-[#32284a] hover:text-white"
                                    onClick={() => {
                                      setEditingChronicleIdx(idx);
                                      setEditingChronicleValue(entry.summary);
                                      setEditingMemoryType('long');
                                    }}
                                  >Chỉnh sửa</button>
                                  <button
                                    className="px-2 py-1 rounded bg-[#32284a] text-[#cfc6e0] text-xs font-bold hover:bg-[#6d4e8e] hover:text-white"
                                    onClick={() => setDetailModal({ type: 'long', idx, content: entry.summary })}
                                  >Chi tiết</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-sm text-[#a08cb6]/70 mt-8">Chưa có ký ức dài hạn nào.</div>
                        )}
                      </>
                    )}

                    {activeMemoryTab === 'short' && (
                      <>
                        {gameState.turnsSinceLastChronicle && gameState.turnsSinceLastChronicle.length > 0 ? (
                          <ul className="space-y-2">
                            {gameState.turnsSinceLastChronicle.map((turn, idx) => (
                              <li key={idx} className="bg-[#201a2a]/60 rounded p-2 text-left border-l-4 border-[#6d4e8e]/20 flex flex-col gap-1 shadow-none">
                                <div className="text-sm text-[#cfc6e0] truncate" title={turn.storyText}>{turn.storyText}</div>
                                <div className="flex gap-2 mt-1">
                                  <button
                                    className="px-2 py-1 rounded bg-[#6d4e8e] text-[#e8dff5] text-xs font-bold hover:bg-[#32284a] hover:text-white"
                                    onClick={() => {
                                      setEditingChronicleIdx(`short-${idx}`);
                                      setEditingChronicleValue(turn.storyText);
                                      setEditingMemoryType('short');
                                    }}
                                  >Chỉnh sửa</button>
                                  <button
                                    className="px-2 py-1 rounded bg-[#32284a] text-[#cfc6e0] text-xs font-bold hover:bg-[#6d4e8e] hover:text-white"
                                    onClick={() => setDetailModal({ type: 'short', idx, content: turn.storyText })}
                                  >Chi tiết</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-sm text-[#a08cb6]/70 mt-8">Chưa có ký ức ngắn hạn nào.</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* Modals are placed here, outside of loops and conditional rendering, but within the main tab container */}
                <MemoryEditModal
                  isOpen={editingChronicleIdx !== null}
                  onClose={() => { setEditingChronicleIdx(null); setEditingMemoryType(null); }}
                  onSave={(value, score) => {
                    if (editingChronicleIdx !== null && editingMemoryType) {
                      if (editingMemoryType === 'long') {
                        const currentScore = typeof editingChronicleIdx === 'number' && gameState?.plotChronicle?.[editingChronicleIdx]?.plotSignificanceScore;
                        updatePlotChronicleEntry(Number(editingChronicleIdx), value, score !== undefined ? score : currentScore);
                      } else {
                        updateShortTermMemoryTurn(Number((editingChronicleIdx as string).replace('short-', '')), value);
                      }
                    }
                    setEditingChronicleIdx(null);
                    setEditingMemoryType(null);
                  }}
                  initialValue={editingChronicleValue}
                  initialScore={editingMemoryType === 'long' && typeof editingChronicleIdx === 'number' && gameState?.plotChronicle?.[editingChronicleIdx]?.plotSignificanceScore !== undefined ? gameState.plotChronicle[editingChronicleIdx].plotSignificanceScore : undefined}
                  showScoreField={editingMemoryType === 'long'}
                  title={editingMemoryType === 'long' ? 'Chỉnh Sửa Ký Ức Dài Hạn' : editingMemoryType === 'short' ? 'Chỉnh Sửa Ký Ức Ngắn Hạn' : 'Chỉnh Sửa Ký Ức'}
                />
                {detailModal && createPortal(
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
                    <div
                      className="bg-[#1d1526] rounded-xl p-6 max-w-lg w-full border-2 border-[#e02585] shadow-2xl animate-fade-in-fast relative flex flex-col items-center justify-center"
                      style={{ minWidth: 320 }}
                    >
                      <button
                        className="absolute top-2 right-2 px-2 py-1 rounded bg-[#e02585] text-white text-xs font-bold hover:bg-[#ffd600] hover:text-[#2a2135]"
                        onClick={() => setDetailModal(null)}
                      >Đóng</button>
                      <div className="text-lg font-bold text-[#ffd600] mb-2 text-center">Chi tiết ký ức {detailModal.type === 'long' ? 'dài hạn' : 'ngắn hạn'}</div>
                      <div className="whitespace-pre-line text-[#e8dff5] text-base max-h-96 overflow-y-auto text-center">
                        {detailModal.content}
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Center Panel */}
        <div className="flex flex-col min-h-0 flex-grow">
            {isLoading && isGameInitialized && !skillToLearn && (
                 <div className="flex-grow flex items-center justify-center bg-[#1d1526]/80 rounded-2xl">
                    <div className="text-center">
                        <p className="text-xl animate-pulse">AI đang suy tư...</p>
                        <p className="text-sm text-gray-400 mt-2">Vui lòng chờ trong giây lát.</p>
                    </div>
                </div>
            )}
            {!isLoading && !isGameInitialized && !error && (
                 <div className="flex-grow flex items-center justify-center bg-[#1d1526]/80 rounded-2xl">
                    <div className="text-center">
                        <p className="text-xl">Chào mừng đến Vị Diện Mới</p>
                        <p className="text-sm text-gray-400 mt-2">Đọc kĩ bối cảnh và bắt đầu cuộc phiêu lưu của bạn.</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="flex-grow flex items-center justify-center bg-red-900/50 rounded-2xl p-4">
                    <div className="text-center w-full max-w-full">
                        <p className="text-xl text-red-300">Đã xảy ra lỗi</p>
                        <p className="text-sm text-red-200 mt-2 whitespace-pre-wrap text-left bg-black/20 p-3 rounded-md max-w-full overflow-x-auto font-mono">{error}</p>
                         <Button onClick={onBackToMenu} variant="primary" className="mt-4 w-auto !py-2 !px-4 !text-sm">Về Menu</Button>
                    </div>
                </div>
            )}
            {gameState && isGameInitialized && !error && (
                <>
                    <div className="flex-grow bg-[#1d1526]/80 rounded-2xl overflow-y-auto p-6 min-h-0 border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] transition-all duration-300">
                        <StoryLog 
                            history={gameState.history} 
                            mainCharacterName={gameState.worldContext.character.name}
                            npcNames={gameState.npcs.map(n => n.name)}
                            isImageGenerationEnabled={isImageGenerationEnabled}
                            generatedImageUrl={generatedImageUrl}
                            lastImageUrl={gameState.lastImageUrl}
                            isGeneratingImage={isGeneratingImage}
                            imageGenerationError={imageGenerationError}
                            onRegenerateImage={regenerateLastImage}
                        />
                    </div>
                    <div className="flex-shrink-0 pt-2 flex flex-col">
                        <button
                            onClick={() => setIsActionsPanelCollapsed(!isActionsPanelCollapsed)}
                            className="w-full flex items-center justify-center gap-2 py-2 mb-2 text-sm uppercase font-rajdhani font-bold text-[#e02585] bg-[#1d1526]/80 rounded-lg border border-solid border-[#633aab]/70 hover:bg-[#e02585]/20 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#120c18] focus:ring-[#e02585]"
                            aria-expanded={!isActionsPanelCollapsed}
                            aria-controls="actions-panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isActionsPanelCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span>{isActionsPanelCollapsed ? 'Hiện Bảng Hành Động' : 'Ẩn Bảng Hành Động'}</span>
                        </button>
                        
                        <div
                            id="actions-panel"
                            className={`transition-all duration-500 ease-in-out ${isActionsPanelCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}
                            style={{ maxHeight: isActionsPanelCollapsed ? '0px' : '45vh' }}
                        >
                            <ChoiceBox 
                                choices={latestTurn?.choices || []} 
                                onChoice={doPlayerChoice}
                                isLoading={isLoading || !!skillToLearn}
                                customAction={customAction}
                                onCustomActionChange={setCustomAction}
                                onUndo={undoLastTurn}
                                isUndoDisabled={!previousGameState || gameState.history.length <= 1}
                                onOpenAiControls={() => setIsAiControlPanelOpen(true)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Right Panel */}
        <div className={`${viewMode === 'desktop' 
            ? 'flex flex-col h-full min-h-0' 
            : `fixed z-40 inset-y-0 right-0 w-4/5 max-w-sm h-full transform transition-transform duration-300 ease-in-out ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`
        }`}>
            {gameState && isGameInitialized && (
                <div className="bg-[#1d1526]/95 backdrop-blur-sm rounded-2xl border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] h-full flex flex-col">
                  <div className="flex-shrink-0 flex overflow-hidden rounded-t-xl">
                    <TabButton tabId="npcs" currentTab={activeRightTab} onClick={setActiveRightTab}>Nhân Vật</TabButton>
                    <TabButton tabId="world" currentTab={activeRightTab} onClick={setActiveRightTab}>Thế Giới</TabButton>
                  </div>

                  <div className="flex-grow min-h-0 overflow-y-auto">
                    <div style={{ display: activeRightTab === 'npcs' ? 'block' : 'none' }}>
                        <NpcCodex 
                            npcs={gameState.npcs} 
                            onToggleProtection={toggleNpcProtection} 
                            onDeleteRequest={requestNpcDeletion} 
                            onReorderNpc={reorderNpc} 
                            onRequestNpcStatEdit={(npcId, statName, stat) => requestStatEdit('npc', statName, stat, npcId)} 
                            onRequestNpcStatDelete={(npcId, statName) => requestStatDelete('npc', statName, npcId)} 
                            recentlyUpdatedStats={recentlyUpdatedNpcStats} 
                        />
                    </div>
                    <div style={{ display: activeRightTab === 'world' ? 'block' : 'none' }}>
                       <WorldCodex
                          locations={gameState.worldLocations}
                          onToggleProtection={toggleLocationProtection}
                          onDeleteRequest={requestLocationDeletion}
                          onReorderLocation={reorderLocation}
                          onEditRequest={requestLocationEdit}
                       />
                    </div>
                  </div>
                </div>
            )}
        </div>
      </main>

      {/* Mobile UI Elements */}
      {viewMode === 'mobile' && (isLeftPanelOpen || isRightPanelOpen) && (
          <div 
              className="fixed inset-0 bg-black/60 z-30 animate-fade-in-fast"
              onClick={() => {
                  setIsLeftPanelOpen(false);
                  setIsRightPanelOpen(false);
              }}
          />
      )}
      {viewMode === 'mobile' && isGameInitialized && !isLeftPanelOpen && !isRightPanelOpen && (
          <>
              <button 
                  onClick={() => setIsLeftPanelOpen(true)}
                  className="fixed z-20 top-1/2 -translate-y-1/2 left-0 bg-[#e02585] text-white p-2 rounded-r-lg shadow-lg transform hover:scale-110 transition-transform"
                  aria-label="Mở bảng nhân vật"
              >
                  <UserIcon />
              </button>
              <button
                  onClick={() => setIsRightPanelOpen(true)}
                  className="fixed z-20 top-1/2 -translate-y-1/2 right-0 bg-[#e02585] text-white p-2 rounded-l-lg shadow-lg transform hover:scale-110 transition-transform"
                  aria-label="Mở bảng NPC"
              >
                  <UsersIcon />
              </button>
          </>
      )}

      {/* Modals */}
      <AiControlPanelModal
        isOpen={isAiControlPanelOpen}
        onClose={() => setIsAiControlPanelOpen(false)}
        isLoading={isLoading || !!skillToLearn}
        isLogicModeOn={isLogicModeOn}
        onLogicModeChange={setIsLogicModeOn}
        lustModeFlavor={lustModeFlavor}
        onLustModeFlavorChange={setLustModeFlavor}
        npcMindset={npcMindset}
        onNpcMindsetChange={setNpcMindset}
        isConscienceModeOn={isConscienceModeOn}
        onConscienceModeChange={setIsConscienceModeOn}
        isStrictInterpretationOn={isStrictInterpretationOn}
        onStrictInterpretationChange={setIsStrictInterpretationOn}
        destinyCompassMode={destinyCompassMode}
        onDestinyCompassModeChange={setDestinyCompassMode}
      />
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={onBackToMenu}
      />
       <PowerCreationModal
        isOpen={isPowerCreationModalOpen}
        onClose={() => setIsPowerCreationModalOpen(false)}
        onSubmit={handleCreatePower}
        isLoading={isLoading}
      />
      {worldContextForModal && (
         <IntroductoryModal
            isOpen={isIntroModalOpen}
            onClose={handleIntroModalClose}
            worldContext={worldContextForModal}
            confirmText={isGameInitialized ? "Đóng" : "Bước Vào Thế Giới"}
        />
      )}
      <SkillAcquisitionModal
          isOpen={!!skillToLearn}
          skill={skillToLearn}
          onConfirm={confirmLearnSkill}
          onDecline={declineLearnSkill}
      />
      <ConfirmationModal
        isOpen={!!npcToDelete}
        onClose={cancelNpcDeletion}
        onConfirm={confirmNpcDeletion}
        title="Xác nhận Xóa NPC"
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy"
        confirmVariant="primary"
      >
        <p>Hành động này sẽ xóa vĩnh viễn NPC khỏi thế giới.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn xóa {npcToDelete?.name} không?</p>
      </ConfirmationModal>
       <StatEditModal
        isOpen={!!editingStat}
        onClose={cancelStatEdit}
        onSave={confirmStatEdit}
        statData={editingStat ? { statName: editingStat.statName, stat: editingStat.stat } : null}
        isLoading={isLoading}
      />
      <ConfirmationModal
        isOpen={!!deletingStat}
        onClose={cancelStatDelete}
        onConfirm={confirmStatDelete}
        title="Xác nhận Xóa Chỉ Số"
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy"
        confirmVariant="primary"
      >
        <p>Hành động này sẽ xóa vĩnh viễn chỉ số này.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn xóa '{deletingStat?.statName}' không?</p>
      </ConfirmationModal>
      <LocationEditModal
        isOpen={!!editingLocation}
        onClose={cancelLocationEdit}
        onSave={confirmLocationEdit}
        locationData={editingLocation}
        isLoading={isLoading}
      />
      <ConfirmationModal
        isOpen={!!locationToDelete}
        onClose={cancelLocationDeletion}
        onConfirm={confirmLocationDeletion}
        title="Xác nhận Xóa Địa Danh"
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy"
        confirmVariant="primary"
      >
        <p>Hành động này sẽ xóa vĩnh viễn Địa danh này khỏi thế giới.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn xóa {locationToDelete?.name} không?</p>
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={!!skillToDelete}
        onClose={cancelSkillDeletion}
        onConfirm={confirmSkillDeletion}
        title="Xác nhận Quên Kỹ Năng"
        confirmText="Xác nhận Quên"
        cancelText="Hủy"
        confirmVariant="primary"
      >
        <p>Hành động này sẽ khiến bạn vĩnh viễn quên đi kỹ năng này.</p>
        <p className="font-bold mt-2">Bạn có chắc chắn muốn quên đi '{skillToDelete?.name}' không?</p>
      </ConfirmationModal>
       <AbilityEditModal
        isOpen={!!editingAbility}
        onClose={cancelAbilityEdit}
        onSave={confirmAbilityEdit}
        abilityData={editingAbility}
        isLoading={isLoading}
      />
      <GameSettingsModal
        isOpen={isGameSettingsModalOpen}
        onClose={() => setIsGameSettingsModalOpen(false)}
        autoHideActionPanel={autoHideActionPanel}
        setAutoHideActionPanel={setAutoHideActionPanel}
        isImageGenerationEnabled={isImageGenerationEnabled}
        setIsImageGenerationEnabled={setIsImageGenerationEnabled}
      />
    </div>
  );
};

export default GameScreen;