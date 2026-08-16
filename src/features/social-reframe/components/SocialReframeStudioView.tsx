import React, { useState, useMemo } from 'react';
import {
  ExtendedSocialReframeEngine,
  SocialTargetFormat,
  ReframeLayoutMode,
  SafeZonePlatform,
  SpeakerProfile,
  RetentionHookCard,
  MultiSpeakerReframeResult,
} from '../../../core/social/extendedSocialReframeEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface SocialReframeStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function SocialReframeStudioView({ onBakeKeyframesToEditor }: SocialReframeStudioViewProps) {
  // Target Aspect Ratio & Layout
  const [format, setFormat] = useState<SocialTargetFormat>('9:16-reels');
  const [layoutMode, setLayoutMode] = useState<ReframeLayoutMode>('full-bleed-pan');
  const [platformOverlay, setPlatformOverlay] = useState<SafeZonePlatform>('tiktok');

  // Multi-Speaker Profiles (Host & Guest)
  const [speakerA_X, setSpeakerA_X] = useState<number>(140);
  const [speakerB_X, setSpeakerB_X] = useState<number>(340);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('speaker-a');
  const [deadbandRadius, setDeadbandRadius] = useState<number>(45);

  // Retention Hook & Pacing Enhancers
  const [hookCard, setHookCard] = useState<RetentionHookCard>({
    text: 'How I scaled from $0 to $50K in 30 Days 🚀',
    style: 'viral-yellow',
    durationSec: 3.0,
    showProgressBar: true,
    progressBarColor: '#38bdf8',
    zoomPunchIn: true,
  });

  const [isBaked, setIsBaked] = useState<boolean>(false);

  // Compute Speakers State
  const speakers: SpeakerProfile[] = useMemo(() => [
    { id: 'speaker-a', name: 'Host (Speaker A)', x: speakerA_X, y: 135, isActive: activeSpeakerId === 'speaker-a' },
    { id: 'speaker-b', name: 'Guest (Speaker B)', x: speakerB_X, y: 135, isActive: activeSpeakerId === 'speaker-b' },
  ], [speakerA_X, speakerB_X, activeSpeakerId]);

  // Compute Layout Solver Result
  const reframeResult: MultiSpeakerReframeResult = useMemo(() => {
    return ExtendedSocialReframeEngine.computeMultiSpeakerLayout(
      480,
      270,
      speakers,
      activeSpeakerId,
      layoutMode,
      format
    );
  }, [speakers, activeSpeakerId, layoutMode, format]);

  // Compute Safe-Zone Inset Margins
  const safeZone = useMemo(() => {
    return ExtendedSocialReframeEngine.getSafeZoneBounds(platformOverlay);
  }, [platformOverlay]);

  // Compute Caption Collision Placement
  const safeCaption = useMemo(() => {
    return ExtendedSocialReframeEngine.solveSafeCaptionPlacement(360, 150, 40, {
      topMarginPx: Math.round((safeZone.topMarginPx / 1920) * 360),
      bottomMarginPx: Math.round((safeZone.bottomMarginPx / 1920) * 360),
      rightMarginPx: Math.round((safeZone.rightMarginPx / 1080) * 200),
      leftMarginPx: 10,
    });
  }, [safeZone]);

  const handleBake = () => {
    const trajectory = [
      { time: 0.0, panX: reframeResult.primaryCrop.x, scale: 1.0 },
      { time: 1.5, panX: reframeResult.primaryCrop.x + 10, scale: hookCard.zoomPunchIn ? 1.08 : 1.0 },
      { time: 3.0, panX: reframeResult.secondaryCrop?.x || reframeResult.primaryCrop.x, scale: 1.0 },
    ];

    const baked = ExtendedSocialReframeEngine.bakeReframeTrajectoryToKeyframes(trajectory);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Auto-Reframe • ${layoutMode.toUpperCase()}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 310px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: LAYOUT PRESETS, RATIOS & MULTI-SPEAKER */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>📱</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Instant Social Reframe Studio
          </span>
        </div>

        {/* 1-Click Layout Modes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
            VERTICAL COMPOSITION LAYOUT:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[
              { id: 'full-bleed-pan', label: '🎬 Full-Bleed Pan' },
              { id: 'split-duplex', label: '👥 Split Duplex' },
              { id: 'tri-stack', label: '🎮 Tri-Stack' },
              { id: 'blurred-mirror', label: '🌫️ Blurred Mirror' },
              { id: 'pip-bubble', label: '💬 PiP Bubble' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLayoutMode(m.id as ReframeLayoutMode)}
                style={{
                  background: layoutMode === m.id ? '#38bdf8' : '#11182c',
                  color: layoutMode === m.id ? '#040711' : '#f8fafc',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Aspect Ratios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
            TARGET ASPECT RATIO:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[
              { id: '9:16-reels', label: '9:16 Reels' },
              { id: '1:1-square', label: '1:1 Square' },
              { id: '4:5-portrait', label: '4:5 Feed' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id as SocialTargetFormat)}
                style={{
                  background: format === fmt.id ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                  border: `1px solid ${format === fmt.id ? '#38bdf8' : '#1e293b'}`,
                  color: format === fmt.id ? '#38bdf8' : '#94a3b8',
                  borderRadius: 4,
                  padding: '5px',
                  fontSize: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Speaker Angle Switching */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
            MULTI-SPEAKER CENTROIDS:
          </span>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveSpeakerId('speaker-a')}
              style={{
                flex: 1,
                background: activeSpeakerId === 'speaker-a' ? '#38bdf8' : '#1e293b',
                color: activeSpeakerId === 'speaker-a' ? '#040711' : '#94a3b8',
                border: 'none',
                padding: '4px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🎤 Host (A)
            </button>
            <button
              onClick={() => setActiveSpeakerId('speaker-b')}
              style={{
                flex: 1,
                background: activeSpeakerId === 'speaker-b' ? '#ec4899' : '#1e293b',
                color: activeSpeakerId === 'speaker-b' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🎤 Guest (B)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
              <span style={{ color: '#38bdf8' }}>Host Pan X:</span>
              <span style={{ fontWeight: 800 }}>{speakerA_X}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="240"
              value={speakerA_X}
              onChange={(e) => setSpeakerA_X(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
              <span style={{ color: '#ec4899' }}>Guest Pan X:</span>
              <span style={{ fontWeight: 800 }}>{speakerB_X}px</span>
            </div>
            <input
              type="range"
              min="240"
              max="440"
              value={speakerB_X}
              onChange={(e) => setSpeakerB_X(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#ec4899' }}
            />
          </div>
        </div>

        {/* Deadband Pan Smoothing */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Deadband Tolerance:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>±{deadbandRadius}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={deadbandRadius}
            onChange={(e) => setDeadbandRadius(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      </div>

      {/* 2. CENTER COLUMN: 60FPS VIEWPORT & SAFE-ZONE OVERLAY */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>SAFE-ZONE OVERLAY:</span>
            {(['tiktok', 'instagram-reels', 'youtube-shorts', 'none'] as SafeZonePlatform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatformOverlay(p)}
                style={{
                  background: platformOverlay === p ? '#38bdf8' : '#11182c',
                  color: platformOverlay === p ? '#040711' : '#94a3b8',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: 4,
                  fontSize: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleBake}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Viewport Canvas Area */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '380px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* 9:16 Vertical Phone Mockup Container */}
          <div
            style={{
              width: 202,
              height: 360,
              background: '#090e1a',
              border: '2px solid #334155',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 32px rgba(0,0,0,0.8)',
            }}
          >
            {/* Top Neon Progress Bar */}
            {hookCard.showProgressBar && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '65%',
                  height: 3,
                  background: hookCard.progressBarColor,
                  zIndex: 40,
                  boxShadow: `0 0 8px ${hookCard.progressBarColor}`,
                }}
              />
            )}

            {/* Top 3-Second Retention Hook Banner */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 10,
                right: 10,
                background: hookCard.style === 'viral-yellow' ? '#fde047' : '#1e293b',
                color: hookCard.style === 'viral-yellow' ? '#040711' : '#38bdf8',
                padding: '4px 6px',
                borderRadius: 4,
                fontSize: 8,
                fontWeight: 900,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 30,
              }}
            >
              {hookCard.text}
            </div>

            {/* Layout Rendering (Full Bleed vs Split Duplex vs Blurred Mirror) */}
            {layoutMode === 'split-duplex' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Top Half: Speaker A */}
                <div style={{ flex: 1, background: '#1e293b', position: 'relative', overflow: 'hidden', borderBottom: '2px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 24 }}>👤</span>
                  <span style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 8, color: '#38bdf8', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: 2 }}>Host (A)</span>
                </div>
                {/* Bottom Half: Speaker B */}
                <div style={{ flex: 1, background: '#0f172a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 24 }}>👤</span>
                  <span style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 8, color: '#ec4899', fontWeight: 800, background: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: 2 }}>Guest (B)</span>
                </div>
              </div>
            ) : layoutMode === 'blurred-mirror' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle, #334155, #0f172a)' }}>
                <div style={{ width: '100%', height: 114, background: '#1e293b', borderTop: '1px solid #475569', borderBottom: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28 }}>👤</span>
                </div>
              </div>
            ) : (
              /* Default Full-Bleed Pan */
              <div style={{ width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: 42 }}>👤</span>
                <span style={{ position: 'absolute', bottom: 12, left: 10, fontSize: 8, color: '#38bdf8', fontWeight: 800, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4 }}>
                  {activeSpeakerId === 'speaker-a' ? 'Host (Tracked)' : 'Guest (Tracked)'}
                </span>
              </div>
            )}

            {/* Smart Safe-Zone Floating Caption */}
            <div
              style={{
                position: 'absolute',
                top: safeCaption.y,
                left: 14,
                right: 36,
                background: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid #fde047',
                borderRadius: 4,
                padding: '3px 6px',
                fontSize: 8,
                fontWeight: 800,
                color: '#fde047',
                textAlign: 'center',
                zIndex: 25,
              }}
            >
              🔥 "And that's how we grew 10X!"
            </div>

            {/* Platform Safe-Zone UI Mockup Overlay */}
            {platformOverlay === 'tiktok' && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 35, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', fontSize: 8, color: '#ffffff', opacity: 0.6 }}>Following | For You</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 7, color: '#ffffff', opacity: 0.7, maxWidth: 110 }}>@creator • Original Sound 🎵</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', fontSize: 10 }}>
                    <span>❤️</span>
                    <span>💬</span>
                    <span>🔖</span>
                    <span>↪️</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: RETENTION & SAFE-ZONE INSPECTOR */}
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
          Retention & Safe-Zone Guard
        </div>

        {/* Top 3-Second Hook Text */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
            TOP 3-SEC RETENTION HOOK:
          </span>
          <input
            type="text"
            value={hookCard.text}
            onChange={(e) => setHookCard((h) => ({ ...h, text: e.target.value }))}
            style={{
              background: '#090e1a',
              border: '1px solid #1e293b',
              borderRadius: 4,
              color: '#f8fafc',
              padding: '6px',
              fontSize: 10,
            }}
          />
        </div>

        {/* Progress Bar & Dynamic Zoom */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hookCard.showProgressBar}
              onChange={(e) => setHookCard((h) => ({ ...h, showProgressBar: e.target.checked }))}
              style={{ accentColor: '#38bdf8' }}
            />
            <span style={{ color: '#f8fafc' }}>Top Neon Progress Line</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hookCard.zoomPunchIn}
              onChange={(e) => setHookCard((h) => ({ ...h, zoomPunchIn: e.target.checked }))}
              style={{ accentColor: '#38bdf8' }}
            />
            <span style={{ color: '#f8fafc' }}>Dynamic Zoom Punch (+8%)</span>
          </label>
        </div>

        {/* Safe-Zone Status */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Safe Bottom Margin:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{safeZone.bottomMarginPx}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Safe Right Margin:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{safeZone.rightMarginPx}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Collision Status:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>✓ Auto-Avoided</span>
          </div>
        </div>
      </div>
    </div>
  );
}
