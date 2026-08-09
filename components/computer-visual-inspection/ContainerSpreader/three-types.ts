export interface SpreaderState {
  lockStatus: 'locked' | 'unlocked' | 'transitioning';
  loadWeight: number; // tons
  twistlockWear: number; // 0 to 1
  alignmentError: { x: number; y: number }; // mm
}
