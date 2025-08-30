export enum ApiKeySource {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM',
}

export interface Settings {
  apiKeySource: ApiKeySource;
  customApiKeys: string[];
  currentApiKeyIndex: number;
}

export type NarrativePerspective = 'Ngôi thứ hai' | 'Ngôi thứ ba Giới hạn' | 'Ngôi thứ ba Toàn tri';
export type LustModeFlavor = 'DOMINATION' | 'HARMONY' | 'SUBMISSION' | 'TEASING' | 'AI_FREESTYLE' | 'SEDUCTION';
export type NpcMindset = 'IRON_WILL' | 'TORN_MIND' | 'PRIMAL_INSTINCT' | 'HEDONISTIC_MIND';
export type ViewMode = 'desktop' | 'mobile';
export type DestinyCompassMode = 'NORMAL' | 'HARSH' | 'HELLISH';

// State from the world creator screen
export interface WorldCreationState {
  storyName: string;
  genre: string;
  description: string;
  isNsfw: boolean;
  narrativePerspective: NarrativePerspective;
  character: {
    name: string;
    gender: 'Nam' | 'Nữ' | 'Tự định nghĩa';
    customGender: string;
    personality: string;
    biography: string;
    skills: string; // User's raw text input for skills
  };
}

// Represents a single ability within a skill set
export interface Ability {
  name: string;
  description: string;
}

// Represents a set of skills for the character
export interface Skill {
  name: string;
  description: string;
  abilities: Ability[];
}

// Represents a single character stat, which can be temporary.
export interface CharacterStat {
  value: string | number;
  duration?: number; // Optional number of turns this stat will last.
  history?: string[]; // Optional array of previous values for this stat.
  isItem?: boolean; // If true, this stat represents a physical item in the inventory.
  evolution?: {
    after: number; // The turn count at which this evolution triggers
    becomes: string; // The name of the new stat
    withValue: string; // The value of the new stat
    withDuration?: number; // The optional duration of the new stat
  };
}

// Represents a single stat update from the AI.
export interface CharacterStatUpdate {
  statName: string;
  value: string | number;
  duration?: number;
  history?: string[];
  isItem?: boolean;
  evolution?: {
    after: number;
    becomes: string;
    withValue: string;
    withDuration?: number;
  };
}


// Dynamic stats for the character, can be updated by the AI
export interface CharacterStats {
  [key: string]: CharacterStat;
}


// Represents one turn in the game's story
export interface GameTurn {
  playerAction: string | null; // The action (choice) that led to this story text. Null for the first turn.
  storyText: string;
  choices: string[];
  tokenCount?: number; // How many tokens this turn cost
  isMajorEvent?: boolean; // Flag for important plot points
  isCondensedMemory?: boolean; // Flag for a turn that is a summary of previous turns
}

// Represents an entry in the structured plot chronicle.
export interface ChronicleEntry {
    summary: string;
    eventType: string;
    involvedNpcIds: string[];
    isUnforgettable: boolean;
    plotSignificanceScore: number;
    relationshipChanges?: {
        npcId: string;
        change: string;
        reason: string;
    }[];
        // --- Các trường mới được thêm vào ---
    keyDetail?: string; // Chi tiết ẩn quan trọng nhất được phát hiện
    potentialConsequence?: string; // Dự đoán về hệ quả tương lai
}

// Represents a Non-Player Character
export interface NPC {
  id: string; // A unique, machine-readable ID (e.g., 'an_nac')
  name: string;
  gender: string;
  personality: string;
  relationship: string; // Relationship to the player (e.g., 'Nô lệ', 'Kẻ thù')
  identity: string; // Thân phận (vai trò, xuất thân, nghề nghiệp...)
  appearance: string; // Physical appearance/description of the NPC
  virginity?: string; // Trinh tiết/Nguyên Âm (chỉ cho NPC nữ, tùy chủ đề)
  status: string; // Current state (e.g., 'Bị giam giữ', 'Tự do')
  lastInteractionSummary: string; // A one-sentence summary of the last key interaction
  stats?: CharacterStats; // Optional stats specific to this NPC
  isProtected?: boolean; // If true, AI is forbidden from deleting this NPC
  sortOrder?: number; // Manual sorting order
}

// Represents an update instruction for an NPC from the AI
export interface NPCUpdate {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  id: string; // ID of the NPC to update or delete
  payload?: Partial<Omit<NPC, 'stats'>> & { stats?: CharacterStatUpdate[] };
  // virginity, identity, appearance are included via Partial<Omit<NPC, 'stats'>>
}

// Represents a location in the world
export interface WorldLocation {
  id: string; // A unique, machine-readable ID (e.g., 'thanh_huyen_mon')
  name: string;
  description: string; // Detailed description of the location
  status: string; // Current status (e.g., 'Yên bình', 'Bị phá hủy', 'Bị bao vây')
  lastEventSummary: string; // A one-sentence summary of the last key event that happened here
  isProtected?: boolean; // If true, AI is forbidden from deleting this location
  sortOrder?: number;
}

// Represents an update instruction for a world location from the AI
export interface WorldLocationUpdate {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  id: string;
  payload?: Partial<Omit<WorldLocation, 'status' | 'lastEventSummary'>>;
}


// The overall state of the game session
export interface GameState {
  history: GameTurn[];
  playerStats: CharacterStats;
  playerStatOrder?: string[];
  worldContext: WorldCreationState;
  npcs: NPC[];
  worldLocations: WorldLocation[];
  playerSkills: Skill[]; // Structured skills
  plotChronicle: ChronicleEntry[]; // The structured, summarized history of major plot points.
  turnsSinceLastChronicle: GameTurn[]; // Track turns for the next summary
  lastImageUrl?: string; // The URL for the AI-generated image for the latest turn.
  turnCount: number; // The total number of turns played.
  worldInfoSheet: string; // A summary of off-screen world events.
  // UI/gameplay settings (optional)
  uiSettings?: {
    destinyCompassMode: DestinyCompassMode;
    lustModeFlavor: LustModeFlavor | null;
    npcMindset: NpcMindset;
    isLogicModeOn: boolean;
    isConscienceModeOn: boolean;
    isStrictInterpretationOn: boolean;
    worldSimulatorTurns?: number;
    worldSimulatorOnSceneBreak?: boolean;
  };
}