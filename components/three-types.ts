
import * as THREE from 'three';

export interface Animatables {

  

///////////////////////////////////
  bulkConveyor?: THREE.Mesh; 
  rtgCranes?: THREE.Group[];
  cityPipes?: THREE.Points;
  solarPanels?: THREE.Group;
  radarPulse?: THREE.Mesh;
  // Smart Ops Specific
  rotor?: THREE.Object3D;
  particles?: THREE.Points;
  shipGroup?: THREE.Group;
  water?: THREE.Mesh;
  trolley?: THREE.Group;
  hookGroup?: THREE.Group;
  buoyGroup?: THREE.Group;
  lanternLight?: THREE.PointLight;
  toneRing?: THREE.Group;
  hoistSheave?: THREE.Mesh;
  cage?: THREE.Group;
  counterWeight?: THREE.Mesh;
  ropes?: THREE.Line;
  tbmCutterhead?: THREE.Group;
  tbmDebris?: THREE.Points;
  drillString?: THREE.Group;
  crusherCone?: THREE.Group;
  crusherRocks?: THREE.Points;
  flotationAgitator?: THREE.Group;
  flotationBubbles?: THREE.Points;
  vsiRotor?: THREE.Group;
  vsiParticles?: THREE.Points;
  
  // Cockpit Specific
  miners?: THREE.Points;
  mineFans?: THREE.Group[];
  damWater?: THREE.Mesh;
  rain?: THREE.Points;
  birds?: THREE.Group;
  trees?: THREE.Group;
  pumpedFlow?: THREE.Points;
  floodWater?: THREE.Mesh;
  riverFlow?: THREE.Points;
  rescueDrill?: THREE.Group;
  trappedPulse?: THREE.PointLight;
  cityFlow?: THREE.Points;
  cityLeak?: THREE.Mesh;
  canalFlow?: THREE.Points;
  cropFields?: THREE.Mesh[];
  sprinklers?: THREE.Group[];
  globeRoutes?: THREE.Group;
  stsCranes?: { trolley: THREE.Mesh; hook: THREE.Mesh; cable: THREE.Mesh }[];
  agvs?: { mesh: THREE.Group; pathOffset: number; speed: number }[];
  stackerArm?: THREE.Group;
  bucketWheel?: THREE.Group;
  riverShips?: { mesh: THREE.Group; speed: number; offset: number; direction: number }[];
  lockChamberWater?: THREE.Mesh;
  lockGatesUpper?: THREE.Group;
  lockGatesLower?: THREE.Group;
  windTurbines?: { group: THREE.Group; speed: number }[];
  energyParticles?: THREE.Points;
  electricTrucks?: { mesh: THREE.Group; path: any; t: number; speed: number }[];
  radarSweep?: THREE.Group;
  targetShips?: { mesh: THREE.Group; speed: number; angle: number; radius: number }[];
  patrolBoat?: THREE.Group;
  
  // Index Analysis
  miningVoxels?: THREE.InstancedMesh;
  scannerPlane?: THREE.Mesh;
  separationBubbles?: THREE.Points;
  separationMineral?: THREE.Points;
  frothSurface?: THREE.Mesh;
  shearerGroup?: THREE.Group;
  shearerDrums?: THREE.Mesh[];
  hydraulicSupports?: THREE.Group[];
  coalParticles?: THREE.Points;
  shovelArm?: THREE.Group;
  miningTrucks?: { mesh: THREE.Group; t: number; speed: number; status: string }[];
  blastHoles?: THREE.Mesh[];
  blastShockwaves?: THREE.Mesh[];
  blastDebris?: THREE.Points;
  energyNodes?: THREE.Group[];
  energyPulses?: THREE.Points;
  ventFans?: THREE.Group[];
  airParticles?: THREE.Points;
  hydroRunner?: THREE.Group;
  hydroShaft?: THREE.Mesh;
  hydroFlow?: THREE.Points;
  spillwayGates?: THREE.Mesh[];
  spillwayFlow?: THREE.Points;
  reservoirSurface?: THREE.Mesh;
  turbineBlade?: THREE.Mesh;
  cavitationBubbles?: THREE.Points;
  sedimentParticles?: THREE.Points;
  resWater?: THREE.Mesh;
  benefitParticles?: THREE.Points;
  damMesh?: THREE.Mesh;
  damSensors?: THREE.Group[];
  psUnitRotor?: THREE.Group;
  psLoopFlow?: THREE.Points;
  psLossNodes?: THREE.Group[];
  ramComponents?: { mesh: THREE.Mesh; label: string; health: number }[];
  ramParticles?: THREE.Points;
  berthShips?: { mesh: THREE.Group; state: string; progress: number; berthId: number }[];
  berthCranes?: THREE.Group[];
  effCraneParts?: { trolley: THREE.Mesh; spreader: THREE.Mesh; cables: THREE.Mesh; container: THREE.Mesh };
  effTrajectory?: THREE.Line;
  eeoiShip?: THREE.Group;
  eeoiWake?: THREE.Points;
  eeoiSmoke?: THREE.Points;
  eeoiPropeller?: THREE.Mesh;
  ciiGlobe?: THREE.Group;
  ciiShip?: THREE.Group;
  ciiTrail?: THREE.Line;
  leGates?: { mesh: THREE.Group; state: string; angle: number }[];
  leWaterLevels?: THREE.Mesh[];
  leShips?: { mesh: THREE.Group; progress: number }[];
  tcNodes?: THREE.Group[];
  tcVehicles?: { mesh: THREE.Mesh; path: any; t: number; speed: number; type: string }[];
  tcLinks?: THREE.Line[];
  csBuoys?: THREE.Group[];
  csShips?: { mesh: THREE.Group; domain: THREE.Mesh; vector: THREE.Line; velocity: THREE.Vector3 }[];
  csRiskZone?: THREE.Group;

  // Digital Delivery
  ddHydroDam?: THREE.Mesh;
  ddWireframeOverlay?: THREE.LineSegments;
  ddScanLaser?: THREE.Mesh;
  ddDocMarkers?: THREE.Group[];
  
  // Hydro Twin Delivery
  htTwinModel?: THREE.Group;
  htWireframe?: THREE.Group;
  htSyncParticles?: THREE.Points;
  htDataNodes?: THREE.Group[];
  htScanEffect?: THREE.Mesh;

  // Hydro BIM Delivery
  hbBimModel?: THREE.Group;
  hbExplodedParts?: { mesh: THREE.Mesh, origin: THREE.Vector3, explodeDir: THREE.Vector3 }[];
  hbAnnotationLines?: THREE.Line[];

  // Hydro Dispatch Delivery
  hdLogicNodes?: { mesh: THREE.Group, type: string }[];
  hdDataStream?: THREE.Points;
  hdTerrainGrid?: THREE.LineSegments;

  // Hydro Equip Lifecycle Delivery
  helModelGroup?: THREE.Group;
  helParts?: { 
    name: string; 
    mesh: THREE.Mesh; 
    wire: THREE.LineSegments; 
    origin: THREE.Vector3; 
    explodedPos: THREE.Vector3; 
  }[];
  helFlowParticles?: THREE.Points;
  helStageEffect?: THREE.Group;

  // Dam Safety Delivery
  dsdSensorNodes?: THREE.Group[];
  dsdCableLines?: THREE.Line[];
  dsdDataPackets?: THREE.Points;
  dsdScanner?: THREE.Mesh;

  // Hydro Monitor Delivery
  hmdRain?: THREE.Points;
  hmdRiverPulse?: THREE.Points;
  hmdStations?: THREE.Group[];
  hmdTerrain?: THREE.Mesh;

  // Flood Control Delivery
  fcdFloodWater?: THREE.Mesh;
  fcdTerrain?: THREE.Mesh;
  fcdRiskZones?: THREE.Group[];
  fcdRainSystem?: THREE.Points;

  // Hydro Asset Delivery
  hadModel?: THREE.Group;
  hadDataCubes?: THREE.InstancedMesh;
  hadScanRing?: THREE.Mesh;

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
}

export interface GeoAnimatables extends Animatables {}

export type SceneType = 
  //  Smart Ops
  | 'turbine' | 'generator' | 'transmission' | 'pump' | 'outfall' | 'wastewater' | 'wind-turbine' 
  | 'ship' | 'berthing' | 'crane' | 'buoy' | 'tachometer' | 'mine-hoist' | 'tbm' | 'drilling-rig' 
  | 'crusher' | 'flotation-cell' | 'sand-maker' 

  //  Cockpit & New Types 
  | 'pumped-storage' | 'flood-basin' | 'cascade-river' | 'mining-rescue' | 'mining-eco' | 'dam' 
  | 'mine-tunnel' | 'city-smart-water' | 'irrigation-network' | 'globe-fleet' 
  | 'container-terminal' | 'bulk-terminal' | 'inland-waterway' 
  | 'green-port-cockpit' | 'maritime-safety-cockpit' 
  | 'city-water-network' 

  //  Index Analysis 
  | 'mining-recovery-analysis' | 'mineral-recovery-analysis' | 'mining-oee-analysis' | 'mining-truck-cycle-analysis' 
  | 'blasting-quality-analysis' | 'mining-energy-analysis' | 'ventilation-efficiency-analysis' | 'hydro-util-analysis' 
  | 'spillage-loss-analysis' | 'turbine-wear-analysis' | 'reservoir-benefit-analysis' | 'dam-health-analysis' 
  | 'pumped-storage-efficiency-analysis' | 'power-ram-analysis' | 'berth-utilization-analysis' | 'crane-efficiency-analysis' 
  | 'ship-eeoi-analysis' | 'ship-cii-analysis' | 'lock-efficiency-analysis' | 'transport-connect-analysis' | 'channel-safety-analysis'

  //  Digital Delivery 
  | 'dd-hydro-completion' | 'hydro-twin-delivery' | 'dd-hydro-bim-delivery' | 'dd-hydro-dispatch' 
  | 'dd-hydro-equip-lifecycle' | 'dd-dam-safety-delivery' | 'dd-hydro-monitor-delivery' | 'dd-flood-control-delivery' 
  | 'dd-hydro-asset-delivery' | 'dd-mine-construction' | 'dd-mine-bim-delivery' | 'dd-mine-process-delivery' 
  | 'dd-mine-processing' | 'dd-mine-equip-lifecycle' | 'dd-mine-safety-delivery' | 'dd-mine-energy-delivery' 
  | 'dd-mine-eco-delivery' | 'dd-port-completion' | 'dd-port-bim' | 'dd-channel-regulation' | 'dd-ship-lock' 
  | 'dd-smart-port' | 'dd-nav-dispatch' | 'dd-ship-lifecycle' | 'dd-port-asset'

  //  特殊
  | 'default' | 'geo' | 'transport';
