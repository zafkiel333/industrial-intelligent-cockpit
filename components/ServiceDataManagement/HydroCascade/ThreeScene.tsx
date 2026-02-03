
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CascadeSceneProps, CascadeStation } from './three-types';

export const HydroCascadeThreeScene: React.FC<CascadeSceneProps> = ({ 
  activeStationId, onStationSelect, stations, globalFlowScale 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark environment with a hint of atmospheric fog
    scene.fog = new THREE.FogExp2(0x020617, 0.02); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 25, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(-20, 50, -20);
    scene.add(sunLight);
    const accentLight = new THREE.PointLight(0x0d9488, 5, 100);
    accentLight.position.set(0, 20, 0);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- Terrain Generation (River Valley) ---
    // Simple procedural terrain using sine waves to create a valley
    const terrainGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    const positions = terrainGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1]; // Actually Z in 3D before rotation
        // Create a valley along X axis roughly
        const distFromCenter = Math.abs(y); 
        // Elevation increases away from center river bed
        let z = Math.pow(distFromCenter / 15, 2) * 2; 
        // Add some noise
        z += Math.sin(x * 0.2) * 2 + Math.cos(y * 0.3) * 1;
        
        // Slope the whole terrain downwards from left to right (Upstream -> Downstream)
        z += (x + 50) * 0.3; 

        positions[i+2] = z;
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.9,
        flatShading: true 
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -10;
    group.add(terrain);

    // --- River Water ---
    // A separate mesh following the valley floor
    const riverGeo = new THREE.PlaneGeometry(100, 12, 64, 8);
    const rPos = riverGeo.attributes.position.array as Float32Array;
    for(let i=0; i<rPos.length; i+=3) {
        const x = rPos[i];
        // Slope matching the terrain roughly
        rPos[i+2] = (x + 50) * 0.3 - 0.5; // Slightly below "banks"
    }
    riverGeo.computeVertexNormals();
    const riverMat = new THREE.MeshPhongMaterial({ 
        color: 0x06b6d4, 
        emissive: 0x083344,
        specular: 0xffffff,
        shininess: 50,
        transparent: true, 
        opacity: 0.8
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.y = -9.5; // Adjust height
    group.add(river);

    // --- Stations & Dams ---
    const stationMeshes: THREE.Mesh[] = [];
    
    stations.forEach((st, idx) => {
        const stGroup = new THREE.Group();
        // Adjust position based on our terrain coordinates logic
        // The props position is abstract, we map it to terrain
        stGroup.position.set(st.position[0], st.position[1] - 5, st.position[2]); 
        
        // Dam Body
        const damWidth = st.type === 'reservoir' ? 12 : 8;
        const damHeight = st.type === 'reservoir' ? 6 : 3;
        const damGeo = new THREE.BoxGeometry(2, damHeight, damWidth);
        const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const dam = new THREE.Mesh(damGeo, damMat);
        dam.position.y = damHeight / 2;
        stGroup.add(dam);

        // Powerhouse
        const phGeo = new THREE.BoxGeometry(4, 3, 5);
        const phColor = st.id === activeStationId ? 0xf59e0b : 0x0d9488;
        const phMat = new THREE.MeshPhongMaterial({ color: phColor, emissive: phColor, emissiveIntensity: 0.3 });
        const ph = new THREE.Mesh(phGeo, phMat);
        ph.position.set(3, 1.5, 3); // Side of dam
        ph.userData = { id: st.id };
        stGroup.add(ph);
        stationMeshes.push(ph);

        // Status Indicator (Spillway)
        if (st.status === 'spilling') {
             const spillGeo = new THREE.PlaneGeometry(1, damHeight);
             const spillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
             const spill = new THREE.Mesh(spillGeo, spillMat);
             spill.rotation.y = Math.PI / 2;
             spill.position.set(1.1, damHeight/2, 0);
             stGroup.add(spill);
        }

        // Label / Hologram
        const ringGeo = new THREE.RingGeometry(2, 2.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: phColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = damHeight + 1;
        stGroup.add(ring);

        group.add(stGroup);
    });

    // --- Transmission Lines (Connecting Powerhouses) ---
    const lineMat = new THREE.LineBasicMaterial({ color: 0xfcd34d, transparent: true, opacity: 0.4 });
    const linePoints = [];
    stations.forEach(st => {
        linePoints.push(new THREE.Vector3(st.position[0] + 3, st.position[1] + 5, st.position[2] + 3));
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const transmissionLine = new THREE.Line(lineGeo, lineMat);
    group.add(transmissionLine);

    // --- Flow Particles ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i+=3) {
        pPos[i] = (Math.random()-0.5) * 80; // Along river X
        pPos[i+1] = -9; // Height
        pPos[i+2] = (Math.random()-0.5) * 8; // Width Y
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stationMeshes);
      if (intersects.length > 0) {
        onStationSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate River Texture (Vertex displacement)
      // Simplified: Just move particles
      const pos = particles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i] += 0.1 * globalFlowScale; // Move downstream (positive X)
          
          // Slope adjustment
          pos[i+1] = (pos[i] + 50) * 0.3 - 9;

          if(pos[i] > 50) {
              pos[i] = -50;
          }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Station pulse
      stationMeshes.forEach(mesh => {
          if (mesh.userData.id === activeStationId) {
             mesh.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
          } else {
             mesh.scale.setScalar(1);
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeStationId, globalFlowScale]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
