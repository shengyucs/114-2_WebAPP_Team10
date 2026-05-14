import React from 'react';

interface SidebarProps {
  title: string;
  position: 'left' | 'right';
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ title, position, children }) => {
  const frameClass =
    position === 'right' ? 'sidebar-frame-right' : 'sidebar-frame-left';

  return (
    <aside className={`w-[280px] h-full ${frameClass} panel-frame`}>
      {/* Texture Layer */}
      <div className="texture-grain opacity-10" />

      {/* Corner Ornaments */}
      <div className="corner-ornament corner-tl" />
      <div className="corner-ornament corner-tr" />
      <div className="corner-ornament corner-bl" />
      <div className="corner-ornament corner-br" />

      {/* Header Area */}
      <div className="panel-header relative z-10">
        <h2 className="text-sm font-black tracking-[0.2em] text-text-primary uppercase">
          {title}
        </h2>
        <div className="w-2 h-2 bg-accent-color rounded-full animate-pulse opacity-50" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative z-10 p-6">{children}</div>
    </aside>
  );
};

export default Sidebar;
