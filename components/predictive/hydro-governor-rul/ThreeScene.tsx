
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GovernorRulSceneProps } from './three-types';

export const GovernorRulScene: React.FC<GovernorRulSceneProps> = ({ 
  components, 
  selectedId, 
  onSelect,
  explodeLevel 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const compGroupsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020408, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2, 20);
    goldLight.position.set(5, 10, 5);
    scene.add(goldLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 1, 20);
    blueLight.position.set(-5, -5, -5);
    scene.add(blueLight);

    // --- Materials ---
    const baseMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0
    });

    const criticalMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.5
    });

    const warningMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.5
    });

    const goodMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.1,
        metalness: 0.5,
        roughness: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const selectedMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        wireframe: true
    });

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    compGroupsRef.current = [];

    components.forEach((comp) => {
        const group = new THREE.Group();
        group.userData = { id: comp.id, basePos: new THREE.Vector3(...comp.position) };
        
        let mesh;
        // Simple distinct shapes for different components
        if (comp.type === 'servo') {
            const geo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
            geo.rotateZ(Math.PI/2);
            mesh = new THREE.Mesh(geo, baseMat.clone());
        } else if (comp.type === 'pump') {
            const geo = new THREE.BoxGeometry(2, 2, 2);
            mesh = new THREE.Mesh(geo, baseMat.clone());
        } else if (comp.type === 'valve') {
            const geo = new THREE.SphereGeometry(1, 16, 16);
            mesh = new THREE.Mesh(geo, baseMat.clone());
        } else if (comp.type === 'accumulator') {
            const geo = new THREE.CapsuleGeometry(0.8, 3, 4, 16);
            mesh = new THREE.Mesh(geo, baseMat.clone());
        } else {
            const geo = new THREE.ConeGeometry(1, 2, 16);
            mesh = new THREE.Mesh(geo, baseMat.clone());
        }

        group.add(mesh);
        
        // Add a "Life Bar" floating above
        const barBg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x000000}));
        barBg.position.y = 2;
        group.add(barBg);
        
        const barFg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.12), new THREE.MeshBasicMaterial({color: 0x00ff00}));
        barFg.position.y = 2;
        barFg.scale.x = comp.health / 100;
        barFg.position.x = -0.5 + (comp.health/100)*0.5; // Left align roughly
        group.add(barFg);
        group.userData.healthBar = barFg;

        mainGroup.add(group);
        compGroupsRef.current.push(group);
    });

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(mainGroup.children, true);
        if (intersects.length > 0) {
            // Find the parent group which holds the userData.id
            let target: any = intersects[0].object;
            while(target.parent && target.parent !== mainGroup) {
                target = target.parent;
            }
            if (target.userData.id) {
                onSelect(target.userData.id);
            }
        } else {
            onSelect('');
        }
    };
    mountRef.current.addEventListener('click', onMouseClick);

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      compGroupsRef.current.forEach((group) => {
          const { id, basePos } = group.userData;
          const compData = components.find(c => c.id === id);
          if (!compData) return;

          // 1. Explode Effect
          // Move away from center (0,0,0) based on explodeLevel
          const direction = basePos.clone().normalize();
          const targetPos = basePos.clone().add(direction.multiplyScalar(explodeLevel * 5));
          group.position.lerp(targetPos, 0.1);

          // 2. Material Update
          const mesh = group.children[0] as THREE.Mesh;
          if (id === selectedId) {
              mesh.material = selectedMat;
              group.rotation.y += 0.02; // Rotate selected
          } else {
              if (compData.status === 'Critical') mesh.material = criticalMat;
              else if (compData.status === 'Warning') mesh.material = warningMat;
              else mesh.material = goodMat;
              group.rotation.y = 0; // Reset
          }

          // 3. Health Bar Color
          const bar = group.userData.healthBar as THREE.Mesh;
          (bar.material as THREE.MeshBasicMaterial).color.setHex(
              compData.health > 70 ? 0x10b981 : compData.health > 40 ? 0xf59e0b : 0xef4444
          );
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [components, selectedId, explodeLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
