export interface ColorWheelsConfig {
  lift: { r: number; g: number; b: number; luma: number }; // Shadows (-1.0 to +1.0)
  gamma: { r: number; g: number; b: number; luma: number }; // Midtones (0.1 to 3.0, default 1.0)
  gain: { r: number; g: number; b: number; luma: number }; // Highlights (0.0 to 4.0, default 1.0)
  offset: { r: number; g: number; b: number; luma: number }; // Master offset (-1.0 to +1.0)
}

export type FilmStockPreset = 'kodak-2383' | 'fuji-3513' | 'cinematic-teal-orange' | 'vintage-polaroid';

export class ColorScienceEngine {
  /**
   * Evaluates pixel RGB color grading through standard 3-Way Color Wheels (Lift, Gamma, Gain, Offset).
   * Formula: Out = Gain * (Lift * (1 - In) + In)^(1 / Gamma) + Offset
   */
  static applyColorWheels(
    r: number,
    g: number,
    b: number,
    wheels: ColorWheelsConfig
  ): { r: number; g: number; b: number } {
    // Normalize to 0.0 - 1.0
    const inR = Math.max(0, Math.min(1, r / 255));
    const inG = Math.max(0, Math.min(1, g / 255));
    const inB = Math.max(0, Math.min(1, b / 255));

    // Lift
    const lR = inR + wheels.lift.r * 0.2 * (1 - inR);
    const lG = inG + wheels.lift.g * 0.2 * (1 - inG);
    const lB = inB + wheels.lift.b * 0.2 * (1 - inB);

    // Gamma
    const gR = Math.pow(Math.max(0, lR), 1 / Math.max(0.1, wheels.gamma.r));
    const gG = Math.pow(Math.max(0, lG), 1 / Math.max(0.1, wheels.gamma.g));
    const gB = Math.pow(Math.max(0, lB), 1 / Math.max(0.1, wheels.gamma.b));

    // Gain & Offset
    const outR = Math.max(0, Math.min(1, gR * wheels.gain.r + wheels.offset.r * 0.1));
    const outG = Math.max(0, Math.min(1, gG * wheels.gain.g + wheels.offset.g * 0.1));
    const outB = Math.max(0, Math.min(1, gB * wheels.gain.b + wheels.offset.b * 0.1));

    return {
      r: Math.round(outR * 255),
      g: Math.round(outG * 255),
      b: Math.round(outB * 255),
    };
  }

  /**
   * Applies Classic Film Stock Print Emulation (Kodak 2383 / Fuji 3513).
   */
  static applyFilmEmulation(
    r: number,
    g: number,
    b: number,
    preset: FilmStockPreset
  ): { r: number; g: number; b: number } {
    const nr = r / 255;
    const ng = g / 255;
    const nb = b / 255;

    let fr = nr;
    let fg = ng;
    let fb = nb;

    switch (preset) {
      case 'kodak-2383':
        // High density blacks, rich golden highlights, characteristic Kodak S-curve
        fr = Math.pow(nr, 1.2) * 1.05;
        fg = Math.pow(ng, 1.15) * 0.98;
        fb = Math.pow(nb, 1.3) * 0.92;
        break;

      case 'fuji-3513':
        // Emerald green shadows, cool highlights, soft roll-off
        fr = Math.pow(nr, 1.1) * 0.95;
        fg = Math.pow(ng, 1.05) * 1.04;
        fb = Math.pow(nb, 1.2) * 1.02;
        break;

      case 'cinematic-teal-orange':
        // Teal in shadows, warm orange in skin highlights
        fr = nr > 0.5 ? nr * 1.1 : nr * 0.85;
        fg = ng * 0.98;
        fb = nr < 0.5 ? nb * 1.2 : nb * 0.8;
        break;

      case 'vintage-polaroid':
        // Lifted cyan shadows, warm yellow tint
        fr = nr * 1.05 + 0.05;
        fg = ng * 1.02 + 0.03;
        fb = nb * 0.85 + 0.08;
        break;
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(fr * 255))),
      g: Math.max(0, Math.min(255, Math.round(fg * 255))),
      b: Math.max(0, Math.min(255, Math.round(fb * 255))),
    };
  }

  /**
   * Generates a standard Adobe / DaVinci Resolve .cube 3D LUT file string.
   */
  static generate3dCubeLut(
    lutSize = 17,
    title = 'MotionStudio_Custom_Grade',
    transform: (r: number, g: number, b: number) => { r: number; g: number; b: number }
  ): string {
    let cube = `# Motion Studio Universal 3D LUT Generator\n`;
    cube += `TITLE "${title}"\n`;
    cube += `LUT_3D_SIZE ${lutSize}\n\n`;

    for (let b = 0; b < lutSize; b++) {
      for (let g = 0; g < lutSize; g++) {
        for (let r = 0; r < lutSize; r++) {
          const inR = Math.round((r / (lutSize - 1)) * 255);
          const inG = Math.round((g / (lutSize - 1)) * 255);
          const inB = Math.round((b / (lutSize - 1)) * 255);

          const out = transform(inR, inG, inB);
          const outR = (out.r / 255).toFixed(6);
          const outG = (out.g / 255).toFixed(6);
          const outB = (out.b / 255).toFixed(6);

          cube += `${outR} ${outG} ${outB}\n`;
        }
      }
    }

    return cube;
  }

  /**
   * False Color Exposure Map Conversion
   * Maps luminance IRE values to standard false color gradients (Purple = Under, Green = 18% Gray, Pink = Skin, Red = Clipped).
   */
  static getFalseColor(r: number, g: number, b: number): { r: number; g: number; b: number } {
    // Rec.709 Luminance
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const ire = luma * 100;

    if (ire >= 98) return { r: 255, g: 0, b: 0 }; // Red = Clipped highlights
    if (ire >= 70 && ire <= 75) return { r: 255, g: 200, b: 200 }; // Pink = Caucasian skin highlights
    if (ire >= 50 && ire <= 55) return { r: 160, g: 120, b: 90 }; // Brown = Dark skin
    if (ire >= 38 && ire <= 42) return { r: 0, g: 255, b: 0 }; // Green = 18% Neutral Gray
    if (ire <= 4) return { r: 128, g: 0, b: 128 }; // Purple = Crushed shadows

    // Gray for neutral
    const gVal = Math.round(luma * 180);
    return { r: gVal, g: gVal, b: gVal };
  }
}
