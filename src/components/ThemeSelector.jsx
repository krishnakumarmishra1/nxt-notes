import { useEffect, useState } from 'react';

export default function ThemeSelector({ setAppTheme }) {
  const [accentColor, setAccentColor] = useState('#2563eb');
  
  // Custom Gradient Maker States
  const [grad1, setGrad1] = useState('#f6d365');
  const [grad2, setGrad2] = useState('#fda085');
  
  const defaultBackgrounds = [
    { name: 'Light', value: '#f9fafb' },
    { name: 'Dark', value: '#111827' },
    { name: 'Ocean', value: 'linear-gradient(to bottom right, #eff6ff, #cffafe)' },
    { name: 'Sunset', value: 'linear-gradient(to bottom right, #fff7ed, #ffe4e6)' },
    { name: 'Forest', value: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' },
    { name: 'Berry', value: 'linear-gradient(to bottom right, #fdf2f8, #fbcfe8)' },
    { name: 'Midnight', value: 'linear-gradient(to bottom right, #1e1b4b, #312e81)' },
    { name: 'Silver', value: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)' },
  ];

  const [customBackgrounds, setCustomBackgrounds] = useState(
    JSON.parse(localStorage.getItem('nxt-custom-bgs')) || []
  );

  useEffect(() => {
    const savedAccent = localStorage.getItem('nxt-accent-color');
    const savedBg = localStorage.getItem('nxt-app-theme');
    if (savedAccent) applyAccent(savedAccent);
    if (savedBg) setAppTheme(savedBg);
  }, []);

  const applyAccent = (newColor) => {
    setAccentColor(newColor);
    document.documentElement.style.setProperty('--color-primary', newColor);
    document.documentElement.style.setProperty('--color-primary-light', newColor + '1A'); 
    localStorage.setItem('nxt-accent-color', newColor);
  };

  const applyAppTheme = (newTheme) => {
    setAppTheme(newTheme);
    localStorage.setItem('nxt-app-theme', newTheme);
  };

  const handleSaveCustomBg = (newColor) => {
    if (!customBackgrounds.includes(newColor)) {
      const updatedCustoms = [...customBackgrounds, newColor];
      setCustomBackgrounds(updatedCustoms);
      localStorage.setItem('nxt-custom-bgs', JSON.stringify(updatedCustoms));
    }
    applyAppTheme(newColor);
  };

  const handleCustomGradientChange = (color1, color2) => {
    setGrad1(color1);
    setGrad2(color2);
    applyAppTheme(`linear-gradient(to bottom right, ${color1}, ${color2})`);
  };

  return (
    <div className="p-4 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
      <div className="mb-5 w-full">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">App Background</p>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar pr-2">
          {defaultBackgrounds.map((bg) => (
            <button key={bg.name} onClick={() => applyAppTheme(bg.value)} className="shrink-0 w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ background: bg.value }} title={bg.name} />
          ))}
          {customBackgrounds.map((color, idx) => (
            <button key={idx} onClick={() => applyAppTheme(color)} className="shrink-0 w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ background: color }} title="Custom Theme" />
          ))}
          
          {/* Custom Solid Color Add */}
          <div className="shrink-0 relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors" title="Add Custom Solid Color">
            <span className="text-gray-500 font-bold leading-none mb-0.5">+</span>
            <input type="color" onChange={(e) => applyAppTheme(e.target.value)} onBlur={(e) => handleSaveCustomBg(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
          </div>

          {/* NEW: Custom Gradient Maker (Double Circle Design) */}
          <div className="shrink-0 flex items-center bg-gray-100 rounded-full p-0.5 border-2 border-white shadow-sm hover:scale-105 transition-transform" title="Mix Custom Gradient">
            <div className="relative w-5 h-5 rounded-full overflow-hidden shadow-sm" style={{ background: grad1 }}>
              <input type="color" value={grad1} onChange={(e) => handleCustomGradientChange(e.target.value, grad2)} onBlur={() => handleSaveCustomBg(`linear-gradient(to bottom right, ${grad1}, ${grad2})`)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0" />
            </div>
            {/* Overlapping second circle (-ml-2) */}
            <div className="relative w-5 h-5 rounded-full overflow-hidden shadow-sm -ml-2 border-l border-white" style={{ background: grad2 }}>
              <input type="color" value={grad2} onChange={(e) => handleCustomGradientChange(grad1, e.target.value)} onBlur={() => handleSaveCustomBg(`linear-gradient(to bottom right, ${grad1}, ${grad2})`)} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0" />
            </div>
          </div>

        </div>
      </div>

      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Accent Color</p>
      <div className="flex items-center gap-3">
        <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <input type="color" value={accentColor} onChange={(e) => applyAccent(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" title="Pick accent color" />
        </div>
        <span className="text-sm text-gray-600 font-medium">Custom Accent</span>
      </div>
    </div>
  );
}