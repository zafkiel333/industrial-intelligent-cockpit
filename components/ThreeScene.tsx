import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Animatables, SceneType } from './three-types';
import * as SmartOps from './scene-builders/SmartOpsBuilder';
import * as Cockpit from './scene-builders/CockpitBuilder';
import * as SmartWater from './scene-builders/SmartWaterBuilder';
import * as Irrigation from './scene-builders/IrrigationBuilder';
import * as ContainerTerminal from './scene-builders/ContainerTerminalBuilder';
import * as InlandWaterway from './scene-builders/InlandWaterwayBuilder';
import * as GreenPort from './scene-builders/GreenPortBuilder';
import * as MaritimeSafety from './scene-builders/MaritimeSafetyBuilder';

//2026.03.16，添加新的3d模型渲染代码，尝试解决   运行指数分析、运行驾驶舱、数字化交付  三栏模型缺失的问题
import * as HydroDelivery from './scene-digital-delivery/HydroDeliveryBuilder';
import * as HydroTwinDelivery from './scene-digital-delivery/HydroTwinDeliveryBuilder';
import * as HydroBimDelivery from './scene-digital-delivery/HydroBimDeliveryBuilder';
import * as HydroDispatch from './scene-digital-delivery/HydroDispatchBuilder';
import * as HydroEquipLifecycle from './scene-digital-delivery/HydroEquipLifecycleBuilder';
import * as DamSafetyDelivery from './scene-digital-delivery/DamSafetyDeliveryBuilder'; 
import * as HydroMonitorDelivery from './scene-digital-delivery/HydroMonitorDeliveryBuilder';
import * as FloodDispatchDelivery from './scene-digital-delivery/FloodDispatchDeliveryBuilder'; 
import * as HydroAssetDelivery from './scene-digital-delivery/HydroAssetDeliveryBuilder'; 
import * as MineConstructionDelivery from './scene-digital-delivery/MineConstructionDeliveryBuilder';
import * as MineBimDelivery from './scene-digital-delivery/MineBimDeliveryBuilder';
import * as MineProcessDelivery from './scene-digital-delivery/MineProcessDeliveryBuilder';
import * as MineProcessingDelivery from './scene-digital-delivery/MineProcessingDeliveryBuilder';
import * as MineEquipLifecycleDelivery from './scene-digital-delivery/MineEquipLifecycleBuilder'; 
import * as MineSafetyDelivery from './scene-digital-delivery/MineSafetyDeliveryBuilder'; // NEW
import * as MiningRecovery from './scene-index-analysis/MiningRecoveryBuilder';
import * as MineralRecovery from './scene-index-analysis/MineralRecoveryBuilder';
import * as MiningOee from './scene-index-analysis/MiningOeeBuilder';
import * as MiningTruckCycle from './scene-index-analysis/MiningTruckCycleBuilder';
import * as BlastingQuality from './scene-index-analysis/BlastingQualityBuilder';
import * as MiningEnergy from './scene-index-analysis/MiningEnergyBuilder';
import * as VentilationEfficiency from './scene-index-analysis/VentilationEfficiencyBuilder';
import * as HydroUtil from './scene-index-analysis/HydroUtilBuilder';
import * as SpillageLoss from './scene-index-analysis/SpillageLossBuilder';
import * as TurbineWear from './scene-index-analysis/TurbineWearBuilder';
import * as ReservoirBenefit from './scene-index-analysis/ReservoirBenefitBuilder';
import * as DamHealth from './scene-index-analysis/DamHealthBuilder';
import * as PumpedStorageEfficiency from './scene-index-analysis/PumpedStorageEfficiencyBuilder';
import * as PowerRam from './scene-index-analysis/PowerRamBuilder';
import * as BerthUtil from './scene-index-analysis/BerthUtilBuilder';
import * as CraneEfficiency from './scene-index-analysis/CraneEfficiencyBuilder';
import * as ShipEeoi from './scene-index-analysis/ShipEeoiBuilder';
import * as ShipCii from './scene-index-analysis/ShipCiiBuilder';
import * as LockEfficiency from './scene-index-analysis/LockEfficiencyBuilder';
import * as TransportConnect from './scene-index-analysis/TransportConnectBuilder';
import * as ChannelSafety from './scene-index-analysis/ChannelSafetyBuilder';




interface ThreeSceneProps {
  type?: SceneType;
  color?: string;
  data?: any; // Pass simulation data to scene，2026.03.16
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ type = 'default', color = '#06b6d4' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  //2026.03.16
  const groupRef = useRef<THREE.Group>(null);
  const animatablesRef = useRef<Animatables>({});

  const sceneType = type as SceneType;


  // // Update scene data when props change，2026.03.16
  // useEffect(() => {
  //   if (groupRef.current && data) {
  //     if (sceneType === 'pumped-storage-efficiency-analysis') {
  //        if (animatablesRef.current.psUnitRotor) {
  //            (animatablesRef.current.psUnitRotor as any).userData = data;
  //        }
  //     } else if (sceneType === 'ship-eeoi-analysis') {
  //        if (animatablesRef.current.eeoiShip) {
  //           (animatablesRef.current.eeoiShip as any).userData = {
  //              speed: data.speed,
  //              effColor: new THREE.Color(data.effColor || '#ffffff')
  //           };
  //        }
  //     } else if (sceneType === 'transport-connect-analysis') {
  //        groupRef.current.userData.jammed = data.jammed;
  //     } else if (sceneType === 'dd-hydro-equip-lifecycle') {
  //        groupRef.current.userData.stage = data.stage;
  //     } else if (sceneType === 'dd-mine-equip-lifecycle') {
  //        groupRef.current.userData.stage = data.stage;
  //     } else if (sceneType === 'dd-mine-safety-delivery') {
  //        if (animatablesRef.current.msdGasCloud) {
  //            // Pass simulation mode to gas cloud parent group userData
  //            (animatablesRef.current.msdGasCloud.parent as any).userData = { simMode: data.simMode };
  //        }
  //     }
  //   }
  // }, [data, sceneType]);

  useEffect(() => {
    if (!mountRef.current) return;
    //console.log('=== ThreeScene useEffect ===', Date.now()); 
    // 清理容器中可能存在的旧 Canvas (针对 HMR)
    console.log("===three model universary useEffect===");
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }

    // Initial Size Calculation
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = null; 
    // 2. 清空 group 中的粒子
    if(scene&&scene.group){
      scene.remove(scene.group);
    }

    // 3. 清空 scene 中的粒子
    if (scene) {
      scene.children.forEach(item => {
        if (item) {
          scene.remove(item);
        }
      });
    }


    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    //camera.position.z = 6;
    camera.position.set(0, 2, 6);
    //new
    const currentType = type as SceneType;
    
    if (SmartOps.isSmartOpsScene(currentType)) {
      SmartOps.setupSmartOpsCamera(camera, currentType);
    } 
    // else {
    //   camera.position.set(0, 0, 6);
    // }
    
    // -- Camera Strategy --
    else if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
      MaritimeSafety.setupMaritimeSafetyCamera(camera);
    } else if (GreenPort.isGreenPortScene(sceneType)) {
      GreenPort.setupGreenPortCamera(camera);
    } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
      InlandWaterway.setupInlandWaterwayCamera(camera);
    } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
      ContainerTerminal.setupContainerTerminalCamera(camera);
    } else if (Irrigation.isIrrigationScene(sceneType)) {
      Irrigation.setupIrrigationCamera(camera);
    } else if (SmartWater.isSmartWaterScene(sceneType)) {
      SmartWater.setupSmartWaterCamera(camera);
    } else if (Cockpit.isCockpitScene(sceneType)) {
      Cockpit.setupCockpitCamera(camera, sceneType);
    } 
    // else if (SmartOps.isSmartOpsScene(sceneType)) {
    //   SmartOps.setupSmartOpsCamera(camera, sceneType);
    // } 
    else {
      camera.position.set(0, 0, 6);
    }

    // Camera Positioning based on Type
    if (type === 'generator') {
      camera.position.set(0, 2, 7);
    } else if (type === 'transmission') {
      camera.position.set(0, 3, 9);
      camera.lookAt(0, 2, 0);
    } else if (type === 'pump') {
      camera.position.set(4, 2, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'outfall') {
      camera.position.set(3, 2, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'wastewater') {
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'wind-turbine') {
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 2, 0);
    } else if (type === 'ship') {
      camera.position.set(8, 4, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'berthing') {
      camera.position.set(5, 5, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'crane') {
      camera.position.set(6, 6, 10);
      camera.lookAt(0, 3, 0);
    } else if (type === 'buoy') {
      camera.position.set(0, 2, 8);
      camera.lookAt(0, 1, 0);
    } else if (type === 'tachometer') {
      camera.position.set(4, 3, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'mine-hoist') {
      camera.position.set(5, 2, 8);
      camera.lookAt(0, -1, 0);
    } else if (type === 'tbm') {
      camera.position.set(6, 3, 8);
      camera.lookAt(0, 0, 0);
    } else if (type === 'drilling-rig') {
      camera.position.set(6, 4, 8);
      camera.lookAt(0, 1, 0);
    } else if (type === 'crusher') {
      camera.position.set(5, 3, 6);
      camera.lookAt(0, 0, 0);
    } else if (type === 'flotation-cell') {
      camera.position.set(5, 4, 7);
      camera.lookAt(0, 0.5, 0);
    } else if (type === 'sand-maker') {
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
    }

    // -- Camera Strategy --，2026.03.16
    if (MineSafetyDelivery.isMineSafetyDeliveryScene(sceneType)) {
      MineSafetyDelivery.setupMineSafetyDeliveryCamera(camera);
    } else if (MineEquipLifecycleDelivery.isMineEquipLifecycleScene(sceneType)) {
      MineEquipLifecycleDelivery.setupMineEquipLifecycleCamera(camera);
    } else if (MineProcessDelivery.isMineProcessDeliveryScene(sceneType)) {
      MineProcessDelivery.setupMineProcessDeliveryCamera(camera);
    } else if (MineProcessingDelivery.isMineProcessingDeliveryScene(sceneType)) {
      MineProcessingDelivery.setupMineProcessingDeliveryCamera(camera);
    } else if (MineBimDelivery.isMineBimDeliveryScene(sceneType)) {
      MineBimDelivery.setupMineBimDeliveryCamera(camera);
    } else if (MineConstructionDelivery.isMineConstructionDeliveryScene(sceneType)) {
      MineConstructionDelivery.setupMineConstructionDeliveryCamera(camera);
    } else if (HydroAssetDelivery.isHydroAssetDeliveryScene(sceneType)) {
      HydroAssetDelivery.setupHydroAssetDeliveryCamera(camera);
    } else if (FloodDispatchDelivery.isFloodDispatchDeliveryScene(sceneType)) {
      FloodDispatchDelivery.setupFloodDispatchDeliveryCamera(camera);
    } else if (HydroMonitorDelivery.isHydroMonitorDeliveryScene(sceneType)) {
      HydroMonitorDelivery.setupHydroMonitorDeliveryCamera(camera);
    } else if (DamSafetyDelivery.isDamSafetyDeliveryScene(sceneType)) {
      DamSafetyDelivery.setupDamSafetyDeliveryCamera(camera);
    } else if (HydroEquipLifecycle.isHydroEquipLifecycleScene(sceneType)) {
      HydroEquipLifecycle.setupHydroEquipLifecycleCamera(camera);
    } else if (HydroDispatch.isHydroDispatchScene(sceneType)) {
      HydroDispatch.setupHydroDispatchCamera(camera);
    } else if (HydroBimDelivery.isHydroBimDeliveryScene(sceneType)) {
      HydroBimDelivery.setupHydroBimDeliveryCamera(camera);
    } else if (HydroTwinDelivery.isHydroTwinDeliveryScene(sceneType)) {
      HydroTwinDelivery.setupHydroTwinDeliveryCamera(camera);
    } else if (HydroDelivery.isHydroDeliveryScene(sceneType)) {
      HydroDelivery.setupHydroDeliveryCamera(camera);
    } else if (ChannelSafety.isChannelSafetyScene(sceneType)) {
      ChannelSafety.setupChannelSafetyCamera(camera);
    } else if (TransportConnect.isTransportConnectScene(sceneType)) {
      TransportConnect.setupTransportConnectCamera(camera);
    } else if (LockEfficiency.isLockEfficiencyScene(sceneType)) {
      LockEfficiency.setupLockEfficiencyCamera(camera);
    } else if (ShipCii.isShipCiiScene(sceneType)) {
      ShipCii.setupShipCiiCamera(camera);
    } else if (ShipEeoi.isShipEeoiScene(sceneType)) {
      ShipEeoi.setupShipEeoiCamera(camera);
    } else if (CraneEfficiency.isCraneEfficiencyScene(sceneType)) {
      CraneEfficiency.setupCraneEfficiencyCamera(camera);
    } else if (BerthUtil.isBerthUtilScene(sceneType)) {
      BerthUtil.setupBerthUtilCamera(camera);
    } else if (PowerRam.isPowerRamScene(sceneType)) {
      PowerRam.setupPowerRamCamera(camera);
    } else if (PumpedStorageEfficiency.isPumpedStorageEfficiencyScene(sceneType)) {
      PumpedStorageEfficiency.setupPumpedStorageEfficiencyCamera(camera);
    } else if (DamHealth.isDamHealthScene(sceneType)) {
      DamHealth.setupDamHealthCamera(camera);
    } else if (ReservoirBenefit.isReservoirBenefitScene(sceneType)) {
      ReservoirBenefit.setupReservoirBenefitCamera(camera);
    } else if (TurbineWear.isTurbineWearScene(sceneType)) {
      TurbineWear.setupTurbineWearCamera(camera);
    } else if (SpillageLoss.isSpillageLossScene(sceneType)) {
      SpillageLoss.setupSpillageLossCamera(camera);
    } else if (HydroUtil.isHydroUtilScene(sceneType)) {
      HydroUtil.setupHydroUtilCamera(camera);
    } else if (VentilationEfficiency.isVentilationEfficiencyScene(sceneType)) {
      VentilationEfficiency.setupVentilationEfficiencyCamera(camera);
    } else if (MiningEnergy.isMiningEnergyScene(sceneType)) {
      MiningEnergy.setupMiningEnergyCamera(camera);
    } else if (BlastingQuality.isBlastingQualityScene(sceneType)) {
      BlastingQuality.setupBlastingQualityCamera(camera);
    } else if (MiningTruckCycle.isMiningTruckCycleScene(sceneType)) {
      MiningTruckCycle.setupMiningTruckCycleCamera(camera);
    } else if (MiningOee.isMiningOeeScene(sceneType)) {
      MiningOee.setupMiningOeeCamera(camera);
    } else if (MineralRecovery.isMineralRecoveryScene(sceneType)) {
      MineralRecovery.setupMineralRecoveryCamera(camera);
    } else if (MiningRecovery.isMiningRecoveryScene(sceneType)) {
      MiningRecovery.setupMiningRecoveryCamera(camera);
    } else if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
      MaritimeSafety.setupMaritimeSafetyCamera(camera);
    } else if (GreenPort.isGreenPortScene(sceneType)) {
      GreenPort.setupGreenPortCamera(camera);
    } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
      InlandWaterway.setupInlandWaterwayCamera(camera);
    } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
      ContainerTerminal.setupContainerTerminalCamera(camera);
    } else if (Irrigation.isIrrigationScene(sceneType)) {
      Irrigation.setupIrrigationCamera(camera);
    } else if (SmartWater.isSmartWaterScene(sceneType)) {
      SmartWater.setupSmartWaterCamera(camera);
    } else if (Cockpit.isCockpitScene(sceneType)) {
      Cockpit.setupCockpitCamera(camera, sceneType);
    } else if (SmartOps.isSmartOpsScene(sceneType)) {
      SmartOps.setupSmartOpsCamera(camera, sceneType);
    } else {
      camera.position.set(0, 0, 6);
    }
  
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    let controls: any;
    try {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true; 
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      if (type === 'transmission') {
         controls.maxPolarAngle = Math.PI / 2; 
      }


      // Stop rotation for specific scenes，2026.03.16
      if ([
        'dd-hydro-equip-lifecycle', 
        'dd-dam-safety-delivery', 
        'dd-flood-control-delivery', 
        'dd-hydro-asset-delivery',
        'dd-mine-construction',
        'dd-mine-bim-delivery',
        'dd-mine-process-delivery',
        'dd-mine-processing',
        'dd-mine-equip-lifecycle',
        'dd-mine-safety-delivery'
      ].includes(sceneType)) {
        controls.autoRotate = false;
      }
      
      if (['dd-flood-control-delivery', 'dd-mine-process-delivery', 'dd-mine-processing', 'dd-mine-safety-delivery'].includes(sceneType)) {
        controls.enablePan = true;
      }



    } catch (e) {
      console.warn("OrbitControls failed to initialize", e);
    }
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
 


    // Dynamic light colors based on type
    let mainLightColor = color;
    if (type === 'generator') mainLightColor = '#f59e0b';
    if (type === 'transmission') mainLightColor = '#a855f7';
    if (type === 'pump') mainLightColor = '#06b6d4';
    if (type === 'outfall') mainLightColor = '#10b981';
    if (type === 'wastewater') mainLightColor = '#3b82f6';
    if (type === 'wind-turbine') mainLightColor = '#0ea5e9';
    if (type === 'ship') mainLightColor = '#38bdf8';
    if (type === 'berthing') mainLightColor = '#f97316';
    if (type === 'crane') mainLightColor = '#facc15';
    if (type === 'buoy') mainLightColor = '#eab308'; 
    if (type === 'tachometer') mainLightColor = '#d946ef';
    if (type === 'mine-hoist') mainLightColor = '#d97706'; 
    if (type === 'tbm') mainLightColor = '#ef4444';
    if (type === 'drilling-rig') mainLightColor = '#06b6d4';
    if (type === 'crusher') mainLightColor = '#f59e0b'; 
    if (type === 'flotation-cell') mainLightColor = '#8b5cf6';
    if (type === 'sand-maker') mainLightColor = '#eab308';
    
    //2026.03.16
    if (sceneType === 'dd-hydro-equip-lifecycle') mainLightColor = '#14b8a6';
    if (sceneType === 'dd-dam-safety-delivery') mainLightColor = '#22c55e';
    if (sceneType === 'dd-hydro-monitor-delivery') mainLightColor = '#06b6d4';
    if (sceneType === 'dd-flood-control-delivery') mainLightColor = '#ef4444';
    if (sceneType === 'dd-hydro-asset-delivery') mainLightColor = '#eab308';
    if (sceneType === 'dd-mine-construction') mainLightColor = '#f97316';
    if (sceneType === 'dd-mine-bim-delivery') mainLightColor = '#0ea5e9';
    if (sceneType === 'dd-mine-process-delivery') mainLightColor = '#eab308';
    if (sceneType === 'dd-mine-processing') mainLightColor = '#8b5cf6';
    if (sceneType === 'dd-mine-equip-lifecycle') mainLightColor = '#f97316';
    if (sceneType === 'dd-mine-safety-delivery') mainLightColor = '#00ff9d';
  
    const pointLight = new THREE.PointLight(mainLightColor, 3, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);


    const pointLight2 = new THREE.PointLight(0xffffff, 1, 20);
    pointLight2.position.set(-5, 0, 2);
    scene.add(pointLight2);

    const group = new THREE.Group();
    scene.add(group);
    if (group) {
      group.children.forEach(item => {
        if (item) {
          group.remove(item);
        }
      });
    }

    // Materials
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: mainLightColor, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15
    });
    const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const solidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.9,
      emissive: mainLightColor,
      emissiveIntensity: 0.15
    });
    const core = new THREE.Mesh(coreGeo, solidMaterial);

    const disposables: { dispose: () => void }[] = [];
    disposables.push(wireframeMaterial, solidMaterial);
    group.add(mesh);
    group.add(core);
    // Use a specific object to hold animated parts
    const animatables:  { 
        rotor?: THREE.Object3D, 
        particles?: THREE.Points, 
        shipGroup?: THREE.Group, 
        water?: THREE.Mesh, 
        lasers?: THREE.LineSegments[], 
        trolley?: THREE.Group, 
        hookGroup?: THREE.Group,
        buoyGroup?: THREE.Group,
        lanternLight?: THREE.PointLight,
        toneRing?: THREE.Group,
        hoistSheave?: THREE.Mesh,
        cage?: THREE.Group,
        counterWeight?: THREE.Mesh,
        ropes?: THREE.Line,
        tbmCutterhead?: THREE.Group,
        tbmDebris?: THREE.Points,
        drillString?: THREE.Group,
        topDrive?: THREE.Group,
        crusherCone?: THREE.Group,
        crusherRocks?: THREE.Points,
        flotationAgitator?: THREE.Group,
        flotationBubbles?: THREE.Points,
        flotationFroth?: THREE.Points,
        vsiRotor?: THREE.Group,
        vsiParticles?: THREE.Points
    } = {};

    //2026.03.16
    animatablesRef.current = animatables;
        // --- BUILDER ROUTING ---
    if (MineSafetyDelivery.isMineSafetyDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineSafetyDelivery.isMineSafetyDeliveryScene判定为true)`);
      console.log(`调用函数: MineSafetyDelivery.initMineSafetyDeliveryScene(${sceneType}, group, animatables, disposables)`);
      MineSafetyDelivery.initMineSafetyDeliveryScene(sceneType, group, animatables, disposables);
    } else if (MineEquipLifecycleDelivery.isMineEquipLifecycleScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineEquipLifecycleDelivery.isMineEquipLifecycleScene判定为true)`);
      console.log(`调用函数: MineEquipLifecycleDelivery.initMineEquipLifecycleScene(${sceneType}, group, animatables, disposables)`);
      MineEquipLifecycleDelivery.initMineEquipLifecycleScene(sceneType, group, animatables, disposables);
    } else if (MineProcessDelivery.isMineProcessDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineProcessDelivery.isMineProcessDeliveryScene判定为true)`);
      console.log(`调用函数: MineProcessDelivery.initMineProcessDeliveryScene(${sceneType}, group, animatables, disposables)`);
      MineProcessDelivery.initMineProcessDeliveryScene(sceneType, group, animatables, disposables);
    } else if (MineProcessingDelivery.isMineProcessingDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineProcessingDelivery.isMineProcessingDeliveryScene判定为true)`);
      console.log(`调用函数: MineProcessingDelivery.initMineProcessingDeliveryScene(${sceneType}, group, animatables, disposables)`);
      MineProcessingDelivery.initMineProcessingDeliveryScene(sceneType, group, animatables, disposables);
    } else if (MineBimDelivery.isMineBimDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineBimDelivery.isMineBimDeliveryScene判定为true)`);
      console.log(`调用函数: MineBimDelivery.initMineBimDeliveryScene(${sceneType}, group, animatables, disposables)`);
      MineBimDelivery.initMineBimDeliveryScene(sceneType, group, animatables, disposables);
    } else if (MineConstructionDelivery.isMineConstructionDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineConstructionDelivery.isMineConstructionDeliveryScene判定为true)`);
      console.log(`调用函数: MineConstructionDelivery.initMineConstructionDeliveryScene(${sceneType}, group, animatables, disposables)`);
      MineConstructionDelivery.initMineConstructionDeliveryScene(sceneType, group, animatables, disposables);
    } else if (HydroAssetDelivery.isHydroAssetDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroAssetDelivery.isHydroAssetDeliveryScene判定为true)`);
      console.log(`调用函数: HydroAssetDelivery.initHydroAssetDeliveryScene(${sceneType}, group, animatables, disposables)`);
      HydroAssetDelivery.initHydroAssetDeliveryScene(sceneType, group, animatables, disposables);
    } else if (FloodDispatchDelivery.isFloodDispatchDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (FloodDispatchDelivery.isFloodDispatchDeliveryScene判定为true)`);
      console.log(`调用函数: FloodDispatchDelivery.initFloodDispatchDeliveryScene(${sceneType}, group, animatables, disposables)`);
      FloodDispatchDelivery.initFloodDispatchDeliveryScene(sceneType, group, animatables, disposables);
    } else if (HydroMonitorDelivery.isHydroMonitorDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroMonitorDelivery.isHydroMonitorDeliveryScene判定为true)`);
      console.log(`调用函数: HydroMonitorDelivery.initHydroMonitorDeliveryScene(${sceneType}, group, animatables, disposables)`);
      HydroMonitorDelivery.initHydroMonitorDeliveryScene(sceneType, group, animatables, disposables);
    } else if (DamSafetyDelivery.isDamSafetyDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (DamSafetyDelivery.isDamSafetyDeliveryScene判定为true)`);
      console.log(`调用函数: DamSafetyDelivery.initDamSafetyDeliveryScene(${sceneType}, group, animatables, disposables)`);
      DamSafetyDelivery.initDamSafetyDeliveryScene(sceneType, group, animatables, disposables);
    } else if (HydroEquipLifecycle.isHydroEquipLifecycleScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroEquipLifecycle.isHydroEquipLifecycleScene判定为true)`);
      console.log(`调用函数: HydroEquipLifecycle.initHydroEquipLifecycleScene(${sceneType}, group, animatables, disposables)`);
      HydroEquipLifecycle.initHydroEquipLifecycleScene(sceneType, group, animatables, disposables);
    } else if (HydroDispatch.isHydroDispatchScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroDispatch.isHydroDispatchScene判定为true)`);
      console.log(`调用函数: HydroDispatch.initHydroDispatchScene(${sceneType}, group, animatables, disposables)`);
      HydroDispatch.initHydroDispatchScene(sceneType, group, animatables, disposables);
    } else if (HydroBimDelivery.isHydroBimDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroBimDelivery.isHydroBimDeliveryScene判定为true)`);
      console.log(`调用函数: HydroBimDelivery.initHydroBimDeliveryScene(${sceneType}, group, animatables, disposables)`);
      HydroBimDelivery.initHydroBimDeliveryScene(sceneType, group, animatables, disposables);
    } else if (HydroTwinDelivery.isHydroTwinDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroTwinDelivery.isHydroTwinDeliveryScene判定为true)`);
      console.log(`调用函数: HydroTwinDelivery.initHydroTwinDeliveryScene(${sceneType}, group, animatables, disposables)`);
      HydroTwinDelivery.initHydroTwinDeliveryScene(sceneType, group, animatables, disposables);
    } else if (HydroDelivery.isHydroDeliveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroDelivery.isHydroDeliveryScene判定为true)`);
      console.log(`调用函数: HydroDelivery.initHydroDeliveryScene(${sceneType}, group, animatables, disposables)`);
      HydroDelivery.initHydroDeliveryScene(sceneType, group, animatables, disposables);
    } else if (ChannelSafety.isChannelSafetyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (ChannelSafety.isChannelSafetyScene判定为true)`);
      console.log(`调用函数: ChannelSafety.initChannelSafetyScene(${sceneType}, group, animatables, disposables)`);
      ChannelSafety.initChannelSafetyScene(sceneType, group, animatables, disposables);
    } else if (TransportConnect.isTransportConnectScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (TransportConnect.isTransportConnectScene判定为true)`);
      console.log(`调用函数: TransportConnect.initTransportConnectScene(${sceneType}, group, animatables, disposables)`);
      TransportConnect.initTransportConnectScene(sceneType, group, animatables, disposables);
    } else if (LockEfficiency.isLockEfficiencyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (LockEfficiency.isLockEfficiencyScene判定为true)`);
      console.log(`调用函数: LockEfficiency.initLockEfficiencyScene(${sceneType}, group, animatables, disposables)`);
      LockEfficiency.initLockEfficiencyScene(sceneType, group, animatables, disposables);
    } else if (ShipCii.isShipCiiScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (ShipCii.isShipCiiScene判定为true)`);
      console.log(`调用函数: ShipCii.initShipCiiScene(${sceneType}, group, animatables, disposables)`);
      ShipCii.initShipCiiScene(sceneType, group, animatables, disposables);
    } else if (ShipEeoi.isShipEeoiScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (ShipEeoi.isShipEeoiScene判定为true)`);
      console.log(`调用函数: ShipEeoi.initShipEeoiScene(${sceneType}, group, animatables, disposables)`);
      ShipEeoi.initShipEeoiScene(sceneType, group, animatables, disposables);
    } else if (CraneEfficiency.isCraneEfficiencyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (CraneEfficiency.isCraneEfficiencyScene判定为true)`);
      console.log(`调用函数: CraneEfficiency.initCraneEfficiencyScene(${sceneType}, group, animatables, disposables)`);
      CraneEfficiency.initCraneEfficiencyScene(sceneType, group, animatables, disposables);
    } else if (BerthUtil.isBerthUtilScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (BerthUtil.isBerthUtilScene判定为true)`);
      console.log(`调用函数: BerthUtil.initBerthUtilScene(${sceneType}, group, animatables, disposables)`);
      BerthUtil.initBerthUtilScene(sceneType, group, animatables, disposables);
    } else if (PowerRam.isPowerRamScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (PowerRam.isPowerRamScene判定为true)`);
      console.log(`调用函数: PowerRam.initPowerRamScene(${sceneType}, group, animatables, disposables)`);
      PowerRam.initPowerRamScene(sceneType, group, animatables, disposables);
    } else if (PumpedStorageEfficiency.isPumpedStorageEfficiencyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (PumpedStorageEfficiency.isPumpedStorageEfficiencyScene判定为true)`);
      console.log(`调用函数: PumpedStorageEfficiency.initPumpedStorageEfficiencyScene(${sceneType}, group, animatables, disposables)`);
      PumpedStorageEfficiency.initPumpedStorageEfficiencyScene(sceneType, group, animatables, disposables);
    } else if (DamHealth.isDamHealthScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (DamHealth.isDamHealthScene判定为true)`);
      console.log(`调用函数: DamHealth.initDamHealthScene(${sceneType}, group, animatables, disposables)`);
      DamHealth.initDamHealthScene(sceneType, group, animatables, disposables);
    } else if (ReservoirBenefit.isReservoirBenefitScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (ReservoirBenefit.isReservoirBenefitScene判定为true)`);
      console.log(`调用函数: ReservoirBenefit.initReservoirBenefitScene(${sceneType}, group, animatables, disposables)`);
      ReservoirBenefit.initReservoirBenefitScene(sceneType, group, animatables, disposables);
    } else if (TurbineWear.isTurbineWearScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (TurbineWear.isTurbineWearScene判定为true)`);
      console.log(`调用函数: TurbineWear.initTurbineWearScene(${sceneType}, group, animatables, disposables)`);
      TurbineWear.initTurbineWearScene(sceneType, group, animatables, disposables);
    } else if (SpillageLoss.isSpillageLossScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (SpillageLoss.isSpillageLossScene判定为true)`);
      console.log(`调用函数: SpillageLoss.initSpillageLossScene(${sceneType}, group, animatables, disposables)`);
      SpillageLoss.initSpillageLossScene(sceneType, group, animatables, disposables);
    } else if (HydroUtil.isHydroUtilScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (HydroUtil.isHydroUtilScene判定为true)`);
      console.log(`调用函数: HydroUtil.initHydroUtilScene(${sceneType}, group, animatables, disposables)`);
      HydroUtil.initHydroUtilScene(sceneType, group, animatables, disposables);
    } else if (VentilationEfficiency.isVentilationEfficiencyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (VentilationEfficiency.isVentilationEfficiencyScene判定为true)`);
      console.log(`调用函数: VentilationEfficiency.initVentilationEfficiencyScene(${sceneType}, group, animatables, disposables)`);
      VentilationEfficiency.initVentilationEfficiencyScene(sceneType, group, animatables, disposables);
    } else if (MiningEnergy.isMiningEnergyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MiningEnergy.isMiningEnergyScene判定为true)`);
      console.log(`调用函数: MiningEnergy.initMiningEnergyScene(${sceneType}, group, animatables, disposables)`);
      MiningEnergy.initMiningEnergyScene(sceneType, group, animatables, disposables);
    } else if (BlastingQuality.isBlastingQualityScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (BlastingQuality.isBlastingQualityScene判定为true)`);
      console.log(`调用函数: BlastingQuality.initBlastingQualityScene(${sceneType}, group, animatables, disposables)`);
      BlastingQuality.initBlastingQualityScene(sceneType, group, animatables, disposables);
    } else if (MiningTruckCycle.isMiningTruckCycleScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MiningTruckCycle.isMiningTruckCycleScene判定为true)`);
      console.log(`调用函数: MiningTruckCycle.initMiningTruckCycleScene(${sceneType}, group, animatables, disposables)`);
      MiningTruckCycle.initMiningTruckCycleScene(sceneType, group, animatables, disposables);
    } else if (MiningOee.isMiningOeeScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MiningOee.isMiningOeeScene判定为true)`);
      console.log(`调用函数: MiningOee.initMiningOeeScene(${sceneType}, group, animatables, disposables)`);
      MiningOee.initMiningOeeScene(sceneType, group, animatables, disposables);
    } else if (MineralRecovery.isMineralRecoveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MineralRecovery.isMineralRecoveryScene判定为true)`);
      console.log(`调用函数: MineralRecovery.initMineralRecoveryScene(${sceneType}, group, animatables, disposables)`);
      MineralRecovery.initMineralRecoveryScene(sceneType, group, animatables, disposables);
    } else if (MiningRecovery.isMiningRecoveryScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MiningRecovery.isMiningRecoveryScene判定为true)`);
      console.log(`调用函数: MiningRecovery.initMiningRecoveryScene(${sceneType}, group, animatables, disposables)`);
      MiningRecovery.initMiningRecoveryScene(sceneType, group, animatables, disposables);
    } else if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (MaritimeSafety.isMaritimeSafetyScene判定为true)`);
      console.log(`调用函数: MaritimeSafety.initMaritimeSafetyScene(${sceneType}, group, animatables, disposables)`);
      MaritimeSafety.initMaritimeSafetyScene(sceneType, group, animatables, disposables);
    } else if (GreenPort.isGreenPortScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (GreenPort.isGreenPortScene判定为true)`);
      console.log(`调用函数: GreenPort.initGreenPortScene(${sceneType}, group, animatables, disposables)`);
      GreenPort.initGreenPortScene(sceneType, group, animatables, disposables);
    } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (InlandWaterway.isInlandWaterwayScene判定为true)`);
      console.log(`调用函数: InlandWaterway.initInlandWaterwayScene(${sceneType}, group, animatables, disposables)`);
      InlandWaterway.initInlandWaterwayScene(sceneType, group, animatables, disposables);
    } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (ContainerTerminal.isContainerTerminalScene判定为true)`);
      console.log(`调用函数: ContainerTerminal.initContainerTerminalScene(${sceneType}, group, animatables, disposables)`);
      ContainerTerminal.initContainerTerminalScene(sceneType, group, animatables, disposables);
    } else if (Irrigation.isIrrigationScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (Irrigation.isIrrigationScene判定为true)`);
      console.log(`调用函数: Irrigation.initIrrigationScene(${sceneType}, group, animatables, disposables)`);
      Irrigation.initIrrigationScene(sceneType, group, animatables, disposables);
    } else if (SmartWater.isSmartWaterScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (SmartWater.isSmartWaterScene判定为true)`);
      console.log(`调用函数: SmartWater.initSmartWaterScene(${sceneType}, group, animatables, disposables)`);
      SmartWater.initSmartWaterScene(sceneType, group, animatables, disposables);
    } else if (Cockpit.isCockpitScene(sceneType)) {
      // 2026.03.17 添加控制台输出，打印进入条件和调用函数
      console.log(`进入条件: sceneType === '${sceneType}' (Cockpit.isCockpitScene判定为true)`);
      console.log(`调用函数: Cockpit.initCockpitScene(${sceneType}, group, animatables, disposables)`);
      Cockpit.initCockpitScene(sceneType, group, animatables, disposables);
    } 
    // else if (SmartOps.isSmartOpsScene(sceneType)) {
    //   // 2026.03.17 添加控制台输出，打印进入条件和调用函数
    //   console.log(`进入条件: sceneType === '${sceneType}' (SmartOps.isSmartOpsScene判定为true)`);
    //   console.log(`调用函数: SmartOps.initSmartOpsScene(${sceneType}, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial })`);
    //   SmartOps.initSmartOpsScene(sceneType, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial });
    // }





    // 2026.02.02，以下三段注释代码生成了另一套不受动画控制的静止3d模型，如需恢复需修复以下函数与现有3d模型生成代码的冲突
    // if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
    //   MaritimeSafety.initMaritimeSafetyScene(sceneType, group, animatables, disposables);
    // } else if (GreenPort.isGreenPortScene(sceneType)) {
    //   GreenPort.initGreenPortScene(sceneType, group, animatables, disposables);
    // } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
    //   InlandWaterway.initInlandWaterwayScene(sceneType, group, animatables, disposables);
    // } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
    //   ContainerTerminal.initContainerTerminalScene(sceneType, group, animatables, disposables);
    // } else if (Irrigation.isIrrigationScene(sceneType)) {
    //   Irrigation.initIrrigationScene(sceneType, group, animatables, disposables);
    // } else if (SmartWater.isSmartWaterScene(sceneType)) {
    //   SmartWater.initSmartWaterScene(sceneType, group, animatables, disposables);
    // } else if (Cockpit.isCockpitScene(sceneType)) {
    //   Cockpit.initCockpitScene(sceneType, group, animatables, disposables);
    // } else if (SmartOps.isSmartOpsScene(sceneType)) {
    //   SmartOps.initSmartOpsScene(sceneType, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial });
    // } else {
    //     const geometry = new THREE.IcosahedronGeometry(1.3, 2);
    //     disposables.push(geometry);
    //     const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    //     const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    //     disposables.push(coreGeo);
    //     const core = new THREE.Mesh(coreGeo, solidMaterial);
    //     group.add(mesh);
    //     group.add(core);
    // }
    
    // if (!Cockpit.isCockpitScene(sceneType) && 
    //     !SmartWater.isSmartWaterScene(sceneType) && 
    //     !Irrigation.isIrrigationScene(sceneType) &&
    //     !ContainerTerminal.isContainerTerminalScene(sceneType) &&
    //     !InlandWaterway.isInlandWaterwayScene(sceneType) &&
    //     !GreenPort.isGreenPortScene(sceneType) &&
    //     !MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
    //   group.rotation.x = 0.4;
    //   group.rotation.y = 0.6;
    // }
    
    // if (SmartOps.isSmartOpsScene(currentType)) {
    //   SmartOps.initSmartOpsScene(currentType, group, animatables, disposables, { wireframe: wireframeMaterial, solid: solidMaterial });
    // } else {
    //     const geometry = new THREE.IcosahedronGeometry(1.3, 2);
    //     disposables.push(geometry);
    //     const mesh = new THREE.Mesh(geometry, wireframeMaterial);
    //     const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    //     disposables.push(coreGeo);
    //     const core = new THREE.Mesh(coreGeo, solidMaterial);
    //     group.add(mesh);
    //     group.add(core);
    // }


    
    // --- GEOMETRY GENERATION ---
    if (type === 'turbine') {
        console.log("=== turbine group ===");
        const geometry = new THREE.TorusKnotGeometry(1, 0.35, 128, 32, 2, 3);
        disposables.push(geometry);
        const mesh = new THREE.Mesh(geometry, wireframeMaterial);
        const coreGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 32);
        coreGeo.rotateX(Math.PI / 2);
        disposables.push(coreGeo);
        const core = new THREE.Mesh(coreGeo, solidMaterial);
        group.add(mesh);
        group.add(core);
    } else if (type === 'generator') {
        console.log("=== generator group ===");
        const statorGeo = new THREE.CylinderGeometry(2.2, 2.2, 3, 32, 4, true);
        disposables.push(statorGeo);
        const stator = new THREE.Mesh(statorGeo, wireframeMaterial);
        group.add(stator);
        const rotorGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.8, 64);
        disposables.push(rotorGeo);
        const rotorMat = new THREE.MeshStandardMaterial({color: 0x333333, metalness: 1.0, roughness: 0.4, emissive: 0xb45309, emissiveIntensity: 0.2});
        disposables.push(rotorMat);
        const rotor = new THREE.Mesh(rotorGeo, rotorMat);
        group.add(rotor);
        const capGeo = new THREE.RingGeometry(0.5, 2.2, 32);
        capGeo.rotateX(-Math.PI / 2);
        capGeo.translate(0, 1.5, 0);
        disposables.push(capGeo);
        const capTop = new THREE.Mesh(capGeo, solidMaterial);
        group.add(capTop);
        const capBottom = capTop.clone();
        capBottom.position.y = -3; 
        group.add(capBottom);
        const ringGeo = new THREE.TorusGeometry(2.6, 0.02, 16, 100);
        disposables.push(ringGeo);
        const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }));
        group.add(ringMesh);
    } else if (type === 'transmission') {
        console.log("=== transmission group ===");
        const towerHeight = 7;
        const towerBaseWidth = 1.5;
        const towerTopWidth = 0.5;
        const towerGeo = new THREE.CylinderGeometry(towerTopWidth, towerBaseWidth, towerHeight, 4, 8, true);
        towerGeo.translate(0, towerHeight/2 - 2, 0);
        disposables.push(towerGeo);
        const tower = new THREE.Mesh(towerGeo, wireframeMaterial);
        group.add(tower);
        const armGeo = new THREE.BoxGeometry(3.5, 0.1, 0.2);
        disposables.push(armGeo);
        const armTop = new THREE.Mesh(armGeo, solidMaterial);
        armTop.position.set(0, 4, 0);
        group.add(armTop);
        const armMid = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 0.2), solidMaterial);
        armMid.position.set(0, 2.5, 0);
        group.add(armMid);
        const armBot = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.2), solidMaterial);
        armBot.position.set(0, 1, 0);
        group.add(armBot);
        const insGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const insMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
        disposables.push(insGeo, insMat);
        [-1.5, 1.5].forEach(x => { const ins1 = new THREE.Mesh(insGeo, insMat); ins1.position.set(x, 3.6, 0); group.add(ins1); });
        [-2.0, 2.0].forEach(x => { const ins = new THREE.Mesh(insGeo, insMat); ins.position.set(x, 2.1, 0); group.add(ins); });
        [-1.5, 1.5].forEach(x => { const ins = new THREE.Mesh(insGeo, insMat); ins.position.set(x, 0.6, 0); group.add(ins); });
    } else if (type === 'pump') {
        console.log("=== pump group ===");
        const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
        disposables.push(motorGeo);
        const motor = new THREE.Mesh(motorGeo, solidMaterial);
        motor.position.y = 2.5;
        group.add(motor);
        const finGeo = new THREE.CylinderGeometry(1.3, 1.3, 2, 8, 1, true);
        disposables.push(finGeo);
        const fins = new THREE.Mesh(finGeo, wireframeMaterial);
        fins.position.y = 2.5;
        group.add(fins);
        const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
        disposables.push(shaftGeo);
        const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.2 }));
        shaft.position.y = 0.5;
        group.add(shaft);
        const voluteGeo = new THREE.SphereGeometry(1.8, 32, 16);
        voluteGeo.scale(1, 0.6, 1);
        disposables.push(voluteGeo);
        const volute = new THREE.Mesh(voluteGeo, solidMaterial);
        volute.position.y = -1.5;
        group.add(volute);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, roughness: 0.4 });
        disposables.push(pipeMat);
        const inletGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 16);
        inletGeo.rotateZ(Math.PI / 2);
        inletGeo.translate(-2, -1.5, 0);
        disposables.push(inletGeo);
        const inlet = new THREE.Mesh(inletGeo, pipeMat);
        group.add(inlet);
        const outletGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 16);
        outletGeo.rotateX(Math.PI / 2);
        outletGeo.translate(0, -1.5, 2);
        disposables.push(outletGeo);
        const outlet = new THREE.Mesh(outletGeo, pipeMat);
        group.add(outlet);
    } else if (type === 'outfall') {
        console.log("=== outfall group ===");
        const wallGeo = new THREE.BoxGeometry(4, 5, 1);
        disposables.push(wallGeo);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });
        disposables.push(wallMat);
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.z = -1;
        wall.position.y = 0;
        group.add(wall);
        const pipeGeo = new THREE.CylinderGeometry(1, 1, 3, 32, 1, true);
        pipeGeo.rotateX(Math.PI / 2);
        disposables.push(pipeGeo);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, side: THREE.DoubleSide });
        disposables.push(pipeMat);
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.z = 0.5;
        group.add(pipe);
        const particleCount = 100;
        const particles = new Float32Array(particleCount * 3);
        const particleGeo = new THREE.BufferGeometry();
        for(let i=0; i<particleCount; i++) {
             particles[i*3] = (Math.random() - 0.5) * 0.8;
             particles[i*3+1] = (Math.random() - 0.5) * 0.8;
             particles[i*3+2] = 2 + Math.random() * 2;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
        const pMat = new THREE.PointsMaterial({ color: 0x34d399, size: 0.08, transparent: true, opacity: 0.6 });
        disposables.push(particleGeo, pMat);
        const particleSystem = new THREE.Points(particleGeo, pMat);
        group.add(particleSystem);
        animatables.particles = particleSystem;
    } else if (type === 'wastewater') {
        console.log("=== wastewater group ===");
        const aeroGeo = new THREE.BoxGeometry(4, 1.5, 3);
        disposables.push(aeroGeo);
        const tankMat = new THREE.MeshStandardMaterial({ 
            color: 0x1e3a8a, 
            roughness: 0.2, 
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        disposables.push(tankMat);
        const aerationTank = new THREE.Mesh(aeroGeo, tankMat);
        aerationTank.position.set(-2, 0, 0);
        group.add(aerationTank);
        const bubbleCount = 150;
        const bubblePos = new Float32Array(bubbleCount * 3);
        const bubbleGeo = new THREE.BufferGeometry();
        for(let i=0; i<bubbleCount; i++) {
            bubblePos[i*3] = -3.5 + Math.random() * 3;
            bubblePos[i*3+1] = -0.7 + Math.random() * 1.5;
            bubblePos[i*3+2] = -1 + Math.random() * 2;
        }
        bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
        const bubbleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.6, transparent: true });
        disposables.push(bubbleGeo, bubbleMat);
        const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
        group.add(bubbles);
        animatables.particles = bubbles; // Reuse particles logic for bubbles
        const settlerGeo = new THREE.CylinderGeometry(2, 2, 1.5, 32);
        disposables.push(settlerGeo);
        const settler = new THREE.Mesh(settlerGeo, tankMat);
        settler.position.set(2.5, 0, 0);
        group.add(settler);
        const bridgeGeo = new THREE.BoxGeometry(4.2, 0.2, 0.4);
        disposables.push(bridgeGeo);
        const bridge = new THREE.Mesh(bridgeGeo, solidMaterial);
        bridge.position.set(2.5, 0.8, 0);
        group.add(bridge);
    } else if (type === 'wind-turbine') {
        console.log("=== wind-turbine group ===");
        const towerGeo = new THREE.CylinderGeometry(0.3, 0.6, 8, 32);
        towerGeo.translate(0, 4, 0);
        disposables.push(towerGeo);
        const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 });
        disposables.push(whiteMaterial);
        const tower = new THREE.Mesh(towerGeo, whiteMaterial);
        group.add(tower);
        const nacelleGeo = new THREE.BoxGeometry(1.5, 0.8, 1);
        disposables.push(nacelleGeo);
        const nacelle = new THREE.Mesh(nacelleGeo, whiteMaterial);
        nacelle.position.y = 8;
        nacelle.position.z = -0.3;
        group.add(nacelle);
        const rotorGroup = new THREE.Group();
        rotorGroup.position.set(0, 8, 0.5);
        group.add(rotorGroup);
        animatables.rotor = rotorGroup;
        const hubGeo = new THREE.ConeGeometry(0.4, 0.8, 16);
        hubGeo.rotateX(Math.PI / 2);
        disposables.push(hubGeo);
        const hub = new THREE.Mesh(hubGeo, whiteMaterial);
        rotorGroup.add(hub);
        const bladeGeo = new THREE.BoxGeometry(0.3, 4.5, 0.1);
        bladeGeo.translate(0, 2.25, 0);
        disposables.push(bladeGeo);
        for (let i = 0; i < 3; i++) {
           const blade = new THREE.Mesh(bladeGeo, whiteMaterial);
           blade.rotation.z = i * (Math.PI * 2 / 3);
           rotorGroup.add(blade);
        }
        // Wind particles
        const particleCount = 80;
        const particlePos = new Float32Array(particleCount * 3);
        const particleGeo = new THREE.BufferGeometry();
        for(let i=0; i<particleCount; i++) {
            particlePos[i*3] = -5 + Math.random() * 10;
            particlePos[i*3+1] = 5 + Math.random() * 5;
            particlePos[i*3+2] = 5 + Math.random() * 5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.05, opacity: 0.6, transparent: true });
        disposables.push(particleGeo, pMat);
        const particles = new THREE.Points(particleGeo, pMat);
        group.add(particles);
        animatables.particles = particles;
    } else if (type === 'ship') {
      console.log("=== ship group ===");
        const shipGroup = new THREE.Group();
        group.add(shipGroup);
        animatables.shipGroup = shipGroup;
        const hullGeo = new THREE.BoxGeometry(2, 1.2, 8);
        disposables.push(hullGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.4 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0;
        shipGroup.add(hull);
        const bridgeGeo = new THREE.BoxGeometry(1.8, 1.5, 1.5);
        disposables.push(bridgeGeo);
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        disposables.push(bridgeMat);
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, 1.3, -2.5);
        shipGroup.add(bridge);
        const containerGeo = new THREE.BoxGeometry(1.5, 0.8, 4);
        disposables.push(containerGeo);
        const containerMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.8 });
        disposables.push(containerMat);
        const containers = new THREE.Mesh(containerGeo, containerMat);
        containers.position.set(0, 1, 1);
        shipGroup.add(containers);
        const waterGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ 
            color: 0x0284c7, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1,
            metalness: 0.5,
            wireframe: true 
        });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -0.5;
        group.add(water);
        animatables.water = water;
    } else if (type === 'berthing') {
        console.log("=== berthing group ===");
        const quayGeo = new THREE.BoxGeometry(4, 3, 12);
        disposables.push(quayGeo);
        const quayMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
        disposables.push(quayMat);
        const quay = new THREE.Mesh(quayGeo, quayMat);
        quay.position.set(-3, 0, 0);
        group.add(quay);
        const shipGroup = new THREE.Group();
        group.add(shipGroup);
        animatables.shipGroup = shipGroup;
        const hullSideGeo = new THREE.BoxGeometry(2, 4, 10);
        disposables.push(hullSideGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.2 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullSideGeo, hullMat);
        hull.position.set(1.5, 0.5, 0);
        shipGroup.add(hull);
        const deckGeo = new THREE.BoxGeometry(1.8, 0.1, 9.8);
        disposables.push(deckGeo);
        const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
        deck.position.set(1.5, 2.5, 0);
        shipGroup.add(deck);
        const waterGeo = new THREE.PlaneGeometry(15, 15);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, transparent: true, opacity: 0.5 });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -1;
        group.add(water);
    } else if (type === 'crane') {
        console.log("=== crane group ===");
        const craneGroup = new THREE.Group();
        group.add(craneGroup);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
        const legGeo = new THREE.BoxGeometry(0.5, 6, 0.5);
        disposables.push(legGeo);
        const legL1 = new THREE.Mesh(legGeo, legMaterial); legL1.position.set(-4, 3, 2); craneGroup.add(legL1);
        const legL2 = new THREE.Mesh(legGeo, legMaterial); legL2.position.set(-4, 3, -2); craneGroup.add(legL2);
        const legR1 = new THREE.Mesh(legGeo, legMaterial); legR1.position.set(4, 3, 2); craneGroup.add(legR1);
        const legR2 = new THREE.Mesh(legGeo, legMaterial); legR2.position.set(4, 3, -2); craneGroup.add(legR2);
        const girderGeo = new THREE.BoxGeometry(12, 0.8, 1);
        disposables.push(girderGeo);
        const girder = new THREE.Mesh(girderGeo, legMaterial);
        girder.position.set(0, 6, 0);
        craneGroup.add(girder);
        const trolleyGroup = new THREE.Group();
        trolleyGroup.position.set(0, 6.5, 0); 
        craneGroup.add(trolleyGroup);
        animatables.trolley = trolleyGroup;
        const trolleyGeo = new THREE.BoxGeometry(1, 0.5, 1.2);
        disposables.push(trolleyGeo);
        const trolley = new THREE.Mesh(trolleyGeo, new THREE.MeshStandardMaterial({color: 0x334155}));
        trolleyGroup.add(trolley);
        const hookGroup = new THREE.Group();
        hookGroup.position.set(0, -2, 0); 
        trolleyGroup.add(hookGroup);
        animatables.hookGroup = hookGroup;
        const containerGeo = new THREE.BoxGeometry(2, 2, 4);
        disposables.push(containerGeo);
        const container = new THREE.Mesh(containerGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        container.position.y = -1.1; 
        hookGroup.add(container);
    } else if (type === 'buoy') {
        console.log("=== buoy group ===");
        const buoyGroup = new THREE.Group();
        group.add(buoyGroup);
        animatables.buoyGroup = buoyGroup;
        const hullGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
        disposables.push(hullGeo);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 });
        disposables.push(hullMat);
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 0;
        buoyGroup.add(hull);
        const towerGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
        disposables.push(towerGeo);
        const tower = new THREE.Mesh(towerGeo, hullMat);
        tower.position.y = 2.5;
        buoyGroup.add(tower);
        const lanternGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
        disposables.push(lanternGeo);
        const lantern = new THREE.Mesh(lanternGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
        lantern.position.y = 4.2;
        buoyGroup.add(lantern);
        const light = new THREE.PointLight(0xffff00, 0, 20); 
        light.position.y = 4.5;
        buoyGroup.add(light);
        animatables.lanternLight = light;
        const waterGeo = new THREE.PlaneGeometry(30, 30, 64, 64);
        waterGeo.rotateX(-Math.PI / 2);
        disposables.push(waterGeo);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8, wireframe: true, transparent: true, opacity: 0.4 });
        disposables.push(waterMat);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -0.8;
        group.add(water);
        animatables.water = water;
    } else if (type === 'tachometer') {
        console.log("=== tachometer group ===");
        const tachGroup = new THREE.Group();
        group.add(tachGroup);
        const toneRingGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        const teethGroup = new THREE.Group();
        const toothGeo = new THREE.BoxGeometry(0.3, 0.5, 0.5);
        for(let i=0; i<32; i++) {
            const tooth = new THREE.Mesh(toothGeo, solidMaterial);
            const angle = (i / 32) * Math.PI * 2;
            tooth.position.x = Math.cos(angle) * 2;
            tooth.position.z = Math.sin(angle) * 2;
            tooth.rotation.y = -angle;
            teethGroup.add(tooth);
        }
        disposables.push(toneRingGeo, toothGeo);
        const ringCore = new THREE.Mesh(toneRingGeo, solidMaterial);
        teethGroup.add(ringCore);
        tachGroup.add(teethGroup);
        animatables.toneRing = teethGroup;
        const sensorGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
        sensorGeo.rotateX(Math.PI/2);
        disposables.push(sensorGeo);
        const sensor = new THREE.Mesh(sensorGeo, new THREE.MeshStandardMaterial({ color: 0xd946ef }));
        sensor.position.set(2.5, 0, 0); 
        tachGroup.add(sensor);
        tachGroup.rotation.x = 0.5;
        tachGroup.rotation.y = 0.5;
    } else if (type === 'mine-hoist') {
        console.log("=== mine-hoist group ===");
        const hoistGroup = new THREE.Group();
        group.add(hoistGroup);
        const sheaveGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
        sheaveGeo.rotateZ(Math.PI / 2);
        disposables.push(sheaveGeo);
        const sheaveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.6 });
        disposables.push(sheaveMat);
        const sheave = new THREE.Mesh(sheaveGeo, sheaveMat);
        sheave.position.y = 4;
        hoistGroup.add(sheave);
        animatables.hoistSheave = sheave;
        const cageGroup = new THREE.Group();
        cageGroup.position.set(-2.5, 0, 0);
        hoistGroup.add(cageGroup);
        animatables.cage = cageGroup;
        const cageGeo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
        disposables.push(cageGeo);
        const cage = new THREE.Mesh(cageGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true }));
        cageGroup.add(cage);
        const cwGeo = new THREE.BoxGeometry(1, 1.5, 0.5);
        disposables.push(cwGeo);
        const cw = new THREE.Mesh(cwGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
        cw.position.set(2.5, -2, 0);
        hoistGroup.add(cw);
        animatables.counterWeight = cw;
        const ropeGeo = new THREE.BufferGeometry();
        const ropePos = new Float32Array([
            -2.5, 0, 0, 
            -2.5, 4, 0, 
            2.5, 4, 0,  
            2.5, -2, 0  
        ]);
        ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePos, 3));
        const ropeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        disposables.push(ropeGeo, ropeMat);
        const ropes = new THREE.Line(ropeGeo, ropeMat);
        hoistGroup.add(ropes);
        animatables.ropes = ropes;
    } else if (type === 'tbm') {
        console.log("=== tbm group ===");
        const tbmGroup = new THREE.Group();
        group.add(tbmGroup);
        const cutterheadGroup = new THREE.Group();
        cutterheadGroup.position.z = 2.5; 
        cutterheadGroup.rotateX(Math.PI / 2); 
        tbmGroup.add(cutterheadGroup);
        animatables.tbmCutterhead = cutterheadGroup;
        const discGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32);
        disposables.push(discGeo);
        const discMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.4 });
        disposables.push(discMat);
        const disc = new THREE.Mesh(discGeo, discMat);
        cutterheadGroup.add(disc);
        const bodyGeo = new THREE.CylinderGeometry(1.85, 1.85, 5, 32);
        bodyGeo.rotateX(Math.PI / 2);
        disposables.push(bodyGeo);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.5, metalness: 0.5 });
        disposables.push(bodyMat);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        tbmGroup.add(body);
        const particleCount = 100;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 3; 
            pPos[i*3+1] = -1.5 + Math.random(); 
            pPos[i*3+2] = 2.5 + Math.random(); 
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.05 });
        const particles = new THREE.Points(pGeo, pMat);
        disposables.push(pGeo);
        disposables.push(pMat);
        tbmGroup.add(particles);
        animatables.tbmDebris = particles;
        tbmGroup.rotation.y = -0.5;
    } else if (type === 'drilling-rig') {
        console.log("=== drilling-rig group ===");
        const rigGroup = new THREE.Group();
        group.add(rigGroup);
        const platGeo = new THREE.BoxGeometry(4, 0.5, 4);
        disposables.push(platGeo);
        const platform = new THREE.Mesh(platGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
        platform.position.y = 0;
        rigGroup.add(platform);
        const derrickHeight = 7;
        const derrickGeo = new THREE.CylinderGeometry(0.8, 2, derrickHeight, 4, 1, true);
        derrickGeo.translate(0, derrickHeight / 2, 0);
        derrickGeo.rotateY(Math.PI/4);
        disposables.push(derrickGeo);
        const derrick = new THREE.Mesh(derrickGeo, new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.3 }));
        rigGroup.add(derrick);
        const stringGroup = new THREE.Group();
        stringGroup.position.y = 5;
        rigGroup.add(stringGroup);
        animatables.drillString = stringGroup;
        const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 12);
        pipeGeo.translate(0, -4, 0);
        disposables.push(pipeGeo);
        const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
        stringGroup.add(pipe);
    } else if (type === 'crusher') {
        console.log("=== crusher group ===");
        const crusherGroup = new THREE.Group();
        group.add(crusherGroup);
        const frameGeo = new THREE.CylinderGeometry(2.5, 1.5, 3, 32, 1, true);
        disposables.push(frameGeo);
        const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide }));
        crusherGroup.add(frame);
        const hopperGeo = new THREE.ConeGeometry(3.5, 1.5, 32, 1, true);
        hopperGeo.translate(0, 2.25, 0);
        hopperGeo.rotateX(Math.PI);
        disposables.push(hopperGeo);
        const hopper = new THREE.Mesh(hopperGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }));
        crusherGroup.add(hopper);
        const mantleGroup = new THREE.Group();
        crusherGroup.add(mantleGroup);
        animatables.crusherCone = mantleGroup;
        const coneGeo = new THREE.ConeGeometry(1.2, 2.5, 32);
        disposables.push(coneGeo);
        const cone = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }));
        cone.position.y = -0.5;
        mantleGroup.add(cone);
        const particleCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 2; 
            pPos[i*3+1] = 2 + Math.random() * 3; 
            pPos[i*3+2] = (Math.random() - 0.5) * 2; 
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xa8a29e, size: 0.1 });
        const particles = new THREE.Points(pGeo, pMat);
        console.log('=== ThreeScene开始创建粒子 ===', Date.now()); 
        crusherGroup.add(particles);
        animatables.crusherRocks = particles;
        disposables.push(pGeo);
        disposables.push(pMat);
    } else if (type === 'flotation-cell') {
        console.log("=== flotation-cell group ===");
        const floatGroup = new THREE.Group();
        group.add(floatGroup);
        const tankGeo = new THREE.CylinderGeometry(2.5, 2.5, 3.5, 32, 1, true);
        disposables.push(tankGeo);
        const tankMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x8b5cf6, 
            roughness: 0.1, 
            metalness: 0.1, 
            transparent: true, 
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        floatGroup.add(tank);
        const mechGroup = new THREE.Group();
        floatGroup.add(mechGroup);
        animatables.flotationAgitator = mechGroup;
        const shaftGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.5, 16);
        disposables.push(shaftGeo);
        const shaft = new THREE.Mesh(shaftGeo, solidMaterial);
        mechGroup.add(shaft);
        const bladeGeo = new THREE.BoxGeometry(1.5, 0.1, 0.4);
        disposables.push(bladeGeo);
        const blades1 = new THREE.Mesh(bladeGeo, solidMaterial);
        blades1.position.y = -1.5;
        mechGroup.add(blades1);
        const bubCount = 300;
        const bubGeo = new THREE.BufferGeometry();
        const bubPos = new Float32Array(bubCount * 3);
        for(let i=0; i<bubCount; i++) {
            bubPos[i*3] = (Math.random() - 0.5) * 4; 
            bubPos[i*3+1] = -1.5 + Math.random() * 3; 
            bubPos[i*3+2] = (Math.random() - 0.5) * 4; 
        }
        bubGeo.setAttribute('position', new THREE.BufferAttribute(bubPos, 3));
        const bubMat = new THREE.PointsMaterial({ color: 0xc4b5fd, size: 0.08, transparent: true, opacity: 0.6 });
        const bubbles = new THREE.Points(bubGeo, bubMat);
        floatGroup.add(bubbles);
        animatables.flotationBubbles = bubbles;
        disposables.push(bubGeo);
        disposables.push(bubMat);
    } else if (type === 'sand-maker') {
        console.log("=== sand-maker group ===");
        const vsiGroup = new THREE.Group();
        group.add(vsiGroup);
        const baseGeo = new THREE.CylinderGeometry(3, 3, 2, 32);
        disposables.push(baseGeo);
        const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x4b5563 }));
        base.position.y = -1;
        vsiGroup.add(base);
        const chamberGeo = new THREE.CylinderGeometry(3, 3, 1.5, 32, 2, true);
        chamberGeo.translate(0, 0.75, 0);
        disposables.push(chamberGeo);
        const chamberMat = new THREE.MeshBasicMaterial({ color: 0xeab308, wireframe: true, transparent: true, opacity: 0.3 });
        const chamber = new THREE.Mesh(chamberGeo, chamberMat);
        vsiGroup.add(chamber);
        const rotorGroup = new THREE.Group();
        vsiGroup.add(rotorGroup);
        animatables.vsiRotor = rotorGroup;
        const impellerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 6);
        disposables.push(impellerGeo);
        const impeller = new THREE.Mesh(impellerGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        impeller.position.y = 0.5;
        rotorGroup.add(impeller);
        const pCount = 300;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 0.5;
            pPos[i*3+1] = 3 + Math.random();
            pPos[i*3+2] = (Math.random() - 0.5) * 0.5;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xfcd34d, size: 0.1 });
        const particles = new THREE.Points(pGeo, pMat);
        vsiGroup.add(particles);
        animatables.vsiParticles = particles;
        disposables.push(pGeo);
        disposables.push(pMat);
    } else {
        console.log("=== Default Sci-Fi Sphere group ===");
        // Default Sci-Fi Sphere
        const geometry = new THREE.IcosahedronGeometry(1.3, 2);
        disposables.push(geometry);
        const mesh = new THREE.Mesh(geometry, wireframeMaterial);
        const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
        disposables.push(coreGeo);
        const core = new THREE.Mesh(coreGeo, solidMaterial);
        group.add(mesh);
        group.add(core);
    }

    // Default Orientation
    if (type !== 'generator' && type !== 'transmission' && type !== 'pump' && type !== 'outfall' && type !== 'wastewater' && type !== 'wind-turbine' && type !== 'ship' && type !== 'berthing' && type !== 'crane' && type !== 'buoy' && type !== 'tachometer' && type !== 'mine-hoist' && type !== 'tbm' && type !== 'drilling-rig' && type !== 'crusher' && type !== 'flotation-cell' && type !== 'sand-maker') {
      group.rotation.x = 0.4;
      group.rotation.y = 0.6;
    }

    // Animation Loop
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // 1. 累加时间增量（用于驱动自动化动画）
      time += 0.02; 
      // 2. 更新轨道控制器（如果存在）
      if (controls) {
        controls.update();
      }
      
      // 3. 核心冲突解决：判断使用哪种动画模式
      if (SmartOps.isSmartOpsScene(currentType)) {
          // 如果是新版的 SmartOps 场景，调用自动化动画接口
          console.log("=== SmartOpsScene animate ===");
          SmartOps.animateSmartOpsScene(currentType, animatables, time);
      } else {
          // 如果是旧版的常规场景，保留原有的简单旋转逻辑
          group.rotation.y += 0.005;
      }
      // 4. 执行渲染
      //renderer.render(scene, camera);

      if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
        console.log("=== MaritimeSafetyScene animate ===");
        MaritimeSafety.animateMaritimeSafetyScene(sceneType, animatables, time);
      } else if (GreenPort.isGreenPortScene(sceneType)) {
        console.log("=== GreenPortScene animate ===");
        GreenPort.animateGreenPortScene(sceneType, animatables, time);
      } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
        console.log("=== InlandWaterwayScene animate ===");
        InlandWaterway.animateInlandWaterwayScene(sceneType, animatables, time);
      } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
        console.log("=== ContainerTerminalScene animate ===");
        ContainerTerminal.animateContainerTerminalScene(sceneType, animatables, time);
      } else if (Irrigation.isIrrigationScene(sceneType)) {
        console.log("=== IrrigationScene animate ===");
        Irrigation.animateIrrigationScene(sceneType, animatables, time);
      } else if (SmartWater.isSmartWaterScene(sceneType)) {
        console.log("=== SmartWaterScene animate ===");
        SmartWater.animateSmartWaterScene(sceneType, animatables, time);
      } else if (Cockpit.isCockpitScene(sceneType)) {
        console.log("=== CockpitScene animate ===");
        Cockpit.animateCockpitScene(sceneType, animatables, time);
      } 
      // else if (SmartOps.isSmartOpsScene(sceneType)) {
      //   SmartOps.animateSmartOpsScene(sceneType, animatables, time);
      // }//重复if段
      // 2026.02.02，以下代码给模型赋予了第二套运动逻辑，虽然好像没有冲突，但是其好像加速了动画速度
      // // Animations
      // if (type === 'wind-turbine' && animatables.rotor) {
      //     animatables.rotor.rotation.z -= 0.05;
      //     if (animatables.particles) {
      //         const positions = animatables.particles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<positions.length; i+=3) {
      //             positions[i+2] -= 0.1; 
      //             if (positions[i+2] < -5) positions[i+2] = 8;
      //         }
      //         animatables.particles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'ship' && animatables.shipGroup) {
      //     animatables.shipGroup.rotation.x = Math.sin(time * 0.5) * 0.05; 
      //     animatables.shipGroup.rotation.z = Math.sin(time * 0.8) * 0.05; 
      //     if (animatables.water) animatables.water.position.y = -0.5 + Math.sin(time) * 0.05;
      // }
      // if (type === 'berthing' && animatables.shipGroup) {
      //     animatables.shipGroup.position.x = 1.5 + Math.sin(time * 0.5) * 0.05; 
      // }
      // if (type === 'crane' && animatables.trolley) {
      //     animatables.trolley.position.x = Math.sin(time * 0.5) * 3;
      // }
      // if (type === 'buoy' && animatables.buoyGroup) {
      //     animatables.buoyGroup.position.y = Math.sin(time * 1.5) * 0.3;
      //     animatables.buoyGroup.rotation.x = Math.sin(time * 1.2) * 0.15;
      //     animatables.buoyGroup.rotation.z = Math.cos(time * 1.1) * 0.15;
      //     if (animatables.lanternLight) {
      //         const flashCycle = time % 4;
      //         animatables.lanternLight.intensity = (flashCycle < 0.5) ? 5 : 0;
      //     }
      // }
      // if (type === 'tachometer' && animatables.toneRing) {
      //     animatables.toneRing.rotation.y -= 0.5;
      // }
      // if (type === 'mine-hoist') {
      //     console.log("=== mine-hoist single animate ===")
      //     const cycleTime = 10; 
      //     const progress = (time % cycleTime) / cycleTime; 
      //     const yPos = Math.sin(progress * Math.PI * 2) * 3 - 6; 
      //     if (animatables.hoistSheave) animatables.hoistSheave.rotation.x -= 0.05 * Math.cos(progress * Math.PI * 2);
      //     if (animatables.cage) animatables.cage.position.y = yPos;
      //     if (animatables.counterWeight) animatables.counterWeight.position.y = -yPos + 1;
      //     if (animatables.ropes) {
      //         const pos = animatables.ropes.geometry.attributes.position.array as Float32Array;
      //         pos[1] = yPos + 1.2; 
      //         pos[10] = -yPos + 1 + 0.7; 
      //         animatables.ropes.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'tbm') {
      //     if (animatables.tbmCutterhead) animatables.tbmCutterhead.rotation.z -= 0.05;
      //     if (animatables.tbmDebris) {
      //         const pos = animatables.tbmDebris.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             pos[i] += (Math.random() - 0.5) * 0.1;
      //             pos[i+1] += (Math.random() - 0.5) * 0.1;
      //             if (Math.random() > 0.9) {
      //                 pos[i] = (Math.random() - 0.5) * 3;
      //                 pos[i+1] = -1.5 + Math.random();
      //             }
      //         }
      //         animatables.tbmDebris.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'drilling-rig' && animatables.drillString) {
      //     animatables.drillString.rotation.y += 0.2;
      // }
      // if (type === 'crusher' && animatables.crusherCone) {
      //   animatables.crusherCone.rotation.z = Math.sin(time * 10) * 0.05;
      //   animatables.crusherCone.rotation.x = Math.cos(time * 10) * 0.05;
      //   if (animatables.crusherRocks) {
      //       const pos = animatables.crusherRocks.geometry.attributes.position.array as Float32Array;
      //       for(let i=0; i<pos.length; i+=3) {                  
      //         pos[i+1] -= 0.15;
      //         if (pos[i+1] > 0) { pos[i] *= 0.98; pos[i+2] *= 0.98; }
      //         if (pos[i+1] < -2) {
      //             pos[i] = (Math.random() - 0.5) * 3;
      //             pos[i+1] = 3;
      //             pos[i+2] = (Math.random() - 0.5) * 3;
      //         }
      //       }
      //       animatables.crusherRocks.geometry.attributes.position.needsUpdate = true;
      //   }
      // }
      // if (type === 'flotation-cell') {
      //     if (animatables.flotationAgitator) animatables.flotationAgitator.rotation.y += 0.15;
      //     if (animatables.flotationBubbles) {
      //         const pos = animatables.flotationBubbles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             pos[i+1] += 0.02;
      //             const x = pos[i]; const z = pos[i+2];
      //             pos[i] = x * Math.cos(0.02) - z * Math.sin(0.02);
      //             pos[i+2] = x * Math.sin(0.02) + z * Math.cos(0.02);
      //             if (pos[i+1] > 1.5) { pos[i+1] = -1.5; pos[i] = (Math.random() - 0.5) * 4; pos[i+2] = (Math.random() - 0.5) * 4; }
      //         }
      //         animatables.flotationBubbles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      // if (type === 'sand-maker') {
      //     if (animatables.vsiRotor) animatables.vsiRotor.rotation.y -= 0.5;
      //     if (animatables.vsiParticles) {
      //         const pos = animatables.vsiParticles.geometry.attributes.position.array as Float32Array;
      //         for(let i=0; i<pos.length; i+=3) {
      //             let x = pos[i]; let y = pos[i+1]; let z = pos[i+2];
      //             if (y > 0.5) { y -= 0.15; x *= 0.95; z *= 0.95; } 
      //             else if (y > -1.0) {
      //                 const angle = Math.atan2(z, x) - 0.5;
      //                 const r = Math.sqrt(x*x + z*z) + 0.4;
      //                 x = r * Math.cos(angle); z = r * Math.sin(angle); y -= 0.05;
      //             }
      //             if (y < -1.5 || (x*x + z*z > 12)) { x = (Math.random() - 0.5) * 0.5; y = 3 + Math.random(); z = (Math.random() - 0.5) * 0.5; }
      //             pos[i] = x; pos[i+1] = y; pos[i+2] = z;
      //         }
      //         animatables.vsiParticles.geometry.attributes.position.needsUpdate = true;
      //     }
      // }
      if (type === 'outfall' && animatables.particles) {
          // Outfall specific animation if needed (particles static jitter handled by material/re-creation usually, but let's add flow)
          // Simple jitter
      }

      //2026.03.16
      if (MineSafetyDelivery.isMineSafetyDeliveryScene(sceneType)) {
        MineSafetyDelivery.animateMineSafetyDeliveryScene(sceneType, animatables, time);
      } else if (MineEquipLifecycleDelivery.isMineEquipLifecycleScene(sceneType)) {
        MineEquipLifecycleDelivery.animateMineEquipLifecycleScene(sceneType, animatables, time);
      } else if (MineProcessDelivery.isMineProcessDeliveryScene(sceneType)) {
        MineProcessDelivery.animateMineProcessDeliveryScene(sceneType, animatables, time);
      } else if (MineProcessingDelivery.isMineProcessingDeliveryScene(sceneType)) {
        MineProcessingDelivery.animateMineProcessingDeliveryScene(sceneType, animatables, time);
      } else if (MineBimDelivery.isMineBimDeliveryScene(sceneType)) {
        MineBimDelivery.animateMineBimDeliveryScene(sceneType, animatables, time);
      } else if (MineConstructionDelivery.isMineConstructionDeliveryScene(sceneType)) {
        MineConstructionDelivery.animateMineConstructionDeliveryScene(sceneType, animatables, time);
      } else if (HydroAssetDelivery.isHydroAssetDeliveryScene(sceneType)) {
        HydroAssetDelivery.animateHydroAssetDeliveryScene(sceneType, animatables, time);
      } else if (FloodDispatchDelivery.isFloodDispatchDeliveryScene(sceneType)) {
        FloodDispatchDelivery.animateFloodDispatchDeliveryScene(sceneType, animatables, time);
      } else if (HydroMonitorDelivery.isHydroMonitorDeliveryScene(sceneType)) {
        HydroMonitorDelivery.animateHydroMonitorDeliveryScene(sceneType, animatables, time);
      } else if (DamSafetyDelivery.isDamSafetyDeliveryScene(sceneType)) {
        DamSafetyDelivery.animateDamSafetyDeliveryScene(sceneType, animatables, time);
      } else if (HydroEquipLifecycle.isHydroEquipLifecycleScene(sceneType)) {
        HydroEquipLifecycle.animateHydroEquipLifecycleScene(sceneType, animatables, time);
      } else if (HydroDispatch.isHydroDispatchScene(sceneType)) {
        HydroDispatch.animateHydroDispatchScene(sceneType, animatables, time);
      } else if (HydroBimDelivery.isHydroBimDeliveryScene(sceneType)) {
        HydroBimDelivery.animateHydroBimDeliveryScene(sceneType, animatables, time);
      } else if (HydroTwinDelivery.isHydroTwinDeliveryScene(sceneType)) {
        HydroTwinDelivery.animateHydroTwinDeliveryScene(sceneType, animatables, time);
      } else if (HydroDelivery.isHydroDeliveryScene(sceneType)) {
        HydroDelivery.animateHydroDeliveryScene(sceneType, animatables, time);
      } else if (ChannelSafety.isChannelSafetyScene(sceneType)) {
        ChannelSafety.animateChannelSafetyScene(sceneType, animatables, time);
      } else if (TransportConnect.isTransportConnectScene(sceneType)) {
        TransportConnect.animateTransportConnectScene(sceneType, animatables, time);
      } else if (LockEfficiency.isLockEfficiencyScene(sceneType)) {
        LockEfficiency.animateLockEfficiencyScene(sceneType, animatables, time);
      } else if (ShipCii.isShipCiiScene(sceneType)) {
        ShipCii.animateShipCiiScene(sceneType, animatables, time);
      } else if (ShipEeoi.isShipEeoiScene(sceneType)) {
        ShipEeoi.animateShipEeoiScene(sceneType, animatables, time);
      } else if (CraneEfficiency.isCraneEfficiencyScene(sceneType)) {
        CraneEfficiency.animateCraneEfficiencyScene(sceneType, animatables, time);
      } else if (BerthUtil.isBerthUtilScene(sceneType)) {
        BerthUtil.animateBerthUtilScene(sceneType, animatables, time);
      } else if (PowerRam.isPowerRamScene(sceneType)) {
        PowerRam.animatePowerRamScene(sceneType, animatables, time);
      } else if (PumpedStorageEfficiency.isPumpedStorageEfficiencyScene(sceneType)) {
        PumpedStorageEfficiency.animatePumpedStorageEfficiencyScene(sceneType, animatables, time);
      } else if (DamHealth.isDamHealthScene(sceneType)) {
        DamHealth.animateDamHealthScene(sceneType, animatables, time);
      } else if (ReservoirBenefit.isReservoirBenefitScene(sceneType)) {
        ReservoirBenefit.animateReservoirBenefitScene(sceneType, animatables, time);
      } else if (TurbineWear.isTurbineWearScene(sceneType)) {
        TurbineWear.animateTurbineWearScene(sceneType, animatables, time);
      } else if (SpillageLoss.isSpillageLossScene(sceneType)) {
        SpillageLoss.animateSpillageLossScene(sceneType, animatables, time);
      } else if (HydroUtil.isHydroUtilScene(sceneType)) {
        HydroUtil.animateHydroUtilScene(sceneType, animatables, time);
      } else if (VentilationEfficiency.isVentilationEfficiencyScene(sceneType)) {
        VentilationEfficiency.animateVentilationEfficiencyScene(sceneType, animatables, time);
      } else if (MiningEnergy.isMiningEnergyScene(sceneType)) {
        MiningEnergy.animateMiningEnergyScene(sceneType, animatables, time);
      } else if (BlastingQuality.isBlastingQualityScene(sceneType)) {
        BlastingQuality.animateBlastingQualityScene(sceneType, animatables, time);
      } else if (MiningTruckCycle.isMiningTruckCycleScene(sceneType)) {
        MiningTruckCycle.animateMiningTruckCycleScene(sceneType, animatables, time);
      } else if (MiningOee.isMiningOeeScene(sceneType)) {
        MiningOee.animateMiningOeeScene(sceneType, animatables, time);
      } else if (MineralRecovery.isMineralRecoveryScene(sceneType)) {
        MineralRecovery.animateMineralRecoveryScene(sceneType, animatables, time);
      } else if (MiningRecovery.isMiningRecoveryScene(sceneType)) {
        MiningRecovery.animateMiningRecoveryScene(sceneType, animatables, time);
      } else if (MaritimeSafety.isMaritimeSafetyScene(sceneType)) {
        MaritimeSafety.animateMaritimeSafetyScene(sceneType, animatables, time);
      } else if (GreenPort.isGreenPortScene(sceneType)) {
        GreenPort.animateGreenPortScene(sceneType, animatables, time);
      } else if (InlandWaterway.isInlandWaterwayScene(sceneType)) {
        InlandWaterway.animateInlandWaterwayScene(sceneType, animatables, time);
      } else if (ContainerTerminal.isContainerTerminalScene(sceneType)) {
        ContainerTerminal.animateContainerTerminalScene(sceneType, animatables, time);
      } else if (Irrigation.isIrrigationScene(sceneType)) {
        Irrigation.animateIrrigationScene(sceneType, animatables, time);
      } else if (SmartWater.isSmartWaterScene(sceneType)) {
        SmartWater.animateSmartWaterScene(sceneType, animatables, time);
      } else if (Cockpit.isCockpitScene(sceneType)) {
        Cockpit.animateCockpitScene(sceneType, animatables, time);
      } else if (SmartOps.isSmartOpsScene(sceneType)) {
        SmartOps.animateSmartOpsScene(sceneType, animatables, time);
      }



      renderer.render(scene, camera);
    };
    animate();

    // Robust Resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
           const newWidth = entry.contentRect.width;
           const newHeight = entry.contentRect.height;
           if (newWidth > 0 && newHeight > 0) {
             camera.aspect = newWidth / newHeight;
             camera.updateProjectionMatrix();
             renderer.setSize(newWidth, newHeight);
           }
        }
      }
    });
    
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
      console.log("=== Cleanup all object ===")
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (controls) controls.dispose();
      if (group && scene) {
        scene.remove(group);
      }
      if(scene){
        scene.clear();
      }
      geometry.dispose();
      coreGeo.dispose();
      wireframeMaterial.dispose();
      disposables.forEach(d => d.dispose());
      solidMaterial.dispose();
      renderer.dispose();
      
    };
  }, [type, color]);

  return <div ref={mountRef} className="w-full h-full cursor-move z-0" title="Click and drag to rotate" />;
};