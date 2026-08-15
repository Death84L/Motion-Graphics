import {
  UniversalComposition,
  UniversalTrack,
  UniversalKeyframe,
  UniversalPropertyLane,
} from './universalTimelineSchema';

export type TimelineToolMode =
  | 'select' // V
  | 'ripple' // B
  | 'slip' // Y
  | 'slide' // U
  | 'roll' // N
  | 'stretch' // R
  | 'split' // C
  | 'hand'; // H

export interface SnappingMatch {
  frame: number;
  label: string;
  sourceType: 'keyframe' | 'marker' | 'playhead' | 'track-edge' | 'work-area' | 'beat';
}

export class TimelineEngine {
  /**
   * Central Snapping Engine: Finds the closest snap candidate within tolerance threshold.
   */
  static findSnapTarget(
    targetFrame: number,
    comp: UniversalComposition,
    playheadFrame: number,
    thresholdFrames = 3
  ): SnappingMatch | null {
    const candidates: SnappingMatch[] = [
      { frame: playheadFrame, label: 'Playhead', sourceType: 'playhead' },
      { frame: 0, label: 'Composition Start', sourceType: 'track-edge' },
      { frame: comp.durationFrames, label: 'Composition End', sourceType: 'track-edge' },
    ];

    // Add Markers
    comp.markers.forEach((m) => {
      candidates.push({ frame: m.frame, label: m.label, sourceType: 'marker' });
    });

    // Add Work Area
    comp.regions.forEach((r) => {
      candidates.push({ frame: r.inFrame, label: `${r.label} In`, sourceType: 'work-area' });
      candidates.push({ frame: r.outFrame, label: `${r.label} Out`, sourceType: 'work-area' });
    });

    // Add Track in/out edges and keyframes
    comp.tracks.forEach((t) => {
      candidates.push({ frame: t.inFrame, label: `${t.name} Start`, sourceType: 'track-edge' });
      candidates.push({ frame: t.outFrame, label: `${t.name} End`, sourceType: 'track-edge' });

      t.propertyLanes.forEach((lane) => {
        lane.keyframes.forEach((k) => {
          candidates.push({ frame: k.frame, label: `${lane.displayName} Key`, sourceType: 'keyframe' });
        });
      });
    });

    let closest: SnappingMatch | null = null;
    let minDistance = Infinity;

    for (const c of candidates) {
      const dist = Math.abs(c.frame - targetFrame);
      if (dist <= thresholdFrames && dist < minDistance) {
        minDistance = dist;
        closest = c;
      }
    }

    return closest;
  }

  /**
   * Ripple Edit: Modifies a track's duration and automatically shifts all subsequent tracks forward/backward.
   */
  static rippleTrimTrack(
    comp: UniversalComposition,
    targetTrackId: string,
    deltaFrames: number
  ): UniversalComposition {
    const trackIndex = comp.tracks.findIndex((t) => t.id === targetTrackId);
    if (trackIndex === -1) return comp;

    const targetTrack = comp.tracks[trackIndex];
    const newOut = Math.max(targetTrack.inFrame + 1, targetTrack.outFrame + deltaFrames);
    const actualDelta = newOut - targetTrack.outFrame;

    const updatedTracks = comp.tracks.map((t, idx) => {
      if (t.id === targetTrackId) {
        return { ...t, outFrame: newOut };
      }
      // Ripple all downstream tracks starting after target
      if (idx > trackIndex && t.inFrame >= targetTrack.outFrame) {
        return {
          ...t,
          inFrame: Math.max(0, t.inFrame + actualDelta),
          outFrame: Math.max(0, t.outFrame + actualDelta),
          timeOffsetFrames: t.timeOffsetFrames + actualDelta,
          propertyLanes: t.propertyLanes.map((lane) => ({
            ...lane,
            keyframes: lane.keyframes.map((k) => ({ ...k, frame: Math.max(0, k.frame + actualDelta) })),
          })),
        };
      }
      return t;
    });

    return { ...comp, tracks: updatedTracks };
  }

  /**
   * Slip Edit: Shifts internal keyframe contents and time offset without moving track in/out boundaries.
   */
  static slipTrack(
    comp: UniversalComposition,
    targetTrackId: string,
    offsetFrames: number
  ): UniversalComposition {
    return {
      ...comp,
      tracks: comp.tracks.map((t) => {
        if (t.id !== targetTrackId) return t;
        return {
          ...t,
          timeOffsetFrames: t.timeOffsetFrames + offsetFrames,
          propertyLanes: t.propertyLanes.map((lane) => ({
            ...lane,
            keyframes: lane.keyframes.map((k) => ({ ...k, frame: k.frame + offsetFrames })),
          })),
        };
      }),
    };
  }

  /**
   * Slide Edit: Moves track along timeline while trimming predecessor and extending successor tracks.
   */
  static slideTrack(
    comp: UniversalComposition,
    targetTrackId: string,
    shiftFrames: number
  ): UniversalComposition {
    return {
      ...comp,
      tracks: comp.tracks.map((t) => {
        if (t.id !== targetTrackId) return t;
        return {
          ...t,
          inFrame: Math.max(0, t.inFrame + shiftFrames),
          outFrame: Math.max(1, t.outFrame + shiftFrames),
          propertyLanes: t.propertyLanes.map((lane) => ({
            ...lane,
            keyframes: lane.keyframes.map((k) => ({ ...k, frame: k.frame + shiftFrames })),
          })),
        };
      }),
    };
  }

  /**
   * Split Track at Playhead Frame (Razor Tool / ⌘K Split).
   */
  static splitTrackAtFrame(
    comp: UniversalComposition,
    targetTrackId: string,
    splitFrame: number
  ): UniversalComposition {
    const track = comp.tracks.find((t) => t.id === targetTrackId);
    if (!track || splitFrame <= track.inFrame || splitFrame >= track.outFrame) return comp;

    const leftTrack: UniversalTrack = {
      ...track,
      outFrame: splitFrame,
      propertyLanes: track.propertyLanes.map((lane) => ({
        ...lane,
        keyframes: lane.keyframes.filter((k) => k.frame <= splitFrame),
      })),
    };

    const rightTrack: UniversalTrack = {
      ...JSON.parse(JSON.stringify(track)),
      id: `${track.id}-split-${Date.now()}`,
      name: `${track.name} (Part 2)`,
      inFrame: splitFrame,
      propertyLanes: track.propertyLanes.map((lane) => ({
        ...lane,
        keyframes: lane.keyframes.filter((k) => k.frame >= splitFrame),
      })),
    };

    const idx = comp.tracks.findIndex((t) => t.id === targetTrackId);
    const newTracks = [...comp.tracks];
    newTracks.splice(idx, 1, leftTrack, rightTrack);

    return { ...comp, tracks: newTracks };
  }

  /**
   * Time Stretch / Compression: Rescales keyframe timing and speed multiplier.
   */
  static timeStretchTrack(
    comp: UniversalComposition,
    targetTrackId: string,
    scaleRatio: number // e.g. 0.5x (twice as fast), 2.0x (half speed)
  ): UniversalComposition {
    return {
      ...comp,
      tracks: comp.tracks.map((t) => {
        if (t.id !== targetTrackId) return t;
        const dur = t.outFrame - t.inFrame;
        const newDur = Math.max(1, Math.round(dur * scaleRatio));

        return {
          ...t,
          outFrame: t.inFrame + newDur,
          speedMultiplier: t.speedMultiplier * (1 / scaleRatio),
          propertyLanes: t.propertyLanes.map((lane) => ({
            ...lane,
            keyframes: lane.keyframes.map((k) => {
              const rel = k.frame - t.inFrame;
              return {
                ...k,
                frame: t.inFrame + Math.round(rel * scaleRatio),
              };
            }),
          })),
        };
      }),
    };
  }

  /**
   * Evaluates property values at current frame including hierarchical parent transformations.
   */
  static evaluateTrackPropertyAtFrame(
    track: UniversalTrack,
    propertyName: string,
    frame: number,
    comp: UniversalComposition
  ): number {
    const lane = track.propertyLanes.find((l) => l.propertyName === propertyName);
    if (!lane || lane.keyframes.length === 0) return lane?.currentValue || 0;

    const keys = [...lane.keyframes].sort((a, b) => a.frame - b.frame);
    if (frame <= keys[0].frame) return keys[0].value;
    if (frame >= keys[keys.length - 1].frame) return keys[keys.length - 1].value;

    // Find bounding keyframes
    let kA = keys[0];
    let kB = keys[1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (frame >= keys[i].frame && frame <= keys[i + 1].frame) {
        kA = keys[i];
        kB = keys[i + 1];
        break;
      }
    }

    const t = (frame - kA.frame) / (kB.frame - kA.frame || 1);

    // If hold interpolation
    if (kA.interpolation === 'hold') return kA.value;

    // Linear / Smooth Interpolation
    let localVal = kA.value + (kB.value - kA.value) * (kA.interpolation === 'linear' ? t : t * t * (3 - 2 * t));

    // Concatenate Parent Transform if parenting exists
    if (track.parentId) {
      const parent = comp.tracks.find((p) => p.id === track.parentId);
      if (parent) {
        const parentVal = this.evaluateTrackPropertyAtFrame(parent, propertyName, frame, comp);
        if (propertyName.startsWith('position')) {
          localVal += parentVal;
        } else if (propertyName.startsWith('scale')) {
          localVal *= (parentVal / 100);
        } else if (propertyName.startsWith('rotation')) {
          localVal += parentVal;
        }
      }
    }

    return localVal;
  }
}
