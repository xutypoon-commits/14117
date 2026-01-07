
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-50">
      <div>
        <h1 className="text-xl font-bold text-slate-900">EO 14117｜美国个人数据访问阈值评估</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide">用于评估美国个人数据访问规模是否触及合规阈值</p>
      </div>
    </header>
  );
};

export default Header;
