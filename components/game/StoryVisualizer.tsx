
import React from 'react';

interface StoryVisualizerProps {
    imageUrl: string | null;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
    isGameInitialized: boolean;
}

const StoryVisualizer: React.FC<StoryVisualizerProps> = ({ imageUrl, isLoading, error, onRetry, isGameInitialized }) => {
    return (
        <div className="relative aspect-video bg-[#120c18]/50 rounded-lg overflow-hidden border border-[#3a2d47]/50 flex items-center justify-center text-center text-[#a08cb6] mb-4 shadow-inner">
            {isLoading && (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-semibold">AI đang vẽ...</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="p-4">
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#e02585] text-white hover:bg-opacity-80 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}
            {imageUrl && !isLoading && !error && (
                <img
                    src={imageUrl}
                    alt="Hình ảnh minh họa cho câu chuyện"
                    className="w-full h-full object-cover animate-fade-in-fast"
                />
            )}
            {!imageUrl && !isLoading && !error && (
                 <div className="p-4 flex flex-col items-center gap-3">
                    <p className="text-sm">Hình ảnh minh họa sẽ xuất hiện ở đây.</p>
                     {isGameInitialized && (
                         <button
                            onClick={onRetry}
                            className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#633aab] text-white hover:bg-opacity-80 transition-colors"
                        >
                            Tạo hình ảnh
                        </button>
                    )}
                </div>
            )}
            <style>{`
                 @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default StoryVisualizer;
