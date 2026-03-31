export interface MicroseismicEvent {
  id: string;
  timestamp: string;
  magnitude: number;
  location: [number, number, number];
  energy: number;
}

export interface DamGalleryData {
  ambientVibration: number;
  eventCount24h: number;
  maxMagnitude: number;
  sensorStatus: 'normal' | 'warning' | 'error';
}
