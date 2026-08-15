import { KeyframePoint, PreviewProperty } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type PremiereProperty = 'Position' | 'Scale' | 'Rotation' | 'Opacity';

export interface PremiereExportOptions {
  fps: number;
  durationFrames: number;
  property: PremiereProperty;
  compWidth?: number;
  compHeight?: number;
}

export class PremiereAdapter {
  /**
   * Generates standard Adobe Keyframe Clipboard text format.
   * This format is supported natively by Adobe Premiere Pro and After Effects for copy-pasting.
   */
  static generateAdobeClipboard(
    keyframes: KeyframePoint[],
    options: PremiereExportOptions
  ): string {
    const { fps, durationFrames, property, compWidth = 1920, compHeight = 1080 } = options;

    const lines: string[] = [
      'Adobe After Effects 8.0 Keyframe Data',
      '',
      `\tUnits Per Second\t${fps}`,
      `\tSource Width\t${compWidth}`,
      `\tSource Height\t${compHeight}`,
      '\tSource Pixel Aspect Ratio\t1',
      '\tComp Pixel Aspect Ratio\t1',
      '',
    ];

    if (property === 'Position') {
      lines.push('Transform\tPosition');
      lines.push('\tFrame\tX pixels\tY pixels\tZ pixels');

      keyframes.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        // Map 0-100 value to screen coordinates
        const xPos = ((kf.value / 100) * compWidth).toFixed(1);
        const yPos = (compHeight / 2).toFixed(1);
        lines.push(`\t${frame}\t${xPos}\t${yPos}\t0`);
      });
    } else if (property === 'Scale') {
      lines.push('Transform\tScale');
      lines.push('\tFrame\tX percent\tY percent\tZ percent');

      keyframes.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const scaleVal = kf.value.toFixed(1);
        lines.push(`\t${frame}\t${scaleVal}\t${scaleVal}\t100`);
      });
    } else if (property === 'Rotation') {
      lines.push('Transform\tRotation');
      lines.push('\tFrame\tdegrees');

      keyframes.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const deg = ((kf.value / 100) * 360).toFixed(1);
        lines.push(`\t${frame}\t${deg}`);
      });
    } else if (property === 'Opacity') {
      lines.push('Transform\tOpacity');
      lines.push('\tFrame\tpercent');

      keyframes.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const opVal = Math.max(0, Math.min(100, kf.value)).toFixed(1);
        lines.push(`\t${frame}\t${opVal}`);
      });
    }

    lines.push('', 'End of Keyframe Data');
    return lines.join('\n');
  }

  /**
   * Generates an ExtendScript (.jsx) file to programmatically apply keyframes to active Premiere sequence.
   */
  static generateExtendScript(
    keyframes: KeyframePoint[],
    options: PremiereExportOptions
  ): string {
    const { fps, property, durationFrames } = options;

    return `// Motion Studio ExtendScript for Adobe Premiere Pro
(function() {
  if (!app.project || !app.project.activeSequence) {
    alert("Please open a project and select an active sequence in Premiere Pro.");
    return;
  }

  var seq = app.project.activeSequence;
  var track = seq.videoTracks[0];
  if (!track || track.clips.numItems === 0) {
    alert("No clips found on Video Track 1.");
    return;
  }

  var clip = track.clips[0];
  var components = clip.components;
  
  // Motion component
  for (var i = 0; i < components.numItems; i++) {
    var comp = components[i];
    if (comp.displayName === "Motion" || comp.matchName === "AE.ADBE Motion") {
      for (var p = 0; p < comp.properties.numItems; p++) {
        var prop = comp.properties[p];
        if (prop.displayName.indexOf("${property}") !== -1) {
          prop.setTimeVarying(true);
          
          // Insert keyframes
          var keyData = ${JSON.stringify(keyframes)};
          var totalDuration = ${durationFrames} / ${fps};
          
          for (var k = 0; k < keyData.length; k++) {
            var kf = keyData[k];
            var timeSec = (kf.time / 100) * totalDuration;
            prop.addKey(timeSec);
            prop.setValueAtKey(timeSec, kf.value, true);
          }
          
          alert("Successfully applied " + keyData.length + " keyframes to " + prop.displayName + "!");
          return;
        }
      }
    }
  }
})();
`;
  }
}
