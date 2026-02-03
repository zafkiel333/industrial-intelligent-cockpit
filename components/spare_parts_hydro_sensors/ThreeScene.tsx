
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroSensorsThreeProps } from './three-types';

export const HydroSensorsThreeScene: React.FC<HydroSensorsThreeProps> = ({ 
  sensors, 
  activeSensorId, 
  onSelect,
  isCalibrating
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020610, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isCalibrating;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Geometry: Ghost Turbine ---
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    // Stator Frame (Wireframe)
    const statorGeo = new THREE.CylinderGeometry(5, 5, 4, 32, 2, true);
    const statorMat = new THREE.MeshBasicMaterial({ 
      color: 0x1e293b, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    ghostGroup.add(stator);

    // Rotor (Wireframe)
    const rotorGeo = new THREE.CylinderGeometry(3.5, 3.5, 4, 32, 2, true);
    const rotorMat = new THREE.MeshBasicMaterial({ 
      color: 0x334155, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    ghostGroup.add(rotor);

    // Shaft (Solid but dark)
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 8, 32);
    const shaftMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
      shininess: 100
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    ghostGroup.add(shaft);

    // --- Sensors ---
    const sensorMeshes: THREE.Mesh[] = [];
    const connectionLines: THREE.Line[] = [];

    sensors.forEach((s) => {
        const color = s.status === 'normal' ? 0x0ea5e9 : (s.status === 'drift' ? 0xf59e0b : 0xef4444);
        
        // Sensor Node
        const geo = new THREE.BoxGeometry(0.4, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        
        // Position relative to center, but look at center
        mesh.position.set(...s.position);
        mesh.lookAt(0, s.position[1], 0);
        
        mesh.userData = { id: s.id };
        ghostGroup.add(mesh);
        sensorMeshes.push(mesh);

        // Halo Ring
        if (activeSensorId === s.id) {
            const ringGeo = new THREE.RingGeometry(0.3, 0.35, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(mesh.position);
            ring.lookAt(0, s.position[1], 0);
            ghostGroup.add(ring);
        }

        // Data Line (Vertical projection)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...s.position),
            new THREE.Vector3(s.position[0], 6, s.position[2])
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
        const line = new THREE.Line(lineGeo, lineMat);
        ghostGroup.add(line);
        connectionLines.push(line);
    });

    // --- Data Stream Particles ---
    const particlesCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particlesCount * 3);
    const pUserData: any[] = []; // Store target sensor index

    for(let i=0; i<particlesCount; i++) {
        // Init at a random sensor position
        const sensorIdx = Math.floor(Math.random() * sensors.length);
        const s = sensors[sensorIdx];
        pPos[i*3] = s.position[0];
        pPos[i*3+1] = s.position[1];
        pPos[i*3+2] = s.position[2];
        pUserData.push({ 
            sensorIdx, 
            yOffset: Math.random() * 6, // Random height offset
            speed: 0.05 + Math.random() * 0.05 
        });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        size: 0.08, 
        color: 0x38bdf8, 
        transparent: true, 
        opacity: 0.6 
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- Calibration Grid (when active) ---
    const gridHelper = new THREE.PolarGridHelper(8, 16, 8, 64, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -4;
    gridHelper.visible = false;
    scene.add(gridHelper);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x0ea5e9, 2, 20);
    point.position.set(5, 5, 5);
    scene.add(point);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(sensorMeshes);
        if (intersects.length > 0) {
            onSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.02;

        // Rotate Ghost Turbine
        ghostGroup.rotation.y = Math.sin(time * 0.1) * 0.1; // Gentle sway

        // Animate Particles (Flowing UP data)
        const posAttr = particles.geometry.attributes.position;
        const positions = posAttr.array as Float32Array;
        
        for(let i=0; i<particlesCount; i++) {
            const data = pUserData[i];
            const s = sensors[data.sensorIdx];
            
            // Move up
            data.yOffset += data.speed;
            if (data.yOffset > 6) data.yOffset = 0; // Reset loop

            // Position is sensor pos + yOffset
            // Rotate with group? No, particles are in world space, sensors in ghostGroup (rotated).
            // To be precise we should apply group rotation. Simplified: Just stick to static sensor positions
            // or animate them slightly
            
            const worldPos = new THREE.Vector3(...s.position);
            worldPos.applyEuler(ghostGroup.rotation); // Apply group rotation to particle emission point

            positions[i*3] = worldPos.x;
            positions[i*3+1] = s.position[1] + data.yOffset;
            positions[i*3+2] = worldPos.z;
        }
        posAttr.needsUpdate = true;

        // Calibration Effect
        if (isCalibrating) {
            gridHelper.visible = true;
            gridHelper.rotation.y += 0.05;
            gridHelper.position.y = -4 + Math.sin(time * 2) * 4; // Scan up/down
            
            // Pulse active sensor
            const activeMesh = sensorMeshes.find(m => m.userData.id === activeSensorId);
            if (activeMesh) {
                activeMesh.scale.setScalar(1.5 + Math.sin(time * 10) * 0.5);
            }
        } else {
            gridHelper.visible = false;
            sensorMeshes.forEach(m => m.scale.setScalar(1));
        }

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
  }, [sensors, activeSensorId, isCalibrating]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
