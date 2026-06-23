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
  
  // FIX: मोबाइल पर साइडबार डिफ़ॉल्ट रूप से बंद रहेगा, डेस्कटॉप पर खुला रहेगा
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
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

  // FIX: मोबाइल पर कैटेगरी चुनने के बाद साइडबार अपने-आप बंद हो जाएगा
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full font-sans overflow-hidden transition-colors duration-500" style={{ background: appTheme }}>
      <TopBar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        viewMode={viewMode} setViewMode={setViewMode}
        openSettings={() => setIsSettingsOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* FIX: मोबाइल के लिए डार्क ओवरले (बाहर क्लिक करने पर बंद होगा) */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          isOpen={isSidebarOpen} uniqueLabels={uniqueLabels} 
          selectedCategory={selectedCategory} setSelectedCategory={handleCategorySelect} 
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