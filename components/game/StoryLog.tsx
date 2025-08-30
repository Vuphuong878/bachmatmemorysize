import React, { useRef, useEffect } from 'react';
import { GameTurn } from '../../types';
import StoryVisualizer from './StoryVisualizer';
import { PaintBrushIcon } from '../icons/PaintBrushIcon';


interface StoryLogProps {
    history: GameTurn[];
    mainCharacterName?: string;
    npcNames?: string[];
    placeNames?: string[];
    isImageGenerationEnabled: boolean;
    generatedImageUrl: string | null;
    lastImageUrl?: string;
    isGeneratingImage: boolean;
    imageGenerationError: string | null;
    onRegenerateImage: () => void;
}



function highlightStory(
    text: string,
    mainCharacterName?: string,
    npcNames?: string[],
    placeNames?: string[]
) {
    let result = text;
    // 1. Highlight đoạn hội thoại (câu trong "..." hoặc “...”)
    result = result.replace(/([“"'])(.+?)([”"'])/g, '<span class="highlight-quote">$1$2$3</span>');

    // 2. Highlight tên nhân vật chính
    if (mainCharacterName) {
        const re = new RegExp(`\\b${mainCharacterName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\w-])`, 'g');
        result = result.replace(re, '<span class="highlight-main">$&</span>');
    }
    // 3. Highlight tên NPC
    if (npcNames && npcNames.length > 0) {
        npcNames.forEach(name => {
            if (name && name !== mainCharacterName) {
                const re = new RegExp(`\\b${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\w-])`, 'g');
                result = result.replace(re, '<span class="highlight-npc">$&</span>');
            }
        });
    }
    // 4. Highlight địa danh
    if (placeNames && placeNames.length > 0) {
        placeNames.forEach(place => {
            if (place) {
                // Highlight địa danh chỉ khi đứng giữa 2 dấu cách hoặc ở đầu/cuối chuỗi
                const re = new RegExp(`(?<= |^)${place.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?= |$)`, 'g');
                result = result.replace(re, '<span class="highlight-place">$&</span>');
            }
        });
    }
    return result;
}

const StoryLog: React.FC<StoryLogProps> = ({ 
    history, 
    mainCharacterName, 
    npcNames, 
    placeNames,
    isImageGenerationEnabled,
    generatedImageUrl,
    lastImageUrl,
    isGeneratingImage,
    imageGenerationError,
    onRegenerateImage
}) => {
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
                {displayedHistory.map((turn, index) => {
                    const isLastTurn = index === displayedHistory.length - 1;
                    const showCreateButton = isLastTurn && isImageGenerationEnabled && !generatedImageUrl && !lastImageUrl && !isGeneratingImage && !imageGenerationError;
                    
                    let imageToShow: string | null = null;
                    if (isLastTurn && isImageGenerationEnabled) {
                        if (generatedImageUrl) { // Prioritize the most recently generated one.
                            imageToShow = generatedImageUrl;
                        } else if (!isGeneratingImage && !imageGenerationError) { // If not currently generating, show the one from the save state.
                            imageToShow = lastImageUrl || null;
                        }
                    }

                    const showVisualizer = isLastTurn && isImageGenerationEnabled && (isGeneratingImage || !!imageToShow || !!imageGenerationError);

                    return (
                        <div key={index} className="mb-6 animate-fade-in">
                            {turn.playerAction && (
                                <div className="mb-4 flex justify-between items-center italic text-[#a08cb6] p-3 bg-black/20 rounded-lg border border-[#3a2d47]/50 text-base">
                                    <p className="flex-grow mr-4">
                                        <span className="font-semibold text-[#c5b5dd]">Hành động của bạn:</span> {turn.playerAction}
                                    </p>
                                    {showCreateButton && (
                                        <button
                                            onClick={onRegenerateImage}
                                            disabled={isGeneratingImage}
                                            className="flex-shrink-0 p-2 bg-[#1d1526]/80 rounded-lg border border-solid border-[#3a2d47]/50 text-[#a08cb6] hover:text-white hover:border-[#e02585] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed not-italic"
                                            title="Tạo hình ảnh"
                                        >
                                            <PaintBrushIcon />
                                        </button>
                                    )}
                                </div>
                            )}

                            {showVisualizer && (
                                <StoryVisualizer
                                    imageUrl={imageToShow}
                                    isLoading={isGeneratingImage}
                                    error={imageGenerationError}
                                    onRetry={onRegenerateImage}
                                />
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
                    );
                })}
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
                    color: #ffd600;
                    font-weight: bold;
                }
                .highlight-npc {
                    color: #ffb300;
                    font-weight: bold;
                }
                .highlight-place {
                    color: #ffe082;
                    font-weight: italic;
                }
                .highlight-quote {
                    color: #be98ffff;
                    font-style: bold;
                }
            `}</style>
        </div>
    );
};

export default StoryLog;
