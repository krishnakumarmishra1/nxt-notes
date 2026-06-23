import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import NoteToolbar from './NoteToolbar';

export default function NoteCard({ note, fetchNotes, setEditingNote, allLabels, handleCopyNote, customNoteBgs, appTheme, viewMode }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [previewFont, setPreviewFont] = useState(null); 
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const updateDB = async (field, value) => {
    const { error } = await supabase.from('notes').update({ [field]: value }).eq('id', note.id);
    if (!error) fetchNotes();
  };

  const handleTrash = async (e) => { e.stopPropagation(); updateDB('is_trashed', true); };
  const handleRestore = async (e) => { e.stopPropagation(); updateDB('is_trashed', false); };
  const handlePermanentDelete = async (e) => { e.stopPropagation(); await supabase.from('notes').delete().eq('id', note.id); fetchNotes(); };

  const handleToggleLabel = async (label) => {
    let lbls = note.labels || [];
    lbls = lbls.includes(label) ? lbls.filter(l => l !== label) : [...lbls, label];
    updateDB('labels', lbls);
  };

  const handleToggleChecklist = async () => {
    const isNowChecklist = !note.is_checklist;
    let newItems = note.checklist_items || [];
    let newContent = note.content;
    if (isNowChecklist) {
      newItems = note.content.split('\n').filter(t => t.trim() !== '').map(text => ({ id: crypto.randomUUID(), text, is_completed: false }));
      newContent = '';
    } else {
      newContent = newItems.map(item => item.text).join('\n');
      newItems = [];
    }
    const { error } = await supabase.from('notes').update({ is_checklist: isNowChecklist, checklist_items: newItems, content: newContent }).eq('id', note.id);
    if (!error) fetchNotes();
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1080 });
      const { data: { session } } = await supabase.auth.getSession();
      const filePath = `${session.user.id}/${Date.now()}.${compressedFile.name.split('.').pop()}`;
      await supabase.storage.from('note-images').upload(filePath, compressedFile);
      const { data } = supabase.storage.from('note-images').getPublicUrl(filePath);
      await updateDB('image_url', data.publicUrl);
    } finally { setIsUploading(false); }
  };

  const handleCustomBgUpload = async (file) => {
    setIsUploading(true);
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
      const { data: { session } } = await supabase.auth.getSession();
      const filePath = `${session.user.id}/bg_${Date.now()}.${compressedFile.name.split('.').pop()}`;
      await supabase.storage.from('note-images').upload(filePath, compressedFile);
      const { data } = supabase.storage.from('note-images').getPublicUrl(filePath);
      await updateDB('bg_image_url', data.publicUrl);
    } catch (error) { alert("Failed to upload background image."); } 
    finally { setIsUploading(false); }
  };

  const shapeClass = note.frame_style || 'shape-rounded';
  const textColor = note.text_color || '#111827';
  const hasBgImage = !!note.bg_image_url;

  const activeFont = previewFont || note.font_family || 'font-sans';
  const textHighlightClass = hasBgImage ? 'img-text-highlight' : '';
  
  const minHeight = viewMode === 'compact' ? 'min-h-[100px]' : 'min-h-[140px]';
  const padding = viewMode === 'compact' ? 'p-3' : 'p-5';

  if (note.is_trashed) {
    return (
      <div className={`border border-red-200 bg-red-50 ${padding} relative flex flex-col justify-between ${minHeight} opacity-80 ${shapeClass}`}>
        <div>
          <h3 className={`font-semibold text-lg text-red-900 mb-2 pr-8 ${activeFont}`}>{note.title}</h3>
          <p className={`text-red-800 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3 mb-4 ${activeFont}`}>{note.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 border-t border-red-200 pt-3">
          <button onClick={handleRestore} className="px-4 py-1.5 bg-white text-green-700 text-xs font-bold rounded-lg shadow-sm hover:bg-green-50 transition-colors">Restore</button>
          <button onClick={handlePermanentDelete} className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors">Delete Forever</button>
        </div>
      </div>
    );
  }

  const renderChecklist = () => {
    const items = note.checklist_items || [];
    const displayItems = items.slice(0, 5);
    return (
      <div className="flex flex-col gap-1.5 mb-2">
        {displayItems.map(item => (
          <div key={item.id} className="flex items-start gap-2">
            <input type="checkbox" checked={item.is_completed} readOnly className="mt-1 w-3.5 h-3.5 text-blue-600 rounded pointer-events-none" />
            <span style={{ color: item.is_completed ? '#9ca3af' : textColor }} className={`text-sm leading-tight font-medium ${activeFont} ${textHighlightClass} ${item.is_completed ? 'line-through opacity-70' : ''}`}>{item.text}</span>
          </div>
        ))}
        {items.length > 5 && <span className="text-xs font-bold pl-6 mt-1" style={{ color: textColor }}>+{items.length - 5} more items</span>}
      </div>
    );
  };

  // FIX: Accurate Background rendering for Colors vs Gradients vs Images
  const getBackgroundStyle = () => {
    if (note.bg_image_url) return { backgroundImage: `url(${note.bg_image_url})`, backgroundColor: (note.color && !note.color.includes('gradient')) ? note.color : '#ffffff' };
    if (note.color && note.color.includes('gradient')) return { backgroundImage: note.color };
    return { backgroundColor: note.color || '#ffffff' }; 
  };

  return (
    <div 
      onClick={() => setEditingNote(note)}
      className={`relative group cursor-pointer transition-all duration-300 flex flex-col justify-between ${minHeight} ${isMenuOpen ? 'z-[60] shadow-xl' : 'hover:z-50 hover:shadow-lg'} ${shapeClass !== 'shape-torn' && 'rounded-2xl'}`}
    >
      <div 
        className={`absolute inset-0 z-0 transition-colors border border-gray-200 bg-cover bg-center ${shapeClass}`} 
        style={getBackgroundStyle()} 
      >
        {hasBgImage && <div className="absolute inset-0 bg-black/20" style={{ borderRadius: 'inherit' }}></div>}
      </div>

      <div className={`relative z-10 ${padding} flex flex-col h-full justify-between`}>
        {isUploading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl"><span className="text-sm font-semibold text-gray-800 bg-white px-4 py-1.5 rounded-full shadow-md">Uploading...</span></div>}

        <button onClick={(e) => { e.stopPropagation(); updateDB('is_pinned', !note.is_pinned); }} className={`absolute top-4 right-4 z-20 p-1.5 rounded-full transition-colors ${note.is_pinned ? 'text-gray-900 bg-white/90 shadow-sm' : 'opacity-0 group-hover:opacity-100 hover:bg-white/90 hover:text-gray-900'} ${hasBgImage ? 'bg-white/80 backdrop-blur-md shadow-sm opacity-100 text-gray-800' : 'text-gray-600'}`} title="Pin">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={note.is_pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
        </button>

        <div className="flex-1">
          {note.image_url && <div className="mb-4 overflow-hidden rounded-xl border border-black/5 shadow-sm"><img src={note.image_url} className="w-full h-40 object-cover" /></div>}
          
          <h3 style={{ color: textColor }} className={`font-bold text-lg mb-3 pr-8 ${activeFont} ${textHighlightClass}`}>{note.title}</h3>
          {note.is_checklist ? renderChecklist() : <p style={{ color: textColor }} className={`text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 font-medium ${note.bg_image_url ? '' : 'mb-4'} ${activeFont} ${textHighlightClass}`}>{note.content}</p>}
          
          {note.labels && note.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.labels.map(label => <span key={label} className="bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">{label}</span>)}
            </div>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAddImage} />

        <NoteToolbar 
          isEditing={false} appTheme={appTheme}
          currentFont={note.font_family || 'font-sans'} onFontChange={(f) => updateDB('font_family', f)} onFontHover={setPreviewFont}
          currentTextColor={textColor} onTextColorChange={(c) => updateDB('text_color', c)}
          currentShape={note.frame_style || 'shape-rounded'} onShapeChange={(s) => updateDB('frame_style', s)}
          onThemeChange={async (theme) => { await supabase.from('notes').update(theme).eq('id', note.id); fetchNotes(); }}
          currentColor={note.color} currentBgImage={note.bg_image_url}
          onCustomBgUpload={handleCustomBgUpload} customNoteBgs={customNoteBgs} 
          onAddImage={() => fileInputRef.current.click()} 
          onToggleLabel={handleToggleLabel} allLabels={allLabels} currentLabels={note.labels || []}
          isChecklist={note.is_checklist} onToggleChecklist={handleToggleChecklist}
          onDelete={handleTrash} onCopy={(e) => handleCopyNote(e, note)}
          onArchive={(e) => { e.stopPropagation(); updateDB('is_archived', !note.is_archived); }} isArchived={note.is_archived}
          onMenuToggle={(isOpen) => setIsMenuOpen(isOpen)} 
          hasBgImage={hasBgImage} 
        />
      </div>
    </div>
  );
}