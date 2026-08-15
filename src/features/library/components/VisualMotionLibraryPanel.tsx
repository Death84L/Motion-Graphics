import React, { useState } from 'react';
import { SAMPLE_MOTION_RECIPES, MotionRecipe } from '../../../core/recipes/motionRecipeSchema';
import { KeyframePoint } from '../../graph-editor/types';
import { compileRecipeToKeyframes } from '../../../core/recipes/motionRecipeSchema';

interface VisualMotionLibraryPanelProps {
  onApplyRecipe: (keyframes: KeyframePoint[]) => void;
}

export function VisualMotionLibraryPanel({ onApplyRecipe }: VisualMotionLibraryPanelProps) {
  const [recipes] = useState<MotionRecipe[]>(SAMPLE_MOTION_RECIPES);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tactile-ui' | 'cinematic' | 'social-punch'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<MotionRecipe>(SAMPLE_MOTION_RECIPES[0]);

  const filtered = activeCategory === 'all' ? recipes : recipes.filter((r) => r.category === activeCategory);

  const handleApply = (recipe: MotionRecipe) => {
    setSelectedRecipe(recipe);
    const keyframes = compileRecipeToKeyframes(recipe);
    onApplyRecipe(keyframes);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>📚</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Visual Motion Library
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 4, background: '#11182c', padding: 2, borderRadius: 6 }}>
        {(['all', 'tactile-ui', 'cinematic', 'social-punch'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flex: 1,
              padding: '3px 6px',
              fontSize: 9,
              fontWeight: activeCategory === cat ? 800 : 500,
              background: activeCategory === cat ? '#38bdf8' : 'transparent',
              color: activeCategory === cat ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Motion Recipe Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((r) => {
          const isSelected = selectedRecipe.id === r.id;

          return (
            <div
              key={r.id}
              onClick={() => handleApply(r)}
              style={{
                background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#11182c',
                border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                borderRadius: 8,
                padding: 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                  {r.name}
                </span>
                <span style={{ fontSize: 8, color: '#64748b', background: '#040711', padding: '1px 5px', borderRadius: 3 }}>
                  {r.entrance.durationMs}ms
                </span>
              </div>

              <div style={{ fontSize: 9, color: '#94a3b8' }}>{r.description}</div>

              {/* Recipe Ingredients Pill Matrix */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 4px', borderRadius: 3 }}>
                  Entrance: {r.entrance.easeType} ({r.entrance.durationMs}ms)
                </span>
                {r.entrance.overshootPercent ? (
                  <span style={{ fontSize: 8, background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '1px 4px', borderRadius: 3 }}>
                    +{r.entrance.overshootPercent}% Overshoot
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
