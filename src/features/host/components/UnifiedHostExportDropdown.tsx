import React, { useState, useEffect, useRef } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import { UxpBridge, UxpApplyResult } from '../../../adapters/uxp/UxpBridge';
import { AfterEffectsAdapter } from '../../../adapters/after-effects/AfterEffectsAdapter';
import { generateCssLinearEasing } from '../../../core/export/webExporters';

interface UnifiedHostExportDropdownProps {
  keyframes: KeyframePoint[];
  fps: number;
  activeProperty?: string;
  onExportToast: (result: { message: string; success: boolean }) => void;
  onOpenFullExportModal: () => void;
}

export function UnifiedHostExportDropdown({
  keyframes,
  fps,
  activeProperty = 'Scale',
  onExportToast,
  onOpenFullExportModal,
}: UnifiedHostExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApplyPremiere = async () => {
    setIsOpen(false);
    try {
      const propMap: Record<string, 'Position' | 'Scale' | 'Rotation' | 'Opacity'> = {
        'translate-x': 'Position',
        'translate-y': 'Position',
        'scale': 'Scale',
        'rotate': 'Rotation',
        'opacity': 'Opacity',
      };
      const targetProp = propMap[activeProperty] || 'Scale';

      const res: UxpApplyResult = await UxpBridge.applyToPremiereClip(keyframes, {
        property: targetProp,
        fps,
        durationFrames: 60,
      });

      onExportToast({
        message: res.message,
        success: res.success,
      });
    } catch (err: any) {
      onExportToast({
        message: `Premiere Export error: ${err.message || err}`,
        success: false,
      });
    }
  };

  const handleCopyAfterEffects = () => {
    setIsOpen(false);
    try {
      const aeCode = AfterEffectsAdapter.generateExtendScript(keyframes, {
        property: 'Scale',
        fps,
        durationFrames: 60,
      });
      navigator.clipboard.writeText(aeCode);
      onExportToast({
        message: '✓ After Effects JSX script copied to clipboard! Paste directly in AE ExtendScript / Script Editor.',
        success: true,
      });
    } catch (err: any) {
      onExportToast({ message: 'Failed to copy After Effects code.', success: false });
    }
  };

  const handleCopyResolve = () => {
    setIsOpen(false);
    try {
      const resolveTable = keyframes
        .map((k) => `[${k.time}] = { Value = ${k.value}, Flags = { Linear = false } }`)
        .join(',\n');
      navigator.clipboard.writeText(`{\n${resolveTable}\n}`);
      onExportToast({
        message: '✓ DaVinci Resolve Fusion Spline table copied to clipboard!',
        success: true,
      });
    } catch (err: any) {
      onExportToast({ message: 'Failed to copy Resolve Splines.', success: false });
    }
  };

  const handleCopyCss = () => {
    setIsOpen(false);
    try {
      const cssCode = generateCssLinearEasing(keyframes);
      navigator.clipboard.writeText(cssCode);
      onExportToast({
        message: '✓ CSS linear() easing function copied to clipboard!',
        success: true,
      });
    } catch (err: any) {
      onExportToast({ message: 'Failed to copy CSS code.', success: false });
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Main Single "Export" Button */}
      <button
        id="btn-main-export-dropdown"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
          color: '#080d1a',
          border: 'none',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(56, 189, 248, 0.35)',
          transition: 'all 0.15s ease',
        }}
        title="Export or Apply curve to Premiere, After Effects, Resolve, or Web"
      >
        <span>⚡ Export</span>
        <span style={{ fontSize: 9, opacity: 0.8 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Responsive Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 260,
            background: '#090e1a',
            border: '1px solid #1e293b',
            borderRadius: 10,
            boxShadow: '0 15px 40px rgba(0,0,0,0.85)',
            zIndex: 99999,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <div style={{ padding: '4px 8px', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Host Applications
          </div>

          {/* Premiere Pro UXP */}
          <button
            onClick={handleApplyPremiere}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#f8fafc',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#a855f7', fontWeight: 800 }}>Pr</span>
              <span>Apply to Premiere Pro</span>
            </div>
            <span style={{ fontSize: 9, color: '#38bdf8', background: '#11182c', padding: '1px 5px', borderRadius: 3 }}>
              Live UXP
            </span>
          </button>

          {/* After Effects */}
          <button
            onClick={handleCopyAfterEffects}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#f8fafc',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#818cf8', fontWeight: 800 }}>Ae</span>
              <span>Copy After Effects Script</span>
            </div>
            <span style={{ fontSize: 9, color: '#64748b', background: '#11182c', padding: '1px 5px', borderRadius: 3 }}>
              JSX / Clip
            </span>
          </button>

          {/* DaVinci Resolve */}
          <button
            onClick={handleCopyResolve}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#f8fafc',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f59e0b', fontWeight: 800 }}>Dv</span>
              <span>Copy DaVinci Resolve Splines</span>
            </div>
            <span style={{ fontSize: 9, color: '#64748b', background: '#11182c', padding: '1px 5px', borderRadius: 3 }}>
              Fusion
            </span>
          </button>

          <div style={{ height: 1, background: '#1e293b', margin: '3px 0' }} />

          <div style={{ padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Web & Formats
          </div>

          {/* CSS linear */}
          <button
            onClick={handleCopyCss}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#f8fafc',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#38bdf8', fontWeight: 800 }}>CSS</span>
              <span>Copy CSS linear() Easing</span>
            </div>
          </button>

          {/* Full Export Dialog Trigger */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenFullExportModal();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 6,
              color: '#38bdf8',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 4,
              justifyContent: 'center',
            }}
          >
            <span>📦 Full Export Menu (All Formats)</span>
          </button>
        </div>
      )}
    </div>
  );
}
