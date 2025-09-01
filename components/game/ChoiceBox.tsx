
import React from 'react';
import Button from '../ui/Button';
import { RedoIcon } from '../icons/RedoIcon';
import { AiSettingsIcon } from '../icons/AiSettingsIcon';
import { PencilIcon } from '../icons/PencilIcon';


interface ChoiceBoxProps {
    choices: string[];
    onChoice: (choice: string) => void;
    isLoading: boolean;
    customAction: string;
    onCustomActionChange: (action: string) => void;
    onUndo: () => void;
    isUndoDisabled: boolean;
    onOpenAiControls: () => void;
}


const ChoiceBox: React.FC<ChoiceBoxProps> = ({
    choices,
    onChoice,
    isLoading,
    customAction,
    onCustomActionChange,
    onUndo,
    isUndoDisabled,
    onOpenAiControls,
}) => {
    const handleCustomAction = () => {
        if (!isLoading && customAction.trim()) {
            onChoice(customAction.trim());
        }
    };

    return (
        <div className="bg-[#1d1526]/80 rounded-2xl p-4 border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] transition-all duration-300">
            {isLoading && choices.length === 0 ? (
                 <p className="text-center text-lg text-[#a08cb6] animate-pulse">AI đang viết...</p>
            ) : (
                <div>
                    <div className="pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {choices.map((choice, index) => (
                                <Button
                                    key={index}
                                    onClick={() => onChoice(choice)}
                                    disabled={isLoading}
                                    variant="choice"
                                >
                                    {choice}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-[#3a2d47]/50">
                        <div className="flex items-center gap-2">
                            <div className="group relative flex-grow flex items-center bg-[#120c18] rounded-lg border-2 border-[#3a2d47] transition-all duration-300 focus-within:border-[#e02585] focus-within:shadow-[0_0_12px_rgba(224,37,133,0.5)]">
                                <input
                                    id="custom-action"
                                    placeholder="Nhập hành động... (hoặc *dùng lệnh meta ở đây*)"
                                    value={customAction}
                                    onChange={(e) => onCustomActionChange(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAction(); }}
                                    disabled={isLoading}
                                    className="flex-grow bg-transparent border-0 focus:ring-0 py-2.5 px-4 pr-16 text-base w-full text-white placeholder:text-[#a08cb6]/50"
                                />
                                <button
                                    onClick={handleCustomAction}
                                    disabled={isLoading || !customAction.trim()}
                                    className="absolute right-0 top-0 h-full px-4 flex items-center text-[#a08cb6] font-semibold text-sm hover:text-white transition-colors duration-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                                    aria-label="Gửi hành động tùy chỉnh"
                                >
                                    Gửi
                                </button>
                            </div>
                             <button
                                onClick={onUndo}
                                disabled={isLoading || isUndoDisabled}
                                className="flex-shrink-0 p-3 bg-[#120c18] rounded-lg border-2 border-[#3a2d47] text-[#a08cb6] hover:text-white hover:border-[#e02585] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Hoàn tác lượt đi"
                            >
                                <RedoIcon />
                            </button>
                             <button
                                disabled={true}
                                className="flex-shrink-0 p-3 bg-[#120c18] rounded-lg border-2 border-[#3a2d47] text-[#a08cb6] hover:text-white hover:border-[#e02585] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Chỉnh sửa lượt đi (Sắp có)"
                            >
                                <PencilIcon />
                            </button>
                             <button
                                onClick={onOpenAiControls}
                                disabled={isLoading}
                                className="flex-shrink-0 p-3 bg-[#120c18] rounded-lg border-2 border-[#3a2d47] text-[#a08cb6] hover:text-white hover:border-[#e02585] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Bảng điều khiển AI"
                            >
                                <AiSettingsIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChoiceBox;
