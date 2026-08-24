import React from 'react';

export default function Footer({ theme, systemInfo, orgInfo }) {
  const isLight = theme === 'light';

  const companyName = orgInfo?.companyName || systemInfo?.softwareName || 'Quản lý tài sản';
  const version = systemInfo?.version || 'v2.5.0-Enterprise (Build 2026.08)';
  const developer = systemInfo?.developer || 'Google DeepMind Team & Advanced Agentic Engineering';

  return (
    <footer className={`h-9 border-t px-8 flex items-center justify-between text-[11px] select-none transition-colors duration-200 shrink-0 z-20 ${
      isLight 
        ? 'bg-white/90 border-slate-200 text-slate-500' 
        : 'bg-slate-950/90 border-slate-800 text-slate-400'
    }`}>
      {/* Left: Copyright & Organization / Company Name */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-700 dark:text-slate-300">© 2026 {companyName}</span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span>Tất cả quyền được bảo lưu.</span>
      </div>

      {/* Right: Version & Developer Credit */}
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[10px]">
          {version}
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span>
          Phát triển bởi <strong className="text-slate-700 dark:text-slate-200">{developer}</strong>
        </span>
      </div>
    </footer>
  );
}
