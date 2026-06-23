import { useState, useRef, useEffect } from 'react';

export default function NoteToolbar({ 
  onFontChange, onFontHover, currentFont, 
  onTextColorChange, currentTextColor,
  onThemeChange, currentColor, currentBgImage, onCustomBgUpload, customNoteBgs = [],
  onShapeChange, currentShape, onAddImage, onToggleLabel, allLabels = [], currentLabels = [],
  onToggleChecklist, isChecklist, onUndo, onRedo, canUndo, canRedo,
  onDelete, onCopy, onArchive, onHistory, lastEdited, onClose, isEditing = false, isArchived = false,
  onMenuToggle, hasBgImage = false, appTheme = '#ffffff'
}) {
  const customBgInputRef = useRef(null);

  // Gradient Maker States
  const [grad1, setGrad1] = useState('#f6d365');
  const [grad2, setGrad2] = useState('#fda085');

  const solidColors = ['transparent', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb'];
  const gradientColors = [
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  ];
  
  const textColors = ['#111827', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  
  const fonts = [
    { name: 'Default Sans', value: 'font-sans' }, { name: 'Roboto', value: 'font-roboto' },
    { name: 'Open Sans', value: 'font-open-sans' }, { name: 'Montserrat', value: 'font-montserrat' },
    { name: 'Poppins', value: 'font-poppins' }, { name: 'Raleway', value: 'font-raleway' },
    { name: 'Nunito', value: 'font-nunito' }, { name: 'Oswald', value: 'font-oswald' },
    { name: 'Anton (Bold)', value: 'font-anton' }, { name: 'Serif Elegant', value: 'font-serif-elegant' },
    { name: 'Merriweather', value: 'font-merriweather' }, { name: 'Lora', value: 'font-lora' },
    { name: 'Playfair', value: 'font-playfair' }, { name: 'Code / Mono', value: 'font-mono-code' },
    { name: 'Fira Code', value: 'font-fira-code' }, { name: 'Inconsolata', value: 'font-inconsolata' },
    { name: 'Handwriting', value: 'font-handwriting' }, { name: 'Comic', value: 'font-comic' },
    { name: 'Dancing Script', value: 'font-dancing' }, { name: 'Indie Flower', value: 'font-indie' },
    { name: 'Shadows Light', value: 'font-shadows' }, { name: 'Satisfy', value: 'font-satisfy' }
  ];

  const shapes = [{ name: 'Rectangle', value: 'shape-rectangle' }, { name: 'Rounded', value: 'shape-rounded' }, { name: 'Circle', value: 'shape-circle' }, { name: 'Torn Paper', value: 'shape-torn' }, { name: 'Leaf', value: 'shape-leaf' }, { name: 'Cut Corner', value: 'shape-tag' }];
  
  const defaultBgImages = [
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f314cb?auto=format&fit=crop&w=300&q=80',
  ];
  
  const [openMenu, setOpenMenu] = useState(null); 
  const [newLabelText, setNewLabelText] = useState('');
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setOpenMenu(null); if (onMenuToggle) onMenuToggle(false);
        if (onFontHover) onFontHover(null); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu, onMenuToggle, onFontHover]);

  const handleMenuClick = (e, menuName) => { e.stopPropagation(); const newMenuState = openMenu === menuName ? null : menuName; setOpenMenu(newMenuState); if (onMenuToggle) onMenuToggle(!!newMenuState); };
  const closeMenu = () => { setOpenMenu(null); if (onMenuToggle) onMenuToggle(false); if(onFontHover) onFontHover(null); };
  const handleCreateLabel = (e) => { e.stopPropagation(); if (newLabelText.trim()) { onToggleLabel(newLabelText.trim()); setNewLabelText(''); } };

  const getMenuThemeStyle = () => {
    if (!appTheme) return { backgroundColor: '#ffffff' };
    if (appTheme.startsWith('#')) return { backgroundColor: appTheme };
    if (appTheme.startsWith('linear')) return { backgroundImage: appTheme };
    return { backgroundColor: '#ffffff' };
  };

  const toolbarContainerClass = isEditing 
    ? "flex items-center justify-between w-full pt-3 pb-1 relative z-[70] transition-opacity duration-200"
    : `flex items-center justify-between w-full mt-4 relative transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 ${hasBgImage ? 'bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/60' : 'pt-2'}`;

  return (
    <div ref={toolbarRef} className={toolbarContainerClass}>
      <div className="flex items-center gap-1">
        
        {/* Font Style */}
        {isEditing && (
          <div className="relative">
            <button type="button" onClick={(e) => handleMenuClick(e, 'font')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Font Style"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg></button>
            {openMenu === 'font' && (
              <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-[340px] max-h-72 overflow-y-auto custom-scrollbar border border-white/40 bg-white/20 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
                <div className="relative z-10 p-2 grid grid-cols-2 gap-1.5">
                  {fonts.map(font => (
                    <button 
                      key={font.value} type="button" 
                      onMouseEnter={() => onFontHover && onFontHover(font.value)} 
                      onMouseLeave={() => onFontHover && onFontHover(null)}
                      onClick={(e) => { e.stopPropagation(); onFontChange(font.value); if(onFontHover) onFontHover(null); closeMenu(); }} 
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all font-bold ${font.value} ${currentFont === font.value ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-gray-900 bg-white/40 hover:bg-white/80 border border-white/50'}`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Color */}
        {isEditing && (
          <div className="relative">
            <button type="button" onClick={(e) => handleMenuClick(e, 'textColor')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Text Color"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg></button>
            {openMenu === 'textColor' && (
              <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-48 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl z-0"></div>
                <div className="relative z-10 p-4 flex flex-wrap gap-2">
                  <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider w-full mb-1">Text Color</p>
                  {textColors.map(color => <button key={color} type="button" onClick={() => { onTextColorChange(color); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform flex items-center justify-center ${currentTextColor === color ? 'border-blue-600 border-2 shadow-md' : 'border-gray-300'}`} style={{ backgroundColor: color }} />)}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gray-50 hover:bg-gray-200 transition-colors" title="Custom Text Color"><span className="text-gray-500 font-bold leading-none mb-0.5">+</span><input type="color" onChange={(e) => onTextColorChange(e.target.value)} onBlur={closeMenu} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Background & Colors */}
        <div className="relative">
          <button type="button" onClick={(e) => handleMenuClick(e, 'color')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Background Options"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/></svg></button>
          {openMenu === 'color' && (
            <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-3 bg-white border border-gray-200 shadow-2xl rounded-3xl p-4 z-[90] w-[280px] max-h-80 overflow-y-auto custom-scrollbar" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-white/85 backdrop-blur-2xl z-0"></div>
              <div className="relative z-10 flex flex-col gap-4">
                
                {/* Colors & Gradients Section */}
                <div>
                  <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-2">Colors & Gradients</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {solidColors.map(color => <button key={color} type="button" onClick={() => { onThemeChange({ color: color === 'transparent' ? '' : color, bg_image_url: '' }); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-blue-600 border-2 shadow-md' : 'border-gray-300'}`} style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}>{color === 'transparent' && <svg width="14" height="14" viewBox="0 0 24 24" stroke="gray" strokeWidth="2"><line x1="2" y1="2" x2="22" y2="22"/></svg>}</button>)}
                    
                    {/* Default Gradients */}
                    {gradientColors.map(grad => <button key={grad} type="button" onClick={() => { onThemeChange({ color: grad, bg_image_url: '' }); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform ${currentColor === grad ? 'border-blue-600 border-2 shadow-md' : 'border-white'}`} style={{ backgroundImage: grad }} />)}
                    
                    {/* Advanced Custom Gradient Mixer (DOUBLE CIRCLE) */}
                    <div className="flex bg-white rounded-full p-0.5 gap-0 items-center border border-gray-300 shadow-sm hover:scale-105 transition-transform" title="Mix Custom Gradient">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-sm" style={{ backgroundColor: grad1 }}>
                        <input type="color" value={grad1} onChange={(e) => { setGrad1(e.target.value); onThemeChange({ color: `linear-gradient(135deg, ${e.target.value} 0%, ${grad2} 100%)`, bg_image_url: '' }); }} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                      </div>
                      <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-sm -ml-3 border-l-2 border-white" style={{ backgroundColor: grad2 }}>
                        <input type="color" value={grad2} onChange={(e) => { setGrad2(e.target.value); onThemeChange({ color: `linear-gradient(135deg, ${grad1} 0%, ${e.target.value} 100%)`, bg_image_url: '' }); }} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                      </div>
                    </div>

                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-white hover:bg-gray-100 transition-colors" title="Custom Solid Color"><span className="text-gray-500 font-bold leading-none mb-0.5">+</span><input type="color" onChange={(e) => { onThemeChange({ color: e.target.value, bg_image_url: '' }); }} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" /></div>
                  </div>
                </div>

                <div className="h-px bg-gray-300/50"></div>

                {/* Themes Gallery */}
                <div>
                  <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider mb-2">Themes Gallery</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button type="button" onClick={() => { onThemeChange({ bg_image_url: '' }); closeMenu(); }} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors bg-white" title="No Background"><svg width="14" height="14" viewBox="0 0 24 24" stroke="gray" strokeWidth="2"><line x1="2" y1="2" x2="22" y2="22"/></svg></button>
                    {defaultBgImages.map(bg => <button key={bg} type="button" onClick={() => { onThemeChange({ color: '', bg_image_url: bg }); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform bg-cover bg-center ${currentBgImage === bg ? 'border-blue-600 border-2 shadow-md' : 'border-gray-300'}`} style={{ backgroundImage: `url(${bg})` }} title="Theme" />)}
                    {customNoteBgs.map(bg => <button key={bg} type="button" onClick={() => { onThemeChange({ color: '', bg_image_url: bg }); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform bg-cover bg-center ${currentBgImage === bg ? 'border-blue-600 border-2 shadow-md' : 'border-gray-300'}`} style={{ backgroundImage: `url(${bg})` }} title="My Theme" />)}
                    {onCustomBgUpload && (
                      <button type="button" onClick={() => customBgInputRef.current?.click()} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition-colors shadow-sm" title="Upload New Theme"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>
                    )}
                    <input type="file" accept="image/*" ref={customBgInputRef} className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file && onCustomBgUpload) { onCustomBgUpload(file); closeMenu(); } }} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Shape */}
        {isEditing && (
          <div className="relative"><button type="button" onClick={(e) => handleMenuClick(e, 'shape')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Note Shape"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m21.92 7.62-4.54-4.54a2 2 0 0 0-2.83 0L10 7.62v4.38h4.38l4.54-4.54a2 2 0 0 0 0-2.84z"/></svg></button>
            {openMenu === 'shape' && <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-40 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}><div className="absolute inset-0 bg-white/85 backdrop-blur-2xl z-0"></div><div className="relative z-10 py-2">{shapes.map(shape => <button key={shape.value} type="button" onClick={(e) => { e.stopPropagation(); onShapeChange(shape.value); closeMenu(); }} className={`w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-white/60 transition-colors ${currentShape === shape.value ? 'text-blue-600' : 'text-gray-800'}`}>{shape.name}</button>)}</div></div>}
          </div>
        )}

        <button type="button" onClick={(e) => { e.stopPropagation(); onAddImage(); }} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Add Image"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>
        {isEditing && <button type="button" onClick={(e) => { e.stopPropagation(); onToggleChecklist(); }} className={`transition-colors p-2 rounded-full hover:bg-black/5 ${isChecklist ? 'text-blue-600 bg-blue-100' : 'text-gray-800 hover:text-blue-600'}`} title={isChecklist ? "Hide checkboxes" : "Show checkboxes"}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></button>}
        
        {isEditing && (
          <div className="relative"><button type="button" onClick={(e) => handleMenuClick(e, 'label')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="Add Label"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg></button>
            {openMenu === 'label' && <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-60 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}><div className="absolute inset-0 bg-white/85 backdrop-blur-2xl z-0"></div><div className="relative z-10 p-4"><input type="text" autoFocus placeholder="Enter label name" value={newLabelText} onChange={(e) => setNewLabelText(e.target.value)} className="w-full text-sm font-bold px-3 py-2 outline-none border border-gray-200 rounded-xl mb-3 text-gray-900 bg-white/50" /><div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">{allLabels.map(label => <label key={label} className="flex items-center gap-3 w-full cursor-pointer hover:bg-white/60 p-2 rounded-xl"><input type="checkbox" checked={currentLabels.includes(label)} onChange={(e) => { e.stopPropagation(); onToggleLabel(label); }} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-bold text-gray-800">{label}</span></label>)}</div>{newLabelText.trim() !== '' && !allLabels.includes(newLabelText.trim()) && <button type="button" onClick={handleCreateLabel} className="mt-3 w-full text-left text-sm font-extrabold text-[var(--color-primary)] px-3 py-2 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl transition-colors">+ Create "{newLabelText.trim()}"</button>}</div></div>}
          </div>
        )}

        {onArchive && <button type="button" onClick={(e) => { e.stopPropagation(); onArchive(e); }} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title={isArchived ? "Unarchive" : "Archive"}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg></button>}

        {/* 3-Dots Menu */}
        <div className="relative"><button type="button" onClick={(e) => handleMenuClick(e, 'more')} className="text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-black/5" title="More"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
          {openMenu === 'more' && (
            <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-48 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-white/85 backdrop-blur-2xl z-0"></div>
              <div className="relative z-10 py-2">
                {onDelete && <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(e); closeMenu(); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Delete note</button>}
                {onCopy && <button type="button" onClick={(e) => { e.stopPropagation(); onCopy(e); closeMenu(); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Make a copy</button>}
                {!isEditing && (
                  <>
                    <div className="h-px bg-gray-300/50 my-1 mx-3"></div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu('more-label'); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Add label</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleChecklist(); closeMenu(); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">{isChecklist ? 'Hide checkboxes' : 'Show checkboxes'}</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu('more-font'); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Change font style</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu('more-textcolor'); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Change text color</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu('more-shape'); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Change note shape</button>
                  </>
                )}
                {isEditing && onHistory && (
                  <>
                    <div className="h-px bg-gray-300/50 my-1 mx-3"></div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onHistory(); closeMenu(); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-white/60 transition-colors">Version history</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Sub-Menus for Card Hover Mode */}
          {openMenu === 'more-font' && <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-80 max-h-64 overflow-y-auto custom-scrollbar border border-white/60 bg-white/20 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}><div className="relative z-10 p-2 grid grid-cols-2 gap-1.5">{fonts.map(font => <button key={font.value} type="button" onMouseEnter={() => onFontHover && onFontHover(font.value)} onMouseLeave={() => onFontHover && onFontHover(null)} onClick={(e) => { e.stopPropagation(); onFontChange(font.value); if(onFontHover) onFontHover(null); closeMenu(); }} className={`w-full text-left px-3 py-2 rounded-xl transition-all font-bold ${font.value} ${currentFont === font.value ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-gray-900 bg-white/40 hover:bg-white/80 border border-white/50'}`}>{font.name}</button>)}</div></div>}
          {openMenu === 'more-textcolor' && <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-48 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}><div className="absolute inset-0 bg-white/80 backdrop-blur-2xl z-0"></div><div className="relative z-10 p-4 flex flex-wrap gap-2"><p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider w-full mb-1">Text Color</p>{textColors.map(color => <button key={color} type="button" onClick={() => { onTextColorChange(color); closeMenu(); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform flex items-center justify-center ${currentTextColor === color ? 'border-blue-600 border-2 shadow-md' : 'border-gray-300'}`} style={{ backgroundColor: color }} />)}<div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gray-50 hover:bg-gray-200 transition-colors" title="Custom Text Color"><span className="text-gray-500 font-bold leading-none mb-0.5">+</span><input type="color" onChange={(e) => onTextColorChange(e.target.value)} onBlur={closeMenu} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" /></div></div></div>}
          {openMenu === 'more-shape' && <div className="absolute bottom-full left-0 mb-2 shadow-2xl rounded-3xl z-[90] w-40 border border-white/40 overflow-hidden" style={getMenuThemeStyle()} onClick={(e) => e.stopPropagation()}><div className="absolute inset-0 bg-white/85 backdrop-blur-2xl z-0"></div><div className="relative z-10 py-2">{shapes.map(shape => <button key={shape.value} type="button" onClick={(e) => { e.stopPropagation(); onShapeChange(shape.value); closeMenu(); }} className={`w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-white/60 transition-colors ${currentShape === shape.value ? 'text-blue-600' : 'text-gray-800'}`}>{shape.name}</button>)}</div></div>}
          {openMenu === 'more-label' && <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 shadow-2xl rounded-xl p-3 z-[90]" onClick={(e) => e.stopPropagation()}><input type="text" autoFocus placeholder="Enter label name" value={newLabelText} onChange={(e) => setNewLabelText(e.target.value)} className="w-full text-sm font-bold px-3 py-2 outline-none border border-gray-200 rounded-xl mb-3 text-gray-900 bg-white/50" /><div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">{allLabels.map(label => <label key={label} className="flex items-center gap-3 w-full cursor-pointer hover:bg-white/60 p-2 rounded-xl"><input type="checkbox" checked={currentLabels.includes(label)} onChange={(e) => { e.stopPropagation(); onToggleLabel(label); }} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-bold text-gray-800">{label}</span></label>)}</div>{newLabelText.trim() !== '' && !allLabels.includes(newLabelText.trim()) && <button type="button" onClick={handleCreateLabel} className="mt-3 w-full text-left text-sm font-extrabold text-[var(--color-primary)] px-3 py-2 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl transition-colors">+ Create "{newLabelText.trim()}"</button>}</div>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
        {isEditing && (
          <div className="flex items-center border-r border-gray-300/50 pr-2 mr-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); onUndo(); }} disabled={!canUndo} className="text-gray-800 hover:text-blue-600 disabled:opacity-30 p-2 rounded-full hover:bg-black/5" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3l-3 2.7"/></svg></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onRedo(); }} disabled={!canRedo} className="text-gray-800 hover:text-blue-600 disabled:opacity-30 p-2 rounded-full hover:bg-black/5" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>
          </div>
        )}
        
        {isEditing && <button type="button" onClick={(e) => { e.stopPropagation(); onClose(e); }} className="ml-3 px-5 py-2 text-sm font-bold text-gray-800 hover:bg-black/5 rounded-lg transition-colors">Close</button>}
      </div>
      {openMenu && <div className="fixed inset-0 z-50" onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }} />}
    </div>
  );
}