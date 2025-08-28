import React, { useState } from 'react';
import { WorldLocation } from '../../types';

interface WorldCodexProps {
    locations: WorldLocation[];
    onToggleProtection: (locationId: string) => void;
    onDeleteRequest: (locationId: string) => void;
    onReorderLocation: (locationId: string, direction: 'up' | 'down') => void;
    onEditRequest: (location: WorldLocation) => void;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#c5b5dd]">{label}</span>
        <p className="text-sm text-white whitespace-pre-line mt-1">{value || 'Chưa có thông tin.'}</p>
    </div>
);

const LocationEntry: React.FC<{ 
    location: WorldLocation; 
    onToggle: () => void; 
    onDelete: () => void;
    onEdit: () => void;
    onReorder: (direction: 'up' | 'down') => void;
    isFirst: boolean;
    isLast: boolean;
}> = ({ location, onToggle, onDelete, onEdit, onReorder, isFirst, isLast }) => {
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
                    <span className="font-bold text-lg text-white truncate">{location.name}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {!isExpanded && (
                      <>
                        <button
                            onClick={onDelete}
                            disabled={location.isProtected}
                            className="p-1 rounded-full text-gray-500 hover:text-red-500 disabled:text-gray-700 disabled:cursor-not-allowed disabled:hover:text-gray-700 transition-colors"
                            aria-label="Xóa Địa danh"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button 
                            onClick={onToggle}
                            className="p-1 rounded-full text-gray-500 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                            aria-label={location.isProtected ? "Bỏ đánh dấu quan trọng" : "Đánh dấu quan trọng"}
                        >
                            {location.isProtected ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            )}
                        </button>
                      </>
                    )}
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
                <div className="px-4 pb-4 pt-3 border-t border-[#3a2d47] animate-fade-in-fast space-y-3">
                    <DetailItem label="Trạng thái" value={location.status} />
                    <DetailItem label="Sự kiện cuối" value={location.lastEventSummary} />
                    <DetailItem label="Mô tả" value={location.description} />
                     <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3a2d47]/50">
                        <button onClick={onEdit} className="text-xs font-bold text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1.5 rounded-md transition-colors">Chỉnh Sửa</button>
                     </div>
                </div>
            )}
        </div>
    );
};

const WorldCodex: React.FC<WorldCodexProps> = ({ locations, onToggleProtection, onDeleteRequest, onReorderLocation, onEditRequest }) => {
    return (
        <div className="p-2">
             {locations.length === 0 ? (
                <p className="text-center text-sm text-[#a08cb6] p-4">Chưa có địa danh nào được khám phá.</p>
            ) : (
                <div className="space-y-2">
                    {locations.map((location, index) => (
                        <LocationEntry 
                            key={location.id} 
                            location={location} 
                            onToggle={() => onToggleProtection(location.id)}
                            onDelete={() => onDeleteRequest(location.id)}
                            onEdit={() => onEditRequest(location)}
                            onReorder={(direction) => onReorderLocation(location.id, direction)}
                            isFirst={index === 0}
                            isLast={index === locations.length - 1}
                        />
                    ))}
                </div>
            )}
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

export default WorldCodex;