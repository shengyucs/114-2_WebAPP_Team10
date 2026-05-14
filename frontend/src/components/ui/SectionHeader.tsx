import React from 'react';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => {
  return (
    <div className="flex items-center space-x-2 mb-4 group">
      <div className="h-6 w-1 bg-accent-color rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
      {icon && <span className="text-accent-color opacity-80">{icon}</span>}
      <h3 className="text-xs font-bold text-text-primary tracking-widest uppercase">
        {title}
      </h3>
    </div>
  );
};

export default SectionHeader;
