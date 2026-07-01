import ThemeSelector from './ThemeSelector';

export default function Sidebar({ isOpen, toggleSidebar, uniqueLabels, selectedCategory, setSelectedCategory, setAppTheme }) {
  return (
    <aside 
      className={`${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 sm:translate-x-0 sm:w-20'} absolute sm:relative inset-y-0 left-0 bg-white/90 sm:bg-white/30 backdrop-blur-2xl border-r border-white/40 flex flex-col h-full shadow-2xl sm:shadow-sm z-[100] sm:z-10 transition-all duration-300 overflow-hidden`}
    >
      <div className="p-4 sm:p-6 border-b border-gray-100/50 flex justify-between items-center sm:hidden">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="var(--color-primary)" stroke="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          NXT <span className="text-[var(--color-primary)]">Notes</span>
        </h1>
        {/* MOBILE CLOSE BUTTON */}
        <button onClick={toggleSidebar} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        
        <div onClick={() => setSelectedCategory('All Notes')} className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${selectedCategory === 'All Notes' ? 'bg-blue-50 sm:bg-white/60 text-[var(--color-primary)] shadow-sm' : 'text-gray-800 hover:bg-gray-100 sm:hover:bg-white/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          {isOpen && <span>All Notes</span>}
        </div>

        <div onClick={() => setSelectedCategory('Archive')} className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${selectedCategory === 'Archive' ? 'bg-blue-50 sm:bg-white/60 text-[var(--color-primary)] shadow-sm' : 'text-gray-800 hover:bg-gray-100 sm:hover:bg-white/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          {isOpen && <span>Archive</span>}
        </div>

        <div onClick={() => setSelectedCategory('Trash')} className={`px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${selectedCategory === 'Trash' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-800 hover:bg-gray-100 sm:hover:bg-white/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          {isOpen && <span>Trash</span>}
        </div>

        {uniqueLabels.length > 0 && (
          <>
            {isOpen && <p className="px-4 text-[11px] font-bold text-gray-500 mt-6 mb-2 uppercase tracking-wider">Labels</p>}
            {!isOpen && <div className="h-4 border-b border-black/10 mx-4 mb-4"></div>}
            {uniqueLabels.map((label) => (
              <div key={label} onClick={() => setSelectedCategory(label)} className={`px-4 py-2.5 rounded-xl cursor-pointer font-medium text-sm transition-all flex items-center gap-3 ${selectedCategory === label ? 'bg-blue-50 sm:bg-white/60 text-[var(--color-primary)] shadow-sm' : 'text-gray-800 hover:bg-gray-100 sm:hover:bg-white/40'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>
                {isOpen && <span className="truncate">{label}</span>}
              </div>
            ))}
          </>
        )}
      </nav>
      {isOpen && <ThemeSelector setAppTheme={setAppTheme} />}
    </aside>
  );
}