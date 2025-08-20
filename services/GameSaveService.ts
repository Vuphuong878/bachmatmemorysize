
import { GameState } from '../types';

const MANUAL_SAVE_KEY = 'BMS_TG_ManualSaveData';
const AUTO_SAVE_KEY = 'BMS_TG_AutoSaveData';

function validateAndHydrateGameState(parsedState: any): GameState | null {
  // Basic validation
  if (parsedState && parsedState.history && parsedState.playerStats && parsedState.worldContext) {
    // Ensure npcs array exists for backward compatibility
    if (!Array.isArray(parsedState.npcs)) {
      parsedState.npcs = [];
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
