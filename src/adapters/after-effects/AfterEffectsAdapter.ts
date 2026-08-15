import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type AfterEffectsProperty =
  | 'Position'
  | 'Scale'
  | 'Rotation'
  | 'Opacity'
  | 'Anchor Point'
  | 'Slider Control';

export interface AfterEffectsExportOptions {
  fps: number;
  durationFrames: number;
  property: AfterEffectsProperty;
  compWidth?: number;
  compHeight?: number;
}

export class AfterEffectsAdapter {
  /**
   * Generates standard Adobe After Effects 8.0 Keyframe Data format.
   * Pastes natively onto selected layers/properties in After Effects (Cmd+V / Ctrl+V).
   */
  static generateClipboardData(
    keyframes: KeyframePoint[],
    options: AfterEffectsExportOptions
  ): string {
    const { fps, durationFrames, property, compWidth = 1920, compHeight = 1080 } = options;
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

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
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const xPos = ((kf.value / 100) * compWidth).toFixed(2);
        const yPos = (compHeight / 2).toFixed(2);
        lines.push(`\t${frame}\t${xPos}\t${yPos}\t0`);
      });
    } else if (property === 'Scale') {
      lines.push('Transform\tScale');
      lines.push('\tFrame\tX percent\tY percent\tZ percent');
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const scaleVal = kf.value.toFixed(2);
        lines.push(`\t${frame}\t${scaleVal}\t${scaleVal}\t100`);
      });
    } else if (property === 'Rotation') {
      lines.push('Transform\tRotation');
      lines.push('\tFrame\tdegrees');
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const deg = ((kf.value / 100) * 360).toFixed(2);
        lines.push(`\t${frame}\t${deg}`);
      });
    } else if (property === 'Opacity') {
      lines.push('Transform\tOpacity');
      lines.push('\tFrame\tpercent');
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const opVal = Math.max(0, Math.min(100, kf.value)).toFixed(2);
        lines.push(`\t${frame}\t${opVal}`);
      });
    } else if (property === 'Anchor Point') {
      lines.push('Transform\tAnchor Point');
      lines.push('\tFrame\tX pixels\tY pixels\tZ pixels');
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        const xPos = ((kf.value / 100) * compWidth).toFixed(2);
        const yPos = (compHeight / 2).toFixed(2);
        lines.push(`\t${frame}\t${xPos}\t${yPos}\t0`);
      });
    } else {
      // Slider / generic
      lines.push('Effects\tSlider Control\tSlider');
      lines.push('\tFrame\t');
      sorted.forEach((kf) => {
        const frame = Math.round((kf.time / 100) * durationFrames);
        lines.push(`\t${frame}\t${kf.value.toFixed(2)}`);
      });
    }

    lines.push('', 'End of Keyframe Data');
    return lines.join('\n');
  }

  /**
   * Generates a native After Effects Expression (Alt+Click on any stopwatch).
   */
  static generateExpression(
    keyframes: KeyframePoint[],
    options: AfterEffectsExportOptions
  ): string {
    const { fps, durationFrames, property } = options;
    const totalDurationSec = (durationFrames / fps).toFixed(3);
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

    // Sample the curve points for instant evaluation inside AE
    const samplePoints: { t: number; v: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const timePercent = (i / 40) * 100;
      const val = evaluateGraphAtTime(sorted, timePercent);
      samplePoints.push({
        t: Number(((timePercent / 100) * (durationFrames / fps)).toFixed(3)),
        v: Number(val.toFixed(2)),
      });
    }

    return `// Motion Studio Graph Expression for After Effects
// Paste into property: ${property} (Alt+Click stopwatch)
var duration = ${totalDurationSec}; // total animation length in seconds
var loopAnimation = true;

var t = time % duration;
var curveData = ${JSON.stringify(samplePoints)};

function evaluateCurve(curT) {
  if (curT <= curveData[0].t) return curveData[0].v;
  if (curT >= curveData[curveData.length - 1].t) return curveData[curveData.length - 1].v;
  
  for (var i = 0; i < curveData.length - 1; i++) {
    var p1 = curveData[i];
    var p2 = curveData[i + 1];
    if (curT >= p1.t && curT <= p2.t) {
      var progress = (curT - p1.t) / (p2.t - p1.t);
      return p1.v + progress * (p2.v - p1.v);
    }
  }
  return curveData[curveData.length - 1].v;
}

var curveVal = evaluateCurve(t);

${
  property === 'Position'
    ? 'var startPos = value;\n[startPos[0] + (curveVal - 50) * 10, startPos[1], startPos[2] || 0];'
    : property === 'Scale'
    ? '[curveVal, curveVal];'
    : property === 'Rotation'
    ? 'curveVal * 3.6;'
    : property === 'Opacity'
    ? 'clamp(curveVal, 0, 100);'
    : 'curveVal;'
}
`;
  }

  /**
   * Generates ExtendScript (.jsx) for After Effects.
   */
  static generateExtendScript(
    keyframes: KeyframePoint[],
    options: AfterEffectsExportOptions
  ): string {
    const { fps, durationFrames, property } = options;
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

    return `// Motion Studio Script for Adobe After Effects
(function() {
  app.beginUndoGroup("Apply Motion Studio Keyframes");
  
  var comp = app.project.activeItem;
  if (!(comp instanceof CompItem)) {
    alert("Please select an active composition in After Effects.");
    return;
  }
  
  var selectedLayers = comp.selectedLayers;
  if (selectedLayers.length === 0) {
    alert("Please select at least one layer in the timeline.");
    return;
  }
  
  var keyData = ${JSON.stringify(sorted)};
  var durationSec = ${durationFrames} / ${fps};
  var propName = "${property}";
  
  for (var l = 0; l < selectedLayers.length; l++) {
    var layer = selectedLayers[l];
    var targetProp = null;
    
    if (propName === "Position") targetProp = layer.transform.position;
    else if (propName === "Scale") targetProp = layer.transform.scale;
    else if (propName === "Rotation") targetProp = layer.transform.rotation;
    else if (propName === "Opacity") targetProp = layer.transform.opacity;
    else if (propName === "Anchor Point") targetProp = layer.transform.anchorPoint;
    
    if (targetProp && targetProp.canSetHoldValue !== undefined) {
      for (var k = 0; k < keyData.length; k++) {
        var kf = keyData[k];
        var keyTime = (kf.time / 100) * durationSec;
        
        var val;
        if (propName === "Position" || propName === "Anchor Point") {
          val = [ (kf.value / 100) * comp.width, comp.height / 2, 0 ];
        } else if (propName === "Scale") {
          val = [ kf.value, kf.value, 100 ];
        } else if (propName === "Rotation") {
          val = (kf.value / 100) * 360;
        } else {
          val = kf.value;
        }
        
        targetProp.setValueAtTime(keyTime, val);
      }
    }
  }
  
  app.endUndoGroup();
  alert("Successfully applied " + keyData.length + " keyframes to " + selectedLayers.length + " layer(s)!");
})();
`;
  }
}
