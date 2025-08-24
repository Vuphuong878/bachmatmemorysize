import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';
import { WorldCreationState, GameState, GameTurn, CharacterStats, NPC, NPCUpdate, CharacterStat, CharacterStatUpdate, Skill, LustModeFlavor, ApiKeySource, NpcMindset, Ability, DestinyCompassMode, ChronicleEntry } from '../types';
import * as storytellerService from '../services/GeminiStorytellerService';
import * as GameSaveService from '../services/GameSaveService';

const CORE_STATS = ['Sinh Lực', 'Thể Lực', 'Lý trí', 'Dục vọng', 'Cảnh Giới'];

/**
 * Converts an array of stat updates from the AI into the CharacterStats object format used by the game state.
 * @param updates - The array of stat update objects from the AI.
 * @returns A CharacterStats object.
 */
function convertStatUpdatesArrayToObject(updates: CharacterStatUpdate[]): CharacterStats {
    const statsObject: CharacterStats = {};
    if (!updates || !Array.isArray(updates)) {
        return statsObject;
    }
    for (const update of updates) {
        // The statName is the key, the rest of the object is the value
        const { statName, ...restOfStat } = update;
        if (statName) {
            statsObject[statName] = restOfStat;
        }
    }
    return statsObject;
}

/**
 * Merges two CharacterStats objects, preserving properties from the base object 
 * that are not present in the update object for a given stat.
 * This is crucial for preserving fields like `history` when the AI provides a simple value update.
 * @param baseStats The original stats object.
 * @param updates The object containing stat changes.
 * @returns A new CharacterStats object with the updates merged intelligently.
 */
function smartMergeStats(baseStats: CharacterStats, updates: CharacterStats): CharacterStats {
    const mergedStats = { ...baseStats };

    for (const statName in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, statName)) {
            const updateData = updates[statName];
            const baseData = baseStats[statName];

            if (baseData) {
                // Stat exists, merge properties intelligently.
                // The `...updateData` will overwrite properties from `...baseData` if they exist in both,
                // but properties only in `baseData` (like `history`) will be preserved.
                mergedStats[statName] = {
                    ...baseData,
                    ...updateData
                };
            } else {
                // This is a new stat, just add it.
                mergedStats[statName] = updateData;
            }
        }
    }
    return mergedStats;
}


function applyNpcUpdates(currentNpcs: NPC[], updates: NPCUpdate[]): NPC[] {
    let newNpcList = [...currentNpcs];

    updates.forEach(update => {
        // Post-Processing and Data Standardization Mechanism:
        // Filter out any stat named 'status' or 'lastInteractionSummary' to prevent AI Core from overstepping its role.
        if (update.payload && Array.isArray(update.payload.stats)) {
            update.payload.stats = update.payload.stats.filter(
                stat => {
                    const statNameClean = stat.statName.toLowerCase().trim();
                    return statNameClean !== 'status' && statNameClean !== 'lastinteractionsummary';
                }
            );
        }

        const index = newNpcList.findIndex(npc => npc.id === update.id);

        switch (update.action) {
            case 'CREATE':
                // Extra safety check: only create if ID doesn't already exist.
                if (index === -1 && update.payload) {
                    const { stats: statsArray, ...otherPayload } = update.payload;
                    const statsObject = convertStatUpdatesArrayToObject(statsArray || []);
                    
                    const newNpc: NPC = {
                        ...(otherPayload as Omit<NPC, 'id'>), // Cast to ensure base properties are there
                        id: update.id,
                        stats: Object.keys(statsObject).length > 0 ? statsObject : undefined,
                        isProtected: otherPayload.isProtected || false, // Initialize as false
                        sortOrder: newNpcList.length, // Assign to the end of the list
                    };

                    newNpcList.push(newNpc);
                }
                break;
            case 'UPDATE':
                if (index !== -1 && update.payload) {
                    const existingNpc = newNpcList[index];
                    const { stats: newStatsArray, ...otherPayload } = update.payload;

                    const newStatChanges = convertStatUpdatesArrayToObject(newStatsArray || []);
                    
                    // "Smart Merge" for NPC stats to preserve history and other fields.
                    const updatedStats = smartMergeStats(existingNpc.stats || {}, newStatChanges);

                    newNpcList[index] = {
                        ...existingNpc,
                        ...otherPayload,
                        // Only assign stats if there are any, to avoid empty {}
                        stats: Object.keys(updatedStats).length > 0 ? updatedStats : undefined
                    };
                }
                break;
            case 'DELETE':
                if (index !== -1) {
                    // **Critical change**: Do not delete protected NPCs
                    const npcToDelete = newNpcList[index];
                    if (npcToDelete.isProtected) {
                        break; // Skip deletion
                    }
                    newNpcList.splice(index, 1);
                }
                break;
        }
    });

    return newNpcList;
}

/**
 * Processes a single set of stats for evolutions and duration decrements.
 * This function is the core of the new Dynamic State System.
 */
function processSingleStatSet(currentStats: CharacterStats): CharacterStats {
    const newStats: CharacterStats = {};
    const statsToAdd: CharacterStats = {};

    // First, iterate to check for evolutions
    for (const key in currentStats) {
        if (Object.prototype.hasOwnProperty.call(currentStats, key)) {
            const stat = currentStats[key];
            
            // Check for evolution trigger
            if (stat.evolution && stat.duration !== undefined && stat.duration <= stat.evolution.after) {
                 // Evolution happens, create the new stat
                 const newEvolvedStat: CharacterStat = {
                     value: stat.evolution.withValue,
                     duration: stat.evolution.withDuration,
                 };
                 statsToAdd[stat.evolution.becomes] = newEvolvedStat;
                 // The old stat will not be copied to newStats, effectively deleting it.
            } else {
                // If no evolution, keep the stat for now
                newStats[key] = { ...stat };
            }
        }
    }

    // Now, process durations for the remaining stats
    for (const key in newStats) {
         const stat = newStats[key];
         if (typeof stat.duration === 'number') {
            // If a stat's duration runs out, delete it, UNLESS it's a core stat.
            if (stat.duration <= 1 && !CORE_STATS.includes(key)) {
                delete newStats[key];
            } else {
                // Otherwise, just decrement the duration. Core stats with a duration will just have it tick down but never be removed by this logic.
                newStats[key] = { ...stat, duration: stat.duration - 1 };
            }
         }
    }
    
    // Finally, add the newly evolved stats
    return { ...newStats, ...statsToAdd };
}


function processEndOfTurnStatChanges(
    playerStats: CharacterStats,
    npcs: NPC[]
): { newPlayerStats: CharacterStats; newNpcs: NPC[] } {
    const newPlayerStats = processSingleStatSet(playerStats);
    
    const newNpcs = npcs.map(npc => {
        if (npc.stats) {
            return { ...npc, stats: processSingleStatSet(npc.stats) };
        }
        return npc;
    });

    return { newPlayerStats, newNpcs };
}


export function useGameEngine(
    initialData: WorldCreationState | GameState | null,
    settingsHook: ReturnType<typeof useSettings>
) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastTurnTokenCount, setLastTurnTokenCount] = useState(0);
    const [totalTokenCount, setTotalTokenCount] = useState(0);
    const [skillToLearn, setSkillToLearn] = useState<Skill | null>(null);
    const [npcToDelete, setNpcToDelete] = useState<NPC | null>(null);
    const [editingStat, setEditingStat] = useState<{ target: 'player' | 'npc', npcId?: string, statName: string, stat: CharacterStat } | null>(null);
    const [deletingStat, setDeletingStat] = useState<{ target: 'player' | 'npc', npcId?: string, statName: string } | null>(null);
    const [presentNpcIds, setPresentNpcIds] = useState<string[] | null>(null);
    const [recentlyUpdatedPlayerStats, setRecentlyUpdatedPlayerStats] = useState<Set<string>>(new Set());
    const [recentlyUpdatedNpcStats, setRecentlyUpdatedNpcStats] = useState<Map<string, Set<string>>>(new Map());
    
    // State for new skill management features
    const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
    const [editingAbility, setEditingAbility] = useState<{ skillName: string; ability: Ability } | null>(null);

    const { geminiService, settings, rotateApiKey } = settingsHook;

    const handleApiError = (e: any, contextAction: string) => {
        console.error(`Lỗi trong '${contextAction}':`, e);
        if (settings.apiKeySource === ApiKeySource.CUSTOM && settings.customApiKeys.filter(k => k.trim() !== '').length > 1) {
            const oldKeyIndex = settings.currentApiKeyIndex;
            rotateApiKey();
            setError(`Khóa API (vị trí ${oldKeyIndex + 1}) đã gặp lỗi hoặc hết hạn mức. Đã tự động chuyển sang khóa tiếp theo. Vui lòng thử lại hành động của bạn.\n\nChi tiết lỗi: ${e.message}`);
        } else {
            setError(e.message || `AI gặp lỗi không xác định khi ${contextAction}.`);
        }
    };

    const initializeGame = useCallback(async () => {
        if (gameState && 'history' in gameState) return;
        if (!initialData) {
            setError("Không có dữ liệu để bắt đầu game.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setPresentNpcIds(null); 
        setRecentlyUpdatedPlayerStats(new Set());
        setRecentlyUpdatedNpcStats(new Map());
        
        if ('history' in initialData) {
            // --- START MIGRATION LOGIC FOR OLD SAVES ---
            if (typeof (initialData as any).plotChronicle === 'string') {
                const oldChronicle = (initialData as any).plotChronicle as string;
                (initialData as GameState).plotChronicle = oldChronicle ? [{
                    summary: oldChronicle,
                    eventType: 'Legacy Import',
                    involvedNpcIds: [],
                    isUnforgettable: true,
                    plotSignificanceScore: 10, // Default for legacy
                }] : [];
            }
            if (!Array.isArray(initialData.plotChronicle)) initialData.plotChronicle = [];
            
            // Add plotSignificanceScore to old chronicle entries that don't have it
            if (initialData.plotChronicle.length > 0) {
                initialData.plotChronicle = initialData.plotChronicle.map(entry => ({
                    ...entry,
                    plotSignificanceScore: entry.plotSignificanceScore ?? (entry.isUnforgettable ? 10 : 5)
                }));
            }

            if (!Array.isArray(initialData.playerSkills)) initialData.playerSkills = [];
            if (!(initialData as GameState).turnsSinceLastChronicle) {
                (initialData as GameState).turnsSinceLastChronicle = [];
            }

            const isOldSave = initialData.npcs.some(npc => npc.sortOrder === undefined);
            if (isOldSave) {
                initialData.npcs.sort((a, b) => {
                    const aProtected = a.isProtected ? 1 : 0;
                    const bProtected = b.isProtected ? 1 : 0;
                    if (aProtected !== bProtected) return bProtected - aProtected;
                    return a.name.localeCompare(b.name);
                });
                initialData.npcs = initialData.npcs.map((npc, index) => ({ ...npc, isProtected: !!npc.isProtected, sortOrder: index }));
            } else {
                initialData.npcs = initialData.npcs.map(npc => ({ ...npc, isProtected: !!npc.isProtected })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            }

            if (!initialData.playerStatOrder || !Array.isArray(initialData.playerStatOrder)) {
                const allStatKeys = Object.keys(initialData.playerStats);
                const coreStatKeys = CORE_STATS.filter(coreStat => allStatKeys.includes(coreStat));
                const otherStatKeys = allStatKeys.filter(key => !CORE_STATS.includes(key)).sort((a, b) => a.localeCompare(b));
                initialData.playerStatOrder = [...coreStatKeys, ...otherStatKeys];
            }
            // --- END MIGRATION LOGIC ---

            setGameState(initialData);
            const totalTokens = initialData.history.reduce((sum, turn) => sum + (turn.tokenCount || 0), 0);
            setTotalTokenCount(totalTokens);
            setLastTurnTokenCount(initialData.history[initialData.history.length - 1]?.tokenCount || 0);
            setIsLoading(false);
            return;
        }
        const worldState = initialData;
        if (!geminiService) {
            setError("Dịch vụ Gemini chưa được khởi tạo. Vui lòng kiểm tra lại thiết lập.");
            setIsLoading(false);
            return;
        }
        try {
            const { initialTurn, initialPlayerStatUpdates, initialNpcUpdates, initialPlayerSkills, presentNpcIds: initialPresentNpcs } = await storytellerService.initializeStory(worldState, geminiService);
            const initialPlayerStats = convertStatUpdatesArrayToObject(initialPlayerStatUpdates);
            const initialNpcs = applyNpcUpdates([], initialNpcUpdates);
            
            const allInitialStatKeys = Object.keys(initialPlayerStats);
            const coreInitialStatKeys = CORE_STATS.filter(coreStat => allInitialStatKeys.includes(coreStat));
            const otherInitialStatKeys = allInitialStatKeys.filter(key => !CORE_STATS.includes(key)).sort();
            const initialPlayerStatOrder = [...coreInitialStatKeys, ...otherInitialStatKeys];
            
            const newState: GameState = {
                history: [initialTurn],
                playerStats: initialPlayerStats,
                playerStatOrder: initialPlayerStatOrder,
                worldContext: worldState,
                npcs: initialNpcs,
                playerSkills: initialPlayerSkills,
                plotChronicle: [],
                turnsSinceLastChronicle: [initialTurn],
            };
            setGameState(newState);
            GameSaveService.saveAutoSave(newState); // Auto-save after initialization
            setPresentNpcIds(initialPresentNpcs);
            const tokenCount = initialTurn.tokenCount || 0;
            setLastTurnTokenCount(tokenCount);
            setTotalTokenCount(tokenCount);
        } catch (e: any) {
            handleApiError(e, "bắt đầu câu chuyện");
        } finally {
            setIsLoading(false);
        }
    }, [initialData, geminiService, gameState]);

    useEffect(() => {
        if (initialData && 'history' in initialData) {
            initializeGame();
        } else {
            setIsLoading(false);
        }
    }, [initialData, initializeGame]);


    const handlePlayerChoice = async (choice: string, isLogicModeOn: boolean, lustModeFlavor: LustModeFlavor | null, npcMindset: NpcMindset, isConscienceModeOn: boolean, isStrictInterpretationOn: boolean, destinyCompassMode: DestinyCompassMode) => {
        if (!gameState || !geminiService) return;
        setIsLoading(true);
        setError(null);
        const { newPlayerStats: processedPlayerStats, newNpcs: processedNpcs } = processEndOfTurnStatChanges(gameState.playerStats, gameState.npcs);
        try {
            const npcsForAI = presentNpcIds
                ? processedNpcs.filter(npc => presentNpcIds.includes(npc.id))
                : processedNpcs;

            const stateForAI: GameState = { ...gameState, playerStats: processedPlayerStats, npcs: npcsForAI };
            
            const { newTurn, playerStatUpdates, npcUpdates, newlyAcquiredSkill, newChronicleEntry, presentNpcIds: newPresentNpcIds, isSceneBreak } = await storytellerService.continueStory(stateForAI, choice, geminiService, isLogicModeOn, lustModeFlavor, npcMindset, isConscienceModeOn, isStrictInterpretationOn, destinyCompassMode);
            
            const playerChanges = new Set(playerStatUpdates.map(u => u.statName));
            setRecentlyUpdatedPlayerStats(playerChanges);

            const npcChanges = new Map<string, Set<string>>();
            npcUpdates.forEach(update => {
                if ((update.action === 'CREATE' || update.action === 'UPDATE') && update.payload?.stats) {
                    const statKeys = new Set(update.payload.stats.map(s => s.statName));
                    if (statKeys.size > 0) {
                        npcChanges.set(update.id, statKeys);
                    }
                }
            });
            setRecentlyUpdatedNpcStats(npcChanges);


            const updatedNpcs = applyNpcUpdates(processedNpcs, npcUpdates);
            const playerStatChanges = convertStatUpdatesArrayToObject(playerStatUpdates);
            const newPlayerStats = smartMergeStats(processedPlayerStats, playerStatChanges);
            
            const currentOrder = gameState.playerStatOrder || [];
            const newStatKeys = Object.keys(newPlayerStats);
            const newlyAddedKeys = newStatKeys.filter(key => !currentOrder.includes(key));
            const newPlayerStatOrder = [...currentOrder, ...newlyAddedKeys];

            const newPlotChronicle = [...gameState.plotChronicle];
            if (newChronicleEntry) {
                // Double-check for duplicates at the game engine level as well
                if (!storytellerService.isDuplicateChronicleEntry(newChronicleEntry, gameState.plotChronicle)) {
                    newPlotChronicle.push(newChronicleEntry);
                } else {
                    console.log('Game engine: Duplicate chronicle entry blocked at final check');
                }
            }
            
            const newState: GameState = {
                ...gameState,
                history: [...gameState.history, newTurn],
                playerStats: newPlayerStats,
                playerStatOrder: newPlayerStatOrder,
                npcs: updatedNpcs,
                plotChronicle: newPlotChronicle,
                // If a scene break happened, reset the turns buffer. Otherwise, add the new turn.
                turnsSinceLastChronicle: isSceneBreak ? [] : [...(gameState.turnsSinceLastChronicle || []), newTurn],
            };

            setGameState(newState);
            GameSaveService.saveAutoSave(newState);
            setPresentNpcIds(newPresentNpcIds);
            
            const tokenCount = newTurn.tokenCount || 0;
            setLastTurnTokenCount(tokenCount);
            setTotalTokenCount(prev => prev + tokenCount);
            if (newlyAcquiredSkill) setSkillToLearn(newlyAcquiredSkill);

        } catch (e: any) {
            handleApiError(e, "tiếp nối câu chuyện");
        } finally {
            setIsLoading(false);
        }
    };
    
    const confirmLearnSkill = (skill: Skill) => {
        if (!gameState) return;
        setGameState(prevState => {
            if (!prevState) return null;
            
            const cleanedStats: CharacterStats = {};
            const baseSkillName = skill.name;

            for (const key in prevState.playerStats) {
                const isStashedVersion = key.startsWith('Bí kíp:') && key.includes(baseSkillName);
                const isBaseVersion = key === baseSkillName;

                if (!isStashedVersion && !isBaseVersion) {
                    cleanedStats[key] = prevState.playerStats[key];
                }
            }
            
            const learnedStatName = `Lĩnh ngộ: ${baseSkillName}`;
            cleanedStats[learnedStatName] = { value: 'Đã học', duration: 999 };
            
            // Add the new learned stat to the order if it's not there
            const currentOrder = prevState.playerStatOrder || [];
            const newOrder = currentOrder.filter(name => !(name.startsWith('Bí kíp:') && name.includes(baseSkillName)) && name !== baseSkillName);
            if (!newOrder.includes(learnedStatName)) {
                newOrder.push(learnedStatName);
            }
    
            return {
                ...prevState,
                playerSkills: prevState.playerSkills.some(s => s.name === baseSkillName) 
                    ? prevState.playerSkills 
                    : [...prevState.playerSkills, skill],
                playerStats: cleanedStats,
                playerStatOrder: newOrder
            };
        });
        setSkillToLearn(null);
    };
    
    const declineLearnSkill = (skill: Skill) => {
        if (!gameState) return;
        setGameState(prevState => {
            if (!prevState) return null;
            
            const newStats: CharacterStats = {};
            const baseSkillName = skill.name;

            for (const key in prevState.playerStats) {
                if (key !== baseSkillName) {
                    newStats[key] = prevState.playerStats[key];
                }
            }
            
            const stashKey = `Bí kíp: ${baseSkillName}`;
            if (!newStats[stashKey]) {
                newStats[stashKey] = { value: 'Chưa học' };
            }

            // Update order: remove base name, add stash name if not present
            const currentOrder = prevState.playerStatOrder || [];
            const newOrder = currentOrder.filter(name => name !== baseSkillName);
             if (!newOrder.includes(stashKey)) {
                newOrder.push(stashKey);
            }

            return {
                ...prevState,
                playerStats: newStats,
                playerStatOrder: newOrder,
            };
        });
        setSkillToLearn(null);
    };

    const manuallyAcquireSkill = async (statName: string) => {
        if (!gameState || !geminiService) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const generatedSkill = await storytellerService.generateSkillFromStat(
                statName,
                gameState.worldContext,
                geminiService
            );
            
            setSkillToLearn(generatedSkill);

        } catch (e: any) {
            handleApiError(e, "lĩnh ngộ kỹ năng");
        } finally {
            setIsLoading(false);
        }
    };
    
    const createPowerFromDescription = async (name: string, description: string) => {
        if (!gameState || !geminiService) return;

        setIsLoading(true);
        setError(null);
        
        try {
            const generatedSkill = await storytellerService.generateSkillFromUserInput(
                name,
                description,
                gameState.worldContext,
                geminiService
            );
            
            setSkillToLearn(generatedSkill);

        } catch (e: any) {
            handleApiError(e, "kiến tạo năng lực");
        } finally {
            setIsLoading(false);
        }
    };

    const triggerSaveToFile = () => {
        if (gameState) {
            GameSaveService.saveToFile(gameState);
        }
    };

    const toggleNpcProtection = (npcId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;

            const newNpcs = prevState.npcs.map(npc => {
                if (npc.id === npcId) {
                    return { ...npc, isProtected: !npc.isProtected };
                }
                return npc;
            });

            return { ...prevState, npcs: newNpcs };
        });
    };

    const reorderNpc = useCallback((npcId: string, direction: 'up' | 'down') => {
        setGameState(prevState => {
            if (!prevState) return null;

            const npcs = [...prevState.npcs];
            const index = npcs.findIndex(n => n.id === npcId);

            if (index === -1) return prevState;

            if (direction === 'up' && index > 0) {
                [npcs[index], npcs[index - 1]] = [npcs[index - 1], npcs[index]];
            } else if (direction === 'down' && index < npcs.length - 1) {
                [npcs[index], npcs[index + 1]] = [npcs[index + 1], npcs[index]];
            } else {
                return prevState; // Already at edge
            }

            // After swapping, update sortOrder for all NPCs to persist the new order
            const updatedNpcsWithSortOrder = npcs.map((npc, i) => ({
                ...npc,
                sortOrder: i
            }));
            
            return { ...prevState, npcs: updatedNpcsWithSortOrder };
        });
    }, []);
    
    // --- Manual NPC Deletion ---
    const requestNpcDeletion = (npcId: string) => {
        const npc = gameState?.npcs.find(n => n.id === npcId);
        if (npc) {
            setNpcToDelete(npc);
        }
    };

    const cancelNpcDeletion = () => {
        setNpcToDelete(null);
    };

    const confirmNpcDeletion = () => {
        if (!gameState || !npcToDelete) return;
        
        setGameState(prevState => {
            if (!prevState) return null;
            const newNpcs = prevState.npcs.filter(npc => npc.id !== npcToDelete.id);
            return { ...prevState, npcs: newNpcs };
        });

        setNpcToDelete(null); // Close the modal
    };
    
    // --- Stat Editing and Deletion Logic ---

    const requestStatEdit = (target: 'player' | 'npc', statName: string, stat: CharacterStat, npcId?: string) => {
        setEditingStat({ target, statName, stat, npcId });
    };

    const cancelStatEdit = () => {
        setEditingStat(null);
    };

    const confirmStatEdit = (oldStatName: string, newStat: { name: string, value: string, duration: string, isItem: boolean }) => {
        if (!gameState || !editingStat) return;

        setGameState(prevState => {
            if (!prevState) return null;

            const newState = { ...prevState };
            const durationValue = newStat.duration.trim() === '' ? undefined : parseInt(newStat.duration, 10);

            const updatedStatData: CharacterStat = {
                value: newStat.value,
                duration: isNaN(durationValue as any) ? undefined : durationValue,
                isItem: newStat.isItem,
                history: editingStat.stat.history, // Preserve history on manual edit
                evolution: editingStat.stat.evolution // Preserve evolution
            };

            if (editingStat.target === 'player') {
                const newPlayerStats = { ...newState.playerStats };
                 let newPlayerStatOrder = [...(newState.playerStatOrder || [])];
                if (oldStatName !== newStat.name) {
                    delete newPlayerStats[oldStatName];
                    const index = newPlayerStatOrder.indexOf(oldStatName);
                    if (index > -1) {
                        newPlayerStatOrder[index] = newStat.name;
                    }
                }
                newPlayerStats[newStat.name] = updatedStatData;
                newState.playerStats = newPlayerStats;
                newState.playerStatOrder = newPlayerStatOrder;
            } else if (editingStat.target === 'npc' && editingStat.npcId) {
                newState.npcs = newState.npcs.map(npc => {
                    if (npc.id === editingStat.npcId && npc.stats) {
                        const newNpcStats = { ...npc.stats };
                        if (oldStatName !== newStat.name) {
                            delete newNpcStats[oldStatName];
                        }
                        newNpcStats[newStat.name] = updatedStatData;
                        return { ...npc, stats: newNpcStats };
                    }
                    return npc;
                });
            }
            return newState;
        });
        setEditingStat(null);
    };

    const requestStatDelete = (target: 'player' | 'npc', statName: string, npcId?: string) => {
        setDeletingStat({ target, statName, npcId });
    };

    const cancelStatDelete = () => {
        setDeletingStat(null);
    };

    const confirmStatDelete = () => {
        if (!gameState || !deletingStat) return;

        setGameState(prevState => {
            if (!prevState) return null;
            const newState = { ...prevState };

            if (deletingStat.target === 'player') {
                const newPlayerStats = { ...newState.playerStats };
                delete newPlayerStats[deletingStat.statName];
                newState.playerStats = newPlayerStats;
                if(newState.playerStatOrder) {
                    newState.playerStatOrder = newState.playerStatOrder.filter(name => name !== deletingStat.statName);
                }
            } else if (deletingStat.target === 'npc' && deletingStat.npcId) {
                newState.npcs = newState.npcs.map(npc => {
                    if (npc.id === deletingStat.npcId && npc.stats) {
                        const newNpcStats = { ...npc.stats };
                        delete newNpcStats[deletingStat.statName];
                        // If no stats are left, set stats to undefined
                        const stats = Object.keys(newNpcStats).length > 0 ? newNpcStats : undefined;
                        return { ...npc, stats };
                    }
                    return npc;
                });
            }

            return newState;
        });

        setDeletingStat(null);
    };
    
    // --- Skill Management ---
    const requestSkillDeletion = (skill: Skill) => {
        setSkillToDelete(skill);
    };

    const cancelSkillDeletion = () => {
        setSkillToDelete(null);
    };

    const confirmSkillDeletion = () => {
        if (!gameState || !skillToDelete) return;

        setGameState(prevState => {
            if (!prevState) return null;
            const newSkills = prevState.playerSkills.filter(skill => skill.name !== skillToDelete.name);
            return { ...prevState, playerSkills: newSkills };
        });

        setSkillToDelete(null);
    };
    
    // --- Ability Management ---
    const requestAbilityEdit = (skillName: string, ability: Ability) => {
        setEditingAbility({ skillName, ability });
    };

    const cancelAbilityEdit = () => {
        setEditingAbility(null);
    };

    const confirmAbilityEdit = (originalAbilityName: string, updatedData: { name: string, description: string }) => {
        if (!gameState || !editingAbility) return;

        setGameState(prevState => {
            if (!prevState) return null;

            const newSkills = prevState.playerSkills.map(skill => {
                if (skill.name === editingAbility.skillName) {
                    const newAbilities = skill.abilities.map(ability => {
                        if (ability.name === originalAbilityName) {
                            return { ...ability, name: updatedData.name, description: updatedData.description };
                        }
                        return ability;
                    });
                    return { ...skill, abilities: newAbilities };
                }
                return skill;
            });

            return { ...prevState, playerSkills: newSkills };
        });
        setEditingAbility(null);
    };
    
    // --- Player Stat Reordering ---
    const reorderPlayerStat = useCallback((statName: string, direction: 'up' | 'down') => {
        setGameState(prevState => {
            if (!prevState || !prevState.playerStatOrder) return prevState;
            if (CORE_STATS.includes(statName)) return prevState;

            const order = [...prevState.playerStatOrder];
            const index = order.indexOf(statName);

            if (index === -1) return prevState;

            if (direction === 'up') {
                const targetIndex = index - 1;
                if (targetIndex >= 0 && !CORE_STATS.includes(order[targetIndex])) {
                    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
                } else {
                    return prevState;
                }
            } else if (direction === 'down') {
                const targetIndex = index + 1;
                if (targetIndex < order.length) {
                    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
                } else {
                    return prevState;
                }
            }
            
            return { ...prevState, playerStatOrder: order };
        });
    }, []);

    const movePlayerStatToTop = useCallback((statName: string) => {
        setGameState(prevState => {
            if (!prevState || !prevState.playerStatOrder) return prevState;
            if (CORE_STATS.includes(statName)) return prevState;

            const order = [...prevState.playerStatOrder];
            const index = order.indexOf(statName);

            if (index === -1) return prevState;

            const firstNonCoreIndex = order.findIndex(stat => !CORE_STATS.includes(stat));

            if (firstNonCoreIndex === -1 || index === firstNonCoreIndex) {
                return prevState;
            }

            order.splice(index, 1);
            order.splice(firstNonCoreIndex, 0, statName);
            
            return { ...prevState, playerStatOrder: order };
        });
    }, []);

    /**
     * Cập nhật một entry trong plotChronicle (ký ức dài hạn) theo index và nội dung mới.
     */
    function updatePlotChronicleEntry(index: number, newSummary: string, newScore?: number) {
        setGameState(prevState => {
            if (!prevState) return null;
            if (!prevState.plotChronicle || index < 0 || index >= prevState.plotChronicle.length) return prevState;
            const updatedChronicle = prevState.plotChronicle.map((entry, i) =>
                i === index
                    ? { ...entry, summary: newSummary, plotSignificanceScore: newScore !== undefined ? newScore : entry.plotSignificanceScore }
                    : entry
            );
            return { ...prevState, plotChronicle: updatedChronicle };
        });
    }

    /**
     * Cập nhật storyText của một turn trong turnsSinceLastChronicle (ký ức ngắn hạn) theo index và nội dung mới.
     */
    function updateShortTermMemoryTurn(index: number, newStoryText: string) {
        setGameState(prevState => {
            if (!prevState) return null;
            if (!prevState.turnsSinceLastChronicle || index < 0 || index >= prevState.turnsSinceLastChronicle.length) return prevState;
            const updatedTurns = prevState.turnsSinceLastChronicle.map((turn, i) =>
                i === index ? { ...turn, storyText: newStoryText } : turn
            );
            return { ...prevState, turnsSinceLastChronicle: updatedTurns };
        });
    }

    return {
        gameState,
        isLoading,
        error,
        handlePlayerChoice,
        initializeGame,
        lastTurnTokenCount,
        totalTokenCount,
        triggerSaveToFile,
        skillToLearn,
        confirmLearnSkill,
        declineLearnSkill,
        manuallyAcquireSkill,
        createPowerFromDescription,
        toggleNpcProtection,
        reorderNpc,
        npcToDelete,
        requestNpcDeletion,
        confirmNpcDeletion,
        cancelNpcDeletion,
        editingStat,
        deletingStat,
        requestStatEdit,
        cancelStatEdit,
        confirmStatEdit,
        requestStatDelete,
        cancelStatDelete,
        confirmStatDelete,
        skillToDelete,
        requestSkillDeletion,
        confirmSkillDeletion,
        cancelSkillDeletion,
        editingAbility,
        requestAbilityEdit,
        confirmAbilityEdit,
        cancelAbilityEdit,
        reorderPlayerStat,
        movePlayerStatToTop,
        recentlyUpdatedPlayerStats,
        recentlyUpdatedNpcStats,
        updatePlotChronicleEntry,
        updateShortTermMemoryTurn,
    };
}