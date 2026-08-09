import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeckLifesavingEquipmentProps } from './three-types';

export const ThreeScene: React.FC<DeckLifesavingEquipmentProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Ship Deck
    const deckGeo = new THREE.BoxGeometry(40, 1, 20);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // slate-600
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = -0.5;
    scene.add(deck);

    // Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const createRailing = (x: number, z: number, length: number, isX: boolean) => {
      const railGeo = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
      const rail = new THREE.Mesh(railGeo, railMat);
      if (isX) {
        rail.rotation.z = Math.PI / 2;
      } else {
        rail.rotation.x = Math.PI / 2;
      }
      rail.position.set(x, 2, z);
      scene.add(rail);
      
      // Posts
      for(let i = -length/2; i <= length/2; i += 2) {
        const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(isX ? x + i : x, 1, isX ? z : z + i);
        scene.add(post);
      }
    };
    createRailing(0, 9.8, 40, true);
    createRailing(0, -9.8, 40, true);
    createRailing(19.8, 0, 20, false);
    createRailing(-19.8, 0, 20, false);

    // Lifeboat Davit (Crane)
    const davitGroup = new THREE.Group();
    davitGroup.position.set(0, 0, 8);
    
    const davitBaseGeo = new THREE.BoxGeometry(2, 4, 2);
    const davitBaseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // amber-500
    const davitBase1 = new THREE.Mesh(davitBaseGeo, davitBaseMat);
    davitBase1.position.set(-6, 2, 0);
    davitGroup.add(davitBase1);
    
    const davitBase2 = new THREE.Mesh(davitBaseGeo, davitBaseMat);
    davitBase2.position.set(6, 2, 0);
    davitGroup.add(davitBase2);

    const davitArmGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
    const davitArm1 = new THREE.Mesh(davitArmGeo, davitBaseMat);
    davitArm1.position.set(-6, 6, 2);
    davitArm1.rotation.x = Math.PI / 4;
    davitGroup.add(davitArm1);

    const davitArm2 = new THREE.Mesh(davitArmGeo, davitBaseMat);
    davitArm2.position.set(6, 6, 2);
    davitArm2.rotation.x = Math.PI / 4;
    davitGroup.add(davitArm2);

    scene.add(davitGroup);

    // Lifeboat
    const lifeboatGroup = new THREE.Group();
    lifeboatGroup.position.set(0, 5, 12);
    
    // Hull
    const hullGeo = new THREE.CapsuleGeometry(2, 8, 16, 16);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 }); // orange-500
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.z = Math.PI / 2;
    lifeboatGroup.add(hull);
    
    // Canopy
    const canopyGeo = new THREE.CapsuleGeometry(1.8, 6, 16, 16);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.y = 0.5;
    lifeboatGroup.add(canopy);

    // Release Mechanism Indicator (Glowing ring)
    const releaseGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
    const releaseMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // emerald-500
    const releaseIndicator1 = new THREE.Mesh(releaseGeo, releaseMat);
    releaseIndicator1.position.set(-4, 2, 0);
    lifeboatGroup.add(releaseIndicator1);
    
    const releaseIndicator2 = new THREE.Mesh(releaseGeo, releaseMat.clone());
    releaseIndicator2.position.set(4, 2, 0);
    lifeboatGroup.add(releaseIndicator2);

    scene.add(lifeboatGroup);

    // Cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const cableGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6, 8.8, 10.8), new THREE.Vector3(-4, 7, 12)]);
    const cable1 = new THREE.Line(cableGeo1, cableMat);
    scene.add(cable1);
    
    const cableGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(6, 8.8, 10.8), new THREE.Vector3(4, 7, 12)]);
    const cable2 = new THREE.Line(cableGeo2, cableMat);
    scene.add(cable2);

    // Rain Particles (Weather)
    const rainCount = 1000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 40;
      rainPos[i + 1] = Math.random() * 20;
      rainPos[i + 2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0 });
    const rain = new THREE.Points(rainGeo, rainMat);
    scene.add(rain);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { equipmentStatus, weatherCondition, releaseMechanismReady, isAlert } = propsRef.current;

      // Ship rocking animation based on weather
      const rockIntensity = weatherCondition === 0 ? 0.05 : weatherCondition === 1 ? 0.15 : 0.3;
      scene.rotation.z = Math.sin(time * 0.5) * rockIntensity;
      scene.rotation.x = Math.cos(time * 0.3) * (rockIntensity * 0.5);

      // Lifeboat swinging
      lifeboatGroup.rotation.x = Math.sin(time * 1.5) * (rockIntensity * 0.5);
      
      // Update cables to follow lifeboat
      const p1 = new THREE.Vector3(-4, 2, 0).applyMatrix4(lifeboatGroup.matrixWorld);
      cableGeo1.setFromPoints([new THREE.Vector3(-6, 8.8, 10.8), p1]);
      const p2 = new THREE.Vector3(4, 2, 0).applyMatrix4(lifeboatGroup.matrixWorld);
      cableGeo2.setFromPoints([new THREE.Vector3(6, 8.8, 10.8), p2]);

      // Weather effects
      if (weatherCondition > 0) {
        rainMat.opacity = weatherCondition === 1 ? 0.3 : 0.7;
        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < rainCount * 3; i += 3) {
          positions[i] -= 0.5; // Fall speed
          if (positions[i] < 0) positions[i] = 20;
        }
        rainGeo.attributes.position.needsUpdate = true;
        scene.fog = new THREE.FogExp2('#0f172a', weatherCondition === 1 ? 0.03 : 0.06);
      } else {
        rainMat.opacity = 0;
        scene.fog = new THREE.FogExp2('#0f172a', 0.015);
      }

      // Release Mechanism Status
      const indMat1 = releaseIndicator1.material as THREE.MeshBasicMaterial;
      const indMat2 = releaseIndicator2.material as THREE.MeshBasicMaterial;
      if (releaseMechanismReady) {
        indMat1.color.setHex(0x10b981); // emerald
        indMat2.color.setHex(0x10b981);
      } else {
        indMat1.color.setHex(0xef4444); // red
        indMat2.color.setHex(0xef4444);
      }

      // Equipment Status Color
      if (equipmentStatus === 2 || isAlert) {
        hullMat.color.setHex(0xef4444); // Red if error
      } else if (equipmentStatus === 1) {
        hullMat.color.setHex(0xfacc15); // Yellow if warning
      } else {
        hullMat.color.setHex(0xf97316); // Orange normal
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
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
