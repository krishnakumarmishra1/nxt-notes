import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function SettingsModal({ onClose, allLabels, fetchNotes, customNoteBgs, setCustomNoteBgs }) {
  const [customAppBgs, setCustomAppBgs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nxt-custom-bgs')) || [];
    setCustomAppBgs(saved);
  }, []);

  const removeAppColor = (colorToRemove) => {
    const updated = customAppBgs.filter(c => c !== colorToRemove);
    setCustomAppBgs(updated);
    localStorage.setItem('nxt-custom-bgs', JSON.stringify(updated));
  };

  const clearAllAppColors = () => {
    if (window.confirm("Delete all custom app colors?")) {
      setCustomAppBgs([]); localStorage.removeItem('nxt-custom-bgs');
    }
  };

  // Note Background Manager
  const removeNoteBg = (bgToRemove) => {
    const updated = customNoteBgs.filter(bg => bg !== bgToRemove);
    setCustomNoteBgs(updated);
    localStorage.setItem('nxt-custom-note-bgs', JSON.stringify(updated));
  };

  const clearAllNoteBgs = () => {
    if (window.confirm("Clear all your uploaded background themes?")) {
      setCustomNoteBgs([]); localStorage.removeItem('nxt-custom-note-bgs');
    }
  };

  const deleteLabelGlobally = async (labelToRemove) => {
    if (!window.confirm(`Delete the label "${labelToRemove}" from ALL notes?`)) return;
    setIsProcessing(true);
    try {
      const { data: notesToUpdate, error } = await supabase.from('notes').select('*').contains('labels', [labelToRemove]);
      if (error) throw error;
      if (notesToUpdate) {
        for (const note of notesToUpdate) {
          const updatedLabels = note.labels.filter(l => l !== labelToRemove);
          await supabase.from('notes').update({ labels: updatedLabels }).eq('id', note.id);
        }
      }
      fetchNotes(); 
    } catch (err) { alert("Failed to delete label."); } finally { setIsProcessing(false); }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
          
          {/* App Colors */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">App Themes (Colors)</h3>
              {customAppBgs.length > 0 && <button onClick={clearAllAppColors} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded-md">Clear All</button>}
            </div>
            {customAppBgs.length === 0 ? <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">No custom app colors added.</p> : (
              <div className="flex flex-wrap gap-3">
                {customAppBgs.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-10 h-10 rounded-full shadow-sm border border-gray-200" style={{ background: color }} />
                    <button onClick={() => removeAppColor(color)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW: Uploaded Note Backgrounds Library */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Note Backgrounds</h3>
              {customNoteBgs.length > 0 && <button onClick={clearAllNoteBgs} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded-md">Clear All</button>}
            </div>
            {customNoteBgs.length === 0 ? <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">No custom background themes uploaded.</p> : (
              <div className="flex flex-wrap gap-3">
                {customNoteBgs.map((bgUrl, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-12 h-12 rounded-lg shadow-sm border border-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
                    <button onClick={() => removeNoteBg(bgUrl)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Manage Labels</h3>
            {allLabels.length === 0 ? <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">No labels created yet.</p> : (
              <div className="space-y-2">
                {allLabels.map(label => (
                  <div key={label} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/60 transition-colors">
                    <span className="font-medium text-gray-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>{label}</span>
                    <button onClick={() => deleteLabelGlobally(label)} disabled={isProcessing} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}