import React, { useState } from 'react';
import { WorldCreationState, NarrativePerspective } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useSettings } from '../../hooks/useSettings';
import { SparklesIcon } from '../icons/SparklesIcon';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import Button from '../ui/Button';

interface WorldInfoFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
    settingsHook: ReturnType<typeof useSettings>;
}

const WorldInfoForm: React.FC<WorldInfoFormProps> = ({ state, setState, settingsHook }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { geminiService } = settingsHook;

    const handleGenerateDescription = async () => {
        if (!geminiService) {
            alert("Dịch vụ AI chưa sẵn sàng.");
            return;
        }
        if (!state.genre && !state.description.trim()) {
            alert("Vui lòng nhập Thể loại Vị Diện hoặc Mô tả Bối Cảnh trước khi tạo.");
            return;
        }

        setIsLoading(true);

        let basePrompt: string;

        if (state.description.trim()) {
            // --- User has provided input, develop it ---
            basePrompt = `Bạn là một AI biên kịch và xây dựng thế giới. Nhiệm vụ của bạn là đọc một ý tưởng ban đầu từ người dùng và phát triển nó thành một bối cảnh thế giới hoàn chỉnh, chi tiết và lôi cuốn.

**Yêu cầu:**
1.  **Tôn trọng ý tưởng gốc:** Giữ lại và làm sâu sắc thêm tất cả các yếu tố cốt lõi mà người dùng đã cung cấp (tên địa danh, nhân vật, sự kiện, khái niệm...).
2.  **Làm phong phú:** Mở rộng các chi tiết, lấp đầy những khoảng trống một cách logic và sáng tạo để tạo ra một bức tranh toàn cảnh sống động.
3.  **Cấu trúc hóa:** Sắp xếp lại thông tin thành một đoạn văn xuôi mạch lạc, có cấu trúc rõ ràng (ví dụ: giới thiệu chung, địa lý, chính trị, văn hóa, các yếu tố đặc trưng...), nhưng CHỈ dựa trên những gì người dùng đã cung cấp hoặc suy luận logic từ đó.
4.  **TUYỆT ĐỐI CẤM:** Không được tự ý thêm vào các khái niệm, yếu tố, hoặc chi tiết hoàn toàn mới mà không có trong hoặc không liên quan trực tiếp đến ý tưởng gốc của người dùng. Mục tiêu là phát triển, không phải thay thế.

**Thể loại tham khảo (nếu có):** "${state.genre || 'Không có'}"
**Ý tưởng ban đầu của người dùng:**
---
${state.description}
---

Hãy bắt đầu phát triển ý tưởng trên thành một bối cảnh thế giới hoàn chỉnh.`;

        } else {
            // --- User has not provided input, generate from scratch based on genre ---
            basePrompt = `Dựa trên thể loại "${state.genre}", hãy xây dựng một thế giới chi tiết. Cần bao gồm:

- Tên thế giới: Một cái tên có ý nghĩa, gợi lên đặc trưng của thế giới.
- Tổng quan: Mô tả khái quát về thế giới (ví dụ: đang ở trong thời kỳ chiến tranh, thịnh vượng, hay suy tàn).
- Cấu trúc xã hội và chính trị: Các thế lực chính, hệ thống cai trị, và mối quan hệ giữa các phe phái.
- Đặc trưng địa lý và văn hóa: Những vùng đất đặc biệt, các chủng tộc sinh sống, và phong tục tập quán nổi bật.
- Yếu tố đặc biệt: Một yếu tố độc đáo của thế giới (ví dụ: một loại ma thuật hiếm, một bí mật cổ xưa).

Hãy viết một đoạn văn mạch lạc, kết hợp các yếu-tố trên để tạo nên một bối cảnh hấp dẫn và có tính sáng tạo.`;
        }

        let prompt = basePrompt;
        if (state.isNsfw) {
            prompt += "\n\nQuan trọng: Vì đây là thế giới 18+, hãy lồng ghép các yếu tố trưởng thành, nhục dục, hoặc bạo lực một cách tự nhiên vào các khía cạnh trên (ví dụ: một xã hội tôn thờ khoái lạc, một phe phái chính trị tàn bạo, các phong tục văn hóa nhạy cảm).";
        }
        
        try {
            const safetySettings = state.isNsfw ? [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ] : [];

            const response = await geminiService.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    safetySettings: safetySettings,
                },
            });
            const text = response.text;
            setState(s => ({ ...s, description: text }));
        } catch (error) {
            console.error("Error generating world description:", error);
            alert("Đã xảy ra lỗi khi tạo mô tả. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormSection title="Thông Tin Vị Diện" description="Đặt nền móng cho thế giới mà bạn sắp thống trị.">
            <InputField
                label="Tên Truyện"
                id="storyName"
                placeholder="VD: Ma Đạo Tổ Sư, Phàm Nhân Tu Tiên..."
                value={state.storyName}
                onChange={e => setState(s => ({ ...s, storyName: e.target.value }))}
            />
            <InputField
                label="Thể loại Vị Diện"
                id="genre"
                placeholder="VD: Tiên hiệp, Tận thế, Hoan dâm thế giới..."
                value={state.genre}
                onChange={e => setState(s => ({ ...s, genre: e.target.value }))}
            />
            <div>
                <label htmlFor="narrative-perspective" className="block text-sm font-medium text-[#e8dff5] mb-2">Ngôi kể</label>
                <select
                    id="narrative-perspective"
                    value={state.narrativePerspective}
                    onChange={e => setState(s => ({ ...s, narrativePerspective: e.target.value as NarrativePerspective }))}
                    className="w-full px-4 py-3 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white placeholder:text-[#a08cb6]/50 focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585] transition-all"
                >
                    <option value="Ngôi thứ ba Giới hạn">Ngôi thứ ba Giới hạn</option>
                    <option value="Ngôi thứ hai">Ngôi thứ hai</option>
                    <option value="Ngôi thứ ba Toàn tri">Ngôi thứ ba Toàn tri</option>
                </select>
                <p className="text-xs text-[#a08cb6] mt-2">Chọn phong cách kể chuyện của AI. "Ngôi thứ ba Giới hạn" được khuyến khích để có trải nghiệm nhập vai tốt nhất.</p>
            </div>
            <div>
                <TextareaField
                    label="Mô tả Bối Cảnh"
                    id="description"
                    placeholder="Mô tả chi tiết về bối cảnh, lịch sử, các thế lực chính... hoặc để AI hỗ trợ."
                    value={state.description}
                    onChange={e => setState(s => ({ ...s, description: e.target.value }))}
                    rows={5}
                />
                 <div className="mt-2 flex justify-end">
                    <Button
                        onClick={handleGenerateDescription}
                        disabled={isLoading}
                        variant="secondary"
                        className="!py-2 !px-4 !text-sm !w-auto inline-flex items-center gap-2"
                    >
                        <SparklesIcon isLoading={isLoading} />
                        <span>{isLoading ? 'Đang sáng tạo...' : 'AI Hỗ trợ Bối cảnh'}</span>
                    </Button>
                </div>
            </div>
            <ToggleSwitch
                label="Chế độ 18+ (NSFW)"
                id="nsfw-toggle"
                enabled={state.isNsfw}
                setEnabled={enabled => setState(s => ({ ...s, isNsfw: enabled }))}
                description="Cốt truyện sẽ chứa các tình huống và mô tả tình dục không che đậy."
            />
        </FormSection>
    )
}

export default WorldInfoForm;