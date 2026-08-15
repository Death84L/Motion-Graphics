import { CaptionSequence, CaptionSegment } from './captionModel';

function formatSrtTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

function formatVttTimestamp(seconds: number): string {
  return formatSrtTimestamp(seconds).replace(',', '.');
}

/**
 * Generates standard SubRip (.srt) subtitle text.
 */
export function generateSrtContent(captions: CaptionSegment[]): string {
  return captions
    .map((c, idx) => {
      const num = idx + 1;
      const time = `${formatSrtTimestamp(c.startSec)} --> ${formatSrtTimestamp(c.endSec)}`;
      return `${num}\n${time}\n${c.text}\n`;
    })
    .join('\n');
}

/**
 * Generates standard WebVTT (.vtt) text.
 */
export function generateVttContent(sequence: CaptionSequence): string {
  let output = `WEBVTT - ${sequence.name}\n\n`;

  sequence.captions.forEach((c, idx) => {
    output += `${idx + 1}\n`;
    output += `${formatVttTimestamp(c.startSec)} --> ${formatVttTimestamp(c.endSec)}\n`;
    output += `${c.text}\n\n`;
  });

  return output;
}

/**
 * Generates Advanced SubStation Alpha (.ass) with precise word-level karaoke tags.
 */
export function generateKaraokeAssContent(sequence: CaptionSequence): string {
  let output = `[Script Info]\nTitle: ${sequence.name}\nScriptType: v4.00+\n\n`;
  output += `[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, BackColour, Alignment\n`;
  output += `Style: Default,Inter,42,&H00FFFFFF,&H00000000,2\n\n`;
  output += `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

  sequence.captions.forEach((c) => {
    const start = formatVttTimestamp(c.startSec).slice(0, 10);
    const end = formatVttTimestamp(c.endSec).slice(0, 10);

    const karaokeWords = c.words
      .map((w) => {
        const centisecs = Math.round((w.endSec - w.startSec) * 100);
        return `{\\k${centisecs}}${w.text}`;
      })
      .join(' ');

    output += `Dialogue: 0,${start},${end},Default,,0,0,30,,${karaokeWords}\n`;
  });

  return output;
}
