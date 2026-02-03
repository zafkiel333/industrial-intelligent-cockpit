
import * as THREE from 'three';

export interface SimAnimatables {
  // ... (keep existing types)
  
  // Hydro Group Dispatch (Multi-Gate)
  groupGates?: THREE.Group[];    // Array of gate meshes
  groupUpWater?: THREE.Mesh;     // Upstream Water Plane
  groupDownWater?: THREE.Mesh;   // Downstream Water Plane
  groupFlowParticles?: THREE.Points;
  groupTerrain?: THREE.Mesh;

  // Hydro Pump Station
  hpPumps?: THREE.Group[];       // The pump units
  hpShafts?: THREE.Mesh[];       // Rotating shafts
  hpFlowParticles?: THREE.Points; // Flow inside pipes
  hpValves?: THREE.Group[];      // Discharge valves
  hpFluids?: THREE.Mesh[];       // Water volume in pipes (for color change)

  // Hydro Fish Pass
  fishTerrain?: THREE.Mesh;
  fishWayWater?: THREE.Mesh;
  ecoDischargeWater?: THREE.Mesh;
  fishSchool?: THREE.Points;     // Fish particles
  fishSensors?: THREE.Group[];   // Monitoring nodes
  fishGate?: THREE.Group;        // Discharge gate

  // Hydro Grid Dispatch
  hgDam?: THREE.Group;
  hgCity?: THREE.Group;
  hgPowerLines?: THREE.Line[];
  hgElectrons?: THREE.Points;    // Power flow particles
  hgTurbines?: THREE.Group[];    // Spinning units
  hgSolarFarm?: THREE.Group;     // Renewable source
  hgGridStatusRing?: THREE.Mesh; // Visual indicator of grid health

  // Hydro Dam Break (Emergency Drill)
  hdbDamBody?: THREE.Group;      // The main dam structure
  hdbBreachPart?: THREE.Group;   // The section that fails
  hdbUpWater?: THREE.Mesh;
  hdbFloodWave?: THREE.Mesh;     // Downstream raging water
  hdbDebris?: THREE.Points;      // Concrete chunks
  hdbHouses?: THREE.Group[];     // Downstream assets
  hdbWarningZones?: THREE.Group[]; // Visual rings

  // Hydro Ice Flood (Ice Jam)
  hifIceFloes?: THREE.InstancedMesh; // The ice chunks
  hifRiverWater?: THREE.Mesh;    // Water surface
  hifBridgePier?: THREE.Group;   // Obstacle
  hifSnowSystem?: THREE.Points;  // Atmospheric snow
  hifJamIndicator?: THREE.Mesh;  // Visual red zone for jam

  // Hydro Vibration (FIV)
  hvGate?: THREE.Mesh;           // The vibrating structure
  hvWater?: THREE.Mesh;          // Water flow
  hvVectors?: THREE.ArrowHelper[]; // Force vectors
  hvParticles?: THREE.Points;    // Turbulent flow
  hvSensorPoints?: THREE.Group[];// Virtual sensors

  // Port Traffic Flow (Sim)
  ptfWater?: THREE.Mesh;
  ptfShips?: THREE.Group[];      // Active vessels
  ptfBuoys?: THREE.Group[];      // Channel markers
  ptfFog?: THREE.Points;         // Weather effect
  ptfRadarSweep?: THREE.Group;   // VTS Radar visual

  // Ship Lock Dispatch (Sim)
  slGatesUpper?: THREE.Group;    // Pair of miter gates (Upstream)
  slGatesLower?: THREE.Group;    // Pair of miter gates (Downstream)
  slChamberWater?: THREE.Mesh;   // Dynamic water level
  slShips?: THREE.Group[];       // Ships in the scene
  slLights?: THREE.PointLight[]; // Traffic signals
  slValves?: THREE.Group[];      // Culvert valves

  // Port Motion (Sim)
  pmWater?: THREE.Mesh;          // Dynamic sea surface
  pmShip?: THREE.Group;          // The vessel
  pmVectors?: THREE.ArrowHelper[]; // Force vectors (Buoyancy, Gravity)
  pmWake?: THREE.Points;         // Wake particles

  // Port Terminal Loading (Sim)
  ptlCranes?: { 
    group: THREE.Group; 
    trolley: THREE.Group; 
    spreader: THREE.Group; 
    cables: THREE.Mesh;
    container: THREE.Mesh; 
    id: number;
  }[];
  ptlAgvs?: THREE.Group[];
  ptlShip?: THREE.Group;
  ptlContainers?: THREE.InstancedMesh;

  // Port Multimodal (Sim)
  pmmTrain?: THREE.Group;        // The freight train
  pmmTrucks?: { mesh: THREE.Group; path: THREE.CatmullRomCurve3; t: number; speed: number; id: number }[];
  pmmRmg?: THREE.Group;          // Rail Mounted Gantry
  pmmRmgTrolley?: THREE.Group;   // RMG Trolley
  pmmContainers?: THREE.InstancedMesh; // Yard stack
  pmmTrafficLights?: THREE.Group[]; // Gate lights

  // Channel Regulation (Sim)
  crRegRiverbed?: THREE.Mesh;
  crRegWater?: THREE.Mesh;
  crRegDikes?: THREE.Group[];    // Groynes
  crRegFlowParticles?: THREE.Points;
  crRegShip?: THREE.Group;
  crRegVelocityVectors?: THREE.InstancedMesh;

  // Port Collision (Sim)
  pcOwnShip?: THREE.Group;       // User controlled ship
  pcTargetShip?: THREE.Group;    // Obstacle ship
  pcShoal?: THREE.Mesh;          // Underwater hazard
  pcWater?: THREE.Mesh;
  pcTrajectories?: THREE.Line[]; // Prediction lines
  pcSafetyDomains?: THREE.Mesh[];// Risk zones rings
  pcCollisionMarker?: THREE.Group; // Impact visual

  // Port Spill (Sim)
  psWater?: THREE.Mesh;
  psSlick?: THREE.Mesh;           // The oil spill mesh
  psBooms?: THREE.Group;          // Containment booms
  psShips?: THREE.Group[];        // Context ships
  psVectors?: THREE.ArrowHelper[];// Wind/Current vectors

  // Port Berthing (Sim)
  pbWater?: THREE.Mesh;
  pbShip?: THREE.Group;           // The main vessel
  pbTugs?: THREE.Group[];         // Array of tugs (Bow, Stern)
  pbQuay?: THREE.Group;           // The dock structure
  pbFenders?: THREE.Group[];      // Fender systems
  pbForceVectors?: THREE.ArrowHelper[]; // Visualizing tug forces
  pbDistLines?: THREE.Line[];     // Laser distance lines
  pbWake?: THREE.Points;

  // Port Dredging (Sim)
  pdDredger?: THREE.Group;        // The CSD vessel
  pdLadder?: THREE.Group;         // The cutting arm
  pdCutterHead?: THREE.Group;     // Rotating head
  pdSpuds?: THREE.Group[];        // Anchor spuds
  pdSeabed?: THREE.Mesh;          // Deformable terrain
  pdSedimentCloud?: THREE.Points; // Turbidity
  pdDischargePipe?: THREE.Mesh;   // Floating pipeline
  pdWorkZone?: THREE.Line;        // Arc visualization

  // Port Scheduling (Sim)
  psGlobe?: THREE.Group;          // The rotating earth
  psPorts?: THREE.Group[];        // Glowing port nodes
  psRoutes?: THREE.Line[];        // Shipping lanes
  portSchedShips?: { mesh: THREE.Mesh; routeIdx: number; t: number; speed: number; status: 'ok'|'late' }[];
  psSatellites?: THREE.Group[];   // GPS Satellites

  // Port Bridge Safety (Sim)
  bridgeStructure?: THREE.Group;  // The bridge itself
  bridgeShip?: THREE.Group;       // The passing vessel
  bridgeWater?: THREE.Mesh;       // Water surface
  bridgeScanner?: THREE.Group;    // Laser scanner visualization
  bridgeClearanceLine?: THREE.Line; // Visual line for vertical clearance
  bridgePierZones?: THREE.Group[];  // Warning zones around piers
  bridgeWindVector?: THREE.ArrowHelper; // Wind drift vector

  // Port Storm Surge (Sim) - NEW
  surgeWater?: THREE.Mesh;        // Dynamic ocean mesh
  surgeTerrain?: THREE.Mesh;      // Port terrain (Quay + Yard)
  surgeCranes?: THREE.Group[];    // STS Cranes
  surgeContainers?: THREE.InstancedMesh; // Stacks
  surgeRain?: THREE.Points;       // Heavy rain system
  surgeWaves?: THREE.Points;      // Overtopping splash particles
  surgeFloodMarkers?: THREE.Group[]; // Warning markers on ground
  surgeClouds?: THREE.Group;      // Dark storm clouds

  // ... (keep Mine & Hydro animatables)
  // Mine Ventilation
  tunnelWalls?: THREE.Mesh;
  fans?: THREE.Group[];
  airflowParticles?: THREE.Points;
  gasCloud?: THREE.Points;
  sensors?: THREE.Group[];

  // Mine Roof Stability
  coalFace?: THREE.Mesh;
  hydraulicSupports?: THREE.Group[];
  roofStrata?: THREE.Mesh;
  stressField?: THREE.Points;

  // Mine Blast
  blastBench?: THREE.Mesh;
  blastHoles?: THREE.Group[];
  shockwaves?: THREE.Mesh[];
  flyrock?: THREE.Points;
  groundRipple?: THREE.Mesh;

  // Mine Truck Routing
  routingTerrain?: THREE.Mesh;
  haulRoads?: THREE.Mesh[];
  loadPoints?: THREE.Group[];
  dumpPoints?: THREE.Group[];
  miningTrucks?: any[]; 

  // Mine Slope Stability
  slopeTerrain?: THREE.Mesh;
  slipPlane?: THREE.Mesh;
  displacementVectors?: THREE.InstancedMesh;
  radarScanner?: THREE.Group;

  // Mine Equip Strength
  excavatorArm?: THREE.Group;
  stressMeshBoom?: THREE.Mesh;
  stressMeshStick?: THREE.Mesh;
  stressMeshBucket?: THREE.Mesh;
  loadRock?: THREE.Mesh;
  hydraulicCylinders?: THREE.Group[];
  forceArrows?: THREE.ArrowHelper[];

  // Mine Belt Conveyor
  drivePulley?: THREE.Mesh;
  tailPulley?: THREE.Mesh;
  conveyorBelt?: THREE.Mesh;
  idlers?: THREE.InstancedMesh;
  materialFlow?: THREE.Points;
  dustClouds?: THREE.Points;
  takeUpWeight?: THREE.Mesh;

  // Mine Evacuation
  evacTunnels?: THREE.Group;
  evacSafeZones?: THREE.Group[];
  evacAgents?: THREE.Group[];
  evacHazards?: THREE.Group[];
  evacPaths?: THREE.Line[];

  // Mine Water
  pumpRoomFloor?: THREE.Mesh;
  sumpWater?: THREE.Mesh;
  waterPumps?: THREE.Group[];
  waterPipes?: THREE.Group;
  waterParticles?: THREE.Points;

  // Mine Power
  powerNodes?: THREE.Group[];
  powerLines?: THREE.Line[];
  electronFlow?: THREE.Points;
  faultSparks?: THREE.Points;
  faultShockwave?: THREE.Mesh;

  // Mine Coop
  coopExcavator?: { body: THREE.Group, boom: THREE.Group, stick: THREE.Group, bucket: THREE.Group };
  coopTrucks?: any[]; 
  coopTargets?: THREE.Group[];
  coopDirt?: THREE.Points;

  // Mine Hoist Sim
  hoistDrum?: THREE.Group;
  hoistCage?: THREE.Group;
  hoistCounterWeight?: THREE.Group;
  hoistRopes?: THREE.LineSegments;

  // Mine Dust
  dustSource?: THREE.Group;
  suctionHood?: THREE.Group;
  suctionFan?: THREE.Mesh;
  mistSprayers?: THREE.Group[];
  dustParticles?: THREE.Points;
  mistParticles?: THREE.Points;

  // Mine Freeze
  freezePipes?: THREE.Group;
  freezeHeaders?: THREE.Group;
  soilVolume?: THREE.Points;
  shaftExcavation?: THREE.Mesh;
  freezeSensors?: THREE.Group[];

  // Mine Crash
  crashBuffer?: THREE.Group;
  crashTruck?: THREE.Group;
  impactZone?: THREE.Mesh;
  crashForceVectors?: THREE.ArrowHelper[];
  crashDebris?: THREE.Points;

  // Mine Slurry
  slurryCyclone?: THREE.Mesh;
  slurryInlet?: THREE.Mesh;
  slurryAirCore?: THREE.Mesh;
  slurryParticles?: THREE.Points;

  // Mine Dispatch
  dispatchTerrain?: THREE.Mesh;
  dispatchNetworkNodes?: THREE.Group[];
  dispatchDiggers?: any[];
  dispatchTrucks?: any[];
  dispatchPeople?: any[];
  dispatchLinks?: THREE.LineSegments;

  // Mine Eco
  ecoSun?: THREE.DirectionalLight;
  ecoTerrain?: THREE.Mesh;
  ecoWater?: THREE.Mesh;
  ecoVegetation?: THREE.InstancedMesh;
  ecoClouds?: THREE.Points;

  // Hydro Flood
  hydroTerrain?: THREE.Mesh;
  hydroDam?: THREE.Group;
  hydroUpstreamWater?: THREE.Mesh;
  hydroDownstreamWater?: THREE.Mesh;
  hydroRain?: THREE.Points;
  hydroSpillFlow?: THREE.Points;
  hydroFloodMarkers?: THREE.Group[];

  // Hydro Spill
  spillwayDam?: THREE.Mesh;
  spillwayGate?: THREE.Mesh;
  spillwayBasinWater?: THREE.Mesh;
  spillwayFlowParticles?: THREE.Points;
  spillwayPressureMap?: THREE.Points;

  // Hydro Dam
  damFoundation?: THREE.Mesh;
  damStressMesh?: THREE.Mesh;
  damUpstreamWater?: THREE.Mesh;
  damDownstreamWater?: THREE.Mesh;
  damSeepageParticles?: THREE.Points;
  damSensors?: THREE.Group[];

  // Hydro Gate
  gateRadial?: THREE.Group;
  gateSkinPlate?: THREE.Mesh;
  gateTrunnion?: THREE.Mesh;
  gateHydraulicCylinders?: THREE.Mesh[];
  gateUpstreamSurface?: THREE.Mesh;
  gateDownstreamSurface?: THREE.Mesh;
  gateFlowParticles?: THREE.Points;
  gateVortices?: THREE.Group;

  // Hydro Turbine
  htSpiralCase?: THREE.Mesh;
  htStayVanes?: THREE.Group;
  htGuideVanes?: THREE.Group;
  htRunner?: THREE.Group;
  htDraftTube?: THREE.Mesh;
  htFlowParticles?: THREE.Points;
  htCavitationBubbles?: THREE.Points;

  // Hydro River
  riverBed?: THREE.Mesh;
  riverWaterSurface?: THREE.Mesh;
  riverGroynes?: THREE.Group[];
  riverSedimentParticles?: THREE.Points;
  riverVelocityVectors?: THREE.InstancedMesh;

  // Hydro Urban
  huRoads?: THREE.Mesh;
  huBuildings?: THREE.Group;
  huPipes?: THREE.Group;
  huSurfaceWater?: THREE.Mesh;
  huRain?: THREE.Points;
  huManholes?: THREE.InstancedMesh;

  // Hydro Sediment
  sedTerrain?: THREE.Mesh;
  sedSedimentMesh?: THREE.Mesh;
  sedDam?: THREE.Group;
  sedSluiceGates?: THREE.Mesh[];
  sedWater?: THREE.Mesh;
  sedInflowParticles?: THREE.Points;
  sedOutflowParticles?: THREE.Points;

  // Hydro Break
  breakTerrain?: THREE.Mesh;
  breakPlug?: THREE.Mesh;
  breakWaterRiver?: THREE.Mesh;
  breakWaterFlood?: THREE.Mesh;
  breakHouses?: THREE.Group;
  breakDebris?: THREE.Points;
  breakMarkers?: THREE.Group[];

  // Hydro Transition
  transUnit?: THREE.Group;
  transRotor?: THREE.Group;
  transTurbine?: THREE.Group;
  transGates?: THREE.Group;
  transFlow?: THREE.Points;
  transSparks?: THREE.Points;
  transSurge?: THREE.Mesh;
}

export type SimSceneType = 
  | 'mine-ventilation'
  | 'mine-roof-stability'
  | 'mine-blast'
  | 'mine-truck-routing'
  | 'mine-slope-stability'
  | 'mine-equip-strength'
  | 'mine-belt-conveyor'
  | 'mine-evacuation'
  | 'mine-water'
  | 'mine-power'
  | 'mine-coop'
  | 'mine-hoist-sim'
  | 'mine-dust'
  | 'mine-freeze'
  | 'mine-crash'
  | 'mine-slurry'
  | 'mine-dispatch'
  | 'mine-eco'
  | 'hydro-flood'
  | 'hydro-spill'
  | 'hydro-dam'
  | 'hydro-gate'
  | 'hydro-turbine'
  | 'hydro-river'
  | 'hydro-urban'
  | 'hydro-sedi'
  | 'hydro-break'
  | 'hydro-trans'
  | 'hydro-group'
  | 'hydro-pump'
  | 'hydro-fish'
  | 'hydro-grid'
  | 'hydro-dam-break'
  | 'hydro-ice'
  | 'hydro-vib'
  | 'port-traffic-flow'
  | 'ship-lock-dispatch'
  | 'port-motion'
  | 'port-terminal-loading'
  | 'port-multimodal'
  | 'port-channel-regulation'
  | 'port-collision'
  | 'port-spill'
  | 'port-berth'
  | 'port-dredging' 
  | 'port-sched'
  | 'port-bridge'
  | 'port-surge' // NEW
  | 'default';
