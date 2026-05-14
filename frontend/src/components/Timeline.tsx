import React from 'react';

const Timeline: React.FC = () => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4/5 max-w-[800px] h-[60px] bg-white border-2 border-border-color rounded-2xl flex items-center justify-center z-20 shadow-soft overflow-hidden">
      <div className="texture-grain" />
      <div className="flex items-center space-x-3 text-text-secondary text-sm font-semibold relative z-10">
        <div className="w-2 h-2 bg-accent-color rounded-full animate-pulse" />
        <span className="tracking-wide">
          Timeline Controller - System Ready
        </span>
      </div>
    </div>
  );
};

export default Timeline;
