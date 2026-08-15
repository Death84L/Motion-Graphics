export interface GraphBookmark {
  id: string;
  name: string;
  time: number;
  color: string;
}

export interface GraphRegion {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
  color: string;
}

export const DEFAULT_BOOKMARKS: GraphBookmark[] = [
  { id: 'bm-intro', name: 'Intro Anticipation', time: 10, color: '#38bdf8' },
  { id: 'bm-impact', name: 'Peak Impact', time: 40, color: '#ec4899' },
  { id: 'bm-settle', name: 'Settle / Rest', time: 80, color: '#10b981' },
];

export const DEFAULT_REGIONS: GraphRegion[] = [
  { id: 'reg-lead', name: 'LEAD IN', startFrame: 0, endFrame: 25, color: '#38bdf8' },
  { id: 'reg-apex', name: 'APEX MOTION', startFrame: 25, endFrame: 70, color: '#a855f7' },
  { id: 'reg-settle', name: 'SETTLE', startFrame: 70, endFrame: 100, color: '#10b981' },
];
