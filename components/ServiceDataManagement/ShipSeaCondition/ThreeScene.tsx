
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SeaConditionProps, EquipmentNode } from './three-types';

export const ShipSeaConditionThreeScene: React.FC<SeaConditionProps> = ({ 
  waveHeight, wavePeriod, shipMotion, activeNodeId, onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Define equipment nodes relative to ship center
  const nodes: EquipmentNode[] = [
    { id: 'radar-mast', name: '雷达桅杆', position: [0, 8, -5], gLoad: 0, limit: 2.5, status: 'safe' },
    { id: 'deck-crane', name: '甲板克令吊', position: [3, 2, 5], gLoad: 0, limit: 1.5, status: 'safe' },
    { id: 'main-engine', name: '主机座架', position: [0, -2, -2], gLoad: 0, limit: 3.0, status: 'safe' },
    { id: 'bow-thruster', name: '侧推器', position: [0, -3, 10], gLoad: 0, limit: 4.0, status: 'safe' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1121, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stay above water

    // Stormy Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 1);
    scene.add(ambientLight);
    const lightningLight = new THREE.PointLight(0xa5f3fc, 0, 100); // For lightning flash
    lightningLight.position.set(0, 20, 0);
    scene.add(lightningLight);
    const spotLight = new THREE.SpotLight(0xffffff, 5);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = 0.5;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Dynamic Ocean Surface
    const waterGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3,
      emissive: 0x0f172a
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Ship Group (Container for all ship parts)
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Ship Hull (Abstract)
    const hullGeo = new THREE.BufferGeometry();
    // Simplified hull shape
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, -12);
    hullShape.lineTo(3, -5);
    hullShape.lineTo(3, 8);
    hullShape.lineTo(0, 12); // Bow
    hullShape.lineTo(-3, 8);
    hullShape.lineTo(-3, -5);
    hullShape.lineTo(0, -12); // Stern
    const hullExtrude = new THREE.ExtrudeGeometry(hullShape, { depth: 4, bevelEnabled: false });
    const hullMat = new THREE.MeshPhongMaterial({ color: 0x334155, flatShading: true });
    const hull = new THREE.Mesh(hullExtrude, hullMat);
    hull.rotation.x = Math.PI / 2;
    hull.position.y = 2;
    shipGroup.add(hull);

    // Deck House
    const houseGeo = new THREE.BoxGeometry(5, 4, 4);
    const houseMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(0, 4, -7);
    shipGroup.add(house);

    // Equipment Nodes
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
      const geo = new THREE.OctahedronGeometry(0.5);
      const mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id, baseColor: 0x10b981 };
      shipGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Label line
      const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(0, 2, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5}));
      mesh.add(line);
    });

    // Rain Particles
    const rainCount = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i++) {
        rainPos[i] = (Math.random() - 0.5) * 80;
        if (i % 3 === 1) rainPos[i] = Math.random() * 40; // Y axis
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.1, transparent: true, opacity: 0.6 });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Update Ship Motion from Props
      shipGroup.rotation.z = THREE.MathUtils.degToRad(shipMotion.roll);
      shipGroup.rotation.x = THREE.MathUtils.degToRad(shipMotion.pitch);
      shipGroup.position.y = shipMotion.heave;

      // Animate Water
      const positions = water.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1];
        // Simulate wave movement
        positions[i + 2] = Math.sin(x * 0.2 + time * 2) * (waveHeight * 0.5) + 
                           Math.cos(y * 0.15 + time * 1.5) * (waveHeight * 0.3);
      }
      water.geometry.attributes.position.needsUpdate = true;

      // Animate Rain
      const rPos = rainSystem.geometry.attributes.position.array as Float32Array;
      for(let i=1; i<rPos.length; i+=3) {
          rPos[i] -= 0.8;
          if (rPos[i] < 0) rPos[i] = 40;
      }
      rainSystem.geometry.attributes.position.needsUpdate = true;

      // Lightning Flash
      if (Math.random() > 0.99) {
          lightningLight.intensity = 10;
          setTimeout(() => lightningLight.intensity = 0, 100);
      }

      // Update Node Colors based on "G-Force" (simulated by motion magnitude)
      nodeMeshes.forEach(mesh => {
          // Calculate local acceleration approximation
          const dist = mesh.position.length();
          const accel = (Math.abs(shipMotion.roll) + Math.abs(shipMotion.pitch)) * dist * 0.1;
          
          if (mesh.userData.id === activeNodeId) {
              mesh.scale.setScalar(1.5);
              (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
          } else {
              mesh.scale.setScalar(1);
              if (accel > 1.5) (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444); // Red
              else if (accel > 0.8) (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b); // Orange
              else (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x10b981); // Green
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
  }, [shipMotion, waveHeight, activeNodeId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
