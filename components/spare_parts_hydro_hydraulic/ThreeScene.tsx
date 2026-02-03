
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroHydraulicThreeProps } from './three-types';

export const HydroHydraulicThreeScene: React.FC<HydroHydraulicThreeProps> = ({ 
  parts, 
  activeId, 
  onPartSelect,
  systemPressure,
  isRunning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020610, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Scene Objects ---
    const group = new THREE.Group();
    scene.add(group);

    const interactives: THREE.Mesh[] = [];

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 });
    const tankMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x334155, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 
    });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });

    // 1. Main Tank
    const tankGeo = new THREE.BoxGeometry(8, 3, 5);
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = -1.5;
    tank.userData = { id: 'HYD-TANK' };
    group.add(tank);
    interactives.push(tank);

    // 2. Motor-Pump Units (Vertical)
    const createPumpUnit = (x: number, z: number, id: string) => {
        const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32);
        const motor = new THREE.Mesh(motorGeo, metalMat);
        motor.position.set(x, 2, z);
        
        // Pump head
        const pumpGeo = new THREE.CylinderGeometry(0.9, 0.9, 1, 32);
        const pump = new THREE.Mesh(pumpGeo, metalMat);
        pump.position.y = -1.5; // Below motor
        motor.add(pump);

        motor.userData = { id };
        group.add(motor);
        interactives.push(motor);
        return motor;
    };

    const pump1 = createPumpUnit(-2, -1, 'HYD-PUMP-01');
    const pump2 = createPumpUnit(2, -1, 'HYD-PUMP-02');

    // 3. Accumulator Bank
    const accGroup = new THREE.Group();
    accGroup.position.set(-3, 1, 1.5);
    for(let i=0; i<3; i++) {
        const accGeo = new THREE.CapsuleGeometry(0.5, 2, 4, 16);
        const acc = new THREE.Mesh(accGeo, orangeMat);
        acc.position.x = i * 1.2;
        acc.userData = { id: `HYD-ACC-${i+1}` }; // Example IDs
        accGroup.add(acc);
        interactives.push(acc);
    }
    group.add(accGroup);

    // 4. Valve Block Manifold
    const manifoldGeo = new THREE.BoxGeometry(4, 1.5, 1.5);
    const manifold = new THREE.Mesh(manifoldGeo, metalMat);
    manifold.position.set(1, 1, 1.5);
    manifold.userData = { id: 'HYD-VALVE-BLOCK' };
    group.add(manifold);
    interactives.push(manifold);

    // Valves on manifold
    const valveGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const v1 = new THREE.Mesh(valveGeo, orangeMat);
    v1.position.set(-1, 1, 0);
    manifold.add(v1);
    const v2 = new THREE.Mesh(valveGeo, orangeMat);
    v2.position.set(1, 1, 0);
    manifold.add(v2);

    // 5. Piping
    const pipePoints = [
        new THREE.Vector3(-2, 0.5, -1), new THREE.Vector3(-2, 0.5, 1.5), // Pump1 to Manifold
        new THREE.Vector3(2, 0.5, -1), new THREE.Vector3(2, 0.5, 1.5),   // Pump2 to Manifold
    ];
    const pipeGeo = new THREE.BufferGeometry().setFromPoints(pipePoints);
    const pipes = new THREE.LineSegments(pipeGeo, new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
    group.add(pipes);

    // Pressure Gauge (Visual)
    const gaugeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    gaugeGeo.rotateX(Math.PI/2);
    const gauge = new THREE.Mesh(gaugeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    gauge.position.set(1, 1.8, 2.3);
    group.add(gauge);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0x0ea5e9, 8);
    spot.position.set(5, 10, 5);
    scene.add(spot);
    const warm = new THREE.PointLight(0xf97316, 2, 10);
    warm.position.set(-5, 5, 0);
    scene.add(warm);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactives);
        if (intersects.length > 0) {
            onPartSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // Highlight active part
      interactives.forEach(mesh => {
         const isActive = mesh.userData.id === activeId;
         if (isActive) {
             (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x0ea5e9);
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.2;
         } else {
             (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
         }

         // Warning blink
         const part = parts.find(p => p.id === mesh.userData.id);
         if (part?.status === 'warning' || part?.status === 'critical') {
             (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
             (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.abs(Math.sin(time * 3));
         }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, activeId, systemPressure, isRunning, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
