import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrashRackCleaningProps } from './three-types';

export const ThreeScene: React.FC<TrashRackCleaningProps> = ({ debrisLevel = 0, status = '待机', cleaningProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const grabberRef = useRef<THREE.Group | null>(null);
  const debrisRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Trash Rack (Grid structure)
    const rackGroup = new THREE.Group();
    const barMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    
    // Vertical bars
    for (let i = -10; i <= 10; i += 1.5) {
      const barGeo = new THREE.CylinderGeometry(0.2, 0.2, 20, 8);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(i, 0, 0);
      rackGroup.add(bar);
    }
    
    // Horizontal supports
    for (let i = -8; i <= 8; i += 4) {
      const supportGeo = new THREE.BoxGeometry(22, 0.5, 0.5);
      const support = new THREE.Mesh(supportGeo, barMat);
      support.position.set(0, i, -0.2);
      rackGroup.add(support);
    }
    
    // Angle the rack slightly
    rackGroup.rotation.x = -Math.PI / 12;
    scene.add(rackGroup);

    // Water
    const waterGeo = new THREE.PlaneGeometry(30, 20);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      transparent: true, 
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 2, 5);
    scene.add(water);

    // Debris (Dirt/Trash accumulation)
    const debrisGroup = new THREE.Group();
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0x451a1a, roughness: 0.9 });
    
    // Create random debris chunks
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 1.5 + 0.5;
      const chunkGeo = new THREE.DodecahedronGeometry(size, 0);
      const chunk = new THREE.Mesh(chunkGeo, debrisMat);
      
      // Position primarily near the water line and bottom
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15 - 2;
      const z = Math.random() * 1.5 + 0.5; // In front of rack
      
      chunk.position.set(x, y, z);
      chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      // Store original scale for animation
      chunk.userData.originalScale = size;
      debrisGroup.add(chunk);
    }
    
    // Angle debris group to match rack
    debrisGroup.rotation.x = -Math.PI / 12;
    scene.add(debrisGroup);
    debrisRef.current = debrisGroup;

    // Cleaning Machine (Grabber)
    const grabberGroup = new THREE.Group();
    
    // Main carriage
    const carriageGeo = new THREE.BoxGeometry(4, 2, 3);
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });
    const carriage = new THREE.Mesh(carriageGeo, carriageMat);
    grabberGroup.add(carriage);
    
    // Arm
    const armGeo = new THREE.CylinderGeometry(0.3, 0.3, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(0, -4, 1);
    grabberGroup.add(arm);
    
    // Bucket/Rake
    const bucketGeo = new THREE.BoxGeometry(3, 1, 1);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(0, -8, 1.5);
    // Add teeth to bucket
    for(let i=-1.2; i<=1.2; i+=0.4) {
        const toothGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
        const tooth = new THREE.Mesh(toothGeo, bucketMat);
        tooth.position.set(i, -0.5, 0.5);
        tooth.rotation.x = Math.PI/4;
        bucket.add(tooth);
    }
    grabberGroup.add(bucket);

    // Position grabber at top of rack
    grabberGroup.position.set(0, 12, 2);
    grabberGroup.rotation.x = -Math.PI / 12;
    scene.add(grabberGroup);
    grabberRef.current = grabberGroup;

    // Guide rails for grabber
    const railGeo = new THREE.CylinderGeometry(0.3, 0.3, 25);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(-11, 0, 1);
    rail1.rotation.x = -Math.PI / 12;
    scene.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(11, 0, 1);
    rail2.rotation.x = -Math.PI / 12;
    scene.add(rail2);

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.02;
      controlsRef.current.update();

      // Animate Debris visibility based on debrisLevel prop
      if (debrisRef.current) {
        const targetCount = Math.floor((debrisLevel / 100) * debrisRef.current.children.length);
        
        debrisRef.current.children.forEach((child, index) => {
          if (index < targetCount) {
            child.visible = true;
            // Slight bobbing for debris near water surface
            if (child.position.y > -2 && child.position.y < 4) {
                child.position.y += Math.sin(time * 2 + index) * 0.01;
            }
          } else {
            child.visible = false;
          }
        });
      }

      // Animate Grabber based on status and progress
      if (grabberRef.current) {
        if (status === '清污中') {
          // Complex motion: move down, grab, move up
          // Use cleaningProgress (0-100) to determine phase
          
          // Map progress to a cycle: 0-40 down, 40-60 grab, 60-100 up
          let cycleProgress = (cleaningProgress % 20) / 20; // Create smaller cycles within overall progress
          
          let targetY = 12; // Top position
          let targetZ = 2;
          
          if (cycleProgress < 0.4) {
             // Moving down
             targetY = 12 - (20 * (cycleProgress / 0.4));
          } else if (cycleProgress < 0.6) {
             // Grabbing (at bottom)
             targetY = -8;
             targetZ = 1; // Move closer to rack
          } else {
             // Moving up
             targetY = -8 + (20 * ((cycleProgress - 0.6) / 0.4));
          }
          
          // Apply movement along the angled rack
          const angle = -Math.PI / 12;
          grabberRef.current.position.y += (targetY * Math.cos(angle) - grabberRef.current.position.y) * 0.1;
          grabberRef.current.position.z += (targetY * Math.sin(angle) + targetZ - grabberRef.current.position.z) * 0.1;
          
          // Move horizontally across the rack slowly over the full 0-100 progress
          const targetX = -8 + (16 * (cleaningProgress / 100));
          grabberRef.current.position.x += (targetX - grabberRef.current.position.x) * 0.05;

        } else if (status === '待机' || status === '故障') {
          // Return to top center
          grabberRef.current.position.x += (0 - grabberRef.current.position.x) * 0.05;
          grabberRef.current.position.y += (12 * Math.cos(-Math.PI / 12) - grabberRef.current.position.y) * 0.05;
          grabberRef.current.position.z += (12 * Math.sin(-Math.PI / 12) + 2 - grabberRef.current.position.z) * 0.05;
        } else if (status === '维护中') {
           // Maintenance position (top side)
          grabberRef.current.position.x += (12 - grabberRef.current.position.x) * 0.05;
          grabberRef.current.position.y += (10 * Math.cos(-Math.PI / 12) - grabberRef.current.position.y) * 0.05;
        }

        // Color indication for status
        const carriage = grabberRef.current.children[0] as THREE.Mesh;
        if (status === '故障') {
            (carriage.material as THREE.MeshStandardMaterial).color.setHex(0xef4444); // Red
        } else if (status === '维护中') {
            (carriage.material as THREE.MeshStandardMaterial).color.setHex(0xa855f7); // Purple
        } else {
            (carriage.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b); // Amber
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    resizeObserverRef.current = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        for (let entry of entries) {
          if (entry.target === mountRef.current) {
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            if (cameraRef.current && rendererRef.current && width > 0 && height > 0) {
              cameraRef.current.aspect = width / height;
              cameraRef.current.updateProjectionMatrix();
              rendererRef.current.setSize(width, height, false);
            }
          }
        }
      });
    });

    if (mountRef.current) {
      resizeObserverRef.current.observe(mountRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
              else object.material.dispose();
            }
          }
        });
      }
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [debrisLevel, status, cleaningProgress]);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
