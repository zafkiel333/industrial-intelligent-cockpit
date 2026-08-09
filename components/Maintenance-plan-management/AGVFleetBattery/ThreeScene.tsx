import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AGVFleetBatteryProps } from './three-types';

export const ThreeScene: React.FC<AGVFleetBatteryProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a192f, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const agvGroup = new THREE.Group();

    // AGV Body
    const bodyGeo = new THREE.BoxGeometry(8, 2, 5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    agvGroup.add(body);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const wheels: THREE.Mesh[] = [];
    
    const wheelPositions = [
      [-3, 0.8, 2.7], [3, 0.8, 2.7],
      [-3, 0.8, -2.7], [3, 0.8, -2.7]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheels.push(wheel);
      agvGroup.add(wheel);
    });

    // Battery Pack (Removable)
    const batteryGeo = new THREE.BoxGeometry(4, 1.5, 3);
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.8, roughness: 0.2 });
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.set(0, 1.5, 0); // Inside AGV
    agvGroup.add(battery);

    // Battery Cells (Visual details inside pack)
    const cellGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 });
    const cells: THREE.Mesh[] = [];
    
    for (let x = -1.5; x <= 1.5; x += 0.6) {
      for (let z = -1; z <= 1; z += 0.6) {
        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.set(x, 0, z);
        cells.push(cell);
        battery.add(cell);
      }
    }

    scene.add(agvGroup);

    // Charging Station / Swap Station
    const stationGeo = new THREE.BoxGeometry(6, 4, 6);
    const stationMat = new THREE.MeshStandardMaterial({ color: 0x334455, transparent: true, opacity: 0.5 });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(0, 2, -8);
    scene.add(station);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffcc, 0x003344);
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { batteryLevel, isRotating, temperature } = propsRef.current;

      // Update cell colors based on battery level and temp
      const levelColor = new THREE.Color(0xff0000).lerp(new THREE.Color(0x00ff00), batteryLevel / 100);
      if (temperature > 45) {
        levelColor.lerp(new THREE.Color(0xffaa00), 0.5); // Orange if hot
      }
      
      cells.forEach(cell => {
        cell.material.color.copy(levelColor);
        cell.material.emissive.copy(levelColor).multiplyScalar(0.5 + Math.sin(time * 2) * 0.2);
      });

      if (isRotating) {
        // Rotation mode: AGV moves to station, battery slides out
        agvGroup.position.z = Math.max(-8, agvGroup.position.z - delta * 5);
        
        if (agvGroup.position.z <= -7.9) {
          // Slide battery out (upwards or sideways depending on AGV design, let's do upwards for visibility)
          battery.position.y = Math.min(4, battery.position.y + delta * 2);
          bodyMat.opacity = 0.5;
          bodyMat.transparent = true;
        }
        
        wheels.forEach(w => w.rotation.y = 0); // Stop wheels
      } else {
        // Normal mode: AGV drives around
        agvGroup.position.z = Math.min(0, agvGroup.position.z + delta * 5);
        
        if (agvGroup.position.z >= -0.1) {
          battery.position.y = Math.max(1.5, battery.position.y - delta * 2);
          bodyMat.opacity = 1.0;
          bodyMat.transparent = false;
          
          // Drive in a circle
          agvGroup.position.x = Math.sin(time) * 5;
          agvGroup.position.z = Math.cos(time) * 5;
          agvGroup.rotation.y = time + Math.PI;
          
          const speed = 5;
          wheels.forEach(w => w.rotation.y += speed * delta);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      wheelGeo.dispose();
      wheelMat.dispose();
      batteryGeo.dispose();
      batteryMat.dispose();
      cellGeo.dispose();
      cellMat.dispose();
      stationGeo.dispose();
      stationMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
