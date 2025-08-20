import React from 'react';

interface TokenCounterProps {
    lastTurn: number;
    total: number;
}

const TokenCounter: React.FC<TokenCounterProps> = ({ lastTurn, total }) => {
    if (total === 0) {
        return null; // Don't show until first API call is done
    }

    return (
        <div className="text-sm text-[#a08cb6] bg-[#1d1526]/80 rounded-lg px-3 py-1.5 border border-solid border-[#3a2d47]/50 whitespace-nowrap">
            <span>Tokens: </span>
            <span className="font-semibold text-white">{lastTurn}</span>
            <span className="text-[#a08cb6]"> / </span>
            <span className="font-semibold text-white">{total}</span>
        </div>
    );
};

export default TokenCounter;
