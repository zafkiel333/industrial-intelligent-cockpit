import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipMainEngineMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<ShipMainEngineMaintenanceProps> = (props) => {
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 20, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x44aaff, 1.5);
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    const engineGroup = new THREE.Group();

    // Cylinder Block (Wireframe style for blueprint look)
    const blockGeo = new THREE.CylinderGeometry(4.5, 4.5, 12, 32);
    const blockMat = new THREE.MeshStandardMaterial({ 
      color: 0x113355, 
      transparent: true, 
      opacity: 0.4,
      wireframe: true 
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = 6;
    engineGroup.add(block);

    // Cylinder Liner
    const linerGeo = new THREE.CylinderGeometry(4, 4, 11.8, 32);
    const linerMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.8, roughness: 0.2 });
    const liner = new THREE.Mesh(linerGeo, linerMat);
    liner.position.y = 6;
    engineGroup.add(liner);

    // Cylinder Cover (Head)
    const coverGeo = new THREE.CylinderGeometry(4.8, 4.8, 2, 32);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.9, roughness: 0.3 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.y = 13;
    engineGroup.add(cover);

    // Piston Assembly
    const pistonGroup = new THREE.Group();
    pistonGroup.position.y = 6;

    const pistonCrownGeo = new THREE.CylinderGeometry(3.9, 3.9, 2, 32);
    const pistonCrownMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 });
    const pistonCrown = new THREE.Mesh(pistonCrownGeo, pistonCrownMat);
    pistonCrown.position.y = 1;
    pistonGroup.add(pistonCrown);

    const pistonRodGeo = new THREE.CylinderGeometry(1, 1, 8, 16);
    const pistonRodMat = new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.8, roughness: 0.2 });
    const pistonRod = new THREE.Mesh(pistonRodGeo, pistonRodMat);
    pistonRod.position.y = -4;
    pistonGroup.add(pistonRod);

    engineGroup.add(pistonGroup);

    // Crane Hook (for lifting)
    const hookGeo = new THREE.TorusGeometry(1, 0.2, 16, 32, Math.PI);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9, roughness: 0.1 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.rotation.z = -Math.PI / 2;
    hook.position.y = 16;
    hook.visible = false;
    engineGroup.add(hook);

    // Crane Cable
    const cableGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = 21;
    cable.visible = false;
    engineGroup.add(cable);

    scene.add(engineGroup);

    // Blueprint Grid Background
    const gridHelper = new THREE.GridHelper(40, 40, 0x44aaff, 0x113355);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { cylinderTemp, pistonWear, isLifting } = propsRef.current;

      if (isLifting) {
        // Lifting mode: cover comes off, piston is pulled out
        hook.visible = true;
        cable.visible = true;

        // Sequence: 1. Cover lifts, 2. Piston lifts
        if (cover.position.y < 20) {
          cover.position.y += delta * 3;
          hook.position.y = cover.position.y + 3;
          cable.position.y = hook.position.y + 5;
        } else if (pistonGroup.position.y < 18) {
          pistonGroup.position.y += delta * 3;
          hook.position.y = pistonGroup.position.y + 4;
          cable.position.y = hook.position.y + 5;
        }

        // Highlight wear on piston crown
        const wearColor = new THREE.Color(0x8899aa).lerp(new THREE.Color(0xff3300), pistonWear / 100);
        pistonCrownMat.color.copy(wearColor);
        pistonCrownMat.emissive.copy(wearColor).multiplyScalar(0.3);

        linerMat.opacity = 0.3;
        linerMat.transparent = true;
      } else {
        // Normal mode: engine running
        hook.visible = false;
        cable.visible = false;
        cover.position.y = 13;
        linerMat.opacity = 1.0;
        linerMat.transparent = false;
        pistonCrownMat.color.setHex(0x8899aa);
        pistonCrownMat.emissive.setHex(0x000000);

        // Piston moves up and down
        const rpmSpeed = 5;
        pistonGroup.position.y = 6 + Math.sin(time * rpmSpeed) * 3;
        
        // Temperature glow on liner
        const tempColor = new THREE.Color(0x556677).lerp(new THREE.Color(0xff5500), (cylinderTemp - 300) / 200);
        linerMat.color.copy(tempColor);
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
      blockGeo.dispose();
      blockMat.dispose();
      linerGeo.dispose();
      linerMat.dispose();
      coverGeo.dispose();
      coverMat.dispose();
      pistonCrownGeo.dispose();
      pistonCrownMat.dispose();
      pistonRodGeo.dispose();
      pistonRodMat.dispose();
      hookGeo.dispose();
      hookMat.dispose();
      cableGeo.dispose();
      cableMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
