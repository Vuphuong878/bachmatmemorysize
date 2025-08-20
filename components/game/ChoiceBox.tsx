





import React, { useState } from 'react';
import Button from '../ui/Button';
import { LustModeFlavor, NpcMindset, DestinyCompassMode } from '../../types';
import { CrownIcon, IntertwinedHeartsIcon, CollarIcon, MaskIcon, LightningIcon, IronWillIcon, TornMindIcon, PrimalInstinctIcon, SeductionIcon, HedonisticIcon } from '../icons/LustIcons';
import { ConscienceIcon } from '../icons/ConscienceIcon';

interface ChoiceBoxProps {
    choices: string[];
    onChoice: (choice: string) => void;
    isLoading: boolean;
    isLogicModeOn: boolean;
    onLogicModeChange: (isOn: boolean) => void;
    lustModeFlavor: LustModeFlavor | null;
    onLustModeFlavorChange: (flavor: LustModeFlavor | null) => void;
    npcMindset: NpcMindset;
    onNpcMindsetChange: (mindset: NpcMindset) => void;
    isConscienceModeOn: boolean;
    onConscienceModeChange: (isOn: boolean) => void;
    isStrictInterpretationOn: boolean;
    onStrictInterpretationChange: (isOn: boolean) => void;
    customAction: string;
    onCustomActionChange: (action: string) => void;
    destinyCompassMode: DestinyCompassMode;
    onDestinyCompassModeChange: (mode: DestinyCompassMode) => void;
}

const LUST_FLAVOR_TEXT: Record<LustModeFlavor, string> = {
    DOMINATION: 'Thống Trị',
    HARMONY: 'Đồng Điệu',
    SUBMISSION: 'Phục Tùng',
    TEASING: 'Trêu Ghẹo',
    AI_FREESTYLE: 'AI Tự Do',
    SEDUCTION: 'Quyến Rũ',
};

const DESTINY_COMPASS_CONFIG: Record<DestinyCompassMode, { displayName: string; description: string; colors: string }> = {
    NORMAL: {
        displayName: 'Bình Thường',
        description: 'Trải nghiệm cân bằng. Tăng trưởng sức mạnh hợp lý và thỉnh thoảng có sự kiện ngẫu nhiên.',
        colors: 'bg-green-600/80 border-green-400 text-white',
    },
    HARSH: {
        displayName: 'Khắc Nghiệt',
        description: 'Thử thách cao hơn. Tăng trưởng sức mạnh hiếm hoi và thường có các sự kiện bất lợi.',
        colors: 'bg-yellow-600/80 border-yellow-400 text-white',
    },
    HELLISH: {
        displayName: 'Nghịch Thiên',
        description: 'Địa ngục trần gian. Cả thế giới chống lại bạn với những thảm họa thường xuyên.',
        colors: 'bg-red-700/80 border-red-500 text-white',
    },
};


const AIStateAnnunciator: React.FC<{
    isLogicModeOn: boolean;
    lustModeFlavor: LustModeFlavor | null;
    isConscienceModeOn: boolean;
    isStrictInterpretationOn: boolean;
    destinyCompassMode: DestinyCompassMode;
}> = ({ isLogicModeOn, lustModeFlavor, isConscienceModeOn, isStrictInterpretationOn, destinyCompassMode }) => {

    const getMessage = (): { text: string; className: string } => {
        if (!isLogicModeOn) {
            return {
                text: `<strong>CẢNH BÁO:</strong> Logic TẮT. Bạn có toàn quyền của Tác Giả, AI sẽ tuân theo mọi mệnh lệnh bất kể logic.`,
                className: 'text-yellow-300'
            };
        }

        let compassMessage = '';
        switch(destinyCompassMode) {
            case 'HARSH': compassMessage = 'trong bối cảnh <strong class="text-yellow-400">Khắc Nghiệt</strong>'; break;
            case 'HELLISH': compassMessage = 'trong bối cảnh <strong class="text-red-500">Nghịch Thiên</strong>'; break;
        }

        if (lustModeFlavor) {
            const flavorText = LUST_FLAVOR_TEXT[lustModeFlavor];
            let mainMessage = `Trạng thái AI: Chế độ <strong class="text-red-400">Dục Vọng (${flavorText})</strong> được kích hoạt`;
            if (isConscienceModeOn) {
                mainMessage += ` kết hợp <strong class="text-cyan-400">Lương Tâm</strong>. Hành động sẽ táo bạo nhưng có chừng mực, tránh tổn thương vĩnh viễn`;
            }
            return {
                text: `${mainMessage} ${compassMessage}.`,
                className: 'text-purple-300'
            };
        }
        
        if (isConscienceModeOn) {
            return {
               text: `Trạng thái AI: Chế độ <strong class="text-cyan-400">Lương Tâm</strong> được kích hoạt. AI sẽ ưu tiên các hành động cứu vãn ${compassMessage}.`,
               className: 'text-cyan-300'
           };
        }

        // If no special modes are on, describe the base mode
        switch(destinyCompassMode) {
            case 'HARSH': return { text: `Trạng thái AI: Thế giới đang ở mức <strong class="text-yellow-400">Khắc Nghiệt</strong>. AI sẽ tạo ra thử thách cao và sự kiện bất lợi.`, className: 'text-yellow-300' };
            case 'HELLISH': return { text: `Trạng thái AI: Thế giới đang ở mức <strong class="text-red-500">Nghịch Thiên</strong>. AI sẽ chủ động tạo ra thảm họa.`, className: 'text-red-400' };
            default: // NORMAL
                if (isStrictInterpretationOn) {
                     return {
                        text: `Trạng thái AI: Chế độ Diễn Giải Nghiêm Túc. AI sẽ diễn giải hành động theo hướng trong sáng.`,
                        className: 'text-green-300'
                    };
                }
                return {
                    text: `Trạng thái AI: Bình thường. AI sẽ tuân thủ logic và tạo ra thử thách cân bằng.`,
                    className: 'text-gray-400'
                };
        }
    };

    const { text, className } = getMessage();

    return (
        <div className="mb-3 p-3 bg-black/25 rounded-lg text-center text-xs transition-all duration-300">
             <p className={`italic ${className}`} dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};


const LustFlavorButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    disabled: boolean;
}> = ({ onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full rounded-md p-2 bg-red-900/50 border border-red-500/50 text-xs font-bold text-red-200 hover:bg-red-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);


const NPC_MINDSET_CONFIG: Record<NpcMindset, { displayName: string; Icon: React.FC; description: string; color: string; borderColor: string; bgColor: string }> = {
    HEDONISTIC_MIND: {
        displayName: "Khoái Lạc",
        Icon: HedonisticIcon,
        description: "NPC hoàn toàn tỉnh táo, xem tình dục là một phần bản chất và chủ động tận hưởng nó. Lý trí không bị ảnh hưởng.",
        color: "text-pink-400",
        borderColor: "border-pink-500/50",
        bgColor: "bg-pink-700/80"
    },
    PRIMAL_INSTINCT: {
        displayName: "Bản Năng",
        Icon: PrimalInstinctIcon,
        description: "Lý trí NPC sụp đổ rất nhanh trong các tình huống 18+.",
        color: "text-red-400",
        borderColor: "border-red-500/50",
        bgColor: "bg-red-700/80"
    },
    TORN_MIND: {
        displayName: "Giằng Xé",
        Icon: TornMindIcon,
        description: "Lý trí NPC giảm ở mức vừa phải, có sự đấu tranh nội tâm.",
        color: "text-purple-400",
        borderColor: "border-purple-500/50",
        bgColor: "bg-purple-700/80"
    },
    IRON_WILL: {
        displayName: "Sắt Đá",
        Icon: IronWillIcon,
        description: "Lý trí NPC cực kỳ vững chắc, giảm rất chậm và cần hành động thuyết phục (Mặc định).",
        color: "text-cyan-400",
        borderColor: "border-cyan-500/50",
        bgColor: "bg-cyan-700/80"
    },
};

const MINDSET_CYCLE: NpcMindset[] = ['PRIMAL_INSTINCT', 'TORN_MIND', 'IRON_WILL', 'HEDONISTIC_MIND'];


const ChoiceBox: React.FC<ChoiceBoxProps> = ({
    choices,
    onChoice,
    isLoading,
    isLogicModeOn,
    onLogicModeChange,
    lustModeFlavor,
    onLustModeFlavorChange,
    npcMindset,
    onNpcMindsetChange,
    isConscienceModeOn,
    onConscienceModeChange,
    isStrictInterpretationOn,
    onStrictInterpretationChange,
    customAction,
    onCustomActionChange,
    destinyCompassMode,
    onDestinyCompassModeChange,
}) => {
    const [isLustPanelVisible, setLustPanelVisible] = useState(false);

    const handleCustomAction = () => {
        if (!isLoading && customAction.trim()) {
            onChoice(customAction.trim());
        }
    };

    const handleLustButtonClick = () => {
        if (lustModeFlavor) {
            // If a mode is active, turn it off
            onLustModeFlavorChange(null);
            setLustPanelVisible(false);
        } else {
            // If no mode is active, toggle the compass
            setLustPanelVisible(!isLustPanelVisible);
        }
    };
    
    const selectFlavor = (flavor: LustModeFlavor) => {
        onLustModeFlavorChange(flavor);
        setLustPanelVisible(false);
    }
    
    const handleMindsetChange = () => {
        const currentIndex = MINDSET_CYCLE.indexOf(npcMindset);
        const nextIndex = (currentIndex + 1) % MINDSET_CYCLE.length;
        onNpcMindsetChange(MINDSET_CYCLE[nextIndex]);
    };

    const currentMindsetConfig = NPC_MINDSET_CONFIG[npcMindset];

    const FlavorIcon = () => {
        if (!lustModeFlavor) return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
        switch (lustModeFlavor) {
            case 'DOMINATION': return <CrownIcon />;
            case 'HARMONY': return <IntertwinedHeartsIcon />;
            case 'SUBMISSION': return <CollarIcon />;
            case 'TEASING': return <MaskIcon />;
            case 'SEDUCTION': return <SeductionIcon />;
            case 'AI_FREESTYLE': return <LightningIcon />;
            default: return null;
        }
    }

    return (
        <div className="bg-[#1d1526]/80 rounded-2xl p-4 border border-solid border-[#633aab]/70 shadow-[0_0_20px_rgba(99,58,171,0.4)] transition-all duration-300">
            {isLoading && choices.length === 0 ? (
                 <p className="text-center text-lg text-[#a08cb6] animate-pulse">AI đang viết...</p>
            ) : (
                <div>
                    <div className="max-h-52 overflow-y-auto pr-2 choice-scroll">
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
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-center text-white mb-2 font-rajdhani uppercase tracking-wider">La Bàn Định Mệnh</label>
                            <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-lg">
                                {Object.keys(DESTINY_COMPASS_CONFIG).map((mode) => {
                                    const config = DESTINY_COMPASS_CONFIG[mode as DestinyCompassMode];
                                    const isActive = destinyCompassMode === mode;
                                    return (
                                        <button
                                            key={mode}
                                            onClick={() => onDestinyCompassModeChange(mode as DestinyCompassMode)}
                                            disabled={isLoading}
                                            title={config.description}
                                            className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isActive 
                                                    ? `${config.colors} scale-105 shadow-lg` 
                                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                        >
                                            {config.displayName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-3 sm:flex-row sm:justify-between sm:items-center mb-3 px-1">
                             <p className="text-sm text-[#a08cb6]">Hoặc, tự do hành động:</p>
                             <div className="flex items-center flex-wrap justify-end gap-x-4 gap-y-2">
                                {/* Lust Mode Button & Panel */}
                                <div className="relative flex items-center justify-center">
                                    {isLustPanelVisible && (
                                        <div className="absolute bottom-full mb-2 w-64 left-0 sm:left-auto sm:right-0 grid grid-cols-3 gap-2 p-2 bg-black/80 rounded-lg border border-red-500/50 animate-fade-in-fast z-10">
                                            <LustFlavorButton onClick={() => selectFlavor('DOMINATION')} disabled={isLoading}>Thống Trị</LustFlavorButton>
                                            <LustFlavorButton onClick={() => selectFlavor('HARMONY')} disabled={isLoading}>Đồng Điệu</LustFlavorButton>
                                            <LustFlavorButton onClick={() => selectFlavor('SUBMISSION')} disabled={isLoading}>Phục Tùng</LustFlavorButton>
                                            <LustFlavorButton onClick={() => selectFlavor('TEASING')} disabled={isLoading}>Trêu Ghẹo</LustFlavorButton>
                                            <LustFlavorButton onClick={() => selectFlavor('SEDUCTION')} disabled={isLoading}>Quyến Rũ</LustFlavorButton>
                                            <LustFlavorButton onClick={() => selectFlavor('AI_FREESTYLE')} disabled={isLoading}>AI Tự Do</LustFlavorButton>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleLustButtonClick}
                                        disabled={isLoading}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            lustModeFlavor
                                                ? 'bg-red-500/90 border-red-400 text-white animate-pulse'
                                                : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50'
                                        }`}
                                    >
                                        <FlavorIcon />
                                        <span>Dục Vọng</span>
                                    </button>
                                </div>

                                {/* Strict Interpretation Toggle */}
                                <div className="flex items-center space-x-2" title="Khi bật, AI sẽ diễn giải hành động của bạn theo hướng trong sáng nhất. Sẽ bị vô hiệu hóa khi bật Dục Vọng.">
                                    <span className={`text-xs font-semibold transition-colors ${isStrictInterpretationOn ? 'text-green-400' : 'text-gray-500'}`}>Diễn Giải Nghiêm Túc</span>
                                     <button
                                        type="button"
                                        className={`${
                                        isStrictInterpretationOn ? 'bg-green-500' : 'bg-gray-600'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1d1526] disabled:opacity-50 disabled:cursor-not-allowed`}
                                        role="switch"
                                        aria-checked={isStrictInterpretationOn}
                                        onClick={() => onStrictInterpretationChange(!isStrictInterpretationOn)}
                                        disabled={isLoading || !!lustModeFlavor}
                                    >
                                        <span
                                        aria-hidden="true"
                                        className={`${
                                            isStrictInterpretationOn ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>

                                {/* Conscience Button */}
                                <button
                                    onClick={() => onConscienceModeChange(!isConscienceModeOn)}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isConscienceModeOn
                                        ? 'bg-cyan-500/90 border-cyan-400 text-white'
                                        : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-cyan-500/20 hover:border-cyan-500/50'
                                    }`}
                                    title="Khi bật, AI sẽ ưu tiên các hành động cứu vãn, giúp NPC phục hồi lý trí."
                                >
                                    <ConscienceIcon />
                                    <span>Lương Tâm</span>
                                </button>
                                
                                {/* NPC Mindset Button */}
                                 <button
                                    onClick={handleMindsetChange}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentMindsetConfig.bgColor} ${currentMindsetConfig.borderColor} text-white`}
                                    title={currentMindsetConfig.description}
                                >
                                    <currentMindsetConfig.Icon />
                                    <span>Tâm Trí NPC: {currentMindsetConfig.displayName}</span>
                                </button>
                                
                                {/* Strict Logic Toggle */}
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-semibold transition-colors ${isLogicModeOn ? 'text-cyan-400' : 'text-gray-500'}`}>Logic Nghiêm ngặt</span>
                                    <button
                                        type="button"
                                        className={`${
                                        isLogicModeOn ? 'bg-cyan-500' : 'bg-gray-600'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#1d1526] disabled:opacity-50`}
                                        role="switch"
                                        aria-checked={isLogicModeOn}
                                        onClick={() => onLogicModeChange(!isLogicModeOn)}
                                        disabled={isLoading}
                                    >
                                        <span
                                        aria-hidden="true"
                                        className={`${
                                            isLogicModeOn ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                             </div>
                        </div>
                        <AIStateAnnunciator 
                            isLogicModeOn={isLogicModeOn}
                            lustModeFlavor={lustModeFlavor}
                            isConscienceModeOn={isConscienceModeOn}
                            isStrictInterpretationOn={isStrictInterpretationOn}
                            destinyCompassMode={destinyCompassMode}
                        />
                        <div className="group relative flex items-center bg-[#120c18] rounded-lg border-2 border-[#3a2d47] transition-all duration-300 focus-within:border-[#e02585] focus-within:shadow-[0_0_12px_rgba(224,37,133,0.5)]">
                            <input
                                id="custom-action"
                                placeholder="Nhập hành động... (hoặc *dùng lệnh meta ở đây*)"
                                value={customAction}
                                onChange={(e) => onCustomActionChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAction(); }}
                                disabled={isLoading}
                                className="flex-grow bg-transparent border-0 focus:ring-0 py-2.5 px-4 text-base w-full text-white placeholder:text-[#a08cb6]/50"
                            />
                            <Button
                                onClick={handleCustomAction}
                                disabled={isLoading || !customAction.trim()}
                                className="!w-auto flex-shrink-0 !py-1.5 !px-4 !text-sm !rounded-md mr-2"
                            >
                                Gửi
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .choice-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .choice-scroll::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .choice-scroll::-webkit-scrollbar-thumb {
                    background-color: #633aab;
                    border-radius: 10px;
                }
                .choice-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: #e02585;
                }
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChoiceBox;