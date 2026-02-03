
import * as THREE from 'three';

export interface GeoAnimatables {
  oreVoxels?: THREE.InstancedMesh;
  boreholes?: THREE.Group;
  scannerPlane?: THREE.Mesh;
  faultLines?: THREE.Group;
  gridFloor?: THREE.GridHelper;
  dataParticles?: THREE.Points;
  
  // Transport Delivery
  mtdHoistSheaves?: THREE.Group[];
  mtdSkip?: THREE.Group;
  mtdConveyorBelt?: THREE.Mesh;
  mtdConveyorFlow?: THREE.Points;
  mtdTrucks?: { mesh: THREE.Group, path: THREE.CatmullRomCurve3, t: number, speed: number }[];
  
  // Mine Construction Delivery
  mcdPitModel?: THREE.Group;
  mcdLayers?: THREE.Group[];
  mcdScanPlane?: THREE.Mesh;
  mcdDataPoints?: THREE.Points;
  
  // Mine BIM Delivery
  mbdOreBody?: THREE.InstancedMesh;
  mbdTunnels?: THREE.Group;
  mbdScanner?: THREE.Mesh;
  mbdGrid?: THREE.GridHelper;
  mbdParticles?: THREE.Points;
  
  // Mine Process Delivery
  mpdShearer?: THREE.Group;
  mpdSupports?: THREE.Group[];
  mpdConveyor?: THREE.Mesh;
  mpdLogicFlow?: THREE.Points;
  
  // Mine Processing Delivery
  mppdCyclones?: THREE.Group[];
  mppdScreens?: THREE.Group[];
  mppdFlowParticles?: THREE.Points;
  mppdScanBeam?: THREE.Mesh;
  
  // Mine Equip Lifecycle Delivery
  meldTruckParts?: {
    chassis: THREE.Group;
    bed: THREE.Group;
    wheels: THREE.Group[];
    engine: THREE.Group;
    cab: THREE.Group;
  };
  meldHologramGrid?: THREE.GridHelper;
  meldDataStream?: THREE.Points;
  
  // Mine Safety Delivery
  msdSensors?: { mesh: THREE.Group; type: string }[];
  msdGasCloud?: THREE.Points;
  msdScanBeam?: THREE.Mesh;
  msdDataLines?: THREE.Line[];
  
  // Mine Energy Delivery
  medGrid?: THREE.Group;
  medNodes?: { mesh: THREE.Group; type: 'source' | 'consumer' }[];
  medEnergyFlow?: THREE.Points;
  medCarbonClouds?: THREE.Points;
  medScanner?: THREE.Mesh;

  // Mine Eco Delivery
  medEcoTerrain?: THREE.Mesh;
  medVegetation?: THREE.InstancedMesh;
  medWater?: THREE.Mesh;
  medScanGrid?: THREE.Group;

  // Port Completion Delivery
  pcdQuay?: THREE.Mesh;
  pcdCranes?: THREE.Group[];
  pcdShip?: THREE.Group;
  pcdScanner?: THREE.Mesh;
  pcdDataFlow?: THREE.Points;
  
  // Port BIM Delivery
  pbdPiles?: THREE.Group[];
  pbdDeck?: THREE.Mesh;
  pbdSeabed?: THREE.Mesh;
  pbdScanner?: THREE.Mesh;
  pbdTags?: THREE.Group[];
  
  // Channel Regulation Delivery
  crdRiverbed?: THREE.Mesh;
  crdWater?: THREE.Mesh;
  crdSpurDikes?: THREE.Group[];
  crdSurveyBoat?: THREE.Group;
  crdSonarCone?: THREE.Mesh;
  crdSedimentParticles?: THREE.Points;

  // Ship Lock Delivery
  sldChamber?: THREE.Group;
  sldGates?: THREE.Group[];
  sldWater?: THREE.Mesh;
  sldShip?: THREE.Group;
  sldScanner?: THREE.Mesh;
  sldValves?: THREE.Group[];

  // Smart Port Delivery
  spdHub?: THREE.Group;
  spdNodes?: { mesh: THREE.Group, type: string }[];
  spdLinks?: THREE.Line[];
  spdDataTraffic?: THREE.Points;
  spdRings?: THREE.Mesh[];

  // Nav Dispatch Delivery
  nddWater?: THREE.Mesh;
  nddTowers?: THREE.Group[];
  nddVessels?: { mesh: THREE.Group, speed: number, t: number, offset: number }[];
  nddWaves?: THREE.Mesh[];
  nddLinks?: THREE.Line[];
  nddScanner?: THREE.Mesh;

  // Ship Lifecycle Delivery
  slcdShip?: THREE.Group;
  slcdWireframe?: THREE.Group;
  slcdScanner?: THREE.Mesh;
  slcdDataStream?: THREE.Points;
  slcdWater?: THREE.Mesh;

  // Port Asset Delivery
  padPlatform?: THREE.Group;
  padAsset?: THREE.Group;
  padScannerRing?: THREE.Group;
  padDataStream?: THREE.Points;
  padHotspots?: THREE.Group[];

  // Channel Monitor Delivery
  cmdRiverbed?: THREE.Mesh;
  cmdWater?: THREE.Mesh;
  cmdSurveyBoat?: THREE.Group;
  cmdScanFan?: THREE.LineSegments;
  cmdBuoys?: THREE.Group[];
  cmdSilt?: THREE.Points;

  // Nav Safety Delivery
  nsdWater?: THREE.Mesh;
  nsdTarget?: THREE.Group;
  nsdRescue?: THREE.Group;
  nsdDrone?: THREE.Group;
  nsdZone?: THREE.Group;
  nsdSignal?: THREE.Mesh;
}

export type SceneType = 
  | 'geo' 
  | 'transport' 
  | 'dd-mine-construction'
  | 'dd-mine-bim-delivery'
  | 'dd-mine-process-delivery'
  | 'dd-mine-processing'
  | 'dd-mine-equip-lifecycle'
  | 'dd-mine-safety-delivery'
  | 'dd-mine-energy-delivery'
  | 'dd-mine-eco-delivery'
  | 'dd-port-completion'
  | 'dd-port-bim'
  | 'dd-channel-regulation'
  | 'dd-ship-lock'
  | 'dd-smart-port'
  | 'dd-nav-dispatch'
  | 'dd-ship-lifecycle'
  | 'dd-port-asset'
  | 'dd-channel-monitor'
  | 'dd-nav-safety';
