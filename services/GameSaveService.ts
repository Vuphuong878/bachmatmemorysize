import { GameState } from '../types';

const MANUAL_SAVE_KEY = 'BMS_TG_ManualSaveData';
const AUTO_SAVE_KEY = 'BMS_TG_AutoSaveData';
const CORE_STATS = ['Sinh Lực', 'Thể Lực', 'Lý trí', 'Cảnh Giới'];


function validateAndHydrateGameState(parsedState: any): GameState | null {
  // Basic validation
  if (parsedState && parsedState.history && parsedState.playerStats && parsedState.worldContext) {
    // --- HYDRATION & MIGRATION FOR BACKWARD COMPATIBILITY ---
    
    // Ensure npcs array exists
    if (!Array.isArray(parsedState.npcs)) {
      parsedState.npcs = [];
    }
    
    // Ensure worldLocations array exists
    if (!Array.isArray(parsedState.worldLocations)) {
        parsedState.worldLocations = [];
    }

    // Ensure storyName exists in worldContext
    if (typeof parsedState.worldContext.storyName === 'undefined') {
      parsedState.worldContext.storyName = '';
    }

    // Migrate history entries to ensure imageUrl property exists (for backward compatibility)
    if (Array.isArray(parsedState.history)) {
      parsedState.history = parsedState.history.map((turn: any) => ({
        ...turn,
        imageUrl: turn.imageUrl || undefined // Ensure imageUrl exists even if undefined
      }));
    }

    // Migrate plotChronicle from old string format to new array format
    if (typeof parsedState.plotChronicle === 'string') {
        const oldChronicle = parsedState.plotChronicle as string;
        parsedState.plotChronicle = oldChronicle ? [{
            summary: oldChronicle,
            eventType: 'Legacy Import',
            involvedNpcIds: [],
            isUnforgettable: true,
            plotSignificanceScore: 10,
        }] : [];
    }
    if (!Array.isArray(parsedState.plotChronicle)) parsedState.plotChronicle = [];
    
    // Add plotSignificanceScore to old chronicle entries that don't have it
    if (parsedState.plotChronicle.length > 0) {
        parsedState.plotChronicle = parsedState.plotChronicle.map((entry: any) => ({
            ...entry,
            plotSignificanceScore: entry.plotSignificanceScore ?? (entry.isUnforgettable ? 10 : 5)
        }));
    }

    if (!Array.isArray(parsedState.playerSkills)) parsedState.playerSkills = [];
    if (!parsedState.turnsSinceLastChronicle) {
        parsedState.turnsSinceLastChronicle = [];
    }

    // Add sortOrder and ensure isProtected exists for NPCs in old saves
    const isOldNpcSave = parsedState.npcs.some((npc: any) => npc.sortOrder === undefined);
    if (isOldNpcSave) {
        parsedState.npcs.sort((a: any, b: any) => {
            const aProtected = a.isProtected ? 1 : 0;
            const bProtected = b.isProtected ? 1 : 0;
            if (aProtected !== bProtected) return bProtected - aProtected;
            return a.name.localeCompare(b.name);
        });
        parsedState.npcs = parsedState.npcs.map((npc: any, index: number) => ({ ...npc, isProtected: !!npc.isProtected, sortOrder: index }));
    } else {
        // For newer saves, just ensure isProtected exists and re-sort
        parsedState.npcs = parsedState.npcs.map((npc: any) => ({ ...npc, isProtected: !!npc.isProtected })).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    // Generate playerStatOrder for old saves
    if (!parsedState.playerStatOrder || !Array.isArray(parsedState.playerStatOrder)) {
        const allStatKeys = Object.keys(parsedState.playerStats);
        const coreStatKeys = CORE_STATS.filter(coreStat => allStatKeys.includes(coreStat));
        const otherStatKeys = allStatKeys.filter((key: string) => !CORE_STATS.includes(key)).sort((a: string, b: string) => a.localeCompare(b));
        parsedState.playerStatOrder = [...coreStatKeys, ...otherStatKeys];
    }
    
    // Add turnsSinceLastProgression for old saves
    if (typeof parsedState.turnsSinceLastProgression === 'undefined') {
      parsedState.turnsSinceLastProgression = 0;
    }

    return parsedState as GameState;
  }
  return null;
}


// --- Manual Save ---

export function saveManualSave(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(MANUAL_SAVE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save manual game to localStorage:", error);
  }
}

export function loadManualSave(): GameState | null {
  try {
    const serializedState = localStorage.getItem(MANUAL_SAVE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsed = JSON.parse(serializedState);
    return validateAndHydrateGameState(parsed);
  } catch (error) {
    console.error("Failed to load manual game from localStorage:", error);
    return null;
  }
}

export function hasManualSave(): boolean {
  return localStorage.getItem(MANUAL_SAVE_KEY) !== null;
}

// --- Auto Save ---

export function saveAutoSave(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(AUTO_SAVE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save auto game to localStorage:", error);
  }
}

export function loadAutoSave(): GameState | null {
  try {
    const serializedState = localStorage.getItem(AUTO_SAVE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsed = JSON.parse(serializedState);
    return validateAndHydrateGameState(parsed);
  } catch (error) {
    console.error("Failed to load auto game from localStorage:", error);
    return null;
  }
}

export function hasAutoSave(): boolean {
  return localStorage.getItem(AUTO_SAVE_KEY) !== null;
}


// --- General ---

export function deleteAllLocalSaves(): void {
  try {
    localStorage.removeItem(MANUAL_SAVE_KEY);
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (error) {
    console.error("Failed to delete all saves from localStorage:", error);
  }
}


// --- File System ---

export function saveToFile(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState, null, 2); // Pretty print JSON
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BMS-TG-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to save game to file:", error);
    alert("Không thể tải file lưu.");
  }
}

export function loadFromFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      return reject(new Error("Vui lòng chọn một file save (.json) hợp lệ."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedState = JSON.parse(text);
        const validatedState = validateAndHydrateGameState(parsedState);
        if (validatedState) {
          resolve(validatedState);
        } else {
          reject(new Error("File save không hợp lệ hoặc bị hỏng."));
        }
      } catch (e) {
        reject(new Error("Không thể đọc file save. File có thể bị hỏng."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc file."));
    };
    reader.readAsText(file);
  });
}