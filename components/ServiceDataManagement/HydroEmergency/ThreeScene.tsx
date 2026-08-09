
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencySceneProps, EmergencyAsset } from './three-types';

export const HydroEmergencyThreeScene: React.FC<EmergencySceneProps> = ({ 
  waterLevel, rainIntensity, lightningActive, activeAssetId, onAssetSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const assets: EmergencyAsset[] = [
    { id: 'gate-spillway', name: '表孔溢洪道', type: 'gate', position: [0, 4, 0], status: 'active-response', load: 100 },
    { id: 'gen-backup', name: '应急柴油发电机', type: 'generator', position: [12, 5, 5], status: 'operational', load: 85 },
    { id: 'road-access', name: '坝顶交通桥', type: 'access-road', position: [-10, 8, 0], status: 'compromised', load: 0 },
    { id: 'sens-level', name: '水位遥测站', type: 'sensor', position: [-5, 2, -10], status: 'operational', load: 100 }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x110505, 0.03); // Dark reddish fog for storm

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x331111, 0.5);
    scene.add(ambientLight);
    
    // Lightning Light (Dynamic)
    const lightningLight = new THREE.PointLight(0xa5f3fc, 0, 200);
    lightningLight.position.set(0, 50, 0);
    scene.add(lightningLight);
    
    // Emergency Red Rotating Light
    const warningLight = new THREE.SpotLight(0xff0000, 10, 50, 0.5, 0.5);
    warningLight.position.set(0, 15, 0);
    scene.add(warningLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- Environment ---
    // Dam Body (Darker, ominous)
    const damGeo = new THREE.CylinderGeometry(30, 35, 15, 64, 1, true, Math.PI * 1.2, Math.PI * 0.6);
    const damMat = new THREE.MeshPhongMaterial({ color: 0x2d2a2e, side: THREE.DoubleSide });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.rotation.y = Math.PI / 2;
    group.add(dam);

    // Flood Water (Turbulent)
    const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e1b18, 
        roughness: 0.1, 
        metalness: 0.8,
        wireframe: false 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = waterLevel - 8; // Adjust relative height
    group.add(water);

    // Rain Particles
    const rainCount = 5000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i+=3) {
        rainPos[i] = (Math.random()-0.5) * 100;
        rainPos[i+1] = Math.random() * 60;
        rainPos[i+2] = (Math.random()-0.5) * 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ 
        color: 0x88aabb, 
        size: 0.15, 
        transparent: true, 
        opacity: 0.6,
        blending: THREE.AdditiveBlending 
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    // --- Assets ---
    const assetMeshes: THREE.Mesh[] = [];
    assets.forEach(asset => {
        const aGroup = new THREE.Group();
        aGroup.position.set(...asset.position);

        let geo, color;
        if (asset.type === 'gate') {
            geo = new THREE.BoxGeometry(4, 5, 1);
            color = 0xff0000;
        } else if (asset.type === 'generator') {
            geo = new THREE.BoxGeometry(3, 3, 3);
            color = 0xf59e0b;
        } else if (asset.type === 'access-road') {
            geo = new THREE.BoxGeometry(8, 0.5, 2);
            color = 0x64748b;
        } else {
            geo = new THREE.OctahedronGeometry(1);
            color = 0x10b981;
        }

        if (asset.status === 'compromised') color = 0xef4444; // Red
        if (asset.status === 'active-response') color = 0xffaa00; // Orange

        const mat = new THREE.MeshPhongMaterial({ 
            color: asset.id === activeAssetId ? 0xffffff : color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { id: asset.id };
        aGroup.add(mesh);
        assetMeshes.push(mesh);

        // Warning Beacon (Pulse)
        if (asset.status !== 'operational') {
            const beaconGeo = new THREE.SphereGeometry(0.5);
            const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.y = 3;
            aGroup.add(beacon);
            // We'll animate this scale
            beacon.userData = { isBeacon: true };
        }

        // Water Discharge for Gate
        if (asset.type === 'gate') {
            const pCount = 500;
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(pCount * 3);
            for(let i=0; i<pCount*3; i+=3) {
                 pPos[i] = (Math.random()-0.5) * 4;
                 pPos[i+1] = 0;
                 pPos[i+2] = 0;
            }
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
            const discharge = new THREE.Points(pGeo, pMat);
            discharge.position.set(0, -2, 2);
            discharge.userData = { isDischarge: true };
            aGroup.add(discharge);
        }

        group.add(aGroup);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(assetMeshes);
      if (intersects.length > 0) {
        onAssetSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 1. Rain Animation
      const rPos = rainSystem.geometry.attributes.position.array as Float32Array;
      for(let i=1; i<rPos.length; i+=3) {
          rPos[i] -= 1.5 * rainIntensity;
          if (rPos[i] < -10) rPos[i] = 60;
      }
      rainSystem.geometry.attributes.position.needsUpdate = true;
      // Rain tilt
      rainSystem.rotation.z = 0.2; 

      // 2. Lightning
      if (lightningActive && Math.random() > 0.98) {
          lightningLight.intensity = 50;
          renderer.setClearColor(0x222233, 0.2);
          setTimeout(() => {
              lightningLight.intensity = 0;
              renderer.setClearColor(0x000000, 0);
          }, 100);
      }

      // 3. Water Waves
      const wPos = water.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<wPos.length; i+=3) {
          wPos[i+2] = Math.sin(wPos[i]*0.2 + time*2) * 1.5 + Math.cos(wPos[i+1]*0.2 + time) * 1; 
      }
      water.geometry.attributes.position.needsUpdate = true;

      // 4. Asset Animations
      group.children.forEach(child => {
          if (child instanceof THREE.Group) {
              child.children.forEach(sub => {
                  if (sub.userData.isBeacon) {
                      const s = 1 + Math.sin(time * 10) * 0.5;
                      sub.scale.set(s,s,s);
                      (sub.material as THREE.MeshBasicMaterial).opacity = 1 - (s-1);
                  }
                  if (sub.userData.isDischarge) {
                      const dPos = (sub as THREE.Points).geometry.attributes.position.array as Float32Array;
                      for(let k=1; k<dPos.length; k+=3) {
                          dPos[k] -= 0.5; // Fall
                          dPos[k+1] += 0.5; // Outward
                          if(dPos[k] < -15) {
                              dPos[k] = 0;
                              dPos[k+1] = 0;
                          }
                      }
                      (sub as THREE.Points).geometry.attributes.position.needsUpdate = true;
                  }
              });
          }
      });
      
      // Warning Light Rotation
      warningLight.position.x = Math.sin(time * 5) * 20;
      warningLight.lookAt(0,0,0);

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
  }, [waterLevel, rainIntensity, lightningActive, activeAssetId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
