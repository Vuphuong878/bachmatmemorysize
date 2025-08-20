import React, { useState, useMemo } from 'react';
import { NPC, CharacterStat } from '../../types';

interface NpcCodexProps {
    npcs: NPC[];
    onToggleProtection: (npcId: string) => void;
    onDeleteRequest: (npcId: string) => void;
    onReorderNpc: (npcId: string, direction: 'up' | 'down') => void;
    onRequestNpcStatEdit: (npcId: string, statName: string, stat: CharacterStat) => void;
    onRequestNpcStatDelete: (npcId: string, statName: string) => void;
    recentlyUpdatedStats: Map<string, Set<string>>;
}

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);


const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    value ? (
        <div className="py-1.5">
            <p className="text-xs font-semibold text-[#a08cb6]">{label}</p>
            <p className="text-sm text-white">{value}</p>
        </div>
    ) : null
);

const NpcStatItem: React.FC<{ 
    label: string; 
    stat: CharacterStat;
    onEdit: () => void;
    onDelete: () => void;
    isHighlighted: boolean;
}> = ({ label, stat, onEdit, onDelete, isHighlighted }) => {
    
    const highlightClass = 'bg-amber-500/20 border-l-2 border-amber-400';
    const baseClass = 'odd:bg-black/10 border-l-2 border-transparent';
    
    return (
        <div className={`grid grid-cols-12 gap-x-2 items-baseline py-1 px-2 text-xs rounded group transition-all duration-500 ${isHighlighted ? highlightClass : baseClass}`}>
            <span className="col-span-5 font-medium text-[#c5b5dd]" title={label}>{label}</span>
            <div className="col-span-7 flex items-baseline justify-end text-right gap-x-2">
                <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1 rounded-full text-cyan-400 hover:bg-cyan-400/20" aria-label={`Chỉnh sửa ${label}`}><PencilIcon /></button>
                    <button onClick={onDelete} className="p-1 rounded-full text-red-500 hover:bg-red-500/20" aria-label={`Xóa ${label}`}><TrashIcon /></button>
                </div>
                {stat.history && stat.history.length > 0 && (
                    <span
                        className="text-blue-400 cursor-help"
                        title={`Lịch sử:\n${stat.history.map((h) => `- ${h}`).join('\n')}`}
                    >
                        <HistoryIcon />
                    </span>
                )}
                <span className="font-semibold text-white break-words">{String(stat.value)}</span>
                {stat.duration && (
                    <span className="font-mono text-cyan-400/80 whitespace-nowrap">({stat.duration})</span>
                )}
            </div>
        </div>
    );
};


const NpcEntry: React.FC<{ 
    npc: NPC; 
    onToggle: () => void; 
    onDelete: () => void;
    onReorder: (direction: 'up' | 'down') => void;
    isFirst: boolean;
    isLast: boolean;
    onRequestNpcStatEdit: (npcId: string, statName: string, stat: CharacterStat) => void;
    onRequestNpcStatDelete: (npcId: string, statName: string) => void;
    recentlyUpdatedStats: Set<string>;
}> = ({ npc, onToggle, onDelete, onReorder, isFirst, isLast, onRequestNpcStatEdit, onRequestNpcStatDelete, recentlyUpdatedStats }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-black/20 rounded-lg border border-[#3a2d47]/50 overflow-hidden">
            <div className="w-full flex items-center p-3 text-left">
                <div className="flex flex-col mr-3 flex-shrink-0">
                    <button onClick={() => onReorder('up')} disabled={isFirst} className="p-0.5 text-gray-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed transition-colors" aria-label="Di chuyển lên">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => onReorder('down')} disabled={isLast} className="p-0.5 text-gray-500 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed transition-colors" aria-label="Di chuyển xuống">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-grow flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0"
                >
                    <span className="font-bold text-lg text-white truncate">{npc.name}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                        onClick={onDelete}
                        disabled={npc.isProtected}
                        className="p-1 rounded-full text-gray-500 hover:text-red-500 disabled:text-gray-700 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-colors"
                        aria-label="Xóa NPC"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                     <button 
                        onClick={onToggle}
                        className="p-1 rounded-full text-gray-500 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                        aria-label={npc.isProtected ? "Bỏ đánh dấu quan trọng" : "Đánh dấu quan trọng"}
                    >
                         {npc.isProtected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                         ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                         )}
                     </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 text-[#a08cb6] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="px-3 pb-3 border-t border-[#3a2d47] animate-fade-in-fast">
                    <DetailItem label="Giới tính" value={npc.gender} />
                    <DetailItem label="Tính cách" value={npc.personality} />
                    <DetailItem label="Mối quan hệ" value={npc.relationship} />
                    <DetailItem label="Trạng thái" value={npc.status} />
                    <DetailItem label="Tương tác cuối" value={npc.lastInteractionSummary} />
                    
                    {npc.stats && Object.keys(npc.stats).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#3a2d47]/50">
                             <h4 className="text-sm font-bold text-[#e02585] mb-1">Chỉ số NPC</h4>
                             <div className="space-y-1">
                                {Object.entries(npc.stats).map(([key, stat]) => (
                                    <NpcStatItem 
                                        key={key} 
                                        label={key} 
                                        stat={stat} 
                                        onEdit={() => onRequestNpcStatEdit(npc.id, key, stat)}
                                        onDelete={() => onRequestNpcStatDelete(npc.id, key)}
                                        isHighlighted={recentlyUpdatedStats.has(key)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const NpcCodex: React.FC<NpcCodexProps> = ({ npcs, onToggleProtection, onDeleteRequest, onReorderNpc, onRequestNpcStatEdit, onRequestNpcStatDelete, recentlyUpdatedStats }) => {
    const sortedNpcs = useMemo(() => {
        // The `sortOrder` is managed by the game engine. We just sort by it.
        // Fallback to index 0 if sortOrder is somehow missing.
        return [...npcs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }, [npcs]);

    return (
        <div className="bg-[#1d1526]/80 rounded-2xl h-full flex flex-col border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] transition-all duration-300">
            <h2 className="text-xl font-bold text-center text-white p-4 border-b-2 border-[#3a2d47] flex-shrink-0" style={{ textShadow: '0 0 5px rgba(224, 37, 133, 0.7)' }}>
                Hồ Sơ Nhân Vật
            </h2>
            <div className="overflow-y-auto p-2 flex-grow">
                 {sortedNpcs.length === 0 ? (
                    <p className="text-center text-sm text-[#a08cb6] p-4">Chưa gặp gỡ nhân vật nào.</p>
                ) : (
                    <div className="space-y-2">
                        {sortedNpcs.map((npc, index) => (
                            <NpcEntry 
                                key={npc.id} 
                                npc={npc} 
                                onToggle={() => onToggleProtection(npc.id)}
                                onDelete={() => onDeleteRequest(npc.id)}
                                onReorder={(direction) => onReorderNpc(npc.id, direction)}
                                isFirst={index === 0}
                                isLast={index === sortedNpcs.length - 1}
                                onRequestNpcStatEdit={onRequestNpcStatEdit}
                                onRequestNpcStatDelete={onRequestNpcStatDelete}
                                recentlyUpdatedStats={recentlyUpdatedStats.get(npc.id) || new Set()}
                            />
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

export default NpcCodex;