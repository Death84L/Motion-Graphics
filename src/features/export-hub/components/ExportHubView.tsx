import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  generateCssKeyframes,
  generateCssLinearEasing,
  generateGsapSnippet,
  generateFramerMotionSnippet,
  generateWaapiSnippet,
  generateLottieJson,
  generateUnityCurveCode,
  generateUnrealRichCurve,
} from '../../../core/export/webExporters';
import { UxpBridge } from '../../../adapters/uxp/UxpBridge';

export type ExportTargetId =
  | 'premiere'
  | 'aftereffects'
  | 'resolve'
  | 'lottie'
  | 'css-keyframes'
  | 'css-linear'
  | 'gsap'
  | 'framer-motion'
  | 'waapi'
  | 'unity'
  | 'unreal'
  | 'json';

interface ExportHubViewProps {
  keyframes: KeyframePoint[];
}

export function ExportHubView({ keyframes }: ExportHubViewProps) {
  const [selectedTarget, setSelectedTarget] = useState<ExportTargetId>('premiere');
  const [copied, setCopied] = useState<boolean>(false);

  const getExportCode = (): string => {
    switch (selectedTarget) {
      case 'premiere':
        return JSON.stringify(
          {
            format: 'MotionStudio_PremierePro_v2',
            version: '2.0.0',
            interpolator: 'Bézier Cubic Tangents',
            keyframes: keyframes.map((k) => ({
              timeSeconds: k.time / 30,
              value: k.value,
              inHandle: k.handleIn || { x: -15, y: 0 },
              outHandle: k.handleOut || { x: 15, y: 0 },
            })),
          },
          null,
          2
        );

      case 'aftereffects':
        return `// Adobe After Effects Keyframe Data
// Units: Percent / Normalized Time
{
  "MotionStudio_AE": {
    "fps": 30,
    "duration": ${(keyframes[keyframes.length - 1]?.time || 100) / 30},
    "keys": ${JSON.stringify(keyframes, null, 2)}
  }
}`;

      case 'resolve':
        return `-- DaVinci Resolve Fusion Spline Data
EyeonFusion {
  Tools = ordered() {
    MotionCurve1 = BezierSpline {
      SplineColor = { Red = 56, Green = 189, Blue = 248 },
      KeyFrames = {
${keyframes.map((k) => `        [${k.time}] = { ${k.value}, RH = { ${k.time + 5}, ${k.value} }, Flags = { Linear = false } },`).join('\n')}
      }
    }
  }
}`;

      case 'lottie':
        return generateLottieJson(keyframes);

      case 'css-keyframes':
        return generateCssKeyframes(keyframes);

      case 'css-linear':
        return generateCssLinearEasing(keyframes);

      case 'gsap':
        return generateGsapSnippet(keyframes);

      case 'framer-motion':
        return generateFramerMotionSnippet(keyframes);

      case 'waapi':
        return generateWaapiSnippet(keyframes);

      case 'unity':
        return generateUnityCurveCode(keyframes);

      case 'unreal':
        return generateUnrealRichCurve(keyframes);

      case 'json':
      default:
        return JSON.stringify(keyframes, null, 2);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToUxp = async () => {
    const result = await UxpBridge.applyToPremiereClip(keyframes, {
      property: 'Position',
      fps: 30,
      durationFrames: 100,
    });
    alert(result.message);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        height: '100%',
        background: '#060913',
        overflow: 'hidden',
      }}
    >
      {/* Target Selector Column */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>📦</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
            Export Ecosystem Hub
          </span>
        </div>

        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Motion interchange station for NLEs, Web animations, and Game Engines.
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            NLE & Motion Graphics
          </span>
          {[
            { id: 'premiere', label: 'Adobe Premiere Pro (UXP)' },
            { id: 'aftereffects', label: 'Adobe After Effects' },
            { id: 'resolve', label: 'DaVinci Resolve (Fusion)' },
            { id: 'lottie', label: 'Lottie JSON' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTarget(t.id as any)}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: selectedTarget === t.id ? 700 : 500,
                background: selectedTarget === t.id ? '#1e3a8a' : 'transparent',
                color: selectedTarget === t.id ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Web & UI Frameworks
          </span>
          {[
            { id: 'css-linear', label: 'CSS linear() Easing' },
            { id: 'css-keyframes', label: 'CSS @keyframes' },
            { id: 'gsap', label: 'GSAP CustomEase' },
            { id: 'framer-motion', label: 'Framer Motion (React)' },
            { id: 'waapi', label: 'Web Animations API' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTarget(t.id as any)}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: selectedTarget === t.id ? 700 : 500,
                background: selectedTarget === t.id ? '#1e3a8a' : 'transparent',
                color: selectedTarget === t.id ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Game Engines & Raw
          </span>
          {[
            { id: 'unity', label: 'Unity C# AnimationCurve' },
            { id: 'unreal', label: 'Unreal Engine 5 FRichCurve' },
            { id: 'json', label: 'Raw JSON Stream' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTarget(t.id as any)}
              style={{
                padding: '6px 8px',
                textAlign: 'left',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: selectedTarget === t.id ? 700 : 500,
                background: selectedTarget === t.id ? '#1e3a8a' : 'transparent',
                color: selectedTarget === t.id ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Snippet & Actions Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          background: '#040711',
          overflow: 'hidden',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Target: {selectedTarget.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              {keyframes.length} keyframes ready for export
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleApplyToUxp}
              style={{
                background: '#10b981',
                color: '#080d1a',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🚀 Send to Active Timeline
            </button>

            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#10b981' : '#38bdf8',
                color: '#080d1a',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Snippet'}
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <pre
          style={{
            flex: 1,
            background: '#0c1222',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: 14,
            fontSize: 11,
            color: '#38bdf8',
            fontFamily: 'monospace',
            overflow: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {getExportCode()}
        </pre>
      </div>
    </div>
  );
}
