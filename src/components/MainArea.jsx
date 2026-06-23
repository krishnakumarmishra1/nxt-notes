import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import NoteCard from './NoteCard';
import NoteToolbar from './NoteToolbar';

export default function MainArea({ notes, fetchNotes, selectedCategory, allLabels, searchQuery, viewMode, customNoteBgs, setCustomNoteBgs, appTheme }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTextColor, setNewTextColor] = useState('#111827');
  const [newBgImage, setNewBgImage] = useState('');
  const [newFont, setNewFont] = useState('font-sans');
  const [previewFontNew, setPreviewFontNew] = useState(null); 
  const [newShape, setNewShape] = useState('shape-rounded');
  const [newLabels, setNewLabels] = useState([]);
  const [isNewChecklist, setIsNewChecklist] = useState(false);
  const [newChecklistItems, setNewChecklistItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false); 
  const [isNewBoxExpanded, setIsNewBoxExpanded] = useState(false);
  const [isToolbarMenuOpen, setIsToolbarMenuOpen] = useState(false); 
  
  const [newHistory, setNewHistory] = useState([{ title: '', content: '' }]);
  const [newHistoryIndex, setNewHistoryIndex] = useState(0);

  const [editingNote, setEditingNote] = useState(null);
  const [previewFontEdit, setPreviewFontEdit] = useState(null); 
  const [noteHistory, setNoteHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isClosingEdit, setIsClosingEdit] = useState(false);
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null); 
  const newNoteRef = useRef(null); 

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewChange = (field, value) => {
    if (field === 'title') setTitle(value);
    if (field === 'content') setContent(value);
    const updatedHistory = newHistory.slice(0, newHistoryIndex + 1);
    updatedHistory.push({ title: field === 'title' ? value : title, content: field === 'content' ? value : content });
    setNewHistory(updatedHistory); setNewHistoryIndex(updatedHistory.length - 1);
  };

  const undoNew = () => { if (newHistoryIndex > 0) { const prev = newHistory[newHistoryIndex - 1]; setTitle(prev.title); setContent(prev.content); setNewHistoryIndex(newHistoryIndex - 1); } };
  const redoNew = () => { if (newHistoryIndex < newHistory.length - 1) { const next = newHistory[newHistoryIndex + 1]; setTitle(next.title); setContent(next.content); setNewHistoryIndex(newHistoryIndex + 1); } };

  const handleToggleNewLabel = (label) => {
    if (newLabels.includes(label)) setNewLabels(newLabels.filter(l => l !== label));
    else setNewLabels([...newLabels, label]);
  };

  const toggleNewChecklist = () => {
    if (!isNewChecklist) {
      const items = content.split('\n').filter(t => t.trim() !== '').map(text => ({ id: crypto.randomUUID(), text, is_completed: false }));
      setNewChecklistItems(items); setContent(''); setIsNewChecklist(true);
    } else {
      const text = newChecklistItems.map(i => i.text).join('\n');
      setContent(text); setNewChecklistItems([]); setIsNewChecklist(false);
    }
  };

  const handleCustomBgUpload = async (file, isEditingMode) => {
    setIsUploadingBg(true); 
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
      const { data: { session } } = await supabase.auth.getSession();
      const filePath = `${session.user.id}/bg_${Date.now()}.${compressedFile.name.split('.').pop()}`;
      await supabase.storage.from('note-images').upload(filePath, compressedFile);
      const { data } = supabase.storage.from('note-images').getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      if (!customNoteBgs.includes(publicUrl)) {
        const updatedBgs = [...customNoteBgs, publicUrl];
        setCustomNoteBgs(updatedBgs);
        localStorage.setItem('nxt-custom-note-bgs', JSON.stringify(updatedBgs));
      }

      if (isEditingMode) { handleEditChange({ bg_image_url: publicUrl, color: '' }); } 
      else { setNewBgImage(publicUrl); setNewColor(''); }
      
    } catch (error) { alert("Failed to upload background theme."); }
    finally { setIsUploadingBg(false); } 
  };

  const handleAddNote = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!title.trim() && !content.trim() && newChecklistItems.length === 0 && !imageFile && !newBgImage) { setIsNewBoxExpanded(false); return; }
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let uploadedImageUrl = null;
      if (imageFile) {
        const filePath = `${session.user.id}/${Date.now()}.${imageFile.name.split('.').pop()}`;
        await supabase.storage.from('note-images').upload(filePath, imageFile);
        const { data } = supabase.storage.from('note-images').getPublicUrl(filePath);
        uploadedImageUrl = data.publicUrl;
      }
      
      await supabase.from('notes').insert([{ 
        title, content, user_id: session.user.id, image_url: uploadedImageUrl, 
        color: newColor, bg_image_url: newBgImage, font_family: newFont, text_color: newTextColor, frame_style: newShape, labels: newLabels, 
        is_trashed: false, is_archived: false, is_checklist: isNewChecklist, checklist_items: newChecklistItems, edit_history: []
      }]);
      
      setTitle(''); setContent(''); setNewColor(''); setNewTextColor('#111827'); setNewBgImage(''); setNewFont('font-sans'); setNewShape('shape-rounded'); setNewLabels([]); setImageFile(null); setImagePreview(null);
      setIsNewChecklist(false); setNewChecklistItems([]); setIsNewBoxExpanded(false);
      fetchNotes();
    } finally { setIsSaving(false); }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHistoryModal || isToolbarMenuOpen || isClosingEdit) return; 
      if (isNewBoxExpanded && newNoteRef.current && !newNoteRef.current.contains(event.target)) {
        handleAddNote();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNewBoxExpanded, title, content, imageFile, newColor, newTextColor, newBgImage, newFont, newShape, newLabels, isNewChecklist, newChecklistItems, showHistoryModal, isToolbarMenuOpen, isClosingEdit]);

  const openEditModal = (note) => {
    if (note.is_trashed) return;
    setEditingNote(note); setNoteHistory([{ title: note.title, content: note.content }]); setHistoryIndex(0);
    setIsClosingEdit(false);
  };

  const handleEditChange = (field, value) => {
    setEditingNote(prev => {
      const newState = { ...prev };
      if (typeof field === 'object') { Object.assign(newState, field); } 
      else { newState[field] = value; }
      return newState;
    });
    
    if (field === 'title' || field === 'content' || field === 'checklist_items' || field === 'is_checklist') {
      const newHist = noteHistory.slice(0, historyIndex + 1);
      newHist.push({ title: field === 'title' ? value : editingNote.title, content: field === 'content' ? value : editingNote.content });
      setNoteHistory(newHist); setHistoryIndex(newHist.length - 1);
    }
  };

  const undoEdit = () => { if (historyIndex > 0) { const prev = noteHistory[historyIndex - 1]; setEditingNote({ ...editingNote, ...prev }); setHistoryIndex(historyIndex - 1); } };
  const redoEdit = () => { if (historyIndex < noteHistory.length - 1) { const next = noteHistory[historyIndex + 1]; setEditingNote({ ...editingNote, ...next }); setHistoryIndex(historyIndex + 1); } };

  const saveAndCloseEdit = async () => {
    if (!editingNote || showHistoryModal || isClosingEdit) return;
    setIsClosingEdit(true);

    const originalNote = notes.find(n => n.id === editingNote.id);
    if (originalNote) {
      let updatedHistoryArray = originalNote.edit_history || [];
      const isChanged = originalNote.title !== editingNote.title || originalNote.content !== editingNote.content || JSON.stringify(originalNote.checklist_items) !== JSON.stringify(editingNote.checklist_items);

      if (isChanged) {
        updatedHistoryArray = [{ title: originalNote.title, content: originalNote.content, is_checklist: originalNote.is_checklist, checklist_items: originalNote.checklist_items, saved_at: new Date().toISOString() }, ...updatedHistoryArray];
      }

      supabase.from('notes').update({ 
        title: editingNote.title, content: editingNote.content, color: editingNote.color, bg_image_url: editingNote.bg_image_url, image_url: editingNote.image_url,
        font_family: editingNote.font_family, text_color: editingNote.text_color, frame_style: editingNote.frame_style, labels: editingNote.labels,
        is_checklist: editingNote.is_checklist, checklist_items: editingNote.checklist_items,
        edit_history: updatedHistoryArray, updated_at: new Date().toISOString()
      }).eq('id', editingNote.id).then(() => fetchNotes());
    }

    setTimeout(() => {
      setEditingNote(null);
      setIsClosingEdit(false);
      setNoteHistory([]);
    }, 300);
  };

  const restoreVersion = (historyItem) => {
    setEditingNote({ ...editingNote, title: historyItem.title, content: historyItem.content, is_checklist: historyItem.is_checklist, checklist_items: historyItem.checklist_items });
    setShowHistoryModal(false); 
  };

  const handleCopyNote = async (e, noteToCopy) => {
    e.stopPropagation(); setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('notes').insert([{ 
      title: `${noteToCopy.title} (Copy)`, content: noteToCopy.content, user_id: session.user.id, 
      image_url: noteToCopy.image_url, color: noteToCopy.color, bg_image_url: noteToCopy.bg_image_url, font_family: noteToCopy.font_family, text_color: noteToCopy.text_color,
      frame_style: noteToCopy.frame_style, labels: noteToCopy.labels, is_trashed: false, is_archived: false,
      is_checklist: noteToCopy.is_checklist, checklist_items: noteToCopy.checklist_items, edit_history: []
    }]);
    fetchNotes(); setIsSaving(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsNewBoxExpanded(true);
    setIsUploadingBg(true); 
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1080 });
      setImageFile(compressedFile); setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) { alert("Failed to compress image."); }
    finally { setIsUploadingBg(false); } 
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingBg(true); 
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1080 });
      const { data: { session } } = await supabase.auth.getSession();
      const filePath = `${session.user.id}/${Date.now()}.${compressedFile.name.split('.').pop()}`;
      await supabase.storage.from('note-images').upload(filePath, compressedFile);
      const { data } = supabase.storage.from('note-images').getPublicUrl(filePath);
      handleEditChange('image_url', data.publicUrl);
    } catch (error) { alert("Failed to upload image."); }
    finally { setIsUploadingBg(false); } 
  };

  const ChecklistEditor = ({ items, setItems, fontClass, textColor, highlightClass }) => {
    const updateItem = (id, text, is_completed) => setItems(items.map(item => item.id === id ? { ...item, text, is_completed } : item));
    const removeItem = (id) => setItems(items.filter(item => item.id !== id));
    const addItem = () => setItems([...items, { id: crypto.randomUUID(), text: '', is_completed: false }]);
    return (
      <div className="flex flex-col gap-2 mt-2 mb-4 w-full">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 w-full group">
            <input type="checkbox" checked={item.is_completed} onChange={(e) => updateItem(item.id, item.text, e.target.checked)} className="w-5 h-5 cursor-pointer text-blue-600 rounded-md border-2 border-gray-400" />
            <input type="text" style={{ color: item.is_completed ? '#9ca3af' : textColor }} value={item.text} onChange={(e) => updateItem(item.id, e.target.value, item.is_completed)} placeholder="List item" className={`flex-1 bg-transparent outline-none font-bold ${item.is_completed ? 'line-through opacity-70' : ''} ${fontClass} ${highlightClass}`} autoFocus={item.text === ''} />
            <button type="button" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">✕</button>
          </div>
        ))}
        <div className="flex items-center gap-3 mt-1 opacity-70 hover:opacity-100 transition-opacity border-t border-black/10 pt-2">
          <span className="text-2xl text-gray-500 leading-none pb-1 font-bold">+</span>
          <input type="text" style={{ color: textColor }} placeholder="List item" onFocus={addItem} value="" onChange={()=>{}} className={`flex-1 bg-transparent outline-none font-bold ${fontClass} ${highlightClass}`} />
        </div>
      </div>
    );
  };

  // FIX: Accurate Background Logic for Gradients
  const getBgStyle = (color, bgImage) => {
    if (bgImage) return { backgroundImage: `url(${bgImage})`, backgroundColor: (color && !color.includes('gradient')) ? color : '#ffffff' };
    if (color && color.includes('gradient')) return { backgroundImage: color }; // Gradient handler
    return { backgroundColor: color || 'var(--app-bg, rgba(255,255,255,0.7))' };
  };

  let filteredNotes = notes;
  if (selectedCategory === 'Trash') filteredNotes = notes.filter(n => n.is_trashed);
  else if (selectedCategory === 'Archive') filteredNotes = notes.filter(n => n.is_archived && !n.is_trashed);
  else {
    filteredNotes = notes.filter(n => !n.is_trashed && !n.is_archived); 
    if (selectedCategory !== 'All Notes') filteredNotes = filteredNotes.filter(n => n.labels && n.labels.includes(selectedCategory));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredNotes = filteredNotes.filter(n => (n.title && n.title.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q)) || (n.labels && n.labels.some(l => l.toLowerCase().includes(q))));
  }

  const sortedNotes = [...filteredNotes].sort((a, b) => { if (a.is_pinned === b.is_pinned) return 0; return a.is_pinned ? -1 : 1; });

  const activeFontNew = previewFontNew || newFont;
  const newTextHighlight = newBgImage ? 'img-text-highlight' : '';

  return (
    <main className="flex-1 flex flex-col bg-transparent h-full overflow-y-auto relative">
      
      {/* New Note Box */}
      {selectedCategory !== 'Trash' && selectedCategory !== 'Archive' && (
        <div className="p-4 md:p-8 pb-4">
          <div ref={newNoteRef} className={`max-w-3xl mx-auto relative group ${isToolbarMenuOpen ? 'z-[60]' : 'z-20'}`} onClick={() => setIsNewBoxExpanded(true)}>
            <div className={`absolute inset-0 z-0 border border-gray-300 shadow-md transition-all bg-cover bg-center ${newShape}`} style={getBgStyle(newColor, newBgImage)}>
              {newBgImage && <div className="absolute inset-0 bg-black/20" style={{ borderRadius: 'inherit' }}></div>}
            </div>
            
            <div className="relative z-10 p-4 md:p-6 flex flex-col h-full">
              {isUploadingBg && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[100] flex flex-col items-center justify-center rounded-2xl">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-sm font-bold text-gray-900 bg-white/80 px-3 py-1 rounded-full shadow-sm">Applying...</span>
                </div>
              )}

              {isNewBoxExpanded && <input type="text" style={{ color: newTextColor }} placeholder="Title" value={title} onChange={(e) => handleNewChange('title', e.target.value)} className={`w-full outline-none text-xl md:text-2xl font-bold placeholder-gray-500 mb-3 bg-transparent px-2 ${activeFontNew} ${newTextHighlight}`} />}
              {isNewChecklist ? <ChecklistEditor items={newChecklistItems} setItems={setNewChecklistItems} fontClass={activeFontNew} textColor={newTextColor} highlightClass={newTextHighlight} /> : <textarea style={{ color: newTextColor }} placeholder="Write Your NXT Note..." value={content} onChange={(e) => handleNewChange('content', e.target.value)} className={`w-full outline-none text-base md:text-lg placeholder-gray-600 resize-none bg-transparent font-medium px-2 ${activeFontNew} ${newTextHighlight} ${isNewBoxExpanded ? 'min-h-[80px]' : 'h-7'}`} />}
              {imagePreview && (
                <div className="relative mb-3 mt-3"><img src={imagePreview} className="w-full h-48 object-cover rounded-xl shadow-sm" /><button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-gray-900/80 text-white rounded-full p-1.5 hover:bg-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
              )}
              {newLabels.length > 0 && <div className="flex flex-wrap gap-1.5 px-2 mt-2">{newLabels.map(l => <span key={l} className="bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">{l}</span>)}</div>}
              
              {isNewBoxExpanded && (
                <div className="mt-2 pt-2 border-t border-black/10">
                  <NoteToolbar 
                    isEditing={true} appTheme={appTheme}
                    currentFont={newFont} onFontChange={setNewFont} onFontHover={setPreviewFontNew}
                    currentShape={newShape} onShapeChange={setNewShape} 
                    currentTextColor={newTextColor} onTextColorChange={setNewTextColor}
                    onThemeChange={(theme) => { if(theme.color!==undefined) setNewColor(theme.color); if(theme.bg_image_url!==undefined) setNewBgImage(theme.bg_image_url); }}
                    currentColor={newColor} currentBgImage={newBgImage} onCustomBgUpload={(file) => handleCustomBgUpload(file, false)} customNoteBgs={customNoteBgs}
                    onAddImage={() => fileInputRef.current.click()} onToggleLabel={handleToggleNewLabel} allLabels={allLabels} currentLabels={newLabels} isChecklist={isNewChecklist} onToggleChecklist={toggleNewChecklist} onUndo={undoNew} onRedo={redoNew} canUndo={newHistoryIndex > 0} canRedo={newHistoryIndex < newHistory.length - 1} onClose={() => { setIsNewBoxExpanded(false); handleAddNote(); }}
                    onMenuToggle={setIsToolbarMenuOpen} hasBgImage={!!newBgImage}
                  />
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 pt-4">
        {selectedCategory !== 'All Notes' && <h2 className={`text-lg font-bold mb-4 px-2 ${selectedCategory === 'Trash' ? 'text-red-600' : 'text-gray-600'}`}>{selectedCategory === 'Trash' ? 'Trash (Recycle Bin)' : selectedCategory}</h2>}
        <div className={`max-w-7xl mx-auto ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5' : 'flex flex-col gap-4 max-w-3xl'}`}>
          {sortedNotes.map((note) => <NoteCard key={note.id} note={note} fetchNotes={fetchNotes} setEditingNote={openEditModal} allLabels={allLabels} handleCopyNote={handleCopyNote} customNoteBgs={customNoteBgs} appTheme={appTheme} viewMode={viewMode} />)}
        </div>
      </div>

      {/* Main Edit Modal (FIXED: BLUR REMOVED bg-gray-900/40) */}
      {editingNote && !editingNote.is_trashed && (
        <div 
          className={`fixed inset-0 bg-gray-900/40 flex items-center justify-center p-4 md:p-8 z-[60] transition-opacity duration-300 ease-in-out ${(showHistoryModal || isClosingEdit) ? 'opacity-0' : 'opacity-100'}`} 
          onMouseDown={saveAndCloseEdit}
        >
          <div 
            className={`relative shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] z-50 rounded-2xl transition-all duration-300 ease-out transform ${isClosingEdit ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`} 
            onMouseDown={(e) => e.stopPropagation()}
          >
            
            {/* Modal Background Gradient Fix */}
            <div className={`absolute inset-0 z-0 bg-cover bg-center ${editingNote.frame_style || 'shape-rounded'}`} style={getBgStyle(editingNote.color, editingNote.bg_image_url)}>
              {editingNote.bg_image_url && <div className="absolute inset-0 bg-black/20" style={{ borderRadius: 'inherit' }}></div>}
            </div>
            
            <div className="relative z-10 pt-4 md:pt-6 pb-2 px-4 md:px-6 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                
                {editingNote.image_url && (
                  <div className="relative mb-4">
                    <img src={editingNote.image_url} className="w-full max-h-72 object-contain rounded-xl bg-black/5" />
                    <button type="button" onClick={() => handleEditChange('image_url', null)} className="absolute top-2 right-2 bg-gray-900/80 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                )}
                
                {(() => {
                  const activeFontEdit = previewFontEdit || editingNote.font_family || 'font-sans';
                  const editTextHighlight = editingNote.bg_image_url ? 'img-text-highlight' : '';
                  return (
                    <>
                      <input type="text" style={{ color: editingNote.text_color || '#111827' }} value={editingNote.title} onChange={(e) => handleEditChange('title', e.target.value)} className={`w-full outline-none text-2xl md:text-3xl font-bold mb-4 bg-transparent ${activeFontEdit} ${editTextHighlight}`} placeholder="Title" />
                      {editingNote.is_checklist ? <ChecklistEditor items={editingNote.checklist_items || []} setItems={(items) => handleEditChange({checklist_items: items})} fontClass={activeFontEdit} textColor={editingNote.text_color || '#111827'} highlightClass={editTextHighlight} /> : <textarea style={{ color: editingNote.text_color || '#111827' }} value={editingNote.content} onChange={(e) => handleEditChange('content', e.target.value)} className={`w-full outline-none text-lg md:text-xl resize-none flex-1 min-h-[150px] md:min-h-[200px] bg-transparent font-medium ${activeFontEdit} ${editTextHighlight}`} placeholder="Note content..." />}
                    </>
                  );
                })()}
                
                {editingNote.labels && editingNote.labels.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2 mt-4">{editingNote.labels.map(l => <span key={l} className="bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{l}</span>)}</div>}
              </div>
              
              <div className="shrink-0 pt-2 border-t border-black/10 mt-2">
                <NoteToolbar 
                  isEditing={true} appTheme={appTheme}
                  currentFont={editingNote.font_family} onFontChange={(f) => handleEditChange('font_family', f)} onFontHover={setPreviewFontEdit} currentShape={editingNote.frame_style} onShapeChange={(s) => handleEditChange('frame_style', s)} 
                  currentColor={editingNote.color} onColorChange={(c) => handleEditChange('color', c)} 
                  currentTextColor={editingNote.text_color || '#111827'} onTextColorChange={(c) => handleEditChange('text_color', c)}
                  onThemeChange={(theme) => handleEditChange(theme)} currentBgImage={editingNote.bg_image_url} onCustomBgUpload={(file) => handleCustomBgUpload(file, true)} customNoteBgs={customNoteBgs}
                  onAddImage={() => editFileInputRef.current.click()} 
                  onToggleLabel={(l) => { let lbls = editingNote.labels || []; handleEditChange('labels', lbls.includes(l) ? lbls.filter(x => x !== l) : [...lbls, l]); }} allLabels={allLabels} currentLabels={editingNote.labels || []} isChecklist={editingNote.is_checklist} 
                  onToggleChecklist={() => {
                    const isNowList = !editingNote.is_checklist;
                    let newItems = editingNote.checklist_items || []; let newContent = editingNote.content;
                    if (isNowList) { newItems = editingNote.content.split('\n').filter(t => t.trim() !== '').map(text => ({ id: crypto.randomUUID(), text, is_completed: false })); newContent = ''; } 
                    else { newContent = newItems.map(item => item.text).join('\n'); newItems = []; }
                    handleEditChange({ is_checklist: isNowList, checklist_items: newItems, content: newContent });
                  }}
                  onHistory={() => setShowHistoryModal(true)} 
                  onDelete={async () => { await supabase.from('notes').update({ is_trashed: true }).eq('id', editingNote.id); setEditingNote(null); fetchNotes(); }} onCopy={(e) => { handleCopyNote(e, editingNote); setEditingNote(null); }} onArchive={async (e) => { e.stopPropagation(); await supabase.from('notes').update({ is_archived: !editingNote.is_archived }).eq('id', editingNote.id); setEditingNote(null); fetchNotes(); }} isArchived={editingNote.is_archived} lastEdited={formatTime(editingNote.updated_at || editingNote.created_at)} onUndo={undoEdit} onRedo={redoEdit} canUndo={historyIndex > 0} canRedo={historyIndex < noteHistory.length - 1} 
                  onClose={saveAndCloseEdit} 
                  hasBgImage={!!editingNote.bg_image_url}
                />
                <input type="file" accept="image/*" ref={editFileInputRef} onChange={handleEditImageChange} className="hidden" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && editingNote && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-[90] transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Version History</h2>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="overflow-y-auto pr-2 flex-1 custom-scrollbar space-y-4">
              {(!notes.find(n => n.id === editingNote.id)?.edit_history || notes.find(n => n.id === editingNote.id).edit_history.length === 0) ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No previous versions available.</p>
              ) : (
                notes.find(n => n.id === editingNote.id).edit_history.map((historyItem, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm relative group">
                    <p className="text-xs font-bold text-gray-500 mb-2">{formatTime(historyItem.saved_at)}</p>
                    <h4 className="font-semibold text-gray-800 mb-1">{historyItem.title || 'Untitled'}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{historyItem.is_checklist ? historyItem.checklist_items?.map(i => i.text).join(', ') : historyItem.content}</p>
                    <button onClick={() => restoreVersion(historyItem)} className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-200">Restore This</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}