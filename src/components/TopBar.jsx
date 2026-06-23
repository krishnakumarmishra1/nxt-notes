import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function TopBar({ toggleSidebar, searchQuery, setSearchQuery, viewMode, setViewMode, openSettings }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: 'User', initial: 'U', email: '' });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const metadataName = user.user_metadata?.username;
        const emailName = user.email?.split('@')[0];
        const finalName = metadataName || emailName || 'User';
        setUserProfile({ name: finalName, initial: finalName.charAt(0).toUpperCase(), email: user.email });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  // CYCLE THROUGH 3 VIEW MODES
  const toggleViewMode = () => {
    if (viewMode === 'grid') setViewMode('compact');
    else if (viewMode === 'compact') setViewMode('list');
    else setViewMode('grid');
  };

  return (
    <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-4 shrink-0 z-[100] shadow-sm transition-colors">
      
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2.5 rounded-full hover:bg-black/10 text-gray-800 transition-colors" title="Main Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="var(--color-primary)" stroke="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          <span className="hidden sm:inline">NXT <span className="text-[var(--color-primary)]">Notes</span></span>
        </h1>
      </div>

      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
          <input type="text" placeholder="Search notes, labels..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/60 border border-white/80 text-gray-900 rounded-xl pl-10 pr-4 py-2 outline-none focus:bg-white focus:shadow-md transition-all placeholder-gray-500 font-medium" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>}
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={toggleViewMode} className="p-2 rounded-full hover:bg-black/10 text-gray-700 transition-colors" title={`Current View: ${viewMode}`}>
          {viewMode === 'grid' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>}
          {viewMode === 'compact' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="4.5" height="4.5" x="3" y="3" rx="0.5"/><rect width="4.5" height="4.5" x="9.75" y="3" rx="0.5"/><rect width="4.5" height="4.5" x="16.5" y="3" rx="0.5"/><rect width="4.5" height="4.5" x="3" y="9.75" rx="0.5"/><rect width="4.5" height="4.5" x="9.75" y="9.75" rx="0.5"/><rect width="4.5" height="4.5" x="16.5" y="9.75" rx="0.5"/><rect width="4.5" height="4.5" x="3" y="16.5" rx="0.5"/><rect width="4.5" height="4.5" x="9.75" y="16.5" rx="0.5"/><rect width="4.5" height="4.5" x="16.5" y="16.5" rx="0.5"/></svg>}
          {viewMode === 'list' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
        </button>
        
        <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ml-2 cursor-pointer border-2 border-white hover:scale-105 transition-transform select-none" title="Account">
          {userProfile.initial}
        </div>

        {/* Z-INDEX FIXED TO 999 SO IT NEVER GETS COVERED */}
        {isProfileOpen && (
          <div className="absolute top-12 right-0 mt-2 w-56 bg-white border border-gray-200 shadow-2xl rounded-xl p-2 z-[999]">
            <div className="px-4 py-3 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-gray-900 truncate">{userProfile.name}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
            </div>
            <button onClick={() => { setIsProfileOpen(false); openSettings(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</button>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border-t border-gray-100 pt-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}