import React, { useMemo } from 'react';
import { GraphViewport } from '../../types';
import {
  AudioWaveformConfig,
  generateWaveformData,
  DEFAULT_AUDIO_CONFIG,
} from '../../../../core/audio/waveformGenerator';

interface CanvasAudioWaveformProps {
  viewport: GraphViewport;
  width: number;
  height: number;
  config?: AudioWaveformConfig;
  enabled?: boolean;
}

export function CanvasAudioWaveform({
  viewport,
  width,
  height,
  config = DEFAULT_AUDIO_CONFIG,
  enabled = true,
}: CanvasAudioWaveformProps) {
  const samples = useMemo(() => generateWaveformData(config), [config]);

  if (!enabled) return null;

  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const centerY = height * 0.85; // Align waveform at the bottom area of canvas
  const maxAmpHeight = height * 0.22 * config.volume;

  // Generate waveform polygon / bars
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];

  samples.forEach((s) => {
    const x = timeToX(s.time);
    const ampPx = s.amplitude * maxAmpHeight;
    topPoints.push(`${x.toFixed(1)},${(centerY - ampPx).toFixed(1)}`);
    bottomPoints.unshift(`${x.toFixed(1)},${(centerY + ampPx * 0.5).toFixed(1)}`);
  });

  const polygonPath = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;

  return (
    <g className="canvas-audio-waveform" style={{ pointerEvents: 'none' }}>
      {/* Background Glow */}
      <path
        d={polygonPath}
        fill="url(#audioWaveGradient)"
        opacity={config.opacity}
      />

      {/* Waveform Outline */}
      <path
        d={`M ${topPoints.join(' L ')}`}
        fill="none"
        stroke={config.color}
        strokeWidth={1.2}
        opacity={config.opacity * 1.5}
      />

      {/* Transients / Beat hit markers */}
      {config.showTransients &&
        samples
          .filter((s) => s.transient)
          .map((s, idx) => {
            const x = timeToX(s.time);
            return (
              <line
                key={`transient-${idx}`}
                x1={x}
                y1={centerY - maxAmpHeight - 6}
                x2={x}
                y2={centerY + maxAmpHeight * 0.5 + 4}
                stroke="#f43f5e"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.6}
              />
            );
          })}

      {/* Audio Wave Gradient */}
      <defs>
        <linearGradient id="audioWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={config.color} stopOpacity={0.6} />
          <stop offset="50%" stopColor={config.color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={config.color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
    </g>
  );
}
