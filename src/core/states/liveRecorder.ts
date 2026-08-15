import { KeyframePoint } from '../../features/graph-editor/types';
import { fitStrokeToBezierKeyframes } from '../math/bezierFitting';

export interface LiveRecordedSample {
  timestampMs: number;
  timeFrame: number;
  value: number;
}

/**
 * Manages live real-time motion capture recording from mouse, MIDI, or gamepad gesture.
 */
export class LiveMotionRecorder {
  private samples: LiveRecordedSample[] = [];
  public isRecording = false;
  private startTimestamp = 0;

  public startRecording(currentFrame: number, initialValue: number): void {
    this.samples = [{ timestampMs: 0, timeFrame: currentFrame, value: initialValue }];
    this.isRecording = true;
    this.startTimestamp = performance.now();
  }

  public recordSample(currentFrame: number, value: number): void {
    if (!this.isRecording) return;
    this.samples.push({
      timestampMs: performance.now() - this.startTimestamp,
      timeFrame: currentFrame,
      value,
    });
  }

  public stopRecording(simplificationTolerance = 1.5): KeyframePoint[] {
    this.isRecording = false;
    if (this.samples.length < 2) return [];

    const stroke = this.samples.map((s) => ({
      time: s.timeFrame,
      value: s.value,
    }));

    return fitStrokeToBezierKeyframes(stroke, simplificationTolerance);
  }
}
