export interface MotionPackage {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'Presets' | 'VFX' | 'Typography' | 'Physics' | 'Transitions';
  rating: number;
  downloadCount: number;
  presetsCount: number;
  isInstalled: boolean;
}

export const SAMPLE_PACKAGES: MotionPackage[] = [
  {
    id: 'pkg-cyberpunk-vfx',
    name: 'Cyberpunk 2099 VFX Suite',
    version: '1.2.0',
    author: 'Motion Studio Labs',
    description: 'Neon glints, scanlines, matrix cipher reveals, and chromatic aberration filters.',
    category: 'VFX',
    rating: 4.9,
    downloadCount: 14200,
    presetsCount: 24,
    isInstalled: true,
  },
  {
    id: 'pkg-viral-captions',
    name: 'Viral Creators Caption Pack',
    version: '2.0.0',
    author: 'Social Motion Co',
    description: 'Hormozi yellow highlight boxes, MrBeast comic tilts, and TikTok karaoke sweeps.',
    category: 'Typography',
    rating: 5.0,
    downloadCount: 28500,
    presetsCount: 36,
    isInstalled: false,
  },
  {
    id: 'pkg-physics-materials',
    name: 'Real-World Elastic Physics Pack',
    version: '1.0.4',
    author: 'Dynamics Rigging',
    description: 'Soft jelly blob meshes, rubber bounces, and verlet cloth tearing presets.',
    category: 'Physics',
    rating: 4.8,
    downloadCount: 9800,
    presetsCount: 18,
    isInstalled: false,
  },
];

export class MotionPackageEngine {
  /**
   * Serializes package metadata and presets into a .motionpkg JSON string.
   */
  static exportPackage(pkg: MotionPackage): string {
    return JSON.stringify(pkg, null, 2);
  }

  /**
   * Deserializes a .motionpkg JSON string into a valid MotionPackage.
   */
  static importPackage(jsonStr: string): MotionPackage | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.id && parsed.name) {
        return parsed as MotionPackage;
      }
      return null;
    } catch {
      return null;
    }
  }
}
