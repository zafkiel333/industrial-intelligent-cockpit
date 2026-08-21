import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReservoirDesiltingProps } from './three-types';

export const ThreeScene: React.FC<ReservoirDesiltingProps> = ({ siltLevel = 65, status = '待作业', progress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Scene objects
  const siltRef = useRef<THREE.Mesh | null>(null);
  const dredgerRef = useRef<THREE.Group | null>(null);
  const cutterRef = useRef<THREE.Mesh | null>(null);

  const propsRef = useRef({ siltLevel, status, progress });

  useEffect(() => {
    propsRef.current = { siltLevel, status, progress };
  }, [siltLevel, status, progress]);

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
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(30, 20, 30);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Reservoir Bed (Base)
    const bedGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    // Add some noise to bed
    const pos = bedGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 2);
    }
    bedGeo.computeVertexNormals();
    
    const bedMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        roughness: 0.9,
        metalness: 0.1
    });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.rotation.x = -Math.PI / 2;
    bed.position.y = -10;
    scene.add(bed);

    // Silt Layer
    const siltGeo = new THREE.BoxGeometry(58, 10, 58);
    const siltMat = new THREE.MeshStandardMaterial({ 
        color: 0x78350f, // Brownish mud
        roughness: 1.0,
        transparent: true,
        opacity: 0.9
    });
    const silt = new THREE.Mesh(siltGeo, siltMat);
    silt.position.y = -5;
    scene.add(silt);
    siltRef.current = silt;

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(60, 60);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0284c7, 
        transparent: true, 
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 5;
    scene.add(water);

    // Dredger (Cutter Suction Dredger)
    const dredgerGroup = new THREE.Group();
    
    // Hull
    const hullGeo = new THREE.BoxGeometry(12, 3, 6);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xeab308 }); // Yellow
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 4.5;
    dredgerGroup.add(hull);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(4, 3, 4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-2, 7.5, 0);
    dredgerGroup.add(cabin);

    // Ladder (Arm)
    const ladderGeo = new THREE.BoxGeometry(10, 1, 1);
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const ladder = new THREE.Mesh(ladderGeo, ladderMat);
    ladder.position.set(9, 3, 0);
    ladder.rotation.z = -Math.PI / 6;
    dredgerGroup.add(ladder);

    // Cutter Head
    const cutterGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 8);
    const cutterMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    const cutter = new THREE.Mesh(cutterGeo, cutterMat);
    cutter.position.set(13, 0.5, 0);
    cutter.rotation.z = Math.PI / 2;
    dredgerGroup.add(cutter);
    cutterRef.current = cutter;

    // Spuds (Poles at back)
    const spudGeo = new THREE.CylinderGeometry(0.3, 0.3, 15);
    const spudMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const spud1 = new THREE.Mesh(spudGeo, spudMat);
    spud1.position.set(-5, 5, 2);
    const spud2 = new THREE.Mesh(spudGeo, spudMat);
    spud2.position.set(-5, 5, -2);
    dredgerGroup.add(spud1);
    dredgerGroup.add(spud2);

    scene.add(dredgerGroup);
    dredgerRef.current = dredgerGroup;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.016;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Update Silt Level
      if (siltRef.current) {
          // Map 0-100% to height 0-10
          const targetHeight = (currentProps.siltLevel / 100) * 10;
          siltRef.current.scale.y = Math.max(0.01, targetHeight / 10);
          siltRef.current.position.y = -10 + targetHeight / 2;
      }

      // Animate Dredger
      if (dredgerRef.current && cutterRef.current) {
          // Bobbing on water
          dredgerRef.current.position.y = Math.sin(time * 2) * 0.2;

          if (currentProps.status === '作业中') {
              // Rotate cutter head
              cutterRef.current.rotation.x += 0.1;
              
              // Move dredger back and forth based on progress
              // Progress 0-100 maps to moving across the reservoir
              const moveX = -20 + (currentProps.progress / 100) * 40;
              // Add some sweeping motion (Z axis)
              const moveZ = Math.sin(currentProps.progress * 0.5) * 10;
              
              dredgerRef.current.position.x = moveX;
              dredgerRef.current.position.z = moveZ;
              
              // Adjust arm angle based on silt level
              const ladder = dredgerRef.current.children[2];
              const targetAngle = -Math.PI/4 - (currentProps.siltLevel/100) * 0.2;
              ladder.rotation.z = targetAngle;
              
              // Keep cutter at end of ladder
              cutterRef.current.position.x = 6 + Math.cos(targetAngle) * 5;
              cutterRef.current.position.y = 4.5 + Math.sin(targetAngle) * 5;
          } else if (currentProps.status === '已完成') {
              // Move to edge
              dredgerRef.current.position.x = -25;
              dredgerRef.current.position.z = 0;
          } else {
              // Idle
              dredgerRef.current.position.x = 0;
              dredgerRef.current.position.z = 0;
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
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
