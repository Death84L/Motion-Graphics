import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraphCanvas,
  GraphToolbar,
  MotionPreview,
  KeyframeInspector,
  TangentControlsPanel,
  CurveOperationsMenu,
  TimeValueTransformPanel,
  SelectionToolsPanel,
  PhysicsParametersPanel,
  MultiCurveManager,
  SegmentEasingPanel,
  UserPresetsLibrary,
  CurveMorphingPanel,
  ReferenceMatchingPanel,
  TimeRemapPanel,
  MotionQualityPanel,
  ModifierStackPanel,
  CurveConstraintsPanel,
  CurveHierarchyPanel,
  LinkedCurvesPanel,
  ExpressionGeneratorPanel,
  AudioToCurvePanel,
  SnapshotGalleryPanel,
  CurveFitPanel,
  SemanticPresetsPanel,
  SpatialPathPanel,
  DynamicsPhysicsPanel,
  OperatorsMatrixPanel,
  AnimationStatePanel,
  RhythmQuantizePanel,
  MoCapRecorderPanel,
  GraphHealthOptimizerPanel,
  ExtrapolationPanel,
  KeyReducerPanel,
  KeyframeTransferPanel,
  RetimingEnginePanel,
  AlignmentDistributionPanel,
  AnimationComparisonPanel,
  OvershootGeneratorPanel,
  CurveDriversPanel,
  AudioAnalyzerPanel,
  SmartAssistantDiagnosticsPanel,
  MotionMarketplaceLibraryPanel,
  WorkspaceProfilesPanel,
  TimelineScrubber,
  ExportModal,
} from '../features/graph-editor/components';
import { LiveCanvas } from '../features/composition/components/LiveCanvas';
import { MultiTrackTimeline } from '../features/timeline/components/MultiTrackTimeline';
import { AnimationBuilderView } from '../features/animation-builder/components/AnimationBuilderView';
import { compileAnimationRecipe } from '../features/animation-builder/engine/animationBuilderEngine';
import { TextAnimatorView } from '../features/text-animator/components/TextAnimatorView';
import { ExportHubView } from '../features/export-hub/components/ExportHubView';
import { AnimationStackPanel } from '../features/stack/components/AnimationStackPanel';
import { PresetMorphPanel } from '../features/preset-studio/components/PresetMorphPanel';
import { MotionDnaStudioView } from '../features/dna-analyzer/components/MotionDnaStudioView';
import { ResponsiveMotionLabView } from '../features/responsive/components/ResponsiveMotionLabView';
import { InteractionStatePanel } from '../features/states/components/InteractionStatePanel';
import { CaptionStudioView } from '../features/caption-studio/components/CaptionStudioView';
import { DesignSystemStudioView } from '../features/design-system/components/DesignSystemStudioView';
import { MotionLogicGraphView } from '../features/logic-graph/components/MotionLogicGraphView';
import { Scene3DStudioView } from '../features/scene3d/components/Scene3DStudioView';
import { VersionReviewComparisonView } from '../features/review/components/VersionReviewComparisonView';
import { MotionReverseEngineeringView } from '../features/reverse-engineering/components/MotionReverseEngineeringView';
import { PhysicsSandboxView } from '../features/physics-sandbox/components/PhysicsSandboxView';
import { AnimationStateMachineView } from '../features/state-machine/components/AnimationStateMachineView';
import { AnimationGitView } from '../features/git/components/AnimationGitView';
import { DerivativesCurveViewer } from '../features/graph-editor/components/derivatives/DerivativesCurveViewer';
import { BlenderCurveToolbar } from '../features/graph-editor/components/toolbar/BlenderCurveToolbar';
import { ReferenceMotionModal } from '../features/graph-editor/components/reference/ReferenceMotionModal';
import { VisualMotionLibraryPanel } from '../features/library/components/VisualMotionLibraryPanel';
import { ActionableDiagnosticsPanel } from '../features/analysis/components/ActionableDiagnosticsPanel';
import { DerivativeGraphType } from '../core/math/derivativesGraphEngine';
import { UnifiedHostExportDropdown } from '../features/host/components/UnifiedHostExportDropdown';
import { CommandPaletteModal, CommandItem } from '../features/command-palette/components/CommandPaletteModal';
import { CrashRecoveryModal } from '../features/project/components/CrashRecoveryModal';
import { PerformanceMonitorOverlay } from '../features/performance/components/PerformanceMonitorOverlay';
import { CrashRecoveryEngine, RecoveryJournalEntry } from '../core/project/crashRecoveryEngine';
import { ProjectEngine } from '../core/project/projectEngine';
import { KeyboardShortcutManager } from '../core/shortcuts/keyboardShortcutManager';
import { MotionBatchProcessorView } from '../features/batch-processor/components/MotionBatchProcessorView';
import { VelocityLabView } from '../features/velocity-lab/components/VelocityLabView';
import { MotionMatchingStudioView } from '../features/motion-matching/components/MotionMatchingStudioView';
import { ParametricPresetStudioView } from '../features/parametric-presets/components/ParametricPresetStudioView';
import { MotionClipboardDrawer } from '../features/clipboard/components/MotionClipboardDrawer';
import { UniversalTimelineStudioView } from '../features/universal-timeline/components/UniversalTimelineStudioView';
import { ConstraintRiggingStudioView } from '../features/constraints-rigging/components/ConstraintRiggingStudioView';
import { AudioReactiveStudioView } from '../features/audio-reactive/components/AudioReactiveStudioView';
import { ShapeTypographyStudioView } from '../features/shapes-typography/components/ShapeTypographyStudioView';
import {
  CompositionLayer,
  DEFAULT_VFX_CONFIG,
} from '../features/composition/types/composition.types';
import { TimelineTrack } from '../features/timeline/types/timeline.types';
import { AudioWaveformConfig, DEFAULT_AUDIO_CONFIG } from '../core/audio/waveformGenerator';
import { autoSaveWorkspace } from '../core/storage/autoSaveRecovery';
import { WorkspaceProfile, WORKSPACE_PRESETS, WorkspaceConfig } from '../core/workspace/workspaceManager';
import type {
  KeyframePoint,
  GraphViewport,
  GraphTool,
  GraphMode,
  CurveLayer,
  GraphGridConfig,
  EasingType,
  WorkArea,
} from '../features/graph-editor/types';
import {
  INITIAL_CURVE_LAYERS,
  DEFAULT_GRID_CONFIG,
  DEFAULT_VIEWPORT,
} from '../features/graph-editor/state/graphStore';
import { HistoryManager } from '../features/graph-editor/state/historyManager';
import { evaluateGraphAtTime } from '../features/graph-editor/utils/curveEvaluation';
import { UxpBridge, UxpApplyResult } from '../adapters/uxp/UxpBridge';
import { PremiereProperty } from '../adapters/premiere/PremiereAdapter';
import { SnappingConfig, DEFAULT_SNAPPING_CONFIG } from '../core/math/smartSnapping';
import { TimeDisplayFormat, ValueUnitType } from '../core/timecode/timecodeFormatter';
import { deleteKeyframesPreservingShape } from '../core/math/velocityPreserving';
import { HeatmapMetric } from '../features/graph-editor/components/canvas/CanvasHeatmapCurve';
import { GraphBookmark, GraphRegion, DEFAULT_BOOKMARKS, DEFAULT_REGIONS } from '../core/bookmarks/bookmarkManager';
import { BeatMarker, generateBeatGrid } from '../core/bookmarks/beatDetector';

export type MotionStudioSuiteView =
  | 'editor'
  | 'universal-timeline'
  | 'constraints-rigging'
  | 'shapes-typography'
  | 'audio-reactive'
  | 'velocity-lab'
  | 'motion-matching'
  | 'batch-processor'
  | 'parametric-presets'
  | 'motion-clipboard'
  | 'canvas-timeline'
  | 'builder-stack'
  | 'text-ui'
  | 'captions'
  | 'reverse-engineering'
  | 'physics-sandbox'
  | 'state-machine'
  | 'git-diff'
  | 'design-system'
  | 'logic-graph'
  | 'scene-3d'
  | 'review-ab'
  | 'dna-analyzer'
  | 'responsive-lab'
  | 'presets-morph'
  | 'export-hub';

const INITIAL_COMPOSITION_LAYERS: CompositionLayer[] = [
  {
    id: 'comp-card-1',
    name: 'Hero Feature Card',
    type: 'ui-card',
    visible: true,
    locked: false,
    color: '#38bdf8',
    fillColor: 'linear-gradient(135deg, #1e293b, #0f172a)',
    strokeColor: '#38bdf888',
    width: 260,
    height: 150,
    borderRadius: 16,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5, opacity: 1 },
    vfx: { ...DEFAULT_VFX_CONFIG, glow: 12, shadow: 20 },
  },
  {
    id: 'comp-text-1',
    name: 'Title Typography',
    type: 'text',
    visible: true,
    locked: false,
    color: '#f8fafc',
    fillColor: 'transparent',
    text: 'MOTION STUDIO',
    fontSize: 28,
    fontWeight: 800,
    width: 340,
    height: 60,
    transform: { x: 0, y: -120, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5, opacity: 1 },
    vfx: { ...DEFAULT_VFX_CONFIG, glow: 15 },
  },
  {
    id: 'comp-badge-1',
    name: 'CTA Pill Badge',
    type: 'badge',
    visible: true,
    locked: false,
    color: '#080d1a',
    fillColor: '#38bdf8',
    text: 'STANDALONE STUDIO',
    width: 170,
    height: 34,
    borderRadius: 17,
    transform: { x: 0, y: 120, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5, opacity: 1 },
    vfx: { ...DEFAULT_VFX_CONFIG, shadow: 10 },
  },
];

const INITIAL_TIMELINE_TRACKS: TimelineTrack[] = [
  {
    id: 'trk-hero',
    name: 'Hero UI Card',
    type: 'shape',
    color: '#38bdf8',
    visible: true,
    locked: false,
    solo: false,
    muted: false,
    expanded: true,
    channels: [
      {
        id: 'ch-hero-pos-y',
        property: 'position-y',
        name: 'Position Y',
        color: '#38bdf8',
        visible: true,
        keyframes: [
          { id: 1, time: 0, value: 120, type: 'bezier' },
          { id: 2, time: 25, value: -12, type: 'bezier' },
          { id: 3, time: 45, value: 0, type: 'bezier' },
        ],
        currentValue: 0,
      },
      {
        id: 'ch-hero-scale',
        property: 'scale',
        name: 'Scale',
        color: '#10b981',
        visible: true,
        keyframes: [
          { id: 4, time: 0, value: 70, type: 'bezier' },
          { id: 5, time: 30, value: 105, type: 'bezier' },
          { id: 6, time: 45, value: 100, type: 'bezier' },
        ],
        currentValue: 100,
      },
    ],
  },
  {
    id: 'trk-title',
    name: 'Title Text Layer',
    type: 'text',
    color: '#ec4899',
    visible: true,
    locked: false,
    solo: false,
    muted: false,
    expanded: false,
    channels: [
      {
        id: 'ch-title-opac',
        property: 'opacity',
        name: 'Opacity',
        color: '#f59e0b',
        visible: true,
        keyframes: [
          { id: 7, time: 0, value: 0, type: 'bezier' },
          { id: 8, time: 20, value: 100, type: 'bezier' },
        ],
        currentValue: 100,
      },
    ],
  },
];

const history = new HistoryManager<CurveLayer[]>(INITIAL_CURVE_LAYERS);

export default function App() {
  const [suiteView, setSuiteView] = useState<MotionStudioSuiteView>('editor');
  const [compositionLayers, setCompositionLayers] = useState<CompositionLayer[]>(INITIAL_COMPOSITION_LAYERS);
  const [selectedCompLayerId, setSelectedCompLayerId] = useState<string | null>('comp-card-1');
  const [timelineTracks, setTimelineTracks] = useState<TimelineTrack[]>(INITIAL_TIMELINE_TRACKS);
  const [selectedTimelineKeyIds, setSelectedTimelineKeyIds] = useState<string[]>([]);
  const [curveLayers, setCurveLayers] = useState<CurveLayer[]>(INITIAL_CURVE_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-pos-x');
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<number[]>([2]);
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_VIEWPORT);
  const [activeTool, setActiveTool] = useState<GraphTool>('select');
  const [graphMode, setGraphMode] = useState<GraphMode>('value');
  const [gridConfig, setGridConfig] = useState<GraphGridConfig>(DEFAULT_GRID_CONFIG);
  const [snappingConfig, setSnappingConfig] = useState<SnappingConfig>(DEFAULT_SNAPPING_CONFIG);
  const [workArea, setWorkArea] = useState<WorkArea>({ inFrame: 0, outFrame: 100, enabled: true });
  const [timeFormat, setTimeFormat] = useState<TimeDisplayFormat>('frames');
  const [valueUnit, setValueUnit] = useState<ValueUnitType>('%');
  const [currentTime, setCurrentTime] = useState<number>(38);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(30);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [uxpToast, setUxpToast] = useState<UxpApplyResult | null>(null);

  // Advanced Analysis, Heatmap & History State (Features 18, 20, 32, 35, 40, 41)
  const [analysisEnabled, setAnalysisEnabled] = useState<boolean>(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(false);
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('speed');
  const [diffViewEnabled, setDiffViewEnabled] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<GraphBookmark[]>(DEFAULT_BOOKMARKS);
  const [regions, setRegions] = useState<GraphRegion[]>(DEFAULT_REGIONS);
  const [beats, setBeats] = useState<BeatMarker[]>(generateBeatGrid(120, 30));

  // Audio Waveform & Extrapolation State (Features 2, 3)
  const [showAudioWaveform, setShowAudioWaveform] = useState<boolean>(true);
  const [audioConfig, setAudioConfig] = useState<AudioWaveformConfig>(DEFAULT_AUDIO_CONFIG);
  const [workspaceProfile, setWorkspaceProfile] = useState<WorkspaceProfile>('motion-design');

  // Kinematic Derivatives & Reference Motion State
  const [derivativeMode, setDerivativeMode] = useState<DerivativeGraphType>('value');
  const [isRefMotionOpen, setIsRefMotionOpen] = useState<boolean>(false);

  // Sidebar Sub-Tabs (Left Suite: Production & Primitives)
  const [leftTab, setLeftTab] = useState<
    | 'actionable-health'
    | 'motion-library'
    | 'extrapolation'
    | 'reducer'
    | 'transfer'
    | 'retiming'
    | 'alignment'
    | 'comparison'
    | 'drivers'
    | 'diagnostics'
    | 'health'
    | 'spatial'
    | 'dynamics'
    | 'operators'
    | 'quality'
    | 'modifiers'
    | 'constraints'
    | 'fit'
    | 'hierarchy'
    | 'linked'
    | 'tangents'
    | 'layers'
    | 'ops'
    | 'transforms'
    | 'morph'
    | 'match'
  >('actionable-health');

  // Sidebar Sub-Tabs (Right Suite: Creative Generators & Presets)
  const [rightTab, setRightTab] = useState<
    | 'motion-library'
    | 'marketplace'
    | 'overshoot'
    | 'audioAnalyzer'
    | 'workspaces'
    | 'semantic'
    | 'states'
    | 'rhythm'
    | 'mocap'
    | 'expressions'
    | 'audio'
    | 'snapshots'
    | 'inspector'
    | 'presets'
    | 'physics'
    | 'segments'
    | 'remap'
    | 'selection'
  >('motion-library');

  // Command Palette & Crash Recovery State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [recoveryEntry, setRecoveryEntry] = useState<RecoveryJournalEntry | null>(null);

  // Watchdog & Crash Detection
  useEffect(() => {
    CrashRecoveryEngine.initWatchdog();
    if (CrashRecoveryEngine.hasRecoverableCrash()) {
      const snap = CrashRecoveryEngine.getLastRecoverySnapshot();
      if (snap) setRecoveryEntry(snap);
    }
  }, []);

  // Keyboard Shortcuts (⌘K, Space, G, V, H, K, etc.)
  useEffect(() => {
    KeyboardShortcutManager.unregisterAll();
    KeyboardShortcutManager.registerBinding({
      key: 'k',
      ctrlOrCmd: true,
      description: 'Open Command Palette',
      category: 'navigation',
      action: () => setIsCommandPaletteOpen((o) => !o),
    });
    KeyboardShortcutManager.registerBinding({
      key: ' ',
      description: 'Toggle Playback',
      category: 'playback',
      action: () => setIsPlaying((p) => !p),
    });
    KeyboardShortcutManager.registerBinding({
      key: 'g',
      description: 'Switch to Motion Graph',
      category: 'navigation',
      action: () => setSuiteView('editor'),
    });
    KeyboardShortcutManager.registerBinding({
      key: 'v',
      description: 'Select Tool',
      category: 'editing',
      action: () => setActiveTool('select'),
    });
    KeyboardShortcutManager.registerBinding({
      key: 'h',
      description: 'Pan Tool',
      category: 'editing',
      action: () => setActiveTool('pan'),
    });
  }, []);

  // Autosave periodically and record crash journal every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveWorkspace(curveLayers);
      const proj = ProjectEngine.createNewProject('Autosaved Project');
      proj.curveLayers = curveLayers;
      CrashRecoveryEngine.recordJournalSnapshot(proj);
    }, 5000);
    return () => clearInterval(interval);
  }, [curveLayers]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const isUxp = UxpBridge.isRunningInUxp();
  const activeLayer = curveLayers.find((l) => l.id === activeLayerId) || curveLayers[0];
  const keyframes = activeLayer?.keyframes || [];

  // Spatial X and Y curve layers
  const posXLayer = curveLayers.find((l) => l.property === 'translate-x') || curveLayers[0];
  const posYLayer = curveLayers.find((l) => l.property === 'translate-y') || curveLayers[1] || curveLayers[0];

  // Evaluate current output value from active curve
  const currentValue = evaluateGraphAtTime(keyframes, currentTime);

  // Sync state changes to History Manager for Undo/Redo
  const updateLayersWithHistory = useCallback((newLayers: CurveLayer[]) => {
    history.push(newLayers);
    setCurveLayers(newLayers);
  }, []);

  const handleUndo = useCallback(() => {
    const prevState = history.undo();
    if (prevState) {
      setCurveLayers(prevState);
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setCurveLayers(nextState);
    }
  }, []);

  // Update keyframes for active layer
  const handleKeyframesChange = (newKeyframes: KeyframePoint[]) => {
    const updatedLayers = curveLayers.map((layer) =>
      layer.id === activeLayerId ? { ...layer, keyframes: newKeyframes } : layer
    );
    updateLayersWithHistory(updatedLayers);
  };

  // Update spatial X/Y keyframes together
  const handleUpdateSpatialKeyframes = (newX: KeyframePoint[], newY: KeyframePoint[]) => {
    const updatedLayers = curveLayers.map((l) => {
      if (l.id === posXLayer.id) return { ...l, keyframes: newX };
      if (l.id === posYLayer.id) return { ...l, keyframes: newY };
      return l;
    });
    updateLayersWithHistory(updatedLayers);
  };

  // Fit Viewport to All Curve Keyframes
  const handleFitAll = () => {
    if (keyframes.length === 0) return;
    setViewport({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  };

  // Fit Viewport to Selected Keyframes
  const handleFitSelection = () => {
    const selected = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));
    if (selected.length === 0) return;

    const times = selected.map((k) => k.time);
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    const span = Math.max(maxT - minT, 10);

    const scaleX = Math.min(3.5, 90 / span);
    const offsetX = -(minT / 100) * 800 * scaleX + 50;

    setViewport((v) => ({ ...v, x: offsetX, scaleX }));
  };

  // Add Keyframe at Current Playhead Time
  const handleAddKeyframeAtCurrentTime = () => {
    const newId = Date.now();
    const newPoint: KeyframePoint = {
      id: newId,
      time: Math.round(currentTime * 10) / 10,
      value: Math.round(currentValue * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
      handleIn: { x: -12, y: 0, angle: 180, length: 12 },
      handleOut: { x: 12, y: 0, angle: 0, length: 12 },
    };
    const nextKeyframes = [...keyframes, newPoint].sort((a, b) => a.time - b.time);
    handleKeyframesChange(nextKeyframes);
    setSelectedKeyframeIds([newId]);
  };

  // Delete Selected Keyframes with Shape Preservation (Feature 11)
  const handleDeleteSelected = () => {
    if (selectedKeyframeIds.length === 0) return;
    const preserved = deleteKeyframesPreservingShape(keyframes, selectedKeyframeIds);
    handleKeyframesChange(preserved);
    setSelectedKeyframeIds([]);
  };

  // Duplicate Selected Keyframes (Feature 12)
  const handleDuplicateSelected = () => {
    if (selectedKeyframeIds.length === 0) return;
    const selected = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));
    const offsetTime = 10;
    const newIds: number[] = [];

    const duplicated: KeyframePoint[] = selected.map((k, idx) => {
      const id = Date.now() + idx;
      newIds.push(id);
      return {
        ...k,
        id,
        time: Math.min(100, k.time + offsetTime),
        handleIn: k.handleIn ? { ...k.handleIn } : undefined,
        handleOut: k.handleOut ? { ...k.handleOut } : undefined,
      };
    });

    const combined = [...keyframes, ...duplicated].sort((a, b) => a.time - b.time);
    handleKeyframesChange(combined);
    setSelectedKeyframeIds(newIds);
  };

  // Segment-Level Easing Application
  const handleApplySegmentEase = (segmentStartIndex: number, easeType: EasingType) => {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    if (segmentStartIndex >= 0 && segmentStartIndex < sorted.length - 1) {
      sorted[segmentStartIndex] = {
        ...sorted[segmentStartIndex],
        ease: easeType,
      };
      handleKeyframesChange(sorted);
    }
  };

  // Global Easing Application
  const handleApplyGlobalEase = (easeType: EasingType) => {
    const nextKeyframes = keyframes.map((k) => ({
      ...k,
      ease: easeType,
    }));
    handleKeyframesChange(nextKeyframes);
  };

  // Ghost Baseline Reference Toggle
  const handleToggleGhost = (layerId: string) => {
    const updated = curveLayers.map((l) => {
      if (l.id === layerId) {
        const isShowing = !l.showGhost;
        return {
          ...l,
          showGhost: isShowing,
          ghostKeyframes: isShowing ? JSON.parse(JSON.stringify(l.keyframes)) : l.ghostKeyframes,
        };
      }
      return l;
    });
    setCurveLayers(updated);
  };

  // Add New Curve Layer
  const handleAddCurveLayer = () => {
    const newId = `layer-${Date.now()}`;
    const colors = ['#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'];
    const newLayer: CurveLayer = {
      id: newId,
      name: `Curve Layer ${curveLayers.length + 1}`,
      property: 'custom',
      color: colors[curveLayers.length % colors.length],
      visible: true,
      locked: false,
      solo: false,
      keyframes: [
        { id: Date.now(), time: 0, value: 0, type: 'bezier', ease: 'easeInOut' },
        { id: Date.now() + 1, time: 100, value: 100, type: 'bezier', ease: 'easeInOut' },
      ],
      showGhost: false,
    };
    const updated = [...curveLayers, newLayer];
    updateLayersWithHistory(updated);
    setActiveLayerId(newId);
  };

  // Quick Apply to Premiere Clip via UXP
  const handleQuickApplyPremiere = async () => {
    const propMap: Record<string, PremiereProperty> = {
      'translate-x': 'Position',
      'translate-y': 'Position',
      'scale': 'Scale',
      'rotate': 'Rotation',
      'opacity': 'Opacity',
    };
    const targetProp = propMap[activeLayer.property] || 'Scale';
    const res = await UxpBridge.applyToPremiereClip(keyframes, {
      property: targetProp,
      fps,
      durationFrames: 60,
    });
    setUxpToast(res);
    setTimeout(() => setUxpToast(null), 4000);
  };

  // Playback Loop Animation Frame with Work Area support (Feature 4)
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        const deltaFrames = deltaSec * fps;

        setCurrentTime((prev) => {
          let next = prev + deltaFrames;
          if (workArea.enabled) {
            if (next >= workArea.outFrame) next = workArea.inFrame;
            if (next < workArea.inFrame) next = workArea.inFrame;
          } else {
            if (next >= 100) next = 0;
          }
          return next;
        });
      }
      lastTimeRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, fps, workArea]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'i' || e.key === 'I') {
        setWorkArea((w) => ({ ...w, inFrame: Math.round(currentTime), enabled: true }));
      } else if (e.key === 'o' || e.key === 'O') {
        setWorkArea((w) => ({ ...w, outFrame: Math.round(currentTime), enabled: true }));
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'p' || e.key === 'P') {
        setActiveTool('draw');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === ';' || e.key === ':')) {
        e.preventDefault();
        setSnappingConfig((s) => ({ ...s, enabled: !s.enabled }));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'q' || e.key === 'Q') {
        setActiveTool('lasso');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('pan');
      } else if (e.key === 'k' || e.key === 'K') {
        setActiveTool('keyframe');
      } else if (e.key === 'f' || e.key === 'F') {
        handleFitAll();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeyframeIds, keyframes, currentTime, handleUndo, handleRedo]);

  const selectedKeyframes = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#060913',
        color: '#f1f5f9',
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Top Professional Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          borderBottom: '1px solid #1e293b',
          background: '#0c1222',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
            }}
          >
            M
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 15, letterSpacing: -0.2 }}>Motion Studio</strong>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                Ultimate 90-Feature Suite
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isUxp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: isUxp ? '#10b981' : '#94a3b8',
                  border: `1px solid ${isUxp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
                }}
              >
                {isUxp ? '● UXP Native Connected' : '🌐 Browser Sandbox'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              Active Track: <span style={{ color: activeLayer.color, fontWeight: 600 }}>{activeLayer.name}</span>
            </div>
          </div>
        </div>

        {/* Motion Studio Suite Switcher */}
        <div style={{ display: 'flex', background: '#090e1a', padding: '3px', borderRadius: 8, border: '1px solid #1e293b', gap: 2, overflowX: 'auto' }}>
          {[
            { id: 'editor', label: '🎬 Motion Graph' },
            { id: 'universal-timeline', label: '🎞️ Universal Timeline' },
            { id: 'constraints-rigging', label: '🦾 Constraints & Rigging' },
            { id: 'shapes-typography', label: '🎨 Vector & Typography' },
            { id: 'audio-reactive', label: '🎵 Audio Reactive' },
            { id: 'batch-processor', label: '🧩 Batch Processor' },
            { id: 'velocity-lab', label: '📈 Velocity Lab' },
            { id: 'motion-matching', label: '🧬 Motion Match' },
            { id: 'parametric-presets', label: '🏛️ Parametric Presets' },
            { id: 'motion-clipboard', label: '📋 Motion Clipboard' },
            { id: 'canvas-timeline', label: '🎥 Live Canvas & Timeline' },
            { id: 'builder-stack', label: '🧱 Stack & Builder' },
            { id: 'text-ui', label: '📝 Text & UI States' },
            { id: 'captions', label: '💬 Caption Studio' },
            { id: 'reverse-engineering', label: '🧠 Explain & Rebuild' },
            { id: 'physics-sandbox', label: '🧪 Physics Sandbox' },
            { id: 'state-machine', label: '🎭 State Machine' },
            { id: 'git-diff', label: '🔀 Motion Git' },
            { id: 'design-system', label: '🎨 Design Tokens' },
            { id: 'logic-graph', label: '🧠 Logic Graph' },
            { id: 'scene-3d', label: '🌌 3D Scene' },
            { id: 'review-ab', label: '👥 A/B Review' },
            { id: 'dna-analyzer', label: '🧬 Motion DNA' },
            { id: 'responsive-lab', label: '🎯 Responsive Lab' },
            { id: 'presets-morph', label: '🏛️ Preset Morph' },
            { id: 'export-hub', label: '📦 Export Hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSuiteView(tab.id as any)}
              style={{
                padding: '4px 7px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: suiteView === tab.id ? 800 : 500,
                background: suiteView === tab.id ? 'linear-gradient(135deg, #1e3a8a, #1e40af)' : 'transparent',
                color: suiteView === tab.id ? '#38bdf8' : '#94a3b8',
                border: suiteView === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          {/* Kinematic Derivative Mode Selector (Value / Velocity / Accel / Jerk) */}
          <div style={{ display: 'flex', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, padding: 2, gap: 2 }}>
            {(['value', 'velocity', 'acceleration', 'jerk'] as const).map((dm) => (
              <button
                key={dm}
                onClick={() => setDerivativeMode(dm)}
                style={{
                  padding: '3px 6px',
                  fontSize: 9,
                  fontWeight: derivativeMode === dm ? 800 : 500,
                  background: derivativeMode === dm ? (dm === 'velocity' ? '#38bdf8' : dm === 'acceleration' ? '#f59e0b' : dm === 'jerk' ? '#ec4899' : '#1e3a8a') : 'transparent',
                  color: derivativeMode === dm ? (dm === 'value' ? '#38bdf8' : '#080d1a') : '#64748b',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {dm}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsRefMotionOpen(true)}
            style={{
              padding: '4px 8px',
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🎯 Match Ref
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#11182c', border: '1px solid #1e293b', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
            <span style={{ color: '#64748b' }}>T:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{currentTime.toFixed(1)}f</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#11182c', border: '1px solid #1e293b', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
            <span style={{ color: '#64748b' }}>Val:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{currentValue.toFixed(1)}%</span>
          </div>

          {/* Save .motionstudio project */}
          <button
            onClick={() => {
              const proj = ProjectEngine.createNewProject('Motion Studio Project');
              proj.curveLayers = curveLayers;
              ProjectEngine.exportToFile(proj);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Save complete project bundle to disk as .motionstudio format"
          >
            <span>💾 Save .motionstudio</span>
          </button>

          {/* ⌘K Command Palette Launcher */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 8px',
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>⌘K</span>
          </button>

          {/* Unified Scalable Host Export Dropdown */}
          <UnifiedHostExportDropdown
            keyframes={keyframes}
            fps={fps}
            activeProperty={activeLayer.property}
            onExportToast={(res) => {
              setUxpToast({ message: res.message, success: res.success });
              setTimeout(() => setUxpToast(null), 4000);
            }}
            onOpenFullExportModal={() => setIsExportOpen(true)}
          />
        </div>
      </header>

      {/* UXP Toast Notification Banner */}
      {uxpToast && (
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: uxpToast.success ? '#064e3b' : '#881337',
            border: `1px solid ${uxpToast.success ? '#10b981' : '#f43f5e'}`,
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{uxpToast.success ? '✓' : '✕'}</span>
          <span>{uxpToast.message}</span>
        </div>
      )}

      {/* 01: MOTION EDITOR GRAPH WORKSPACE */}
      {suiteView === 'editor' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr 330px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
        {/* LEFT COLUMN: Health AI, Spatial 2D, Dynamics, Operators, Quality, Modifiers */}
        <aside
          style={{
            background: '#090e1a',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sub-Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#0c1222', overflowX: 'auto' }}>
            {[
              { id: 'actionable-health', label: '🩺 Health & Fix' },
              { id: 'motion-library', label: '📚 Recipe Library' },
              { id: 'extrapolation', label: '♾ Loops' },
              { id: 'transfer', label: '📋 Transfer' },
              { id: 'retiming', label: '⏱ Retime' },
              { id: 'alignment', label: '⇋ Align' },
              { id: 'comparison', label: '⚖ Compare' },
              { id: 'drivers', label: '🔗 Drivers' },
              { id: 'diagnostics', label: '🔬 Diagnostics' },
              { id: 'reducer', label: '📉 Reducer' },
              { id: 'health', label: 'Health AI' },
              { id: 'spatial', label: '2D Path' },
              { id: 'dynamics', label: 'Dynamics' },
              { id: 'operators', label: 'Operators' },
              { id: 'quality', label: 'Quality' },
              { id: 'modifiers', label: 'Modifiers' },
              { id: 'constraints', label: 'Constraints' },
              { id: 'fit', label: 'Fit & Density' },
              { id: 'hierarchy', label: 'Hierarchy' },
              { id: 'linked', label: 'Linked' },
              { id: 'tangents', label: 'Tangents' },
              { id: 'layers', label: 'Curves' },
              { id: 'ops', label: 'Ops' },
              { id: 'transforms', label: 'Time/Val' },
              { id: 'morph', label: 'Morph' },
              { id: 'match', label: 'Match' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as any)}
                style={{
                  padding: '7px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: leftTab === tab.id ? '#38bdf8' : '#64748b',
                  background: leftTab === tab.id ? '#11182c' : 'transparent',
                  border: 'none',
                  borderBottom: leftTab === tab.id ? '2px solid #38bdf8' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leftTab === 'actionable-health' && (
              <ActionableDiagnosticsPanel
                keyframes={keyframes}
                onApplyFixedKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'motion-library' && (
              <VisualMotionLibraryPanel
                onApplyRecipe={handleKeyframesChange}
              />
            )}

            {leftTab === 'extrapolation' && (
              <ExtrapolationPanel
                activeLayer={activeLayer}
                onUpdateLayer={(updates) => {
                  const updated = curveLayers.map((l) => (l.id === activeLayerId ? { ...l, ...updates } : l));
                  updateLayersWithHistory(updated);
                }}
              />
            )}

            {leftTab === 'transfer' && (
              <KeyframeTransferPanel
                selectedKeyframes={selectedKeyframes}
                allKeyframes={keyframes}
                activeLayer={activeLayer}
                curveLayers={curveLayers}
                currentTime={currentTime}
                onUpdateKeyframes={handleKeyframesChange}
                onUpdateLayerKeyframes={(layerId, updated) => {
                  const updatedLayers = curveLayers.map((l) => (l.id === layerId ? { ...l, keyframes: updated } : l));
                  updateLayersWithHistory(updatedLayers);
                }}
              />
            )}

            {leftTab === 'retiming' && (
              <RetimingEnginePanel
                keyframes={keyframes}
                selectedKeyframes={selectedKeyframes}
                currentTime={currentTime}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'alignment' && (
              <AlignmentDistributionPanel
                selectedKeyframes={selectedKeyframes}
                allKeyframes={keyframes}
                currentTime={currentTime}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'comparison' && (
              <AnimationComparisonPanel
                activeLayer={activeLayer}
                curveLayers={curveLayers}
              />
            )}

            {leftTab === 'drivers' && (
              <CurveDriversPanel
                curveLayers={curveLayers}
                onApplyDrivenCurve={(drivenId, drivenKeys) => {
                  const updated = curveLayers.map((l) => (l.id === drivenId ? { ...l, keyframes: drivenKeys } : l));
                  updateLayersWithHistory(updated);
                }}
              />
            )}

            {leftTab === 'diagnostics' && (
              <SmartAssistantDiagnosticsPanel
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'reducer' && (
              <KeyReducerPanel
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'health' && (
              <GraphHealthOptimizerPanel
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'spatial' && (
              <SpatialPathPanel
                xKeyframes={posXLayer.keyframes}
                yKeyframes={posYLayer.keyframes}
                currentTime={currentTime}
                onUpdateSpatialKeyframes={handleUpdateSpatialKeyframes}
              />
            )}

            {leftTab === 'dynamics' && (
              <DynamicsPhysicsPanel
                keyframes={keyframes}
                currentTime={currentTime}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'operators' && (
              <OperatorsMatrixPanel
                keyframes={keyframes}
                currentTime={currentTime}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'quality' && (
              <MotionQualityPanel
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'modifiers' && (
              <ModifierStackPanel
                baseKeyframes={keyframes}
                onApplyModifiedCurve={handleKeyframesChange}
              />
            )}

            {leftTab === 'constraints' && (
              <CurveConstraintsPanel
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'fit' && (
              <CurveFitPanel
                keyframes={keyframes}
                originalKeyframes={activeLayer.ghostKeyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'hierarchy' && (
              <CurveHierarchyPanel
                curveLayers={curveLayers}
                activeLayerId={activeLayerId}
                onSelectLayer={setActiveLayerId}
                onUpdateLayer={(id: string, updates: Partial<CurveLayer>) => {
                  const updated = curveLayers.map((l) => (l.id === id ? { ...l, ...updates } : l));
                  updateLayersWithHistory(updated);
                }}
              />
            )}

            {leftTab === 'linked' && (
              <LinkedCurvesPanel
                curveLayers={curveLayers}
                activeLayerId={activeLayerId}
                onApplyLinkedKeyframes={(targetId: string, newKfs: KeyframePoint[]) => {
                  const updated = curveLayers.map((l) => (l.id === targetId ? { ...l, keyframes: newKfs } : l));
                  updateLayersWithHistory(updated);
                }}
              />
            )}

            {leftTab === 'tangents' && (
              <TangentControlsPanel
                selectedKeyframes={selectedKeyframes}
                allKeyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'layers' && (
              <MultiCurveManager
                curveLayers={curveLayers}
                activeLayerId={activeLayerId}
                onSelectLayer={setActiveLayerId}
                onUpdateLayer={(id: string, updates: Partial<CurveLayer>) => {
                  const updated = curveLayers.map((l) => (l.id === id ? { ...l, ...updates } : l));
                  updateLayersWithHistory(updated);
                }}
                onAddLayer={handleAddCurveLayer}
                onToggleGhost={handleToggleGhost}
              />
            )}

            {leftTab === 'ops' && (
              <CurveOperationsMenu
                keyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'transforms' && (
              <TimeValueTransformPanel
                selectedKeyframes={selectedKeyframes}
                allKeyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {leftTab === 'morph' && (
              <CurveMorphingPanel
                curveLayers={curveLayers}
                activeLayerId={activeLayerId}
                onApplyMorphedCurve={handleKeyframesChange}
              />
            )}

            {leftTab === 'match' && (
              <ReferenceMatchingPanel
                currentKeyframes={keyframes}
                ghostKeyframes={activeLayer.ghostKeyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Toolbar + Canvas + Timeline */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 10,
            background: '#060913',
            overflow: 'hidden',
          }}
        >
          {/* Main Top Toolbar */}
          <GraphToolbar
            activeTool={activeTool}
            graphMode={graphMode}
            isPlaying={isPlaying}
            viewport={viewport}
            fps={fps}
            hasSelection={selectedKeyframeIds.length > 0}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            snappingConfig={snappingConfig}
            timeFormat={timeFormat}
            valueUnit={valueUnit}
            analysisEnabled={analysisEnabled}
            heatmapEnabled={heatmapEnabled}
            heatmapMetric={heatmapMetric}
            audioEnabled={showAudioWaveform}
            ghostEnabled={activeLayer.showGhost}
            onToolChange={setActiveTool}
            onModeChange={setGraphMode}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onStepForward={() => setCurrentTime((t) => Math.min(100, t + 1))}
            onStepBackward={() => setCurrentTime((t) => Math.max(0, t - 1))}
            onResetTime={() => setCurrentTime(0)}
            onAddKeyframe={handleAddKeyframeAtCurrentTime}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onZoomIn={() => setViewport((v) => ({ ...v, scaleX: Math.min(4, v.scaleX * 1.15), scaleY: Math.min(4, v.scaleY * 1.15) }))}
            onZoomOut={() => setViewport((v) => ({ ...v, scaleX: Math.max(0.3, v.scaleX * 0.85), scaleY: Math.max(0.3, v.scaleY * 0.85) }))}
            onResetZoom={() => setViewport({ x: 0, y: 0, scaleX: 1, scaleY: 1 })}
            onFitAll={handleFitAll}
            onFitSelection={handleFitSelection}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onFpsChange={setFps}
            onSnappingConfigChange={setSnappingConfig}
            onTimeFormatChange={setTimeFormat}
            onValueUnitChange={setValueUnit}
            onToggleAnalysis={() => setAnalysisEnabled((a) => !a)}
            onToggleHeatmap={() => setHeatmapEnabled((h) => !h)}
            onHeatmapMetricChange={setHeatmapMetric}
            onToggleAudio={() => setShowAudioWaveform((s) => !s)}
            onToggleGhost={() => handleToggleGhost(activeLayerId)}
          />

          {/* Blender-Style Curve & Handle Operations Toolbar */}
          <BlenderCurveToolbar
            keyframes={keyframes}
            selectedKeyframeIds={selectedKeyframeIds}
            onUpdateKeyframes={handleKeyframesChange}
            onSelectAll={() => setSelectedKeyframeIds(keyframes.map((k) => k.id))}
            onInvertSelection={() => {
              const inv = keyframes.filter((k) => !selectedKeyframeIds.includes(k.id)).map((k) => k.id);
              setSelectedKeyframeIds(inv);
            }}
          />

          {/* Interactive Graph Canvas */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <GraphCanvas
              viewport={viewport}
              curveLayers={curveLayers}
              activeLayerId={activeLayerId}
              selectedKeyframeIds={selectedKeyframeIds}
              currentTime={currentTime}
              activeTool={activeTool}
              graphMode={graphMode}
              gridConfig={gridConfig}
              snappingConfig={snappingConfig}
              workArea={workArea}
              fps={fps}
              timeFormat={timeFormat}
              valueUnit={valueUnit}
              isPlaying={isPlaying}
              analysisEnabled={analysisEnabled}
              heatmapMetric={heatmapMetric}
              heatmapEnabled={heatmapEnabled}
              diffViewEnabled={diffViewEnabled}
              bookmarks={bookmarks}
              regions={regions}
              beats={beats}
              showAudioWaveform={showAudioWaveform}
              audioConfig={audioConfig}
              onKeyframesChange={handleKeyframesChange}
              onSelectKeyframes={setSelectedKeyframeIds}
              onCurrentTimeChange={setCurrentTime}
              onViewportChange={setViewport}
              onWorkAreaChange={setWorkArea}
              onApplySegmentEase={handleApplySegmentEase}
            />
            {/* Kinematic Derivative Curve Overlay (Velocity, Acceleration, Jerk) */}
            <DerivativesCurveViewer keyframes={keyframes} graphType={derivativeMode} />
          </div>

          {/* Bottom Timeline Scrubber (Feature 38: Deep 2-Way Sync) */}
          <TimelineScrubber
            currentTime={currentTime}
            keyframes={keyframes}
            selectedKeyframeIds={selectedKeyframeIds}
            onCurrentTimeChange={setCurrentTime}
            onSelectKeyframe={(id: number) => setSelectedKeyframeIds([id])}
          />
        </main>

        {/* RIGHT COLUMN: Motion Preview, Semantic Presets, States, Rhythm, MoCap, Expressions, Audio, Snapshots */}
        <aside
          style={{
            background: '#090e1a',
            borderLeft: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sub-Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#0c1222', overflowX: 'auto' }}>
            {[
              { id: 'marketplace', label: '🏛️ Market' },
              { id: 'overshoot', label: '🎯 Overshoot' },
              { id: 'audioAnalyzer', label: '🎙️ Band Audio' },
              { id: 'workspaces', label: '📐 Workspaces' },
              { id: 'semantic', label: 'Semantic' },
              { id: 'states', label: 'UI States' },
              { id: 'rhythm', label: 'Rhythm' },
              { id: 'mocap', label: 'MoCap' },
              { id: 'expressions', label: 'Formula' },
              { id: 'audio', label: 'Audio Sync' },
              { id: 'snapshots', label: 'Snapshots' },
              { id: 'inspector', label: 'Inspector' },
              { id: 'presets', label: 'Presets' },
              { id: 'physics', label: 'Physics' },
              { id: 'segments', label: 'Segments' },
              { id: 'remap', label: 'Time Remap' },
              { id: 'selection', label: 'Select' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id as any)}
                style={{
                  padding: '7px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: rightTab === tab.id ? '#38bdf8' : '#64748b',
                  background: rightTab === tab.id ? '#11182c' : 'transparent',
                  border: 'none',
                  borderBottom: rightTab === tab.id ? '2px solid #38bdf8' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Live Motion Sandbox Preview */}
            <MotionPreview
              currentValue={currentValue}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />

            {rightTab === 'marketplace' && (
              <MotionMarketplaceLibraryPanel
                onApplyPreset={handleKeyframesChange}
              />
            )}

            {rightTab === 'overshoot' && (
              <OvershootGeneratorPanel
                onApplyCurve={handleKeyframesChange}
              />
            )}

            {rightTab === 'audioAnalyzer' && (
              <AudioAnalyzerPanel
                onApplyAudioCurve={handleKeyframesChange}
              />
            )}

            {rightTab === 'workspaces' && (
              <WorkspaceProfilesPanel
                currentProfile={workspaceProfile}
                curveLayers={curveLayers}
                onSelectProfile={(cfg) => {
                  setWorkspaceProfile(cfg.id);
                  setLeftTab(cfg.leftDefaultTab as any);
                  setRightTab(cfg.rightDefaultTab as any);
                  setShowAudioWaveform(cfg.showAudio);
                  setGraphMode(cfg.graphMode);
                }}
              />
            )}

            {rightTab === 'semantic' && (
              <SemanticPresetsPanel
                onApplySemanticPreset={handleKeyframesChange}
              />
            )}

            {rightTab === 'states' && (
              <AnimationStatePanel
                onApplyTransitionCurve={handleKeyframesChange}
              />
            )}

            {rightTab === 'rhythm' && (
              <RhythmQuantizePanel
                keyframes={keyframes}
                fps={fps}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {rightTab === 'mocap' && (
              <MoCapRecorderPanel
                currentTime={currentTime}
                onApplyRecordedKeyframes={handleKeyframesChange}
              />
            )}

            {rightTab === 'expressions' && (
              <ExpressionGeneratorPanel
                onApplyExpressionKeyframes={handleKeyframesChange}
              />
            )}

            {rightTab === 'audio' && (
              <AudioToCurvePanel
                onApplyAudioCurve={handleKeyframesChange}
              />
            )}

            {rightTab === 'snapshots' && (
              <SnapshotGalleryPanel
                currentKeyframes={keyframes}
                originalBaselineKeyframes={activeLayer.ghostKeyframes}
                onApplySnapshot={handleKeyframesChange}
                onToggleDiffView={setDiffViewEnabled}
                diffViewEnabled={diffViewEnabled}
              />
            )}

            {rightTab === 'inspector' && (
              <KeyframeInspector
                selectedKeyframes={selectedKeyframes}
                onUpdateKeyframe={(id: number, updates: Partial<KeyframePoint>) => {
                  const updated = keyframes.map((k) => (k.id === id ? { ...k, ...updates } : k));
                  handleKeyframesChange(updated);
                }}
                onDeleteKeyframe={(id: number) => {
                  const updated = deleteKeyframesPreservingShape(keyframes, [id]);
                  handleKeyframesChange(updated);
                  setSelectedKeyframeIds([]);
                }}
              />
            )}

            {rightTab === 'presets' && (
              <UserPresetsLibrary
                currentKeyframes={keyframes}
                onApplyPreset={handleKeyframesChange}
              />
            )}

            {rightTab === 'physics' && (
              <PhysicsParametersPanel
                selectedKeyframes={selectedKeyframes}
                allKeyframes={keyframes}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}

            {rightTab === 'segments' && (
              <SegmentEasingPanel
                keyframes={keyframes}
                onApplySegmentEase={handleApplySegmentEase}
                onApplyGlobalEase={handleApplyGlobalEase}
              />
            )}

            {rightTab === 'remap' && (
              <TimeRemapPanel
                onApplyRemapPreset={(preset) => handleKeyframesChange(preset.keyframes)}
              />
            )}

            {rightTab === 'selection' && (
              <SelectionToolsPanel
                keyframes={keyframes}
                selectedKeyframeIds={selectedKeyframeIds}
                currentTime={currentTime}
                onSelectKeyframes={setSelectedKeyframeIds}
                onUpdateKeyframes={handleKeyframesChange}
              />
            )}
          </div>
        </aside>
      </div>
      )}

      {/* 02: LIVE COMPOSITION CANVAS & MULTI-TRACK TIMELINE PLAYGROUND */}
      {suiteView === 'canvas-timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <LiveCanvas
            layers={compositionLayers}
            selectedLayerId={selectedCompLayerId}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSelectLayer={setSelectedCompLayerId}
            onUpdateLayerTransform={(layerId, updates) => {
              setCompositionLayers(
                compositionLayers.map((l) => (l.id === layerId ? { ...l, transform: { ...l.transform, ...updates } } : l))
              );
            }}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onCurrentTimeChange={(t) => setCurrentTime(t)}
          />
          <MultiTrackTimeline
            tracks={timelineTracks}
            currentTime={currentTime}
            totalFrames={100}
            isPlaying={isPlaying}
            selectedKeyframeIds={selectedTimelineKeyIds}
            onCurrentTimeChange={(t) => setCurrentTime(t)}
            onToggleTrackExpand={(trackId) => {
              setTimelineTracks(
                timelineTracks.map((t) => (t.id === trackId ? { ...t, expanded: !t.expanded } : t))
              );
            }}
            onToggleTrackVisibility={(trackId) => {
              setTimelineTracks(
                timelineTracks.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t))
              );
            }}
            onToggleTrackLock={(trackId) => {
              setTimelineTracks(
                timelineTracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t))
              );
            }}
            onAddKeyframeAtPlayhead={(trackId, channelId) => {
              setTimelineTracks(
                timelineTracks.map((t) => {
                  if (t.id !== trackId) return t;
                  const updatedChannels = t.channels.map((ch) => {
                    if (ch.id !== channelId) return ch;
                    const newKey = { id: Date.now(), time: Math.round(currentTime), value: 50, type: 'bezier' as const };
                    return { ...ch, keyframes: [...ch.keyframes, newKey].sort((a, b) => a.time - b.time) };
                  });
                  return { ...t, channels: updatedChannels };
                })
              );
            }}
            onSelectKeyframe={(selectionId) => setSelectedTimelineKeyIds([selectionId])}
          />
        </div>
      )}

      {/* 02: UNIVERSAL TIMELINE STUDIO */}
      {suiteView === 'universal-timeline' && (
        <UniversalTimelineStudioView
          onSyncWithGraphEditor={(graphKeys, label) => {
            handleKeyframesChange(graphKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 02.5: COMPLETE CONSTRAINT & RIGGING SYSTEM */}
      {suiteView === 'constraints-rigging' && (
        <ConstraintRiggingStudioView />
      )}

      {/* 02.55: ADVANCED VECTOR SHAPES & KINETIC TYPOGRAPHY */}
      {suiteView === 'shapes-typography' && (
        <ShapeTypographyStudioView
          onBakeKeyframesToEditor={(bakedKeys, label) => {
            handleKeyframesChange(bakedKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 02.6: AUDIO-REACTIVE MOTION ENGINE */}
      {suiteView === 'audio-reactive' && (
        <AudioReactiveStudioView
          onBakeKeyframesToEditor={(bakedKeys, label) => {
            handleKeyframesChange(bakedKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 03: MOTION BATCH PROCESSOR */}
      {suiteView === 'batch-processor' && (
        <MotionBatchProcessorView
          curveLayers={curveLayers}
          onApplyBatchLayers={(updated) => {
            updateLayersWithHistory(updated);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 04: VELOCITY & KINEMATICS LAB */}
      {suiteView === 'velocity-lab' && (
        <VelocityLabView
          currentKeyframes={keyframes}
          onApplyKeyframes={(updated) => {
            handleKeyframesChange(updated);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 05: MOTION MATCHING & KINEMATIC TRANSFER STUDIO */}
      {suiteView === 'motion-matching' && (
        <MotionMatchingStudioView
          currentKeyframes={keyframes}
          onApplyMatchedKeyframes={(updated) => {
            handleKeyframesChange(updated);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 06: LIVING PARAMETRIC PRESETS STUDIO */}
      {suiteView === 'parametric-presets' && (
        <ParametricPresetStudioView
          currentKeyframes={keyframes}
          onApplyKeyframes={(updated) => {
            handleKeyframesChange(updated);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 07: SMART MOTION CLIPBOARD */}
      {suiteView === 'motion-clipboard' && (
        <MotionClipboardDrawer
          currentKeyframes={keyframes}
          activeProperty={activeLayer.property}
          onApplyKeyframes={(pasted) => {
            handleKeyframesChange(pasted);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 08: MODULAR ANIMATION STACK & BUILDER */}
      {suiteView === 'builder-stack' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' }}>
          <AnimationBuilderView
            onApplyModelToGraph={(bakedKeys) => {
              handleKeyframesChange(bakedKeys);
              setSuiteView('editor');
            }}
          />
          <div style={{ background: '#090e1a', borderLeft: '1px solid #1e293b', padding: 12, overflowY: 'auto' }}>
            <AnimationStackPanel
              baseKeyframes={keyframes}
              onApplyBakedStack={handleKeyframesChange}
            />
          </div>
        </div>
      )}

      {/* 04: TEXT & UI STATE STUDIO */}
      {suiteView === 'text-ui' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, overflow: 'hidden' }}>
          <TextAnimatorView
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onCurrentTimeChange={(t) => setCurrentTime(t)}
          />
          <div style={{ background: '#090e1a', borderLeft: '1px solid #1e293b', padding: 12, overflowY: 'auto' }}>
            <InteractionStatePanel
              onApplyStateCurve={handleKeyframesChange}
            />
          </div>
        </div>
      )}

      {/* 05: CAPTION STUDIO */}
      {suiteView === 'captions' && (
        <CaptionStudioView />
      )}

      {/* 06: MOTION REVERSE ENGINEERING ("Explain & Rebuild") */}
      {suiteView === 'reverse-engineering' && (
        <MotionReverseEngineeringView
          currentKeyframes={keyframes}
          onApplyReconstructedKeyframes={(rebuilt) => {
            handleKeyframesChange(rebuilt);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 07: INTERACTIVE PHYSICS WORLD & SIMULATION SANDBOX */}
      {suiteView === 'physics-sandbox' && (
        <PhysicsSandboxView
          onBakeKeyframesToEditor={(physicsKeys) => {
            handleKeyframesChange(physicsKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 08: ANIMATION STATE MACHINE */}
      {suiteView === 'state-machine' && (
        <AnimationStateMachineView />
      )}

      {/* 09: ANIMATION GIT & MOTION DIFF */}
      {suiteView === 'git-diff' && (
        <AnimationGitView currentKeyframes={keyframes} />
      )}

      {/* 10: DESIGN SYSTEM & COMPONENT STUDIO */}
      {suiteView === 'design-system' && (
        <DesignSystemStudioView />
      )}

      {/* 07: PROCEDURAL ANIMATION GRAPH & PROGRAMMING SYSTEM */}
      {suiteView === 'logic-graph' && (
        <MotionLogicGraphView
          onBakeKeyframesToEditor={(bakedKeys) => {
            handleKeyframesChange(bakedKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 08: 2.5D / 3D SCENE & CAMERA STUDIO */}
      {suiteView === 'scene-3d' && (
        <Scene3DStudioView />
      )}

      {/* 09: A/B REVIEW & VERSION COMPARISON */}
      {suiteView === 'review-ab' && (
        <VersionReviewComparisonView />
      )}

      {/* 10: MOTION DNA INTELLIGENCE & QUALITY STUDIO */}
      {suiteView === 'dna-analyzer' && (
        <MotionDnaStudioView
          currentKeyframes={keyframes}
          onApplyKeyframesToEditor={(optKeys) => {
            handleKeyframesChange(optKeys);
            setSuiteView('editor');
          }}
        />
      )}

      {/* 06: RESPONSIVE MOTION LAB */}
      {suiteView === 'responsive-lab' && (
        <ResponsiveMotionLabView currentKeyframes={keyframes} />
      )}

      {/* 07: PRESET STUDIO & MORPHING */}
      {suiteView === 'presets-morph' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', flex: 1, overflow: 'hidden' }}>
          <div style={{ background: '#090e1a', borderRight: '1px solid #1e293b', padding: 14, overflowY: 'auto' }}>
            <PresetMorphPanel
              currentKeyframes={keyframes}
              curveLayers={curveLayers}
              onApplyMorphedCurve={handleKeyframesChange}
              onApplyStaggeredLayers={updateLayersWithHistory}
            />
          </div>
          <div style={{ padding: 20, overflowY: 'auto', background: '#060913' }}>
            <MotionMarketplaceLibraryPanel
              onApplyPreset={(newKeys) => {
                handleKeyframesChange(newKeys);
                setSuiteView('editor');
              }}
            />
          </div>
        </div>
      )}

      {/* 08: EXPORT ECOSYSTEM HUB */}
      {suiteView === 'export-hub' && (
        <ExportHubView keyframes={keyframes} />
      )}

      {/* Export to After Effects / Premiere Modal */}
      <ExportModal
        isOpen={isExportOpen}
        keyframes={keyframes}
        fps={fps}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Reference Motion Overlay & Match Solver Modal */}
      <ReferenceMotionModal
        isOpen={isRefMotionOpen}
        currentKeyframes={keyframes}
        onClose={() => setIsRefMotionOpen(false)}
        onApplyMatchedKeyframes={handleKeyframesChange}
      />

      {/* ⌘K Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={[
          {
            id: 'cmd-graph',
            title: 'Switch to Motion Graph Editor',
            category: 'Navigation',
            shortcut: 'G',
            action: () => setSuiteView('editor'),
          },
          {
            id: 'cmd-captions',
            title: 'Open Caption Studio (Word Timings & Karaoke)',
            category: 'Navigation',
            action: () => setSuiteView('captions'),
          },
          {
            id: 'cmd-explain',
            title: 'Explain & Rebuild This Motion (Reverse Engineering)',
            category: 'Diagnostics',
            action: () => setSuiteView('reverse-engineering'),
          },
          {
            id: 'cmd-physics',
            title: 'Open 2D Physics Motion Sandbox',
            category: 'Navigation',
            action: () => setSuiteView('physics-sandbox'),
          },
          {
            id: 'cmd-state',
            title: 'Open Animation State Machine',
            category: 'Navigation',
            action: () => setSuiteView('state-machine'),
          },
          {
            id: 'cmd-save-proj',
            title: 'Save .motionstudio Project File',
            category: 'Actions',
            action: () => {
              const proj = ProjectEngine.createNewProject('Motion Studio Project');
              proj.curveLayers = curveLayers;
              ProjectEngine.exportToFile(proj);
            },
          },
          {
            id: 'cmd-apply-pr',
            title: 'Apply Keyframes to Premiere Pro (UXP)',
            category: 'Host Interchange',
            action: () => handleQuickApplyPremiere(),
          },
        ]}
      />

      {/* Crash Recovery Modal */}
      <CrashRecoveryModal
        isOpen={Boolean(recoveryEntry)}
        recoveryEntry={recoveryEntry}
        onRestore={() => {
          if (recoveryEntry?.projectSnapshot?.curveLayers) {
            setCurveLayers(recoveryEntry.projectSnapshot.curveLayers);
          }
          CrashRecoveryEngine.clearRecoveryJournal();
          setRecoveryEntry(null);
        }}
        onDismiss={() => {
          CrashRecoveryEngine.clearRecoveryJournal();
          setRecoveryEntry(null);
        }}
      />

      {/* Real-Time Performance Monitor Overlay */}
      <PerformanceMonitorOverlay />
    </div>
  );
}
