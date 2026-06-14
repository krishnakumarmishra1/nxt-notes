import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import Auth from './components/Auth';
import SettingsModal from './components/SettingsModal';

function App() {
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Notes');
  const [appTheme, setAppTheme] = useState(localStorage.getItem('nxt-app-theme') || '#f9fafb');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [customNoteBgs, setCustomNoteBgs] = useState(JSON.parse(localStorage.getItem('nxt-custom-note-bgs')) || []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchNotes();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchNotes();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (!error && data) setNotes(data);
  };

  if (!session) return <Auth />;

  const uniqueLabels = Array.from(new Set(notes.flatMap(note => note.labels || [])));

  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-500" style={{ background: appTheme }}>
      <TopBar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        viewMode={viewMode} setViewMode={setViewMode}
        openSettings={() => setIsSettingsOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} uniqueLabels={uniqueLabels} 
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} 
          setAppTheme={setAppTheme} 
        />
        <MainArea 
          notes={notes} fetchNotes={fetchNotes} selectedCategory={selectedCategory} allLabels={uniqueLabels}
          searchQuery={searchQuery} viewMode={viewMode}
          customNoteBgs={customNoteBgs} setCustomNoteBgs={setCustomNoteBgs}
          appTheme={appTheme} 
        />
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} allLabels={uniqueLabels} fetchNotes={fetchNotes}
          customNoteBgs={customNoteBgs} setCustomNoteBgs={setCustomNoteBgs}
        />
      )}
    </div>
  );
}

export default App;