
import React from 'react';
import Button from './ui/Button';

interface GameScreenProps {
  onBackToMenu: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <div className="animate-fade-in">
        <h1 className="text-5xl font-bold text-indigo-400 mb-4">Trò Chơi Bắt Đầu</h1>
        <p className="text-lg text-gray-300 mb-8 max-w-lg">
          Đây là màn hình trò chơi. Nội dung chính của ứng dụng của bạn sẽ được hiển thị ở đây.
        </p>
        <div className="max-w-xs mx-auto">
          <Button onClick={onBackToMenu} variant="secondary">Quay lại Menu</Button>
        </div>
      </div>
      <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-in-out forwards;
          }
      `}</style>
    </div>
  );
};

export default GameScreen;
