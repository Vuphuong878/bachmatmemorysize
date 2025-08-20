import React from 'react';

interface RequestCounterProps {
    count: number;
}

const RequestCounter: React.FC<RequestCounterProps> = ({ count }) => {
    if (count === 0) {
        return null; // Don't show until first API call is done
    }

    return (
        <div className="text-sm text-[#a08cb6] bg-[#1d1526]/80 rounded-lg px-3 py-1.5 border border-solid border-[#3a2d47]/50 whitespace-nowrap">
            <span>Requests: </span>
            <span className="font-semibold text-white">{count}</span>
        </div>
    );
};

export default RequestCounter;