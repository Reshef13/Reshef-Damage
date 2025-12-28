export interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

export enum AppState {
  LOADING = 'LOADING',
  READY_TO_ENTER = 'READY_TO_ENTER',
  ENTERED = 'ENTERED',
  VIDEO_PLAYER = 'VIDEO_PLAYER',
  MUSIC_PLAYER = 'MUSIC_PLAYER'
}