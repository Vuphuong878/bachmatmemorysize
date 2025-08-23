

import React, { useRef, useEffect } from 'react';
import { GameTurn } from '../../types';


interface StoryLogProps {
    history: GameTurn[];
    mainCharacterName?: string;
    npcNames?: string[];
    placeNames?: string[];
}


function highlightStory(
    text: string,
    mainCharacterName?: string,
    npcNames?: string[],
    placeNames?: string[]
) {
    let result = text;
    // 0. Highlight marker ẩn nếu có (ví dụ: [NAME]...[/NAME], [PLACE]...[/PLACE])
    // Không hiện marker, chỉ highlight phần text bên trong
    result = result.replace(/\[NA\](.+?)\[\/NA\]/g, '<span class="highlight-main">$1</span>');
    result = result.replace(/\[NP\](.+?)\[\/NP\]/g, '<span class="highlight-npc">$1</span>');
    result = result.replace(/\[PL\](.+?)\[\/PL\]/g, '<span class="highlight-place">$1</span>');
    result = result.replace(/\[QU\](.+?)\[\/QU\]/g, '<span class="highlight-quote">$1</span>');
    result = result.replace(/\[STAT\](.+?)\[\/STAT\]/g, '<span class="highlight-quote">$1</span>');
    result = result.replace(/\[ITEM\](.+?)\[\/ITEM\]/g, '<span class="highlight-quote">$1</span>');
    result = result.replace(/\[IT\](.+?)\[\/IT\]/g, '<span class="highlight-quote">$1</span>');
    return result;
}

const StoryLog: React.FC<StoryLogProps> = ({ history, mainCharacterName, npcNames, placeNames }) => {
    const endOfLogRef = useRef<HTMLDivElement>(null);
    // Only display the last 10 turns for performance.
    const displayedHistory = history.slice(-10);
    const isTruncated = history.length > 10;

    useEffect(() => {
        endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div>
            <div className="max-w-none">
                {isTruncated && (
                    <div className="text-center text-sm text-[#a08cb6] py-4 italic border-b-2 border-[#3a2d47]/50 mb-6">
                        <p>Lược sử cũ hơn đã được ẩn đi để đảm bảo hiệu suất.</p>
                        <p>Toàn bộ câu chuyện vẫn được lưu lại.</p>
                    </div>
                )}
                {displayedHistory.map((turn, index) => (
                    <div key={index} className="mb-6 animate-fade-in">
                        {turn.playerAction && (
                            <div className="mb-4 italic text-[#a08cb6] p-3 bg-black/20 rounded-lg border border-[#3a2d47]/50 text-base">
                                <span className="font-semibold text-[#c5b5dd]">Hành động của bạn:</span> {turn.playerAction}
                            </div>
                        )}
                        {turn.storyText.split('\n').filter(p => p.trim() !== '').map((paragraph, pIndex) => (
                            <p
                                key={pIndex}
                                className="text-lg leading-loose mb-4 text-[#e8dff5]"
                                dangerouslySetInnerHTML={{
                                    __html: highlightStory(paragraph, mainCharacterName, npcNames, placeNames),
                                }}
                            />
                        ))}
                        {index < displayedHistory.length - 1 && <hr className="my-6 border-t-2 border-[#3a2d47]/50" />}
                    </div>
                ))}
            </div>
            <div ref={endOfLogRef} />
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .highlight-main {
                    color: #2366f5ff;
                    font-weight: bold;
                }
                .highlight-npc {
                    color: #0f81ebff;
                    font-weight: bold;
                }
                .highlight-place {
                    color: #eebb24ff;
                    font-weight: bold;
                }
                .highlight-quote {
                    color: #afe7ebff;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default StoryLog;
