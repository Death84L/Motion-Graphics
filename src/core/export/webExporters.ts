import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface WebExportOptions {
  fps?: number;
  durationSeconds?: number;
  propertyName?: string;
  className?: string;
  samplesCount?: number;
}

/**
 * 1. Generates standard CSS @keyframes with percentage stops and transform/opacity mappings.
 */
export function generateCssKeyframes(
  keyframes: KeyframePoint[],
  options: WebExportOptions = {}
): string {
  const { propertyName = 'transform: translateY', className = 'motion-curve-anim', durationSeconds = 1.2 } = options;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (sorted.length === 0) return '/* No keyframes to export */';

  const stops: string[] = [];
  const samples = 20;

  for (let i = 0; i <= samples; i++) {
    const pct = (i / samples) * 100;
    const val = evaluateGraphAtTime(sorted, pct);
    const formattedVal = propertyName.includes('translate')
      ? `${(val * 1.5).toFixed(1)}px`
      : propertyName.includes('rotate')
      ? `${val.toFixed(1)}deg`
      : propertyName.includes('scale')
      ? `${(val / 100).toFixed(2)}`
      : `${val.toFixed(1)}%`;

    stops.push(`  ${pct.toFixed(0)}% {\n    ${propertyName}(${formattedVal});\n  }`);
  }

  return `@keyframes ${className} {\n${stops.join('\n')}\n}\n\n.${className} {\n  animation: ${className} ${durationSeconds}s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;\n}`;
}

/**
 * 2. Generates modern CSS linear() Easing Function (CSS Easing Level 2).
 * e.g. `animation-timing-function: linear(0, 0.05 10%, 0.4 45%, 0.85 75%, 1);`
 */
export function generateCssLinearEasing(
  keyframes: KeyframePoint[],
  sampleCount = 15
): string {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (sorted.length === 0) return 'linear(0, 1)';

  const minV = sorted[0].value;
  const maxV = sorted[sorted.length - 1].value;
  const spanV = maxV - minV || 1;

  const points: string[] = [];
  for (let i = 0; i <= sampleCount; i++) {
    const t = (i / sampleCount) * 100;
    const rawVal = evaluateGraphAtTime(sorted, t);
    const normVal = (rawVal - minV) / spanV;
    const roundedNorm = Math.round(normVal * 1000) / 1000;
    const pct = Math.round((i / sampleCount) * 100);

    if (i === 0) {
      points.push(`${roundedNorm}`);
    } else if (i === sampleCount) {
      points.push(`${roundedNorm}`);
    } else {
      points.push(`${roundedNorm} ${pct}%`);
    }
  }

  return `/* CSS Easing Level 2 linear() Easing */\n--motion-ease: linear(\n  ${points.join(',\n  ')}\n);\n\n/* Usage */\ntransition: all 600ms var(--motion-ease);`;
}

/**
 * 3. Generates GSAP (GreenSock) CustomEase & timeline snippet.
 */
export function generateGsapSnippet(
  keyframes: KeyframePoint[],
  options: WebExportOptions = {}
): string {
  const { durationSeconds = 1.0, propertyName = 'y' } = options;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // Generate SVG path for CustomEase
  const pathParts: string[] = ['M0,0'];
  const samples = 10;
  const minV = sorted[0]?.value ?? 0;
  const maxV = sorted[sorted.length - 1]?.value ?? 100;
  const span = maxV - minV || 1;

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const val = evaluateGraphAtTime(sorted, t * 100);
    const normY = (val - minV) / span;
    pathParts.push(`L${t.toFixed(3)},${normY.toFixed(3)}`);
  }

  const svgPath = pathParts.join(' ');

  return `import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

// Register custom bezier ease curve
CustomEase.create("motionStudioCurve", "${svgPath}");

// Trigger GSAP Animation
gsap.to(".target-element", {
  ${propertyName}: 100,
  duration: ${durationSeconds},
  ease: "motionStudioCurve",
  repeat: -1,
  yoyo: true
});`;
}

/**
 * 4. Generates Framer Motion Transition snippet for React.
 */
export function generateFramerMotionSnippet(keyframes: KeyframePoint[]): string {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const k1 = sorted[0];
  const k2 = sorted[sorted.length - 1];

  // Normalized cubic bezier handles
  let x1 = 0.25, y1 = 0.1, x2 = 0.25, y2 = 1.0;
  if (k1 && k1.handleOut && k2 && k2.handleIn) {
    const dt = k2.time - k1.time || 100;
    const dv = k2.value - k1.value || 100;
    x1 = Math.max(0, Math.min(1, k1.handleOut.x / dt));
    y1 = Math.max(-0.5, Math.min(1.5, k1.handleOut.y / dv));
    x2 = Math.max(0, Math.min(1, 1 + k2.handleIn.x / dt));
    y2 = Math.max(-0.5, Math.min(1.5, 1 + k2.handleIn.y / dv));
  }

  return `// Framer Motion (React)
export const transitionConfig = {
  duration: 0.85,
  ease: [${x1.toFixed(3)}, ${y1.toFixed(3)}, ${x2.toFixed(3)}, ${y2.toFixed(3)}],
};

export const motionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: transitionConfig 
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};`;
}

/**
 * 5. Generates Lottie JSON compatible animation payload with Bézier in/out tangents.
 */
export function generateLottieJson(
  keyframes: KeyframePoint[],
  options: WebExportOptions = {}
): string {
  const { fps = 30, durationSeconds = 2.0 } = options;
  const totalFrames = Math.round(fps * durationSeconds);
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  const lottieKeyframes = sorted.map((k, i, arr) => {
    const frame = Math.round((k.time / 100) * totalFrames);
    const next = arr[i + 1];

    const kfObj: Record<string, unknown> = {
      t: frame,
      s: [k.value],
    };

    if (next) {
      const dt = next.time - k.time || 1;
      const dv = next.value - k.value || 1;
      const outX = k.handleOut ? Math.max(0, Math.min(1, k.handleOut.x / dt)) : 0.33;
      const outY = k.handleOut ? Math.max(0, Math.min(1, (k.handleOut.y / dv) + 0.5)) : 0.33;
      const inX = next.handleIn ? Math.max(0, Math.min(1, 1 + next.handleIn.x / dt)) : 0.67;
      const inY = next.handleIn ? Math.max(0, Math.min(1, (next.handleIn.y / dv) + 0.5)) : 0.67;

      kfObj.o = { x: [outX], y: [outY] };
      kfObj.i = { x: [inX], y: [inY] };
    }

    return kfObj;
  });

  const lottieDoc = {
    v: '5.7.4',
    fr: fps,
    ip: 0,
    op: totalFrames,
    w: 1920,
    h: 1080,
    nm: 'MotionStudio_Export',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Animated Layer',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [960, 540, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: lottieKeyframes,
          },
        },
        ao: 0,
        shapes: [],
        ip: 0,
        op: totalFrames,
        st: 0,
        bm: 0,
      },
    ],
  };

  return JSON.stringify(lottieDoc, null, 2);
}

/**
 * 6. Generates Web Animations API (WAAPI) keyframes.
 */
export function generateWaapiSnippet(
  keyframes: KeyframePoint[],
  options: WebExportOptions = {}
): string {
  const { durationSeconds = 1.0, propertyName = 'transform' } = options;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  const frames = sorted.map((k) => {
    const offset = Math.round((k.time / 100) * 1000) / 1000;
    return `  { offset: ${offset}, ${propertyName}: "translateY(${k.value.toFixed(1)}px)" }`;
  });

  return `// Web Animations API (WAAPI)
const element = document.querySelector('.motion-target');

const keyframes = [
${frames.join(',\n')}
];

const animation = element.animate(keyframes, {
  duration: ${Math.round(durationSeconds * 1000)}, // ms
  iterations: Infinity,
  direction: 'alternate',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
});`;
}

/**
 * 7. Generates Unity C# AnimationCurve code.
 */
export function generateUnityCurveCode(keyframes: KeyframePoint[]): string {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  const unityKeys = sorted.map((k) => {
    const timeNorm = (k.time / 100).toFixed(3) + 'f';
    const valNorm = (k.value / 100).toFixed(3) + 'f';
    const inTangent = k.handleIn ? (-k.handleIn.y / (k.handleIn.x || 1)).toFixed(3) + 'f' : '0f';
    const outTangent = k.handleOut ? (k.handleOut.y / (k.handleOut.x || 1)).toFixed(3) + 'f' : '0f';

    return `        new Keyframe(${timeNorm}, ${valNorm}, ${inTangent}, ${outTangent})`;
  });

  return `// Unity C# Script
using UnityEngine;

public class MotionStudioCurve : MonoBehaviour
{
    [SerializeField]
    public AnimationCurve motionCurve = new AnimationCurve(
${unityKeys.join(',\n')}
    );

    void Update()
    {
        float eval = motionCurve.Evaluate(Time.time % 1f);
        transform.position = new Vector3(transform.position.x, eval * 5f, transform.position.z);
    }
}`;
}

/**
 * 8. Generates Unreal Engine 5 UCurveFloat / FRichCurve JSON.
 */
export function generateUnrealRichCurve(keyframes: KeyframePoint[]): string {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  const ueKeys = sorted.map((k) => ({
    Time: Math.round((k.time / 100) * 1000) / 1000,
    Value: Math.round(k.value * 100) / 100,
    ArriveTangent: k.handleIn ? -k.handleIn.y / (k.handleIn.x || 1) : 0,
    LeaveTangent: k.handleOut ? k.handleOut.y / (k.handleOut.x || 1) : 0,
    InterpMode: 'RCIM_Cubic',
    TangentMode: 'RCTM_User',
  }));

  const ueAsset = {
    Type: 'CurveFloat',
    Name: 'MotionStudio_CurveAsset',
    Properties: {
      FloatCurve: {
        Keys: ueKeys,
        PreInfinityExtrap: 'RCCE_Constant',
        PostInfinityExtrap: 'RCCE_Cycle',
      },
    },
  };

  return JSON.stringify(ueAsset, null, 2);
}
