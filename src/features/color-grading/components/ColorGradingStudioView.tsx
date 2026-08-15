import React, { useState, useMemo } from 'react';
import {
  ColorScienceEngine,
  ColorWheelsConfig,
  FilmStockPreset,
} from '../../../core/color/colorScienceEngine';

export function ColorGradingStudioView() {
  const [wheels, setWheels] = useState<ColorWheelsConfig>({
    lift: { r: 0, g: 0, b: 0, luma: 0 },
    gamma: { r: 1.0, g: 1.0, b: 1.0, luma: 1.0 },
    gain: { r: 1.0, g: 1.0, b: 1.0, luma: 1.0 },
    offset: { r: 0, g: 0, b: 0, luma: 0 },
  });

  const [filmPreset, setFilmPreset] = useState<FilmStockPreset>('kodak-2383');
  const [showFalseColor, setShowFalseColor] = useState<boolean>(false);
  const [lutDownloaded, setLutDownloaded] = useState<boolean>(false);

  // Sample Evaluated Graded Swatches
  const gradedSample = useMemo(() => {
    const rawR = 180, rawG = 120, rawB = 70;
    const wheeled = ColorScienceEngine.applyColorWheels(rawR, rawG, rawB, wheels);
    const filmed = ColorScienceEngine.applyFilmEmulation(wheeled.r, wheeled.g, wheeled.b, filmPreset);
    const falseCol = ColorScienceEngine.getFalseColor(filmed.r, filmed.g, filmed.b);

    return {
      gradedRgb: `rgb(${filmed.r}, ${filmed.g}, ${filmed.b})`,
      falseColorRgb: `rgb(${falseCol.r}, ${falseCol.g}, ${falseCol.b})`,
      r: filmed.r,
      g: filmed.g,
      b: filmed.b,
    };
  }, [wheels, filmPreset]);

  // Download .cube 3D LUT File
  const handleExportLut = () => {
    const cubeContent = ColorScienceEngine.generate3dCubeLut(17, `MotionStudio_${filmPreset}`, (r, g, b) => {
      const w = ColorScienceEngine.applyColorWheels(r, g, b, wheels);
      return ColorScienceEngine.applyFilmEmulation(w.r, w.g, w.b, filmPreset);
    });

    const blob = new Blob([cubeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MotionStudio_${filmPreset}.cube`;
    a.click();
    URL.revokeObjectURL(url);

    setLutDownloaded(true);
    setTimeout(() => setLutDownloaded(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: FILM PRESETS & SCOPES */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎨</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Color Science & LUTs
          </span>
        </div>

        {/* Film Stock Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>FILM STOCK EMULATION:</span>
          {[
            { id: 'kodak-2383', name: 'Kodak 2383 Print', desc: 'Rich golden highlights, deep blacks' },
            { id: 'fuji-3513', name: 'Fuji 3513 Eterna', desc: 'Emerald cool shadows, soft roll-off' },
            { id: 'cinematic-teal-orange', name: 'Teal & Orange', desc: 'Modern blockbuster contrast' },
            { id: 'vintage-polaroid', name: 'Vintage Polaroid', desc: 'Faded cyan shadows, warm cast' },
          ].map((preset) => {
            const isSel = filmPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setFilmPreset(preset.id as FilmStockPreset)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSel ? '#38bdf8' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.desc}</div>
              </div>
            );
          })}
        </div>

        {/* False Color Toggle */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700 }}>False Color Overlay</span>
          <button
            onClick={() => setShowFalseColor((f) => !f)}
            style={{
              background: showFalseColor ? '#10b981' : '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 9,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {showFalseColor ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 2. CENTER COLUMN: 3-WAY COLOR WHEELS STAGE */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
            Interactive 3-Way Primary Color Wheels (Lift / Gamma / Gain)
          </span>

          <button
            onClick={handleExportLut}
            style={{
              background: lutDownloaded ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {lutDownloaded ? '✓ Exported .CUBE LUT!' : '💾 Export 3D .cube LUT'}
          </button>
        </div>

        {/* Live Color Preview Canvas */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 320,
              height: 200,
              borderRadius: 8,
              background: showFalseColor ? gradedSample.falseColorRgb : gradedSample.gradedRgb,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 32px rgba(0,0,0,0.8)',
              border: '2px solid #38bdf8',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 900, color: '#ffffff', textShadow: '0 2px 4px #000000' }}>
              {showFalseColor ? 'FALSE COLOR EXPOSURE' : `${filmPreset.toUpperCase()}`}
            </span>
            <span style={{ fontSize: 10, color: '#e2e8f0', marginTop: 4, fontFamily: 'monospace' }}>
              R: {gradedSample.r} | G: {gradedSample.g} | B: {gradedSample.b}
            </span>
          </div>
        </div>

        {/* 3 Interactive Color Wheels (Lift, Gamma, Gain) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {/* Lift (Shadows) */}
          <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8' }}>LIFT (SHADOWS)</span>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', position: 'relative', border: '2px solid #1e293b' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffffff', position: 'absolute', top: '42%', left: '42%', border: '1px solid #000000' }} />
            </div>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>Red Shift: {wheels.lift.r.toFixed(2)}</span>
          </div>

          {/* Gamma (Midtones) */}
          <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b' }}>GAMMA (MIDTONES)</span>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', position: 'relative', border: '2px solid #1e293b' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffffff', position: 'absolute', top: '42%', left: '42%', border: '1px solid #000000' }} />
            </div>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>Gamma: {wheels.gamma.r.toFixed(2)}</span>
          </div>

          {/* Gain (Highlights) */}
          <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#ec4899' }}>GAIN (HIGHLIGHTS)</span>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', position: 'relative', border: '2px solid #1e293b' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffffff', position: 'absolute', top: '42%', left: '42%', border: '1px solid #000000' }} />
            </div>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>Gain: {wheels.gain.r.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: LUT SPEC */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          3D LUT Specifications
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Generated 3D .cube LUTs are 100% compatible with Adobe Premiere Pro Lumetri Color, DaVinci Resolve Color Page, and Final Cut Pro.
        </div>
      </div>
    </div>
  );
}
