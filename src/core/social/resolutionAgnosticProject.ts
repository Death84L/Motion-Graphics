import { SocialTargetFormat, SafeZonePlatform, SafeZoneBounds, ExtendedSocialReframeEngine } from './extendedSocialReframeEngine';
import { RetentionHookStyle } from './viralRetentionEngine';
import { CaptionStylePreset, KineticCaptionPhrase } from './kineticCaptionEngine';
import { KeyframePoint } from '../../features/graph-editor/types';

export interface NormalizedPoint {
  timeSec: number;
  u: number; // 0.0 to 1.0 (Percentage of source frame width)
  v: number; // 0.0 to 1.0 (Percentage of source frame height)
  scale: number; // Normalized scale (1.0 = native fit)
  confidence: number; // 0.0 to 1.0 tracking confidence
}

export interface TrackedEntity {
  id: string;
  name: string;
  type: 'face' | 'speaker' | 'upper-body' | 'screen' | 'poi';
  isPrimary: boolean;
  trajectory: NormalizedPoint[];
}

export type AnchorRule =
  | 'center-subject'
  | 'rule-of-thirds-eye-line'
  | 'gaze-lead-room-22'
  | 'safe-zone-bottom-dock'
  | 'safe-zone-top-dock'
  | 'asymmetric-split-host';

export interface LayoutConstraint {
  id: string;
  targetEntityId: string;
  anchorRule: AnchorRule;
  leadRoomRatio: number; // Default 0.22 (22%)
  headroomRatio: number; // Default 0.12 (12%)
  priority: number; // 1 (highest) to 10
}

export interface OverrideDeltaKeyframe {
  timeSec: number;
  deltaU: number; // User nudge in normalized X (-0.5 to +0.5)
  deltaV: number; // User nudge in normalized Y (-0.5 to +0.5)
  deltaScale: number; // User zoom nudge (-0.5 to +1.5)
  targetEntityId?: string;
}

export interface MasterRetentionHook {
  headline: string;
  style: RetentionHookStyle;
  durationSec: number;
  normalizedPlacementY: number; // Default 0.06 (top 6%)
  zoomPunchMultiplier: number; // Default 1.08 (+8%)
  showProgressBar: boolean;
  progressBarColor: string;
}

export interface MasterReframeProject {
  schemaVersion: '2.0.0-semantic-agnostic';
  projectId: string;
  title: string;
  sourceDimensions: { width: number; height: number; aspectRatio: number };
  durationSec: number;
  entities: TrackedEntity[];
  constraints: LayoutConstraint[];
  overrideDeltas: OverrideDeltaKeyframe[];
  hookProfile: MasterRetentionHook;
  captions: {
    preset: CaptionStylePreset;
    phrases: KineticCaptionPhrase[];
    autoAvoidFaceOcclusion: boolean;
  };
  audioKinematics: {
    silenceThresholdDb: number;
    minSilenceDurationSec: number;
    autoJumpCutEnabled: boolean;
  };
}

export interface RenderProfile {
  format: SocialTargetFormat;
  platform: SafeZonePlatform;
  targetWidth: number;
  targetHeight: number;
  fitMode: 'smart-ambient-fit' | 'depth-parallax-25d' | 'ken-burns-scan' | 'stacked-duplex' | 'elevated-card' | 'full-bleed-crop';
  depthIntensity: number;
}

export interface ResolvedViewportScene {
  renderProfile: RenderProfile;
  contentBounds: { x: number; y: number; width: number; height: number; scale: number };
  activeCropPanX: number;
  activeCropPanY: number;
  cameraPanKeyframes: KeyframePoint[];
  cameraScaleKeyframes: KeyframePoint[];
  captionPlacement: { y: number; isFlippedToUpperThird: boolean };
  hookBannerPlacement: { x: number; y: number; width: number };
  safeZoneBounds: SafeZoneBounds;
  cutoffPercentage: 0;
}

export class ResolutionIndependentSolver {
  /**
   * Creates a default Master Resolution-Independent Project from detected media.
   */
  static createDefaultMasterProject(
    sourceWidth = 1920,
    sourceHeight = 1080,
    durationSec = 15.0,
    title = 'Master Resolution-Agnostic Project'
  ): MasterReframeProject {
    const primaryEntity: TrackedEntity = {
      id: 'entity_primary_speaker',
      name: 'Primary Speaker (Host)',
      type: 'speaker',
      isPrimary: true,
      trajectory: [
        { timeSec: 0.0, u: 0.35, v: 0.45, scale: 1.0, confidence: 0.98 },
        { timeSec: durationSec / 2, u: 0.42, v: 0.45, scale: 1.0, confidence: 0.95 },
        { timeSec: durationSec, u: 0.38, v: 0.45, scale: 1.0, confidence: 0.97 },
      ],
    };

    const secondaryEntity: TrackedEntity = {
      id: 'entity_guest_speaker',
      name: 'Secondary Speaker (Guest)',
      type: 'speaker',
      isPrimary: false,
      trajectory: [
        { timeSec: 0.0, u: 0.75, v: 0.45, scale: 1.0, confidence: 0.94 },
        { timeSec: durationSec, u: 0.72, v: 0.45, scale: 1.0, confidence: 0.93 },
      ],
    };

    return {
      schemaVersion: '2.0.0-semantic-agnostic',
      projectId: `ms_proj_${Date.now()}`,
      title,
      sourceDimensions: { width: sourceWidth, height: sourceHeight, aspectRatio: sourceWidth / sourceHeight },
      durationSec,
      entities: [primaryEntity, secondaryEntity],
      constraints: [
        {
          id: 'c_eye_line',
          targetEntityId: 'entity_primary_speaker',
          anchorRule: 'rule-of-thirds-eye-line',
          leadRoomRatio: 0.22,
          headroomRatio: 0.12,
          priority: 1,
        },
      ],
      overrideDeltas: [],
      hookProfile: {
        headline: 'How I Scaled from $0 to $50K in 30 Days 🚀',
        style: 'viral-yellow',
        durationSec: 3.0,
        normalizedPlacementY: 0.06,
        zoomPunchMultiplier: 1.08,
        showProgressBar: true,
        progressBarColor: '#38bdf8',
      },
      captions: {
        preset: 'hormozi-punch',
        phrases: [],
        autoAvoidFaceOcclusion: true,
      },
      audioKinematics: {
        silenceThresholdDb: -38,
        minSilenceDurationSec: 0.35,
        autoJumpCutEnabled: true,
      },
    };
  }

  /**
   * Dynamically resolves the resolution-independent master project against ANY target render profile.
   * Transforms normalized (u, v) constraints and override deltas into pixel-exact camera keyframes in O(1).
   */
  static resolveToViewport(project: MasterReframeProject, profile: RenderProfile): ResolvedViewportScene {
    const safeBounds = ExtendedSocialReframeEngine.getSafeZoneBounds(profile.platform);
    const primaryEntity = project.entities.find((e) => e.isPrimary) || project.entities[0];

    // Compute target crop window in source space
    const targetAspect = profile.targetWidth / profile.targetHeight;
    const cropWidthInSource = Math.min(project.sourceDimensions.width, project.sourceDimensions.height * targetAspect);

    // Compute camera trajectory in normalized space, then project to target pixels
    const cameraPanKeyframes: KeyframePoint[] = primaryEntity.trajectory.map((pt, idx) => {
      // 1. Find user override delta for this time
      const override = project.overrideDeltas.find((o) => Math.abs(o.timeSec - pt.timeSec) < 0.2) || { deltaU: 0, deltaV: 0, deltaScale: 0 };

      // 2. Base position from entity trajectory
      const effectiveU = Math.max(0, Math.min(1.0, pt.u + override.deltaU));

      // 3. Convert normalized coordinate to source X pan position
      const rawPanX = effectiveU * project.sourceDimensions.width - cropWidthInSource / 2;
      const clampedPanX = Math.max(0, Math.min(project.sourceDimensions.width - cropWidthInSource, rawPanX));

      return {
        id: 12000 + idx,
        time: pt.timeSec,
        value: Math.round(clampedPanX),
        type: 'bezier',
        handleIn: { x: 0.25, y: clampedPanX },
        handleOut: { x: 0.25, y: clampedPanX },
      };
    });

    const cameraScaleKeyframes: KeyframePoint[] = [
      { id: 12100, time: 0.0, value: Math.round(100 * project.hookProfile.zoomPunchMultiplier), type: 'bezier' },
      { id: 12101, time: 3.0, value: 100, type: 'bezier' },
      { id: 12102, time: project.durationSec, value: 100, type: 'bezier' },
    ];

    // Safe-Zone Caption Placement Solver
    let captionY = profile.targetHeight - safeBounds.bottomMarginPx - 60;
    let isFlipped = false;
    if (captionY < profile.targetHeight * 0.5) {
      captionY = safeBounds.topMarginPx + 80;
      isFlipped = true;
    }

    return {
      renderProfile: profile,
      contentBounds: {
        x: 0,
        y: 0,
        width: profile.targetWidth,
        height: profile.targetHeight,
        scale: 1.0,
      },
      activeCropPanX: cameraPanKeyframes[0]?.value || 0,
      activeCropPanY: 0,
      cameraPanKeyframes,
      cameraScaleKeyframes,
      captionPlacement: {
        y: Math.round(captionY),
        isFlippedToUpperThird: isFlipped,
      },
      hookBannerPlacement: {
        x: 10,
        y: Math.round(project.hookProfile.normalizedPlacementY * profile.targetHeight),
        width: profile.targetWidth - 20,
      },
      safeZoneBounds: safeBounds,
      cutoffPercentage: 0,
    };
  }

  /**
   * Applies a non-destructive user override delta at a specific timecode.
   * Does NOT clobber the underlying auto-detected trajectory.
   */
  static applyUserOverrideDelta(
    project: MasterReframeProject,
    timeSec: number,
    deltaU: number,
    deltaV: number,
    deltaScale = 0
  ): MasterReframeProject {
    const updatedOverrides = project.overrideDeltas.filter((o) => Math.abs(o.timeSec - timeSec) >= 0.1);
    updatedOverrides.push({
      timeSec: Math.round(timeSec * 100) / 100,
      deltaU: Math.round(deltaU * 1000) / 1000,
      deltaV: Math.round(deltaV * 1000) / 1000,
      deltaScale: Math.round(deltaScale * 1000) / 1000,
    });

    return {
      ...project,
      overrideDeltas: updatedOverrides,
    };
  }
}
