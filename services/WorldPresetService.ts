import { WorldCreationState } from '../types';

/**
 * Saves the world creation state to a .json file and triggers a download.
 * @param preset The current state of the world creator form.
 */
export function savePresetToFile(preset: WorldCreationState): void {
  try {
    const serializedState = JSON.stringify(preset, null, 2); // Pretty print JSON
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BMS-TG-Preset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to save preset to file:", error);
    alert("Không thể lưu file thiết lập.");
  }
}

/**
 * Loads a world creation preset from a user-selected .json file.
 * @param file The .json file selected by the user.
 * @returns A promise that resolves with the parsed WorldCreationState.
 */
export function loadPresetFromFile(file: File): Promise<WorldCreationState> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      return reject(new Error("Vui lòng chọn một file thiết lập (.json) hợp lệ."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedState = JSON.parse(text) as WorldCreationState;
        // Basic validation to ensure it's a world creation state and not a game save state.
        if (
          parsedState && 
          typeof parsedState.genre === 'string' &&
          typeof parsedState.description === 'string' &&
          typeof parsedState.isNsfw === 'boolean' &&
          parsedState.character &&
          typeof parsedState.character.name === 'string' &&
          !('history' in parsedState) // Make sure it's not a game save
        ) {
          resolve(parsedState);
        } else {
          reject(new Error("File thiết lập không hợp lệ hoặc bị hỏng."));
        }
      } catch (e) {
        reject(new Error("Không thể đọc file thiết lập. File có thể bị hỏng."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc file."));
    };
    reader.readAsText(file);
  });
}