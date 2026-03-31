import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShearerDrumMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<ShearerDrumMaintenanceProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a15, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Shearer Arm
    const armGeo = new THREE.BoxGeometry(8, 1.5, 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.3 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.x = -4;
    scene.add(arm);

    // Drum Group
    const drumGroup = new THREE.Group();
    drumGroup.position.x = 0;
    scene.add(drumGroup);

    // Drum Core
    const coreGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    drumGroup.add(core);

    // Spiral Vanes
    const spiralGeo = new THREE.TorusKnotGeometry(2, 0.3, 100, 16, 2, 3);
    const spiralMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.6, roughness: 0.4 });
    const spiral = new THREE.Mesh(spiralGeo, spiralMat);
    spiral.scale.set(1, 1, 0.5);
    drumGroup.add(spiral);

    // Teeth
    const toothGeo = new THREE.ConeGeometry(0.15, 0.6, 8);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.9, roughness: 0.1 });
    const teeth: THREE.Mesh[] = [];

    const numTeeth = 60;
    for (let i = 0; i < numTeeth; i++) {
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      const angle = (i / numTeeth) * Math.PI * 2 * 3; // 3 turns
      const radius = 2.2;
      const z = -2 + (i / numTeeth) * 4;
      
      tooth.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
      tooth.lookAt(0, 0, z);
      tooth.rotateX(-Math.PI / 2);
      
      teeth.push(tooth);
      drumGroup.add(tooth);
    }

    // Coal seam
    const coalGeo = new THREE.BoxGeometry(10, 10, 2);
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const coal = new THREE.Mesh(coalGeo, coalMat);
    coal.position.set(2, 0, -3);
    scene.add(coal);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const { drumSpeed, toothWear, isMaintaining } = propsRef.current;

      if (isMaintaining) {
        // Maintenance mode: drum stops, moves away from coal
        drumGroup.position.z = Math.min(3, drumGroup.position.z + delta * 2);
        arm.position.z = Math.min(3, arm.position.z + delta * 2);
        
        // Highlight worn teeth
        teeth.forEach((t, i) => {
          if (i % 5 === 0) { // Simulate some teeth being worn
            t.material.color.setHex(0xff3300);
            t.scale.set(1, 0.5, 1); // Shorter tooth
          } else {
            t.material.color.setHex(0x00ffcc);
            t.scale.set(1, 1, 1);
          }
        });
      } else {
        // Normal mode: drum rotates, cuts coal
        drumGroup.position.z = Math.max(0, drumGroup.position.z - delta * 2);
        arm.position.z = Math.max(0, arm.position.z - delta * 2);
        drumGroup.rotation.z -= drumSpeed * delta * 0.1;
        
        // Wear color effect
        const wearColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xffaa00), toothWear / 100);
        teeth.forEach(t => {
          t.material.color.copy(wearColor);
          t.scale.set(1, 1 - (toothWear / 200), 1); // Gradually shorten all teeth
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      
      cancelAnimationFrame(animationId);
      renderer.dispose();
      armGeo.dispose();
      armMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      spiralGeo.dispose();
      spiralMat.dispose();
      toothGeo.dispose();
      toothMat.dispose();
      coalGeo.dispose();
      coalMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
