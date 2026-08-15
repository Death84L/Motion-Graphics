import React from 'react';
import { RecoveryJournalEntry } from '../../../core/project/crashRecoveryEngine';

interface CrashRecoveryModalProps {
  isOpen: boolean;
  recoveryEntry: RecoveryJournalEntry | null;
  onRestore: () => void;
  onDismiss: () => void;
}

export function CrashRecoveryModal({
  isOpen,
  recoveryEntry,
  onRestore,
  onDismiss,
}: CrashRecoveryModalProps) {
  if (!isOpen || !recoveryEntry) return null;

  const secondsAgo = Math.max(1, Math.round((Date.now() - recoveryEntry.timestamp) / 1000));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#090e1a',
          border: '1px solid #38bdf8',
          borderRadius: 14,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 0 40px rgba(56, 189, 248, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🛟</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#f8fafc' }}>
              Motion Studio Crash Recovery
            </h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Unsaved changes detected from previous session ({secondsAgo}s ago).
            </span>
          </div>
        </div>

        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 12, fontSize: 11, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: '#10b981', fontWeight: 700 }}>✓ Recoverable Items:</div>
          <div>• Project: <strong>{recoveryEntry.projectSnapshot.metadata.name}</strong></div>
          <div>• Curve Layers: <strong>{recoveryEntry.projectSnapshot.curveLayers?.length || 0} active curves</strong></div>
          <div>• Motion Recipes: <strong>{recoveryEntry.projectSnapshot.recipes?.length || 0} recipes</strong></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onDismiss}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Discard
          </button>
          <button
            onClick={onRestore}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
              color: '#080d1a',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✨ Restore Project
          </button>
        </div>
      </div>
    </div>
  );
}
