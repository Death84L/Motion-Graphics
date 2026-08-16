import { SocialTargetFormat, MediaFitMode, ProceduralBackdropStyle } from './extendedSocialReframeEngine';
import { DeviceMockupType } from './zeroCutoffEngine';
import { RetentionHookStyle } from './viralRetentionEngine';

export interface ProStudioPreset {
  id: string;
  name: string;
  creatorTag: string;
  badgeColor: string;
  description: string;
  targetFormat: SocialTargetFormat;
  fitMode: MediaFitMode;
  deviceMockup: DeviceMockupType;
  backdropStyle: ProceduralBackdropStyle;
  hookStyle: RetentionHookStyle;
  hookHeadline: string;
  progressBarColor: string;
  depthIntensity: number;
  zoomPunchIn: boolean;
  pacingSpeed: 'Cinematic' | 'Balanced' | 'Hyper-Paced';
  captionStyle: 'Hormozi Kinetic' | 'MrBeast Impact' | 'Ali Abdaal Clean' | 'Cyberpunk Neon';
}

export const PRO_STUDIO_PRESETS: ProStudioPreset[] = [
  {
    id: 'hormozi-viral',
    name: 'Hormozi Viral Machine',
    creatorTag: 'HIGH CTR / RETENTION',
    badgeColor: '#fde047',
    description: 'High-contrast bold yellow retention card, +8% zoom punch, dynamic 2.5D pop, and kinetic karaoke captions.',
    targetFormat: '9:16-reels',
    fitMode: 'smart-ambient-fit',
    deviceMockup: 'none',
    backdropStyle: 'ambient-color-glow',
    hookStyle: 'viral-yellow',
    hookHeadline: 'How to scale from $0 to $100K/Mo in 60 Days 🚀',
    progressBarColor: '#fde047',
    depthIntensity: 1.4,
    zoomPunchIn: true,
    pacingSpeed: 'Hyper-Paced',
    captionStyle: 'Hormozi Kinetic',
  },
  {
    id: 'ali-abdaal-aesthetic',
    name: 'Ali Abdaal Studio Aesthetic',
    creatorTag: 'CLEAN & SOPHISTICATED',
    badgeColor: '#10b981',
    description: 'Minimal slate gradient, subtle 2.5D optical breathing, glassmorphic elevated container, and elegant typography.',
    targetFormat: '9:16-reels',
    fitMode: 'elevated-card',
    deviceMockup: 'elevated-card',
    backdropStyle: 'clean-minimal-slate',
    hookStyle: 'clean-minimal-white',
    hookHeadline: 'The 3 Systems That Changed How I Work ☕',
    progressBarColor: '#10b981',
    depthIntensity: 0.8,
    zoomPunchIn: false,
    pacingSpeed: 'Balanced',
    captionStyle: 'Ali Abdaal Clean',
  },
  {
    id: 'mrbeast-hyper-pace',
    name: 'MrBeast Hyper-Velocity',
    creatorTag: 'MAXIMUM AUDIENCE HOOK',
    badgeColor: '#ec4899',
    description: 'Action-velocity tracking, continuous neon progress line, fast pan sweeps, and high-impact captions.',
    targetFormat: '9:16-reels',
    fitMode: 'ken-burns-scan',
    deviceMockup: 'none',
    backdropStyle: 'cyberpunk-gradient',
    hookStyle: 'cyberpunk-neon',
    hookHeadline: 'I Survived 100 Hours In A Desert Island! 🏝️',
    progressBarColor: '#ec4899',
    depthIntensity: 1.8,
    zoomPunchIn: true,
    pacingSpeed: 'Hyper-Paced',
    captionStyle: 'MrBeast Impact',
  },
  {
    id: 'mkbhd-crisp-tech',
    name: 'MKBHD Matte Dark Studio',
    creatorTag: '4K MATTE CINEMATIC',
    badgeColor: '#38bdf8',
    description: 'Studio dark radial spotlight, glassmorphic smartphone frame, color-matched ambient bloom, and vector-sharp text.',
    targetFormat: '9:16-reels',
    fitMode: 'smart-ambient-fit',
    deviceMockup: 'glass-smartphone',
    backdropStyle: 'studio-dark-radial',
    hookStyle: 'cyberpunk-neon',
    hookHeadline: 'Is This The Ultimate Smartphone Of 2026? 📱',
    progressBarColor: '#38bdf8',
    depthIntensity: 1.2,
    zoomPunchIn: false,
    pacingSpeed: 'Cinematic',
    captionStyle: 'Cyberpunk Neon',
  },
  {
    id: 'podcast-duplex-pro',
    name: 'Lex & Rogan Podcast Duplex',
    creatorTag: 'MULTI-SPEAKER INTERVIEW',
    badgeColor: '#a855f7',
    description: '50/50 dual vertical split, active speaker tracking, cyan neon divider line, and audio waveform reaction.',
    targetFormat: '9:16-reels',
    fitMode: 'stacked-duplex',
    deviceMockup: 'none',
    backdropStyle: 'ambient-color-glow',
    hookStyle: 'viral-yellow',
    hookHeadline: 'The Truth About Artificial Superintelligence 🧠',
    progressBarColor: '#a855f7',
    depthIntensity: 1.0,
    zoomPunchIn: false,
    pacingSpeed: 'Balanced',
    captionStyle: 'Hormozi Kinetic',
  },
  {
    id: 'widescreen-master-16-9',
    name: 'YouTube 4K Widescreen Master',
    creatorTag: 'VERTICAL ➔ HORIZONTAL',
    badgeColor: '#f59e0b',
    description: 'Converts vertical 9:16 Shorts to full 16:9 widescreen with tri-mirror side pillar infill and stats sidebar.',
    targetFormat: '16:9-landscape',
    fitMode: 'smart-ambient-fit',
    deviceMockup: 'none',
    backdropStyle: 'studio-dark-radial',
    hookStyle: 'luxury-gold',
    hookHeadline: 'Complete Breakdown: Zero To Scale 📊',
    progressBarColor: '#f59e0b',
    depthIntensity: 1.0,
    zoomPunchIn: false,
    pacingSpeed: 'Cinematic',
    captionStyle: 'Ali Abdaal Clean',
  },
];
