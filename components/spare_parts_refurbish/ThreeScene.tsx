
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RefurbishProps } from './three-types';

export const RefurbishThreeScene: React.FC<RefurbishProps> = ({ 
  stage, 
  progress,
  laserPower,
  partType
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Scene Objects ---

    // 1. Workbench Platform
    const platformGeo = new THREE.CylinderGeometry(4, 4.5, 0.5, 32);
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.7, 
      metalness: 0.6 
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -2;
    scene.add(platform);

    // Grid on platform
    const grid = new THREE.GridHelper(8, 16, 0x0ea5e9, 0x334155);
    grid.position.y = -1.74;
    scene.add(grid);

    // 2. The Part (Shaft or Gear)
    const partGroup = new THREE.Group();
    scene.add(partGroup);

    let partMesh: THREE.Mesh;
    let repairLayer: THREE.Mesh;

    if (partType === 'gear') {
      const gearGeo = new THREE.CylinderGeometry(2, 2, 1, 16);
      const gearMat = new THREE.MeshStandardMaterial({ color: 0x475569, flatShading: true });
      partMesh = new THREE.Mesh(gearGeo, gearMat);
      partMesh.rotation.x = Math.PI / 2;
      partMesh.rotation.z = Math.PI / 2;
      
      // Repair layer (Ring around gear)
      const repairGeo = new THREE.TorusGeometry(2, 0.1, 16, 100, Math.PI * 2 * (progress/100));
      const repairMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      repairLayer = new THREE.Mesh(repairGeo, repairMat);
      // repairLayer.rotation.x = Math.PI / 2;
      partMesh.add(repairLayer);

    } else {
      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 32);
      const shaftMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x64748b, 
        metalness: 0.8, 
        roughness: 0.4,
        clearcoat: 0.5
      });
      partMesh = new THREE.Mesh(shaftGeo, shaftMat);
      partMesh.rotation.z = Math.PI / 2;

      // Repair layer (Section of shaft)
      // Represented by a slightly larger cylinder segment that grows
      const repairGeo = new THREE.CylinderGeometry(0.82, 0.82, 6 * (progress/100), 32);
      const repairMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        emissive: 0xff4500,
        emissiveIntensity: stage === 'cladding' ? 0.5 : 0,
        metalness: 1, 
        roughness: 0.2 
      });
      repairLayer = new THREE.Mesh(repairGeo, repairMat);
      repairLayer.rotation.z = Math.PI / 2;
      // Position needs to start from left and grow right
      repairLayer.position.x = -3 + (3 * (progress/100));
      // But CylinderGeometry grows from center, so we need to be careful. 
      // Actually simpler: Just scale a full cylinder.
      // Reset geometry to full length
      const fullRepairGeo = new THREE.CylinderGeometry(0.82, 0.82, 6, 32);
      // We will mask it or use scale. For simplicity in THREE basic, let's translate geometry
      fullRepairGeo.translate(0, 3, 0); // Pivot at bottom
      repairLayer = new THREE.Mesh(fullRepairGeo, repairMat);
      repairLayer.rotation.z = -Math.PI / 2;
      repairLayer.position.x = -3;
      repairLayer.scale.y = Math.max(0.01, progress/100);

      partGroup.add(repairLayer);
    }
    partGroup.add(partMesh);

    // 3. Laser Head
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    const nozzleGeo = new THREE.ConeGeometry(0.5, 1, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.rotation.x = Math.PI;
    headGroup.add(nozzle);

    // Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.01, 2, 8);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: laserPower > 0 ? 0.8 : 0 
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = -1.5;
    headGroup.add(beam);

    // Sparks (Particles)
    const sparkCount = 50;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.1, transparent: true, opacity: 0 });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    headGroup.add(sparks);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x0ea5e9, 10);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);
    
    // Laser interaction light
    const laserLight = new THREE.PointLight(0xff4500, laserPower / 20, 5);
    headGroup.add(laserLight);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Rotate Part
      if (stage === 'cladding' || stage === 'machining') {
         partMesh.rotation.x += 0.05;
         if(partType === 'shaft') repairLayer.rotation.x += 0.05; // Match rotation
      }

      // Move Laser Head
      if (stage === 'cladding') {
        const xPos = -3 + (progress / 100) * 6;
        headGroup.position.set(xPos, 2, 0);
        
        // Sparks animation
        if (laserPower > 0) {
            sparkMat.opacity = 1;
            const positions = sparks.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<sparkCount; i++) {
                const i3 = i * 3;
                // Reset if too far
                if (Math.abs(positions[i3+1]) > 1) {
                    positions[i3] = 0;
                    positions[i3+1] = -2.5; // Start at beam tip approx
                    positions[i3+2] = 0;
                    // Random velocity
                    (sparks as any).userData[i] = {
                        vx: (Math.random() - 0.5) * 0.1,
                        vy: Math.random() * 0.1,
                        vz: (Math.random() - 0.5) * 0.1
                    };
                }
                const v = (sparks as any).userData[i] || {vx:0, vy:0, vz:0};
                positions[i3] += v.vx;
                positions[i3+1] += v.vy;
                positions[i3+2] += v.vz;
            }
            sparks.geometry.attributes.position.needsUpdate = true;
        } else {
            sparkMat.opacity = 0;
        }
      } else if (stage === 'scanning') {
         headGroup.position.x = Math.sin(time) * 3;
         headGroup.position.y = 2;
         beamMat.color.setHex(0x0ea5e9); // Blue scan
         beamMat.opacity = 0.5;
         sparkMat.opacity = 0;
      } else {
         headGroup.position.y = 5; // Retract
         beamMat.opacity = 0;
         sparkMat.opacity = 0;
      }

      // Update Repair Layer visual
      if (partType === 'shaft' && repairLayer) {
          repairLayer.scale.y = Math.max(0.01, progress/100);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [stage, progress, laserPower, partType]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
