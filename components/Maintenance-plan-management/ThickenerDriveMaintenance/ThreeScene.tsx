import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ThickenerDriveMaintenanceProps } from './three-types';

export const ThreeScene: React.FC<ThickenerDriveMaintenanceProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x050a15, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffcc, 1.5);
    dirLight.position.set(20, 30, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa00, 2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Thickener Tank
    const tankGeo = new THREE.CylinderGeometry(20, 20, 5, 64, 1, true);
    const tankMat = new THREE.MeshStandardMaterial({ 
      color: 0x112233, 
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = -2.5;
    scene.add(tank);

    // Slurry surface
    const slurryGeo = new THREE.CircleGeometry(19.8, 64);
    const slurryMat = new THREE.MeshBasicMaterial({ 
      color: 0x224433, 
      transparent: true, 
      opacity: 0.6 
    });
    const slurry = new THREE.Mesh(slurryGeo, slurryMat);
    slurry.rotation.x = -Math.PI / 2;
    slurry.position.y = -0.5;
    scene.add(slurry);

    // Drive Bridge
    const bridgeGroup = new THREE.Group();
    
    const bridgeGeo = new THREE.BoxGeometry(42, 1, 3);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.6, roughness: 0.4 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.y = 2;
    bridgeGroup.add(bridge);

    // Central Drive Unit
    const driveUnitGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
    const driveUnitMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.7, roughness: 0.3 });
    const driveUnit = new THREE.Mesh(driveUnitGeo, driveUnitMat);
    driveUnit.position.y = 3;
    bridgeGroup.add(driveUnit);

    scene.add(bridgeGroup);

    // Rake Mechanism (Rotating part)
    const rakeGroup = new THREE.Group();
    
    const centerShaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
    const centerShaftMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
    const centerShaft = new THREE.Mesh(centerShaftGeo, centerShaftMat);
    centerShaft.position.y = -2;
    rakeGroup.add(centerShaft);

    const armGeo = new THREE.BoxGeometry(38, 0.5, 1);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.5 });
    const arm1 = new THREE.Mesh(armGeo, armMat);
    arm1.position.y = -4;
    rakeGroup.add(arm1);
    
    const arm2 = new THREE.Mesh(armGeo, armMat);
    arm2.position.y = -4;
    arm2.rotation.y = Math.PI / 2;
    rakeGroup.add(arm2);

    // Add blades to arms
    const bladeGeo = new THREE.BoxGeometry(0.2, 1, 2);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00aaaa });
    for (let i = 2; i < 19; i += 2) {
      const b1 = new THREE.Mesh(bladeGeo, bladeMat);
      b1.position.set(i, -4.5, 0);
      b1.rotation.y = Math.PI / 4;
      rakeGroup.add(b1);
      
      const b2 = new THREE.Mesh(bladeGeo, bladeMat);
      b2.position.set(-i, -4.5, 0);
      b2.rotation.y = Math.PI / 4;
      rakeGroup.add(b2);
      
      const b3 = new THREE.Mesh(bladeGeo, bladeMat);
      b3.position.set(0, -4.5, i);
      b3.rotation.y = -Math.PI / 4;
      rakeGroup.add(b3);
      
      const b4 = new THREE.Mesh(bladeGeo, bladeMat);
      b4.position.set(0, -4.5, -i);
      b4.rotation.y = -Math.PI / 4;
      rakeGroup.add(b4);
    }

    scene.add(rakeGroup);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x00ffcc, 0x003344);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { rakeSpeed, torque, isLifting } = propsRef.current;

      if (isLifting) {
        // Lift rake mechanism
        rakeGroup.position.y = Math.min(4, rakeGroup.position.y + delta * 2);
        driveUnitMat.color.setHex(0xff3300); // Warning color
        armMat.color.setHex(0xaaaaaa);
      } else {
        // Lower rake mechanism
        rakeGroup.position.y = Math.max(0, rakeGroup.position.y - delta * 2);
        
        // Rotate rake
        rakeGroup.rotation.y += rakeSpeed * delta;
        
        // Torque color effect
        const torqueColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), torque / 100);
        driveUnitMat.color.copy(torqueColor);
        armMat.color.copy(torqueColor);
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
      tankGeo.dispose();
      tankMat.dispose();
      slurryGeo.dispose();
      slurryMat.dispose();
      bridgeGeo.dispose();
      bridgeMat.dispose();
      driveUnitGeo.dispose();
      driveUnitMat.dispose();
      centerShaftGeo.dispose();
      centerShaftMat.dispose();
      armGeo.dispose();
      armMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
