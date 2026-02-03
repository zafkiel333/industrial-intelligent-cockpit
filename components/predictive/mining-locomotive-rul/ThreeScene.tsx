
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocoRulSceneProps } from './three-types';

export const LocomotiveRulScene: React.FC<LocoRulSceneProps> = ({ 
  components, 
  activeComponentId, 
  onSelect, 
  explodeFactor, 
  previewTimeMonth 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const compGroupsRef = useRef<THREE.Group[]>([]);
  const timeTunnelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0510, 0.02); // Deep violet fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 50);
    purpleLight.position.set(-10, 5, -10);
    scene.add(purpleLight);

    const warningLight = new THREE.PointLight(0xff0000, 0, 50); // Activates on low health
    warningLight.position.set(0, 5, 0);
    scene.add(warningLight);

    // --- Time Tunnel (Visual Effect for Prediction) ---
    const tunnelGroup = new THREE.Group();
    timeTunnelRef.current = tunnelGroup;
    scene.add(tunnelGroup);

    for(let i=0; i<10; i++) {
        const ringGeo = new THREE.TorusGeometry(8 + i, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.1 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.z = -5 + i * 2;
        tunnelGroup.add(ring);
    }

    // --- Materials ---
    const baseMat = new THREE.MeshPhysicalMaterial({
        color: 0xfacc15, // Yellow base
        metalness: 0.5,
        roughness: 0.2,
        clearcoat: 0.5
    });

    const techMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
        roughness: 0.4
    });

    const highlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // --- Components Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    compGroupsRef.current = [];

    components.forEach((comp) => {
        const group = new THREE.Group();
        group.userData = { 
            id: comp.id, 
            basePos: new THREE.Vector3(...comp.position),
            degradationRate: comp.degradationRate,
            initialHealth: comp.currentHealth
        };

        // Geometry based on type
        let mesh;
        if (comp.category === 'body') {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMat.clone());
        } else if (comp.category === 'wheel') {
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), techMat.clone());
            mesh.rotation.z = Math.PI / 2;
        } else if (comp.category === 'motor') {
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), techMat.clone());
        } else if (comp.category === 'pantograph') {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), techMat.clone());
        } else {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), techMat.clone());
        }
        
        mesh.scale.set(...comp.scale);
        mesh.name = "mesh";
        group.add(mesh);

        // Selection Highlight
        const highlight = new THREE.Mesh(mesh.geometry, highlightMat);
        highlight.scale.multiplyScalar(1.05);
        highlight.visible = false;
        highlight.name = "highlight";
        if (comp.category === 'wheel') highlight.rotation.z = Math.PI / 2;
        group.add(highlight);

        mainGroup.add(group);
        compGroupsRef.current.push(group);
    });

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        // Raycast recursively
        const hits = raycaster.intersectObjects(mainGroup.children, true);
        if (hits.length > 0) {
            let target: any = hits[0].object;
            while(target.parent && target.parent !== mainGroup) target = target.parent;
            if (target.userData.id) onSelect(target.userData.id);
        } else {
            onSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation ---
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // Time Tunnel Animation
      if (timeTunnelRef.current) {
          timeTunnelRef.current.position.z = (time * 2) % 2;
          // Pulse effect based on preview time
          const pulse = 1 + (previewTimeMonth / 12) * 0.5;
          timeTunnelRef.current.scale.setScalar(pulse);
      }

      let minHealthInScene = 100;

      compGroupsRef.current.forEach(group => {
          const { id, basePos, degradationRate, initialHealth } = group.userData;
          
          // 1. Explode Logic
          // Calculate explode direction (away from center Y axis)
          const dir = new THREE.Vector3(basePos.x, basePos.y, basePos.z).normalize();
          // Add Y bias for top components
          if (basePos.y > 1) dir.y += 1;
          
          const targetPos = basePos.clone().add(dir.multiplyScalar(explodeFactor * 5));
          group.position.lerp(targetPos, 0.1);

          // 2. Future Health Simulation (Coloring)
          // Predicted Health = Current - Rate * Months
          const predictedHealth = Math.max(0, initialHealth - degradationRate * previewTimeMonth);
          if (predictedHealth < minHealthInScene) minHealthInScene = predictedHealth;

          const mesh = group.getObjectByName('mesh') as THREE.Mesh;
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          
          // Color Mapping: Green -> Yellow -> Red -> Dark Grey (Dead)
          const hNorm = predictedHealth / 100;
          const targetColor = new THREE.Color();
          
          if (predictedHealth < 20) targetColor.setHex(0x333333); // Failed
          else targetColor.setHSL(hNorm * 0.3, 1.0, 0.4); // Red(0) to Green(0.3)
          
          mat.color.lerp(targetColor, 0.1);
          
          // Emissive pulse for critical parts in future
          if (predictedHealth < 40) {
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
          } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
          }

          // 3. Selection State
          const highlight = group.getObjectByName('highlight');
          if (highlight) highlight.visible = (id === activeComponentId);
      });

      // Global warning light
      if (minHealthInScene < 40) {
          warningLight.intensity = 2 + Math.sin(time * 5) * 2;
      } else {
          warningLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [components, activeComponentId, explodeFactor, previewTimeMonth]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
