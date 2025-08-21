import React from 'react';

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
  changelogs: { version: string; date: string; content: string }[];
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ open, onClose, changelogs }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#1a1022] rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] p-6 relative flex flex-col">
        <button
          className="absolute top-3 right-3 text-[#e02585] hover:text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Thông Tin Cập Nhật</h2>
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '60vh' }}>
          {changelogs.map((log, idx) => (
            <div key={idx} className="bg-[#251336] rounded-md p-4 shadow-inner border border-[#e02585]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#e02585]">Phiên bản {log.version}</span>
                <span className="text-xs text-[#a08cb6]">{log.date}</span>
              </div>
              <div className="text-[#e6d6f7] whitespace-pre-line text-sm">{log.content}</div>
            </div>
          ))}
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a08cb6;
            border-radius: 6px;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #a08cb6 #251336;
          }
          /* Ẩn hoàn toàn nếu muốn */
          /*
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .custom-scrollbar {
            scrollbar-width: none;
          }
          */
        `}</style>
      </div>
    </div>
  );
};

export default ChangelogModal;
