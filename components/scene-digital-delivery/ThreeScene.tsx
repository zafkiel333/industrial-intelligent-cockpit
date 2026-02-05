
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initGeoScene, animateGeoScene } from './MineGeoDeliveryBuilder';
import { initTransportScene, animateTransportScene } from './MineTransportDeliveryBuilder';
import { initMineConstructionDeliveryScene, animateMineConstructionDeliveryScene, setupMineConstructionDeliveryCamera } from './MineConstructionDeliveryBuilder';
import { initMineBimDeliveryScene, animateMineBimDeliveryScene, setupMineBimDeliveryCamera } from './MineBimDeliveryBuilder';
import { initMineProcessDeliveryScene, animateMineProcessDeliveryScene, setupMineProcessDeliveryCamera } from './MineProcessDeliveryBuilder';
import { initMineProcessingDeliveryScene, animateMineProcessingDeliveryScene, setupMineProcessingDeliveryCamera } from './MineProcessingDeliveryBuilder';
import { initMineEquipLifecycleScene, animateMineEquipLifecycleScene, setupMineEquipLifecycleCamera } from './MineEquipLifecycleBuilder';
import { initMineSafetyDeliveryScene, animateMineSafetyDeliveryScene, setupMineSafetyDeliveryCamera } from './MineSafetyDeliveryBuilder';
import { initMineEnergyDeliveryScene, animateMineEnergyDeliveryScene, setupMineEnergyDeliveryCamera } from './MineEnergyDeliveryBuilder'; 
import { initMineEcoDeliveryScene, animateMineEcoDeliveryScene, setupMineEcoDeliveryCamera } from './MineEcoDeliveryBuilder';
import { initPortCompletionDeliveryScene, animatePortCompletionDeliveryScene, setupPortCompletionDeliveryCamera } from './PortCompletionDeliveryBuilder';
import { initPortBimDeliveryScene, animatePortBimDeliveryScene, setupPortBimDeliveryCamera } from './PortBimDeliveryBuilder';
import { initChannelRegulationDeliveryScene, animateChannelRegulationDeliveryScene, setupChannelRegulationDeliveryCamera } from './ChannelRegulationDeliveryBuilder';
import { initShipLockDeliveryScene, animateShipLockDeliveryScene, setupShipLockDeliveryCamera } from './ShipLockDeliveryBuilder';
import { initSmartPortDeliveryScene, animateSmartPortDeliveryScene, setupSmartPortDeliveryCamera } from './SmartPortDeliveryBuilder';
import { initNavDispatchDeliveryScene, animateNavDispatchDeliveryScene, setupNavDispatchDeliveryCamera } from './NavDispatchDeliveryBuilder';
import { initShipLifecycleDeliveryScene, animateShipLifecycleDeliveryScene, setupShipLifecycleDeliveryCamera } from './ShipLifecycleDeliveryBuilder';
import { initPortAssetDeliveryScene, animatePortAssetDeliveryScene, setupPortAssetDeliveryCamera } from './PortAssetDeliveryBuilder';
import { initChannelMonitorDeliveryScene, animateChannelMonitorDeliveryScene, setupChannelMonitorDeliveryCamera } from './ChannelMonitorDeliveryBuilder';
import { initNavSafetyDeliveryScene, animateNavSafetyDeliveryScene, setupNavSafetyDeliveryCamera } from './NavSafetyDeliveryBuilder';
import { GeoAnimatables, SceneType } from './three-types';

interface GeoSceneProps {
  type?: SceneType;
  color?: string;
  data?: any;
}

export const GeoThreeScene: React.FC<GeoSceneProps> = ({ type = 'geo', data }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animatablesRef = useRef<GeoAnimatables>({});
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current && data) {
       if (type === 'dd-mine-safety-delivery' && animatablesRef.current.msdGasCloud) {
          (animatablesRef.current.msdGasCloud.parent as any).userData = { simMode: data.simMode };
       }
       if (type === 'dd-mine-equip-lifecycle' && groupRef.current.children[0]) {
           groupRef.current.userData = { stage: data.stage };
       }
    }
  }, [data, type]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050403, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    if (type === 'transport') {
        camera.position.set(25, 15, 25);
        camera.lookAt(0, 0, 0);
    } else if (type === 'dd-mine-construction') {
        setupMineConstructionDeliveryCamera(camera);
    } else if (type === 'dd-mine-bim-delivery') {
        setupMineBimDeliveryCamera(camera);
    } else if (type === 'dd-mine-process-delivery') {
        setupMineProcessDeliveryCamera(camera);
    } else if (type === 'dd-mine-processing') {
        setupMineProcessingDeliveryCamera(camera);
    } else if (type === 'dd-mine-equip-lifecycle') {
        setupMineEquipLifecycleCamera(camera);
    } else if (type === 'dd-mine-safety-delivery') {
        setupMineSafetyDeliveryCamera(camera);
    } else if (type === 'dd-mine-energy-delivery') {
        setupMineEnergyDeliveryCamera(camera);
    } else if (type === 'dd-mine-eco-delivery') {
        setupMineEcoDeliveryCamera(camera);
    } else if (type === 'dd-port-completion') {
        setupPortCompletionDeliveryCamera(camera);
    } else if (type === 'dd-port-bim') {
        setupPortBimDeliveryCamera(camera);
    } else if (type === 'dd-channel-regulation') {
        setupChannelRegulationDeliveryCamera(camera);
    } else if (type === 'dd-ship-lock') {
        setupShipLockDeliveryCamera(camera);
    } else if (type === 'dd-smart-port') {
        setupSmartPortDeliveryCamera(camera);
    } else if (type === 'dd-nav-dispatch') {
        setupNavDispatchDeliveryCamera(camera);
    } else if (type === 'dd-ship-lifecycle') {
        setupShipLifecycleDeliveryCamera(camera);
    } else if (type === 'dd-port-asset') {
        setupPortAssetDeliveryCamera(camera);
    } else if (type === 'dd-channel-monitor') {
        setupChannelMonitorDeliveryCamera(camera);
    } else if (type === 'dd-nav-safety') {
        setupNavSafetyDeliveryCamera(camera);
    } else {
        camera.position.set(20, 15, 20);
        camera.lookAt(0, 0, 0);
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    if (['dd-mine-equip-lifecycle', 'dd-mine-safety-delivery', 'dd-mine-eco-delivery', 'dd-port-completion', 'dd-port-bim', 'dd-channel-regulation', 'dd-ship-lock', 'dd-smart-port', 'dd-nav-dispatch', 'dd-ship-lifecycle', 'dd-port-asset', 'dd-channel-monitor', 'dd-nav-safety'].includes(type)) {
       controls.autoRotate = false;
    }

    const disposables: { dispose: () => void }[] = [];
    const animatables: GeoAnimatables = {};
    animatablesRef.current = animatables;
    
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Use casting to any for builders that expect strict Animatables but receive GeoAnimatables
    if (type === 'transport') {
        initTransportScene(scene, animatables, disposables);
    } else if (type === 'dd-mine-construction') {
        initMineConstructionDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-bim-delivery') {
        initMineBimDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-process-delivery') {
        initMineProcessDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-processing') {
        initMineProcessingDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-equip-lifecycle') {
        initMineEquipLifecycleScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-safety-delivery') {
        initMineSafetyDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-mine-energy-delivery') {
        initMineEnergyDeliveryScene(scene, animatables, disposables);
    } else if (type === 'dd-mine-eco-delivery') {
        initMineEcoDeliveryScene(type, group, animatables, disposables);
    } else if (type === 'dd-port-completion') {
        initPortCompletionDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-port-bim') {
        initPortBimDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-channel-regulation') {
        initChannelRegulationDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-ship-lock') {
        initShipLockDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-smart-port') {
        initSmartPortDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-nav-dispatch') {
        initNavDispatchDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-ship-lifecycle') {
        initShipLifecycleDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-port-asset') {
        initPortAssetDeliveryScene(type, group, animatables as any, disposables);
    } else if (type === 'dd-channel-monitor') {
        initChannelMonitorDeliveryScene(type, group, animatables, disposables);
    } else if (type === 'dd-nav-safety') {
        initNavSafetyDeliveryScene(type, group, animatables, disposables);
    } else {
        initGeoScene(scene, animatables, disposables);
    }

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      controls.update();
      
      if (type === 'transport') {
          animateTransportScene(animatables, time);
      } else if (type === 'dd-mine-construction') {
          animateMineConstructionDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-mine-bim-delivery') {
          animateMineBimDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-mine-process-delivery') {
          animateMineProcessDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-mine-processing') {
          animateMineProcessingDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-mine-equip-lifecycle') {
          animateMineEquipLifecycleScene(type, animatables as any, time);
      } else if (type === 'dd-mine-safety-delivery') {
          animateMineSafetyDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-mine-energy-delivery') {
          animateMineEnergyDeliveryScene(animatables, time);
      } else if (type === 'dd-mine-eco-delivery') {
          animateMineEcoDeliveryScene(type, animatables, time);
      } else if (type === 'dd-port-completion') {
          animatePortCompletionDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-port-bim') {
          animatePortBimDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-channel-regulation') {
          animateChannelRegulationDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-ship-lock') {
          animateShipLockDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-smart-port') {
          animateSmartPortDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-nav-dispatch') {
          animateNavDispatchDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-ship-lifecycle') {
          animateShipLifecycleDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-port-asset') {
          animatePortAssetDeliveryScene(type, animatables as any, time);
      } else if (type === 'dd-channel-monitor') {
          animateChannelMonitorDeliveryScene(type, animatables, time);
      } else if (type === 'dd-nav-safety') {
          animateNavSafetyDeliveryScene(type, animatables, time);
      } else {
          animateGeoScene(animatables, time);
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
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    return () => {
      console.log("=== scene-digital-delivery cleanup ===");
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if(scene&&scene.group){
        scene.remove(group)
      }
      if(scene){
        scene.clear();
      }
      controls.dispose();
    //   console.log("=== cleanup 函数 - 读取 disposables ===");
    //   console.log("引用标识（toString）：", disposables.toString());
    //   console.log("数组长度：", disposables.length);
    //   console.log("数组本身（查看引用地址）：", disposables);
      disposables.forEach(d => d.dispose());
    //   console.log("=== cleanup 函数 - clear后 disposables ===");
    //   console.log("引用标识（toString）：", disposables.toString());
    //   console.log("数组长度：", disposables.length);
    //   console.log("数组本身（查看引用地址）：", disposables);
      renderer.dispose();
    };
  }, [type]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
