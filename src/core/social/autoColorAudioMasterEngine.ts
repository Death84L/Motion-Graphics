import { SafeZonePlatform } from './extendedSocialReframeEngine';

export interface PlatformAudioSpec {
  targetLufs: number; // e.g. -14 LUFS
  maxTruePeakDb: number; // e.g. -1.0 dBTP
  recommendedBitrateKbps: number;
  sampleRateHz: number;
}

export interface CropSharpnessCompensation {
  zoomFactor: number;
  unsharpMaskAmount: number; // 0 to 100%
  contrastBoostPercent: number; // 0 to 25%
  filterCss: string;
}

export type ColorGradePreset = 'teal-orange-modern' | 'kodak-film-warm' | 'mkbhd-crisp-matte' | 'clean-studio-pop';

export interface ColorGradeResult {
  preset: ColorGradePreset;
  colorFilterCss: string;
  exposureCorrectionDb: number;
  colorTemperatureK: number;
  lutName: string;
}

export class AutoColorAudioMasterEngine {
  /**
   * Returns exact audio broadcast standard target specs per platform.
   */
  static getPlatformAudioSpec(platform: SafeZonePlatform): PlatformAudioSpec {
    switch (platform) {
      case 'tiktok':
      case 'youtube-shorts':
        return {
          targetLufs: -14.0,
          maxTruePeakDb: -1.0,
          recommendedBitrateKbps: 320,
          sampleRateHz: 48000,
        };
      case 'instagram-reels':
      default:
        return {
          targetLufs: -16.0,
          maxTruePeakDb: -1.5,
          recommendedBitrateKbps: 256,
          sampleRateHz: 44100,
        };
    }
  }

  /**
   * Calculates auto music ducking envelope (-14dB attenuation during active speech).
   */
  static computeMusicDuckingVolume(isSpeaking: boolean): number {
    return isSpeaking ? 0.18 : 0.85; // 0.18 ≈ -15dB ducked background music
  }

  /**
   * Calculates crop-aware sharpness compensation to prevent soft, pixelated visuals when punching into a 1080p source.
   */
  static solveCropSharpnessCompensation(zoomFactor: number): CropSharpnessCompensation {
    const clampedZoom = Math.max(1.0, zoomFactor);
    const excessZoom = clampedZoom - 1.0; // 0.0 to 1.5+

    const unsharpMask = Math.min(60, Math.round(excessZoom * 40));
    const contrastBoost = Math.min(18, Math.round(excessZoom * 12));

    const contrastVal = (100 + contrastBoost) / 100;
    const brightnessVal = 1.0 + excessZoom * 0.02;

    const filterCss = `contrast(${contrastVal.toFixed(2)}) brightness(${brightnessVal.toFixed(2)})`;

    return {
      zoomFactor: clampedZoom,
      unsharpMaskAmount: unsharpMask,
      contrastBoostPercent: contrastBoost,
      filterCss,
    };
  }

  /**
   * Generates 1-Click Shot Color Grading & 3D LUT simulation CSS.
   */
  static solveColorGrade(preset: ColorGradePreset): ColorGradeResult {
    switch (preset) {
      case 'teal-orange-modern':
        return {
          preset,
          colorFilterCss: 'contrast(1.12) saturate(1.25) hue-rotate(-6deg)',
          exposureCorrectionDb: 0.4,
          colorTemperatureK: 5600,
          lutName: 'Teal_Orange_Blockbuster_3D.cube',
        };
      case 'kodak-film-warm':
        return {
          preset,
          colorFilterCss: 'sepia(0.12) contrast(1.08) brightness(1.03) saturate(1.15)',
          exposureCorrectionDb: 0.2,
          colorTemperatureK: 5200,
          lutName: 'Kodak_2383_PrintStock.cube',
        };
      case 'mkbhd-crisp-matte':
        return {
          preset,
          colorFilterCss: 'contrast(1.2) brightness(0.96) saturate(1.1)',
          exposureCorrectionDb: -0.2,
          colorTemperatureK: 6500,
          lutName: 'Matte_Dark_Studio_Pro.cube',
        };
      case 'clean-studio-pop':
      default:
        return {
          preset: 'clean-studio-pop',
          colorFilterCss: 'contrast(1.08) brightness(1.04) saturate(1.18)',
          exposureCorrectionDb: 0.5,
          colorTemperatureK: 6000,
          lutName: 'Clean_Creator_Studio.cube',
        };
    }
  }
}
