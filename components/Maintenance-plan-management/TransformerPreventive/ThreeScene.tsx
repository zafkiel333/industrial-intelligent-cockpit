import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformerPreventiveProps } from './three-types';

export const ThreeScene: React.FC<TransformerPreventiveProps> = ({ oilTemperature = 65, status = '正常', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformerRef = useRef<THREE.Group | null>(null);
  const oilRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const propsRef = useRef({ oilTemperature, status, maintenanceProgress });

  useEffect(() => {
    propsRef.current = { oilTemperature, status, maintenanceProgress };
  }, [oilTemperature, status, maintenanceProgress]);

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
    camera.position.set(15, 10, 20);

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

    // Transformer Group
    const transformerGroup = new THREE.Group();
    
    // Main Tank
    const tankGeo = new THREE.BoxGeometry(8, 6, 6);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 3;
    transformerGroup.add(tank);

    // Conservator (Oil Tank on top)
    const conservatorGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 16);
    const conservatorMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
    const conservator = new THREE.Mesh(conservatorGeo, conservatorMat);
    conservator.rotation.z = Math.PI / 2;
    conservator.position.set(0, 7.5, 2);
    transformerGroup.add(conservator);

    // Bushings (Insulators)
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.1, roughness: 0.8 });
    for (let i = -2; i <= 2; i += 2) {
      const bushingGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
      const bushing = new THREE.Mesh(bushingGeo, bushingMat);
      bushing.position.set(i, 7.5, -1);
      
      // Add rings to bushing
      for (let j = 0; j < 5; j++) {
        const ringGeo = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
        const ring = new THREE.Mesh(ringGeo, bushingMat);
        ring.position.y = -1 + j * 0.5;
        ring.rotation.x = Math.PI / 2;
        bushing.add(ring);
      }
      
      transformerGroup.add(bushing);
    }

    // Radiators (Cooling fins)
    const radiatorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
    for (let side of [-1, 1]) {
      for (let i = -2; i <= 2; i += 1) {
        const radiatorGeo = new THREE.BoxGeometry(0.1, 5, 4);
        const radiator = new THREE.Mesh(radiatorGeo, radiatorMat);
        radiator.position.set(side * 4.5, 3, i);
        transformerGroup.add(radiator);
      }
    }

    // Oil visualization (inside a semi-transparent cutaway)
    const oilTankGeo = new THREE.BoxGeometry(7.8, 5.8, 5.8);
    const oilTankMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.3,
      depthWrite: false
    });
    const oilTank = new THREE.Mesh(oilTankGeo, oilTankMat);
    oilTank.position.y = 3;
    transformerGroup.add(oilTank);
    oilRef.current = oilTank;

    scene.add(transformerGroup);
    transformerRef.current = transformerGroup;

    // Maintenance scaffolding (hidden by default)
    const scaffoldGroup = new THREE.Group();
    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
    const scaffoldGeo = new THREE.BoxGeometry(10, 10, 8);
    const scaffold = new THREE.Mesh(scaffoldGeo, scaffoldMat);
    scaffold.position.y = 5;
    scaffoldGroup.add(scaffold);
    scaffoldGroup.visible = false;
    scene.add(scaffoldGroup);

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.05;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Update oil color based on temperature
      if (oilRef.current) {
        const mat = oilRef.current.material as THREE.MeshStandardMaterial;
        if (currentProps.oilTemperature > 75) {
          mat.color.setHex(0xef4444); // Red for warning
          mat.opacity = 0.5 + Math.sin(time * 2) * 0.2; // Pulsate
        } else {
          mat.color.setHex(0x0ea5e9); // Blue for normal
          mat.opacity = 0.3;
        }
      }

      // Handle maintenance visualization
      if (currentProps.status === '检修中') {
        scaffoldGroup.visible = true;
        // Animate scaffolding building up based on progress
        scaffold.scale.y = Math.max(0.01, currentProps.maintenanceProgress / 100);
        scaffold.position.y = (10 * scaffold.scale.y) / 2;
      } else {
        scaffoldGroup.visible = false;
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
