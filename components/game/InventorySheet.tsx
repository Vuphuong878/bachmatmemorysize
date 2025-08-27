import React, { useState } from 'react';
import { CharacterStats, CharacterStat } from '../../types';
import Button from '../ui/Button';

interface InventorySheetProps {
    items: CharacterStats;
    itemOrder: string[];
    isLoading: boolean;
    onRequestStatEdit: (statName: string, stat: CharacterStat) => void;
    onRequestStatDelete: (statName: string) => void;
    onReorderStat: (statName: string, direction: 'up' | 'down') => void;
    onMoveStatToTop: (statName: string) => void;
    recentlyUpdatedStats: Set<string>;
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

const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.172l5.707 5.707a1 1 0 01-1.414 1.414L14 11.414V17a1 1 0 11-2 0v-5.586l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 10 9 8.414V17a1 1 0 11-2 0V8.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 7 9 5.414V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const UpArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

const DownArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const Item: React.FC<{ 
    label: string; 
    stat: CharacterStat; 
    isLoading: boolean; 
    onEdit: () => void;
    onDelete: () => void;
    onReorder: (direction: 'up' | 'down') => void;
    onMoveToTop: () => void;
    isFirst: boolean;
    isLast: boolean;
    isHighlighted: boolean;
}> = ({ label, stat, isLoading, onEdit, onDelete, onReorder, onMoveToTop, isFirst, isLast, isHighlighted }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const valueStr = String(stat.value);
    const TRUNCATE_LENGTH = 60;
    const isLongText = valueStr.length > TRUNCATE_LENGTH;
    const canToggle = isLongText;

    const displayText = isLongText && !isExpanded
        ? `${valueStr.substring(0, TRUNCATE_LENGTH)}...`
        : valueStr;
    
    const highlightClass = 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-4 border-amber-400 scale-[1.01] shadow-lg';
    const baseClass = 'odd:bg-white/5 border-l-4 border-transparent';
    
    return (
        <div className={`py-2 px-3 group transition-all duration-500 rounded-md ${isHighlighted ? highlightClass : baseClass}`}>
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#c5b5dd]" title={label}>{label}</span>
                <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onMoveToTop} className="p-1 rounded-full text-yellow-400 hover:bg-yellow-400/20" aria-label={`Ghim ${label} lên đầu`} title="Ghim lên đầu"><PinIcon /></button>
                    <button onClick={() => onReorder('up')} disabled={isFirst} className="p-1 rounded-full text-sky-400 hover:bg-sky-400/20 disabled:text-gray-600 disabled:hover:bg-transparent" aria-label={`Di chuyển ${label} lên`}><UpArrowIcon /></button>
                    <button onClick={() => onReorder('down')} disabled={isLast} className="p-1 rounded-full text-sky-400 hover:bg-sky-400/20 disabled:text-gray-600 disabled:hover:bg-transparent" aria-label={`Di chuyển ${label} xuống`}><DownArrowIcon /></button>
                    <button onClick={onEdit} className="p-1 rounded-full text-cyan-400 hover:bg-cyan-400/20" aria-label={`Chỉnh sửa ${label}`}><PencilIcon /></button>
                    <button onClick={onDelete} className="p-1 rounded-full text-red-500 hover:bg-red-500/20" aria-label={`Xóa ${label}`}><TrashIcon /></button>
                </div>
            </div>
            <div className="flex items-baseline justify-start text-left gap-x-2 mt-1">
                {stat.history && stat.history.length > 0 && (
                    <span
                        className="text-blue-400 cursor-help"
                        title={`Lịch sử:\n${stat.history.map((h) => `- ${h}`).join('\n')}`}
                    >
                        <HistoryIcon />
                    </span>
                )}
                <span 
                    className={`text-sm font-bold text-white break-words ${canToggle ? 'cursor-pointer hover:text-amber-300' : ''}`}
                    onClick={() => canToggle && setIsExpanded(!isExpanded)}
                    title={canToggle ? (isExpanded ? 'Thu gọn' : 'Nhấn để xem đầy đủ') : ''}
                >
                    {displayText}
                </span>
                {stat.duration && (
                    <span className="text-xs font-mono text-cyan-400 whitespace-nowrap">({stat.duration} lượt)</span>
                )}
            </div>
        </div>
    );
};

const InventorySheet: React.FC<InventorySheetProps> = ({ items, itemOrder, isLoading, onRequestStatEdit, onRequestStatDelete, onReorderStat, onMoveStatToTop, recentlyUpdatedStats }) => {
    
    return (
        <div>
            <h2 className="text-xl font-bold text-center text-white p-4 border-b-2 border-[#3a2d47] flex-shrink-0" style={{textShadow: '0 0 5px rgba(224, 37, 133, 0.7)'}}>
                Hành Trang
            </h2>
            <div className="p-2">
                {itemOrder.length === 0 ? (
                    <p className="text-center text-sm text-[#a08cb6] p-4">Hành trang trống rỗng.</p>
                ) : (
                    <div className="space-y-1">
                        {itemOrder.map((key, index) => {
                            const stat = items[key];
                            if (!stat) return null;

                            return (
                                <Item 
                                    key={key} 
                                    label={key} 
                                    stat={stat} 
                                    isLoading={isLoading}
                                    onEdit={() => onRequestStatEdit(key, stat)}
                                    onDelete={() => onRequestStatDelete(key)}
                                    onReorder={(direction) => onReorderStat(key, direction)}
                                    onMoveToTop={() => onMoveStatToTop(key)}
                                    isFirst={index === 0}
                                    isLast={index === itemOrder.length - 1}
                                    isHighlighted={recentlyUpdatedStats.has(key)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventorySheet;