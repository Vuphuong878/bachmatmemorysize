import React, { useState } from 'react';
import { WorldCreationState } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { useSettings } from '../../hooks/useSettings';
import { SparklesIcon } from '../icons/SparklesIcon';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import Button from '../ui/Button';

interface CharacterInfoFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
    settingsHook: ReturnType<typeof useSettings>;
}

const CharacterInfoForm: React.FC<CharacterInfoFormProps> = ({ state, setState, settingsHook }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { geminiService } = settingsHook;
    
    const handleCharacterChange = (field: string, value: any) => {
        setState(s => ({ ...s, character: { ...s.character, [field]: value } }));
    };

    const handleGenerateBiography = async () => {
         if (!geminiService) {
            alert("Dịch vụ AI chưa sẵn sàng.");
            return;
        }
        if (!state.description) {
            alert("Vui lòng tạo mô tả bối cảnh thế giới trước khi tạo tiểu sử.");
            return;
        }
        setIsLoading(true);

        const charGender = state.character.gender === 'Tự định nghĩa' ? state.character.customGender : state.character.gender;
        const userProvidedBiography = state.character.biography.trim();
        let basePrompt: string;

        if (userProvidedBiography) {
            // "Tiểu Sử Hợp Nhất" - User provided input, AI creates backstory leading to it.
            basePrompt = `Bạn là một AI biên kịch bậc thầy. Nhiệm vụ của bạn là kết hợp hài hòa giữa việc sáng tạo tiểu sử và việc tôn trọng bối cảnh khởi đầu của người dùng.

**YÊU CẦU NGHIÊM NGẶT:**
1.  **"Kịch bản khởi đầu" là bất biến:** Xem đoạn văn do người dùng cung cấp là khoảnh khắc HIỆN TẠI và là điểm bắt đầu của game.
2.  **Sáng tạo có định hướng:** Dựa vào thông tin nhân vật và thế giới, hãy tự do viết một tiểu sử chi tiết về quá khứ, nguồn gốc, động lực của nhân vật để giải thích tại sao họ lại có mặt tại "Kịch bản khởi đầu" này.
3.  **Kết thúc tại Hiện tại:** Đoạn tiểu sử bạn viết BẮT BUỘC phải kết thúc bằng việc mô tả lại "Kịch bản khởi đầu" của người dùng một cách liền mạch.
4.  **TUYỆT ĐỐI CẤM:** Không được viết bất kỳ sự kiện nào xảy ra SAU "Kịch bản khởi đầu". Dòng thời gian phải dừng lại ngay tại điểm người dùng đã chọn.

**Dữ liệu tham khảo (để đảm bảo nhất quán):**
- Bối cảnh thế giới: ${state.description || 'Chưa có.'}
- Thông tin nhân vật: Tên: ${state.character.name || 'Chưa có'}, Giới tính: ${charGender}, Tính cách: ${state.character.personality || 'Chưa có'}, Kỹ năng: ${state.character.skills || 'Chưa có'}.

**Kịch bản khởi đầu từ người dùng (điểm kết của tiểu sử):**
---
${userProvidedBiography}
---

Hãy bắt đầu viết tiểu sử dẫn đến kịch bản trên.`;
        } else {
            // "Biên Kịch Sáng Tạo" - User did not provide input, AI acts as a Creative Writer.
            basePrompt = `Dựa trên các đặc điểm của nhân vật và bối cảnh thế giới đã được tạo ra, hãy viết một tiểu sử chi tiết và có chiều sâu. Tiểu sử này cần thể hiện:
- Quá khứ: Nhân vật sinh ra và lớn lên ở đâu trong thế giới này? Cuộc sống thời thơ ấu của họ bị ảnh hưởng bởi bối cảnh thế giới như thế nào?
- Động lực: Điều gì đã thúc đẩy nhân vật phát triển kỹ năng hay tính cách hiện tại? Mục tiêu hay khát vọng lớn nhất của họ là gì?
- Mối quan hệ: Nhân vật có mối liên hệ nào với các thế lực hoặc sự kiện quan trọng trong thế giới?

Hãy lồng ghép một cách tự nhiên các yếu tố của thế giới vào câu chuyện của nhân vật, ví dụ: nhân vật phải luyện tập ma thuật vì một cuộc chiến tranh đang đến, hoặc lớn lên trong một xã hội phân biệt chủng tộc. Tiểu sử này sẽ là tiền đề để bắt đầu game.

**BỐI CẢNH THẾ GIỚI:**
${state.description || 'Thế giới chưa được mô tả chi tiết.'}

**THÔNG TIN NHÂN VẬT:**
- Tên: ${state.character.name || 'Chưa có tên'}
- Giới tính: ${charGender}
- Tính cách: ${state.character.personality || 'Chưa xác định'}
- Kỹ năng: ${state.character.skills || 'Chưa xác định'}`;
        }
        
        let prompt = basePrompt;
        if (state.isNsfw) {
            prompt += "\n\nQuan trọng: Vì đây là thế giới 18+, hãy lồng ghép các trải nghiệm (kể cả tình dục) trong quá khứ như những sự kiện quan trọng định hình nên con người, động lực và mối quan hệ của nhân vật.";
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
            handleCharacterChange('biography', text);
        } catch (error) {
            console.error("Error generating character biography:", error);
            alert("Đã xảy ra lỗi khi tạo tiểu sử. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormSection title="Thông Tin Nhân Vật" description="Kiến tạo linh hồn sẽ khuấy đảo vị diện này.">
            <InputField
                label="Tên Nhân Vật"
                id="char-name"
                placeholder="Tên gọi của bạn"
                value={state.character.name}
                onChange={e => handleCharacterChange('name', e.target.value)}
            />
            
            <div>
                <label className="block text-sm font-medium text-[#e8dff5] mb-2">Giới tính</label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {['Nam', 'Nữ', 'Tự định nghĩa'].map(g => (
                        <label key={g} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={state.character.gender === g}
                                onChange={() => handleCharacterChange('gender', g)}
                                className="h-4 w-4 text-[#e02585] bg-[#120c18] border-[#3a2d47] focus:ring-[#e02585] focus:ring-offset-[#1d1526]"
                            />
                            <span className="ml-2 text-sm text-[#e8dff5]">{g}</span>
                        </label>
                    ))}
                </div>
                 {state.character.gender === 'Tự định nghĩa' && (
                    <div className="mt-3">
                        <InputField
                            id="custom-gender"
                            placeholder="Nhập giới tính của bạn"
                            value={state.character.customGender}
                            onChange={e => handleCharacterChange('customGender', e.target.value)}
                        />
                    </div>
                )}
            </div>

            <InputField
                label="Tính cách"
                id="char-personality"
                placeholder="Lạnh lùng, tà ác, dâm đãng, chính nghĩa..."
                value={state.character.personality}
                onChange={e => handleCharacterChange('personality', e.target.value)}
            />

            <div>
                <TextareaField
                    label="Tiểu sử"
                    id="char-bio"
                    placeholder="Nguồn gốc, quá khứ, mục tiêu của nhân vật... hoặc để AI hỗ trợ."
                    value={state.character.biography}
                    onChange={e => handleCharacterChange('biography', e.target.value)}
                    rows={5}
                />
                 <div className="mt-2 flex justify-end">
                    <Button
                        onClick={handleGenerateBiography}
                        disabled={isLoading}
                        variant="secondary"
                        className="!py-2 !px-4 !text-sm !w-auto inline-flex items-center gap-2"
                    >
                        <SparklesIcon isLoading={isLoading} />
                        <span>{isLoading ? 'Đang sáng tạo...' : 'AI Hỗ trợ Tiểu sử'}</span>
                    </Button>
                </div>
            </div>

            <InputField
                label="Kỹ năng / Quyền năng khởi đầu"
                id="char-skills"
                placeholder="Tách biệt bởi dấu phẩy. VD: Đọc tâm trí, Vô ảnh cước,..."
                value={state.character.skills}
                onChange={e => handleCharacterChange('skills', e.target.value)}
            />
        </FormSection>
    )
}

export default CharacterInfoForm;