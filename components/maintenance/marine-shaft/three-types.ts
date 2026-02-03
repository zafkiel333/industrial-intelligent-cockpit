
import * as THREE from 'three';

export interface ShaftAnimatables {
  propeller?: THREE.Mesh;
  shaft?: THREE.Mesh;
  flywheel?: THREE.Mesh;
  laserUnitEmitter?: THREE.Group;
  laserUnitReceiver?: THREE.Group;
  laserBeam?: THREE.Mesh;
  bearingAft?: THREE.Group; // Stern tube aft
  bearingFwd?: THREE.Group; // Stern tube fwd
  bearingInter?: THREE.Group; // Intermediate
  oilFilm?: THREE.Mesh;
}

export type ShaftMaintenancePhase = 
  | 'RUNNING'        // Normal operation
  | 'FAULT_VIB'      // High vibration detection
  | 'DIAGNOSIS'      // Orbit/Spectrum analysis
  | 'STOP_LOCK'      // Shaft stopped and locked
  | 'ALIGNMENT'      // Laser alignment process
  | 'REPAIR'         // Bearing replacement/adjustment
  | 'TEST_RUN';      // Verification
