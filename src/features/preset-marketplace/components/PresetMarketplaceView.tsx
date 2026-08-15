import React, { useState } from 'react';
import { SAMPLE_PACKAGES, MotionPackage } from '../../../core/packages/motionPackageEngine';

export function PresetMarketplaceView() {
  const [packages, setPackages] = useState<MotionPackage[]>(SAMPLE_PACKAGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const toggleInstall = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isInstalled: !p.isInstalled } : p))
    );
  };

  const filteredPackages = packages.filter((p) => {
    return selectedCategory === 'All' || p.category === selectedCategory;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
        padding: 20,
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '12px 16px', borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#38bdf8', fontSize: 18 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>
            Preset Marketplace & Extension Vault (.motionpkg)
          </span>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'VFX', 'Typography', 'Physics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#38bdf8' : '#11182c',
                color: selectedCategory === cat ? '#040711' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, overflowY: 'auto' }}>
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            style={{
              background: '#090e1a',
              border: `1px solid ${pkg.isInstalled ? '#10b981' : '#1e293b'}`,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>{pkg.name}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>v{pkg.version} • by {pkg.author}</div>
              </div>
              <span style={{ fontSize: 9, background: '#11182c', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                {pkg.category}
              </span>
            </div>

            <div style={{ fontSize: 10, color: '#cbd5e1', lineHeight: 1.4 }}>{pkg.description}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 }}>
              <div style={{ fontSize: 9, color: '#f59e0b' }}>
                ★ {pkg.rating.toFixed(1)} • {(pkg.downloadCount / 1000).toFixed(1)}k installs
              </div>
              <button
                onClick={() => toggleInstall(pkg.id)}
                style={{
                  background: pkg.isInstalled ? '#065f46' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {pkg.isInstalled ? '✓ Installed' : 'Install Pack'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
