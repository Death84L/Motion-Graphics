import { KeyframePoint } from '../../features/graph-editor/types';
import { PremiereAdapter, PremiereProperty } from '../premiere/PremiereAdapter';

export interface UxpApplyResult {
  success: boolean;
  message: string;
}

export class UxpBridge {
  /**
   * Checks if the app is currently running inside the Adobe UXP environment.
   */
  static isRunningInUxp(): boolean {
    return (
      typeof window !== 'undefined' &&
      // @ts-ignore
      (Boolean((window as any).uxp) || Boolean((window as any).require && (window as any).require('uxp')))
    );
  }

  /**
   * Directly applies keyframes to the selected clip in Premiere Pro via UXP ExtendScript.
   */
  static async applyToPremiereClip(
    keyframes: KeyframePoint[],
    options: {
      property: PremiereProperty;
      fps: number;
      durationFrames: number;
    }
  ): Promise<UxpApplyResult> {
    const isUxp = this.isRunningInUxp();

    if (!isUxp) {
      // In web browser mode, copy to clipboard as fallback
      const clipText = PremiereAdapter.generateAdobeClipboard(keyframes, options);
      try {
        await navigator.clipboard.writeText(clipText);
        return {
          success: true,
          message: 'Copied keyframe data to clipboard! Paste directly in Premiere (Cmd+V / Ctrl+V).',
        };
      } catch (e) {
        return {
          success: false,
          message: 'Clipboard permission error. Please copy manually from the Export modal.',
        };
      }
    }

    try {
      // @ts-ignore
      const ppro = (window as any).require ? (window as any).require('premierepro') : null;
      const script = PremiereAdapter.generateExtendScript(keyframes, options);

      if (ppro && ppro.executeExtendScript) {
        const result = await ppro.executeExtendScript(script);
        return {
          success: true,
          message: `Successfully applied keyframes to selected clip! ${result || ''}`,
        };
      } else {
        // Evaluate via window eval if available in UXP
        // @ts-ignore
        if (typeof (window as any).eval === 'function') {
          // @ts-ignore
          (window as any).eval(script);
          return {
            success: true,
            message: 'Applied keyframes to Premiere Pro clip.',
          };
        }
      }

      return {
        success: false,
        message: 'Could not communicate with Premiere Pro UXP script engine.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `UXP Error: ${err?.message || 'Unknown error'}`,
      };
    }
  }
}
