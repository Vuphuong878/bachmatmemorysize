<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1u3LwM-LSow05s18cJmgymvS6ey3cst-8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Memory & Story Context Management (Ký ức & Quản lý mạch truyện)

### Tổng quan
Hệ thống sử dụng nhiều lớp ký ức để đảm bảo AI kể chuyện mạch lạc, không lặp lại, có thể nhắc lại các sự kiện cũ phù hợp hoàn cảnh và tối ưu hóa context khi bộ nhớ lớn.

### Các thuật toán và chức năng chính

- **1. Kiểm tra & bổ sung dữ liệu đầu ra AI:**
  - Hàm `validateCoreResponse` và `validateChronicleEntry` đảm bảo mọi trường dữ liệu quan trọng đều có mặt, đúng định dạng. Nếu thiếu sẽ tự động bổ sung hoặc cảnh báo.

- **2. Chống lặp sự kiện cốt truyện:**
  - Hàm `isDuplicateChronicleEntry` kiểm tra trùng lặp (so sánh độ tương tự summary, eventType, từ khóa chung) trước khi thêm vào plotChronicle.

- **3. Gợi nhớ thông minh (Contextual Recall):**
  - Hàm `findContextualRecalls` chọn các sự kiện cũ phù hợp hoàn cảnh hiện tại (NPC, loại sự kiện, cảm xúc, trạng thái nhân vật, địa điểm, v.v).
  - Hàm `findEmotionalContinuityRecalls` ưu tiên các sự kiện liên quan đến cảm xúc/mối quan hệ.

- **4. Tối ưu hóa context khi bộ nhớ lớn:**
  - Hàm `optimizeContextWhenFull` tự động tóm tắt, gom nhóm, ưu tiên các lượt gần nhất, sự kiện lớn, và tóm tắt các lượt nhỏ khi cần.
  - Hàm `groupAndSummarizeMinorEvents` gom nhóm các sự kiện nhỏ cùng loại thành một entry tổng hợp.
  - Tăng giới hạn context lên 25.000 ký tự, loại bỏ giới hạn token thủ công, sử dụng mặc định của API.

### Lợi ích
- Cốt truyện mạch lạc, không lặp, có thể nhắc lại các trải nghiệm cũ hợp lý.
- Không bị mất thông tin quan trọng khi số lượng sự kiện lớn.
- Dễ bảo trì, mở rộng, kiểm soát chất lượng dữ liệu AI trả về.

### Ghi chú
- Nếu muốn thay đổi giới hạn context, sửa biến `MEMORY_CHAR_BUDGET` trong `GeminiStorytellerService.ts`.
- Các hàm tối ưu context và kiểm tra trùng lặp đều có log chi tiết để debug.
- Có thể mở rộng thêm các tiêu chí gợi nhớ hoặc grouping theo nhu cầu.

---
