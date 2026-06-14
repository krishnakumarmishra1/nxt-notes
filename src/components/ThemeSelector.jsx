import { useEffect, useState } from 'react';

export default function ThemeSelector({ setAppTheme }) {
  const [accentColor, setAccentColor] = useState('#2563eb');
  
  const defaultBackgrounds = [
    { name: 'Light', value: '#f9fafb' },
    { name: 'Dark', value: '#111827' },
    { name: 'Ocean', value: 'linear-gradient(to bottom right, #eff6ff, #cffafe)' },
    { name: 'Sunset', value: 'linear-gradient(to bottom right, #fff7ed, #ffe4e6)' },
    { name: 'Forest', value: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' },
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

  // बग फिक्स: बाहर क्लिक करने पर (onBlur) ही लिस्ट में कलर सेव होगा
  const handleSaveCustomBg = (e) => {
    const newColor = e.target.value;
    if (!customBackgrounds.includes(newColor)) {
      const updatedCustoms = [...customBackgrounds, newColor];
      setCustomBackgrounds(updatedCustoms);
      localStorage.setItem('nxt-custom-bgs', JSON.stringify(updatedCustoms));
    }
  };

  return (
    <div className="p-4 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
      <div className="mb-5 w-full">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">App Background</p>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {defaultBackgrounds.map((bg) => (
            <button
              key={bg.name}
              onClick={() => applyAppTheme(bg.value)}
              className="shrink-0 w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: bg.value }}
              title={bg.name}
            />
          ))}

          {customBackgrounds.map((color, idx) => (
            <button
              key={idx}
              onClick={() => applyAppTheme(color)}
              className="shrink-0 w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: color }}
              title="Custom Theme"
            />
          ))}

          {/* Add New Color (Fixed) */}
          <div className="shrink-0 relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors" title="Add Custom Color">
            <span className="text-gray-500 font-bold leading-none mb-0.5">+</span>
            <input
              type="color"
              onChange={(e) => applyAppTheme(e.target.value)} // लाइव प्रीव्यू के लिए
              onBlur={handleSaveCustomBg} // फाइनल सेव करने के लिए
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Accent Color</p>
      <div className="flex items-center gap-3">
        <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => applyAccent(e.target.value)}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
            title="Pick accent color"
          />
        </div>
        <span className="text-sm text-gray-600 font-medium">Custom Accent</span>
      </div>
    </div>
  );
}