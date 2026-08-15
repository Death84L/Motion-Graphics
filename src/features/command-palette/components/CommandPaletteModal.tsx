import React, { useState, useEffect } from 'react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Host Interchange' | 'Diagnostics';
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function CommandPaletteModal({ isOpen, onClose, commands }: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#090e1a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e293b', gap: 10 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>⌘</span>
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search actions (e.g. 'spring', 'premiere', 'fix')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 13,
            }}
          />
          <span style={{ fontSize: 10, color: '#64748b', background: '#11182c', padding: '2px 6px', borderRadius: 4 }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: isSelected ? '#38bdf8' : '#f8fafc', fontWeight: 600 }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: 9, color: '#64748b', background: '#11182c', padding: '1px 5px', borderRadius: 3 }}>
                      {item.category}
                    </span>
                  </div>

                  {item.shortcut && (
                    <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: '#64748b' }}>
              No commands found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
