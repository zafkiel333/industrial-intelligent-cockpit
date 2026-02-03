
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimAnimatables, SimSceneType } from './three-types';
import { initMineVentilationScene, animateMineVentilationScene } from './MineVentilationBuilder';
import { initMineRoofStabilityScene, animateMineRoofStabilityScene } from './MineRoofStabilityBuilder';
import { initMineBlastScene, animateMineBlastScene } from './MineBlastBuilder';
import { initMineTruckRoutingScene, animateMineTruckRoutingScene } from './MineTruckRoutingBuilder';
import { initMineSlopeStabilityScene, animateMineSlopeStabilityScene } from './MineSlopeStabilityBuilder';
import { initMineEquipStrengthScene, animateMineEquipStrengthScene } from './MineEquipStrengthBuilder';
import { initMineBeltConveyorScene, animateMineBeltConveyorScene } from './MineBeltConveyorBuilder';
import { initMineEvacuationScene, animateMineEvacuationScene } from './MineEvacuationBuilder';
import { initMineWaterScene, animateMineWaterScene } from './MineWaterBuilder';
import { initMinePowerScene, animateMinePowerScene } from './MinePowerBuilder';
import { initMineCoopScene, animateMineCoopScene } from './MineCoopBuilder';
import { initMineHoistSimScene, animateMineHoistSimScene } from './MineHoistSimBuilder';
import { initMineDustScene, animateMineDustScene } from './MineDustBuilder';
import { initMineFreezeScene, animateMineFreezeScene } from './MineFreezeBuilder';
import { initMineCrashScene, animateMineCrashScene } from './MineCrashBuilder';
import { initMineSlurryScene, animateMineSlurryScene } from './MineSlurryBuilder';
import { initMineDispatchScene, animateMineDispatchScene } from './MineDispatchBuilder';
import { initMineEcoScene, animateMineEcoScene } from './MineEcoBuilder';
import { initHydroFloodScene, animateHydroFloodScene } from './HydroFloodBuilder';
import { initHydroSpillScene, animateHydroSpillScene } from './HydroSpillBuilder';
import { initHydroDamScene, animateHydroDamScene } from './HydroDamBuilder';
import { initHydroGateScene, animateHydroGateScene } from './HydroGateBuilder';
import { initHydroTurbineScene, animateHydroTurbineScene } from './HydroTurbineBuilder';
import { initHydroRiverScene, animateHydroRiverScene } from './HydroRiverBuilder';
import { initHydroUrbanScene, animateHydroUrbanScene } from './HydroUrbanBuilder';
import { initHydroSedimentScene, animateHydroSedimentScene } from './HydroSedimentBuilder';
import { initHydroBreakScene, animateHydroBreakScene } from './HydroBreakBuilder';
import { initHydroTransitionScene, animateHydroTransitionScene } from './HydroTransitionBuilder';
import { initHydroGroupDispatchScene, animateHydroGroupDispatchScene } from './HydroGroupDispatchBuilder';
import { initHydroPumpScene, animateHydroPumpScene } from './HydroPumpBuilder';
import { initHydroFishScene, animateHydroFishScene } from './HydroFishBuilder';
import { initHydroGridScene, animateHydroGridDispatchScene } from './HydroGridBuilder';
import { initHydroDamBreakScene, animateHydroDamBreakScene } from './HydroDamBreakBuilder';
import { initHydroIceFloodScene, animateHydroIceFloodScene } from './HydroIceFloodBuilder';
import { initHydroVibrationScene, animateHydroVibrationScene } from './HydroVibrationBuilder';
import { initPortTrafficFlowScene, animatePortTrafficFlowScene } from './PortTrafficFlowBuilder';
import { initShipLockScene, animateShipLockScene } from './ShipLockBuilder';
import { initPortMotionScene, animatePortMotionScene } from './PortMotionBuilder';
import { initPortTerminalLoadingScene, animatePortTerminalLoadingScene } from './PortTerminalBuilder';
import { initPortMultimodalScene, animatePortMultimodalScene } from './PortMultimodalBuilder';
import { initChannelRegulationScene, animateChannelRegulationScene } from './ChannelRegulationBuilder';
import { initPortCollisionScene, animatePortCollisionScene } from './PortCollisionBuilder';
import { initPortSpillScene, animatePortSpillScene } from './PortSpillBuilder';
import { initPortBerthingScene, animatePortBerthingScene } from './PortBerthingBuilder';
import { initPortDredgingScene, animatePortDredgingScene } from './PortDredgingBuilder';
import { initPortSchedScene, animatePortSchedScene } from './PortSchedBuilder';
import { initPortBridgeScene, animatePortBridgeScene } from './PortBridgeBuilder';
import { initPortSurgeScene, animatePortSurgeScene } from './PortSurgeBuilder';

interface SimThreeSceneProps {
  type: SimSceneType;
  simData?: any;
}

export const SimThreeScene: React.FC<SimThreeSceneProps> = ({ type, simData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animatablesRef = useRef<SimAnimatables>({});
  const groupRef = useRef<THREE.Group>(null);
  const reqIdRef = useRef<number>(0);
  
  const dataRef = useRef(simData);
  useEffect(() => { dataRef.current = simData; }, [simData]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Fog handling
    if (type === 'port-bridge' || type === 'port-surge') {
       scene.fog = new THREE.FogExp2(0x050b1a, 0.015);
    } else if (type !== 'hydro-trans' && type !== 'hydro-pump' && type !== 'hydro-dam-break' && type !== 'hydro-ice' && type !== 'hydro-vib' && type !== 'port-traffic-flow' && type !== 'ship-lock-dispatch' && type !== 'port-motion' && type !== 'port-terminal-loading' && type !== 'port-multimodal' && type !== 'port-channel-regulation' && type !== 'port-collision' && type !== 'port-spill' && type !== 'port-berth' && type !== 'port-dredging' && type !== 'port-sched') {
       scene.fog = new THREE.FogExp2(0x020202, 0.005); 
    }
    
    // Custom Fog
    if (type === 'port-berth') scene.fog = new THREE.FogExp2(0x020610, 0.015);
    if (type === 'port-dredging') scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // Camera Positions
    if (type === 'port-surge') {
       camera.position.set(-20, 20, 40);
       camera.lookAt(0, 0, 0);
    } else if (type === 'port-bridge') {
       camera.position.set(0, 15, 60);
       camera.lookAt(0, 10, 0);
    } else if (type === 'port-sched') {
       camera.position.set(0, 40, 60);
       camera.lookAt(0, 0, 0);
    } else if (type === 'port-berth') {
       camera.position.set(0, 40, 40);
       camera.lookAt(0, 0, 0);
    } else if (type === 'port-dredging') {
       camera.position.set(30, 25, 30);
       camera.lookAt(0, 0, 0);
    } else if (type === 'mine-roof-stability') {
       camera.position.set(20, 15, 25);
       camera.lookAt(0, 0, 0);
    } else {
       camera.position.set(20, 20, 30);
       camera.lookAt(0, 0, 0);
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    
    const disposables: { dispose: () => void }[] = [];
    const animatables: SimAnimatables = {};
    animatablesRef.current = animatables;

    // Builders Routing
    if (type === 'port-surge') {
        initPortSurgeScene(group, animatables, disposables);
        controls.autoRotate = false;
    } else if (type === 'port-bridge') {
        initPortBridgeScene(group, animatables, disposables);
        controls.autoRotate = false;
    } else if (type === 'port-sched') {
        initPortSchedScene(group, animatables, disposables);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    } else if (type === 'port-dredging') {
        initPortDredgingScene(group, animatables, disposables);
        controls.autoRotate = false;
    } else if (type === 'port-berth') {
        initPortBerthingScene(group, animatables, disposables);
        controls.autoRotate = false;
    } else if (type === 'port-spill') {
        initPortSpillScene(group, animatables, disposables);
        controls.autoRotate = false;
    } else if (type === 'mine-ventilation') {
        initMineVentilationScene(group, animatables, disposables);
    } else if (type === 'mine-roof-stability') {
        initMineRoofStabilityScene(group, animatables, disposables);
    } else if (type === 'mine-blast') {
        initMineBlastScene(group, animatables, disposables);
    } else if (type === 'mine-truck-routing') {
        initMineTruckRoutingScene(group, animatables, disposables);
    } else if (type === 'mine-slope-stability') {
        initMineSlopeStabilityScene(group, animatables, disposables);
    } else if (type === 'mine-equip-strength') {
        initMineEquipStrengthScene(group, animatables, disposables);
    } else if (type === 'mine-belt-conveyor') {
        initMineBeltConveyorScene(group, animatables, disposables);
    } else if (type === 'mine-evacuation') {
        initMineEvacuationScene(group, animatables, disposables);
    } else if (type === 'mine-water') {
        initMineWaterScene(group, animatables, disposables);
    } else if (type === 'mine-power') {
        initMinePowerScene(group, animatables, disposables);
    } else if (type === 'mine-coop') {
        initMineCoopScene(group, animatables, disposables);
    } else if (type === 'mine-hoist-sim') {
        initMineHoistSimScene(group, animatables, disposables);
    } else if (type === 'mine-dust') {
        initMineDustScene(group, animatables, disposables);
    } else if (type === 'mine-freeze') {
        initMineFreezeScene(group, animatables, disposables);
    } else if (type === 'mine-crash') {
        initMineCrashScene(group, animatables, disposables);
    } else if (type === 'mine-slurry') {
        initMineSlurryScene(group, animatables, disposables);
    } else if (type === 'mine-dispatch') {
        initMineDispatchScene(group, animatables, disposables);
    } else if (type === 'mine-eco') {
        initMineEcoScene(group, animatables, disposables);
    } else if (type === 'hydro-flood') {
        initHydroFloodScene(group, animatables, disposables);
    } else if (type === 'hydro-spill') {
        initHydroSpillScene(group, animatables, disposables);
    } else if (type === 'hydro-dam') {
        initHydroDamScene(group, animatables, disposables);
    } else if (type === 'hydro-gate') {
        initHydroGateScene(group, animatables, disposables);
    } else if (type === 'hydro-turbine') {
        initHydroTurbineScene(group, animatables, disposables);
    } else if (type === 'hydro-river') {
        initHydroRiverScene(group, animatables, disposables);
    } else if (type === 'hydro-urban') {
        initHydroUrbanScene(group, animatables, disposables);
    } else if (type === 'hydro-sedi') {
        initHydroSedimentScene(group, animatables, disposables);
    } else if (type === 'hydro-break') {
        initHydroBreakScene(group, animatables, disposables);
    } else if (type === 'hydro-trans') {
        initHydroTransitionScene(group, animatables, disposables);
    } else if (type === 'hydro-group') {
        initHydroGroupDispatchScene(group, animatables, disposables);
    } else if (type === 'hydro-pump') {
        initHydroPumpScene(group, animatables, disposables);
    } else if (type === 'hydro-fish') {
        initHydroFishScene(group, animatables, disposables);
    } else if (type === 'hydro-grid') {
        initHydroGridScene(group, animatables, disposables);
    } else if (type === 'hydro-dam-break') {
        initHydroDamBreakScene(group, animatables, disposables);
    } else if (type === 'hydro-ice') {
        initHydroIceFloodScene(group, animatables, disposables);
    } else if (type === 'hydro-vib') {
        initHydroVibrationScene(group, animatables, disposables);
    } else if (type === 'port-traffic-flow') {
        initPortTrafficFlowScene(group, animatables, disposables);
    } else if (type === 'ship-lock-dispatch') {
        initShipLockScene(group, animatables, disposables);
    } else if (type === 'port-motion') {
        initPortMotionScene(group, animatables, disposables);
    } else if (type === 'port-terminal-loading') {
        initPortTerminalLoadingScene(group, animatables, disposables);
    } else if (type === 'port-multimodal') {
        initPortMultimodalScene(group, animatables, disposables);
    } else if (type === 'port-channel-regulation') {
        initChannelRegulationScene(group, animatables, disposables);
    } else if (type === 'port-collision') {
        initPortCollisionScene(group, animatables, disposables);
    } else if (type === 'port-spill') {
        initPortSpillScene(group, animatables, disposables);
    }

    const clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      controls.update();

      // Animators
      if (type === 'port-surge') {
          animatePortSurgeScene(animatables, time, dataRef.current);
      } else if (type === 'port-bridge') {
          animatePortBridgeScene(animatables, time, dataRef.current);
      } else if (type === 'port-sched') {
          animatePortSchedScene(animatables, time, dataRef.current);
      } else if (type === 'port-dredging') {
          animatePortDredgingScene(animatables, time, dataRef.current);
      } else if (type === 'port-berth') {
          animatePortBerthingScene(animatables, time, dataRef.current);
      } else if (type === 'port-spill') {
          animatePortSpillScene(animatables, time, dataRef.current);
      } else if (type === 'mine-ventilation') {
          animateMineVentilationScene(animatables, time, dataRef.current);
      } else if (type === 'mine-roof-stability') {
          animateMineRoofStabilityScene(animatables, time, dataRef.current);
      } else if (type === 'mine-blast') {
          animateMineBlastScene(animatables, time, dataRef.current);
      } else if (type === 'mine-truck-routing') {
          animateMineTruckRoutingScene(animatables, time, dataRef.current);
      } else if (type === 'mine-slope-stability') {
          animateMineSlopeStabilityScene(animatables, time, dataRef.current);
      } else if (type === 'mine-equip-strength') {
          animateMineEquipStrengthScene(animatables, time, dataRef.current);
      } else if (type === 'mine-belt-conveyor') {
          animateMineBeltConveyorScene(animatables, time, dataRef.current);
      } else if (type === 'mine-evacuation') {
          animateMineEvacuationScene(animatables, time, dataRef.current);
      } else if (type === 'mine-water') {
          animateMineWaterScene(animatables, time, dataRef.current);
      } else if (type === 'mine-power') {
          animateMinePowerScene(animatables, time, dataRef.current);
      } else if (type === 'mine-coop') {
          animateMineCoopScene(animatables, time, dataRef.current);
      } else if (type === 'mine-hoist-sim') {
          animateMineHoistSimScene(animatables, time, dataRef.current);
      } else if (type === 'mine-dust') {
          animateMineDustScene(animatables, time, dataRef.current);
      } else if (type === 'mine-freeze') {
          animateMineFreezeScene(animatables, time, dataRef.current);
      } else if (type === 'mine-crash') {
          animateMineCrashScene(animatables, time, dataRef.current);
      } else if (type === 'mine-slurry') {
          animateMineSlurryScene(animatables, time, dataRef.current);
      } else if (type === 'mine-dispatch') {
          animateMineDispatchScene(animatables, time, dataRef.current);
      } else if (type === 'mine-eco') {
          animateMineEcoScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-flood') {
          animateHydroFloodScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-spill') {
          animateHydroSpillScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-dam') {
          animateHydroDamScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-gate') {
          animateHydroGateScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-turbine') {
          animateHydroTurbineScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-river') {
          animateHydroRiverScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-urban') {
          animateHydroUrbanScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-sedi') {
          animateHydroSedimentScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-break') {
          animateHydroBreakScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-trans') {
          animateHydroTransitionScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-group') {
          animateHydroGroupDispatchScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-pump') {
          animateHydroPumpScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-fish') {
          animateHydroFishScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-grid') {
          animateHydroGridDispatchScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-dam-break') {
          animateHydroDamBreakScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-ice') {
          animateHydroIceFloodScene(animatables, time, dataRef.current);
      } else if (type === 'hydro-vib') {
          animateHydroVibrationScene(animatables, time, dataRef.current);
      } else if (type === 'port-traffic-flow') {
          animatePortTrafficFlowScene(animatables, time, dataRef.current);
      } else if (type === 'ship-lock-dispatch') {
          animateShipLockScene(animatables, time, dataRef.current);
      } else if (type === 'port-motion') {
          animatePortMotionScene(animatables, time, dataRef.current);
      } else if (type === 'port-terminal-loading') {
          animatePortTerminalLoadingScene(animatables, time, dataRef.current);
      } else if (type === 'port-multimodal') {
          animatePortMultimodalScene(animatables, time, dataRef.current);
      } else if (type === 'port-channel-regulation') {
          animateChannelRegulationScene(animatables, time, dataRef.current);
      } else if (type === 'port-collision') {
          animatePortCollisionScene(animatables, time, dataRef.current);
      } else if (type === 'port-spill') {
          animatePortSpillScene(animatables, time, dataRef.current);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(mountRef.current);

    return () => {
      observer.disconnect();
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [type]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
