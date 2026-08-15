import React, { useState, useMemo } from 'react';
import {
  ObjectAnimationModel,
  ParametricBlockConfig,
  AnimationStageSequence,
} from '../../../core/engine/universalAnimationModel';
import {
  evaluateObjectPropertyAtFrame,
} from '../../../core/engine/parametricMotionSolver';
import {
  UniversalMotionControllerConfig,
  DEFAULT_MOTION_CONTROLLER,
  applyMotionControllerToValue,
} from '../../../core/controllers/motionControllerEngine';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { ParametricBlockInspector } from './ParametricBlockInspector';
import { VisualStageTimeline } from './VisualStageTimeline';
import { UniversalControllersPanel } from './UniversalControllersPanel';
import { TriggerEventsPanel } from './TriggerEventsPanel';
import { SmartTargetingPanel } from './SmartTargetingPanel';
import { SmartAnimationTemplate, SMART_ANIMATION_TEMPLATES } from '../../../core/engine/smartSuggestionsEngine';
import { KeyframePoint } from '../../graph-editor/types';

const INITIAL_BUILDER_MODEL: ObjectAnimationModel = {
  id: 'model-hero-card',
  objectId: 'comp-card-1',
  objectName: 'Hero Feature Card',
  enabled: true,
  totalDurationFrames: 100,
  stages: SMART_ANIMATION_TEMPLATES[0].stages,
};

interface AnimationBuilderViewProps {
  onApplyModelToGraph?: (keyframes: KeyframePoint[]) => void;
}

export function AnimationBuilderView({ onApplyModelToGraph }: AnimationBuilderViewProps) {
  const [model, setModel] = useState<ObjectAnimationModel>(INITIAL_BUILDER_MODEL);
  const [controller, setController] = useState<UniversalMotionControllerConfig>(DEFAULT_MOTION_CONTROLLER);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    INITIAL_BUILDER_MODEL.stages[0]?.blocks[0]?.id || null
  );
  const [currentTime, setCurrentTime] = useState<number>(18);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'templates' | 'targeting'>('templates');
  const [rightTab, setRightTab] = useState<'inspector' | 'controllers' | 'triggers'>('controllers');

  // Active selected block
  const selectedBlock = useMemo(() => {
    for (const stage of model.stages) {
      const found = stage.blocks.find((b) => b.id === selectedBlockId);
      if (found) return found;
    }
    return null;
  }, [model, selectedBlockId]);

  // Live evaluated animated transforms modulated by Universal Controller
  const livePosY = useMemo(() => {
    const raw = evaluateObjectPropertyAtFrame(model, 'position-y', currentTime, 0);
    return applyMotionControllerToValue(raw, 'position-y', controller);
  }, [model, currentTime, controller]);

  const liveScale = useMemo(() => {
    const raw = evaluateObjectPropertyAtFrame(model, 'scale-uniform', currentTime, 100);
    return applyMotionControllerToValue(raw, 'scale-uniform', controller);
  }, [model, currentTime, controller]);

  const liveOpacity = useMemo(() => {
    return evaluateObjectPropertyAtFrame(model, 'opacity', currentTime, 100);
  }, [model, currentTime]);

  const liveGlow = useMemo(() => {
    const raw = evaluateObjectPropertyAtFrame(model, 'glow-intensity', currentTime, 0);
    return applyMotionControllerToValue(raw, 'glow-intensity', controller);
  }, [model, currentTime, controller]);

  // Playback timer effect
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev >= 100 ? 0 : prev + 1 * controller.speed));
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [isPlaying, controller.speed]);

  const handleUpdateBlock = (updates: Partial<ParametricBlockConfig>) => {
    if (!selectedBlockId) return;
    const updatedStages = model.stages.map((stage) => ({
      ...stage,
      blocks: stage.blocks.map((b) => (b.id === selectedBlockId ? { ...b, ...updates } : b)),
    }));
    setModel({ ...model, stages: updatedStages });
  };

  const handleToggleStage = (stageId: string) => {
    const updatedStages = model.stages.map((st) => (st.id === stageId ? { ...st, enabled: !st.enabled } : st));
    setModel({ ...model, stages: updatedStages });
  };

  const handleToggleBlock = (stageId: string, blockId: string) => {
    const updatedStages = model.stages.map((st) => {
      if (st.id !== stageId) return st;
      return {
        ...st,
        blocks: st.blocks.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b)),
      };
    });
    setModel({ ...model, stages: updatedStages });
  };

  const handleAddBlockToStage = (stageId: string) => {
    const newBlock: ParametricBlockConfig = {
      id: `blk-${Date.now()}`,
      presetId: 'harmonic-spring',
      name: 'Harmonic Spring Overshoot',
      category: 'physics',
      stage: 'emphasis',
      targetProperties: ['scale-uniform'],
      enabled: true,
      startFrame: 20,
      durationFrames: 30,
      delayFrames: 0,
      loopCount: 1,
      pingPong: false,
      reverse: false,
      intensity: 1.0,
      startValue: 100,
      targetValue: 112,
      ease: 'spring',
      blendMode: 'additive',
      params: { stiffness: 160, damping: 14, mass: 1 },
    };

    const updatedStages = model.stages.map((st) => {
      if (st.id !== stageId) return st;
      return { ...st, blocks: [...st.blocks, newBlock] };
    });

    setModel({ ...model, stages: updatedStages });
    setSelectedBlockId(newBlock.id);
  };

  const handleApplyTemplate = (template: SmartAnimationTemplate) => {
    setModel({
      ...model,
      stages: template.stages,
    });
    if (template.stages[0]?.blocks[0]) {
      setSelectedBlockId(template.stages[0].blocks[0].id);
    }
  };

  const handleBakeToKeyframes = () => {
    const keys: KeyframePoint[] = [];
    for (let i = 0; i <= 25; i++) {
      const t = (i / 25) * 100;
      const raw = evaluateObjectPropertyAtFrame(model, 'position-y', t, 0);
      const modulated = applyMotionControllerToValue(raw, 'position-y', controller);
      keys.push({
        id: 9700 + i,
        time: t,
        value: modulated,
        type: 'bezier',
        ease: 'easeInOut',
      });
    }
    if (onApplyModelToGraph) {
      onApplyModelToGraph(keys);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '270px 1fr 340px',
        height: '100%',
        background: '#060913',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Smart Templates & Smart Targeting */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🧩</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
            Animation Builder
          </span>
        </div>

        {/* Tab Switcher Left */}
        <div style={{ display: 'flex', background: '#11182c', padding: 2, borderRadius: 6, gap: 2 }}>
          <button
            onClick={() => setLeftTab('templates')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 10,
              fontWeight: leftTab === 'templates' ? 700 : 500,
              background: leftTab === 'templates' ? '#38bdf8' : 'transparent',
              color: leftTab === 'templates' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Templates
          </button>
          <button
            onClick={() => setLeftTab('targeting')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 10,
              fontWeight: leftTab === 'targeting' ? 700 : 500,
              background: leftTab === 'targeting' ? '#38bdf8' : 'transparent',
              color: leftTab === 'targeting' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Targeting
          </button>
        </div>

        {leftTab === 'templates' && (
          <SmartSuggestionsPanel onApplyTemplate={handleApplyTemplate} />
        )}

        {leftTab === 'targeting' && (
          <SmartTargetingPanel onUpdateTargeting={() => {}} />
        )}
      </div>

      {/* Center Column: Visual Stage Sequencer & Live Stage Sandbox */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#040711',
          overflow: 'hidden',
          padding: 14,
          gap: 12,
        }}
      >
        {/* Live Stage Sandbox Viewport */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0e1526 0%, #03060f 100%)',
            borderRadius: 12,
            border: '1px solid #1e293b',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Target Object Element */}
          <div
            style={{
              width: 240,
              height: 130,
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              borderRadius: 16,
              border: '1px solid #38bdf888',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 ${liveGlow}px #38bdf8`,
              transform: `translateY(${livePosY}px) scale(${liveScale / 100})`,
              opacity: liveOpacity / 100,
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{model.objectName}</div>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              Speed: {controller.speed}x | Intensity: {controller.intensity}x
            </div>
          </div>

          {/* Transport Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 20,
              right: 20,
              background: '#090e1a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? '#ec4899' : '#38bdf8',
                color: '#080d1a',
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#38bdf8' }}
            />

            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
              {currentTime.toFixed(0)}f
            </span>
          </div>
        </div>

        {/* Visual Stage Sequencer Timeline */}
        <VisualStageTimeline
          stages={model.stages}
          selectedBlockId={selectedBlockId}
          currentTime={currentTime}
          totalDurationFrames={model.totalDurationFrames}
          onSelectBlock={(b) => {
            setSelectedBlockId(b.id);
            setRightTab('inspector');
          }}
          onToggleStage={handleToggleStage}
          onToggleBlock={handleToggleBlock}
          onAddBlockToStage={handleAddBlockToStage}
        />
      </div>

      {/* Right Column: Parametric Inspector, Universal Controllers, & Event Triggers */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        {/* Right Tab Switcher */}
        <div style={{ display: 'flex', background: '#11182c', padding: 2, borderRadius: 6, gap: 2 }}>
          <button
            onClick={() => setRightTab('controllers')}
            style={{
              flex: 1,
              padding: '4px 4px',
              fontSize: 10,
              fontWeight: rightTab === 'controllers' ? 700 : 500,
              background: rightTab === 'controllers' ? '#38bdf8' : 'transparent',
              color: rightTab === 'controllers' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            🎛️ Controllers
          </button>
          <button
            onClick={() => setRightTab('inspector')}
            style={{
              flex: 1,
              padding: '4px 4px',
              fontSize: 10,
              fontWeight: rightTab === 'inspector' ? 700 : 500,
              background: rightTab === 'inspector' ? '#38bdf8' : 'transparent',
              color: rightTab === 'inspector' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            🧱 Physics
          </button>
          <button
            onClick={() => setRightTab('triggers')}
            style={{
              flex: 1,
              padding: '4px 4px',
              fontSize: 10,
              fontWeight: rightTab === 'triggers' ? 700 : 500,
              background: rightTab === 'triggers' ? '#38bdf8' : 'transparent',
              color: rightTab === 'triggers' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            ⚡ Triggers
          </button>
        </div>

        {rightTab === 'controllers' && (
          <UniversalControllersPanel
            controller={controller}
            onUpdateController={(updates) => setController({ ...controller, ...updates })}
          />
        )}

        {rightTab === 'inspector' && (
          <ParametricBlockInspector
            block={selectedBlock}
            onUpdateBlock={handleUpdateBlock}
          />
        )}

        {rightTab === 'triggers' && (
          <TriggerEventsPanel
            onFireEvent={(evt) => {
              setCurrentTime(0);
              setIsPlaying(true);
            }}
          />
        )}

        <button
          onClick={handleBakeToKeyframes}
          style={{
            background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          ⚡ Bake Animation to Bézier Curve
        </button>
      </div>
    </div>
  );
}
