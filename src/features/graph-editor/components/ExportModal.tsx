import React, { useState } from 'react';
import type { KeyframePoint } from '../types';
import { PremiereAdapter, PremiereProperty } from '../../../adapters/premiere/PremiereAdapter';
import { AfterEffectsAdapter, AfterEffectsProperty } from '../../../adapters/after-effects/AfterEffectsAdapter';
import { UxpBridge, UxpApplyResult } from '../../../adapters/uxp/UxpBridge';
import {
  generateCssKeyframes,
  generateCssLinearEasing,
  generateGsapSnippet,
  generateFramerMotionSnippet,
  generateLottieJson,
  generateWaapiSnippet,
  generateUnityCurveCode,
  generateUnrealRichCurve,
} from '../../../core/export/webExporters';

export type HostCategory = 'premiere' | 'after-effects' | 'web' | 'games';

type WebFormat = 'css-keyframes' | 'css-linear' | 'gsap' | 'framer-motion' | 'lottie' | 'waapi';
type GameFormat = 'unity' | 'unreal';

type ExportModalProps = {
  isOpen: boolean;
  keyframes: KeyframePoint[];
  fps: number;
  initialHost?: HostCategory;
  onClose: () => void;
};

export function ExportModal({
  isOpen,
  keyframes,
  fps: defaultFps,
  initialHost = 'web',
  onClose,
}: ExportModalProps) {
  const [hostApp, setHostApp] = useState<HostCategory>(initialHost);
  const [property, setProperty] = useState<string>('Scale');
  const [fps, setFps] = useState<number>(defaultFps);
  const [durationFrames, setDurationFrames] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);
  const [uxpStatus, setUxpStatus] = useState<UxpApplyResult | null>(null);

  // Active sub-tabs for different categories
  const [aeTab, setAeTab] = useState<'clipboard' | 'expression' | 'extendscript'>('clipboard');
  const [prTab, setPrTab] = useState<'uxp' | 'clipboard' | 'extendscript'>('uxp');
  const [webFormat, setWebFormat] = useState<WebFormat>('css-keyframes');
  const [gameFormat, setGameFormat] = useState<GameFormat>('unity');

  if (!isOpen) return null;

  const isUxp = UxpBridge.isRunningInUxp();
  const durationSeconds = durationFrames / (fps || 30);

  // Generate content text based on selected category and format
  let contentText = '';
  let filename = 'motion-export.txt';
  let language = 'javascript';

  if (hostApp === 'premiere') {
    if (prTab === 'extendscript') {
      contentText = PremiereAdapter.generateExtendScript(keyframes, {
        fps,
        durationFrames,
        property: property as PremiereProperty,
      });
      filename = `motion-premiere-${property.toLowerCase()}.jsx`;
    } else {
      contentText = PremiereAdapter.generateAdobeClipboard(keyframes, {
        fps,
        durationFrames,
        property: property as PremiereProperty,
      });
      filename = `motion-premiere-${property.toLowerCase()}.txt`;
    }
  } else if (hostApp === 'after-effects') {
    if (aeTab === 'expression') {
      contentText = AfterEffectsAdapter.generateExpression(keyframes, {
        fps,
        durationFrames,
        property: property as AfterEffectsProperty,
      });
      filename = `motion-ae-expression.txt`;
    } else if (aeTab === 'extendscript') {
      contentText = AfterEffectsAdapter.generateExtendScript(keyframes, {
        fps,
        durationFrames,
        property: property as AfterEffectsProperty,
      });
      filename = `motion-ae-script.jsx`;
    } else {
      contentText = AfterEffectsAdapter.generateClipboardData(keyframes, {
        fps,
        durationFrames,
        property: property as AfterEffectsProperty,
      });
      filename = `motion-ae-keyframes.txt`;
    }
  } else if (hostApp === 'web') {
    language = 'css';
    if (webFormat === 'css-keyframes') {
      contentText = generateCssKeyframes(keyframes, { durationSeconds });
      filename = 'motion-curve.css';
    } else if (webFormat === 'css-linear') {
      contentText = generateCssLinearEasing(keyframes);
      filename = 'motion-linear-ease.css';
    } else if (webFormat === 'gsap') {
      language = 'javascript';
      contentText = generateGsapSnippet(keyframes, { durationSeconds });
      filename = 'motion-gsap.js';
    } else if (webFormat === 'framer-motion') {
      language = 'typescript';
      contentText = generateFramerMotionSnippet(keyframes);
      filename = 'motion-framer.ts';
    } else if (webFormat === 'lottie') {
      language = 'json';
      contentText = generateLottieJson(keyframes, { fps, durationSeconds });
      filename = 'motion-curve.json';
    } else if (webFormat === 'waapi') {
      language = 'javascript';
      contentText = generateWaapiSnippet(keyframes, { durationSeconds });
      filename = 'motion-waapi.js';
    }
  } else if (hostApp === 'games') {
    if (gameFormat === 'unity') {
      language = 'csharp';
      contentText = generateUnityCurveCode(keyframes);
      filename = 'MotionStudioCurve.cs';
    } else {
      language = 'json';
      contentText = generateUnrealRichCurve(keyframes);
      filename = 'UnrealCurveFloat.json';
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([contentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyUxp = async () => {
    const res = await UxpBridge.applyToPremiereClip(keyframes, {
      property: property as PremiereProperty,
      fps,
      durationFrames,
    });
    setUxpStatus(res);
    setTimeout(() => setUxpStatus(null), 4000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 18, 0.82)',
        backdropFilter: 'blur(14px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0c1222',
          border: '1px solid #1e293b',
          borderRadius: 20,
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category Selector Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderBottom: '1px solid #1e293b',
            background: '#11182c',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', background: '#080d1a', padding: 3, borderRadius: 10, border: '1px solid #1e293b' }}>
            <button
              onClick={() => setHostApp('web')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: hostApp === 'web' ? '#38bdf8' : 'transparent',
                color: hostApp === 'web' ? '#080d1a' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🌐 Web & UI
            </button>
            <button
              onClick={() => setHostApp('after-effects')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: hostApp === 'after-effects' ? '#6366f1' : 'transparent',
                color: hostApp === 'after-effects' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Ae After Effects
            </button>
            <button
              onClick={() => setHostApp('premiere')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: hostApp === 'premiere' ? '#a855f7' : 'transparent',
                color: hostApp === 'premiere' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Pr Premiere Pro
            </button>
            <button
              onClick={() => setHostApp('games')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: hostApp === 'games' ? '#10b981' : 'transparent',
                color: hostApp === 'games' ? '#080d1a' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🎮 Game Engines
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 18,
              padding: '4px 8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Sub-Format Selector Bar */}
        <div style={{ padding: '10px 18px', background: '#0a0f1d', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {hostApp === 'web' && (
            <>
              {[
                { id: 'css-keyframes', label: 'CSS @keyframes' },
                { id: 'css-linear', label: 'CSS linear() Easing' },
                { id: 'gsap', label: 'GSAP CustomEase' },
                { id: 'framer-motion', label: 'Framer Motion' },
                { id: 'lottie', label: 'Lottie JSON' },
                { id: 'waapi', label: 'Web Animations API' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setWebFormat(fmt.id as WebFormat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: webFormat === fmt.id ? '#1e293b' : 'transparent',
                    color: webFormat === fmt.id ? '#38bdf8' : '#94a3b8',
                    border: `1px solid ${webFormat === fmt.id ? '#38bdf8' : 'transparent'}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </>
          )}

          {hostApp === 'after-effects' && (
            <>
              {[
                { id: 'clipboard', label: 'AE Keyframe Clipboard' },
                { id: 'expression', label: 'Expression Function' },
                { id: 'extendscript', label: 'ExtendScript JSX' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAeTab(tab.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: aeTab === tab.id ? '#1e293b' : 'transparent',
                    color: aeTab === tab.id ? '#6366f1' : '#94a3b8',
                    border: `1px solid ${aeTab === tab.id ? '#6366f1' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {hostApp === 'premiere' && (
            <>
              {[
                { id: 'uxp', label: 'UXP Direct Apply' },
                { id: 'clipboard', label: 'Adobe Keyframe Data' },
                { id: 'extendscript', label: 'ExtendScript JSX' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPrTab(tab.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: prTab === tab.id ? '#1e293b' : 'transparent',
                    color: prTab === tab.id ? '#a855f7' : '#94a3b8',
                    border: `1px solid ${prTab === tab.id ? '#a855f7' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}

          {hostApp === 'games' && (
            <>
              {[
                { id: 'unity', label: 'Unity AnimationCurve (C#)' },
                { id: 'unreal', label: 'Unreal Engine 5 FRichCurve' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setGameFormat(fmt.id as GameFormat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: gameFormat === fmt.id ? '#1e293b' : 'transparent',
                    color: gameFormat === fmt.id ? '#10b981' : '#94a3b8',
                    border: `1px solid ${gameFormat === fmt.id ? '#10b981' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  {fmt.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Configuration Row */}
        <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, borderBottom: '1px solid #1e293b' }}>
          <div>
            <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              TARGET PROPERTY
            </label>
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 11,
                color: '#38bdf8',
              }}
            >
              <option value="Position">Position (X, Y)</option>
              <option value="Scale">Scale (Uniform)</option>
              <option value="Rotation">Rotation (Degrees)</option>
              <option value="Opacity">Opacity (%)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              TIMELINE FPS
            </label>
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value) || 30)}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 11,
                color: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              SPAN (FRAMES / SEC)
            </label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="number"
                value={durationFrames}
                onChange={(e) => setDurationFrames(parseInt(e.target.value) || 60)}
                style={{
                  width: '60%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: 11,
                  color: '#f8fafc',
                }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                {(durationFrames / fps).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>

        {/* Code Preview Area */}
        <div style={{ flex: 1, padding: 18, overflowY: 'auto', background: '#080d1a', display: 'flex', flexDirection: 'column' }}>
          <pre
            style={{
              margin: 0,
              flex: 1,
              fontFamily: 'monospace',
              fontSize: 11,
              lineHeight: 1.5,
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              userSelect: 'all',
              padding: 12,
              background: '#040711',
              borderRadius: 8,
              border: '1px solid #1e293b',
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {contentText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #1e293b',
            background: '#11182c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Exporting {keyframes.length} keyframes as <strong>{filename}</strong>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {hostApp === 'premiere' && prTab === 'uxp' && isUxp && (
              <button
                onClick={handleApplyUxp}
                style={{
                  background: '#a855f7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ Apply Directly to Clip
              </button>
            )}

            <button
              onClick={handleDownload}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📥 Download File
            </button>

            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#10b981' : '#38bdf8',
                color: '#080d1a',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
