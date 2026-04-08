export interface InverterState {
  doorOpen: boolean;
  igbtRemoved: boolean;
  newIgbtInstalled: boolean;
  testing: boolean;
  testResult: 'none' | 'pass' | 'fail';
}
