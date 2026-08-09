import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LifeboatDavitTestProps } from './three-types';

export const ThreeScene: React.FC<LifeboatDavitTestProps> = (props) => {
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

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a2a); // Deep sea night

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(20, 30, 10);
    scene.add(dirLight);

    // Ship Hull (Background)
    const hullGeo = new THREE.BoxGeometry(40, 30, 10);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.6, roughness: 0.4 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(0, 0, -8);
    scene.add(hull);

    // Davit Arms
    const davitGroup = new THREE.Group();
    scene.add(davitGroup);

    const armGeo = new THREE.CylinderGeometry(0.5, 0.8, 12, 16);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });
    
    const arm1 = new THREE.Mesh(armGeo, armMat);
    arm1.position.set(-6, 10, 0);
    arm1.rotation.x = Math.PI / 4; // Leaning out
    davitGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, armMat);
    arm2.position.set(6, 10, 0);
    arm2.rotation.x = Math.PI / 4;
    davitGroup.add(arm2);

    // Winch
    const winchGeo = new THREE.CylinderGeometry(1, 1, 4, 16);
    const winchMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const winch = new THREE.Mesh(winchGeo, winchMat);
    winch.position.set(0, 15, -2);
    winch.rotation.z = Math.PI / 2;
    davitGroup.add(winch);

    // Lifeboat
    const boatGroup = new THREE.Group();
    scene.add(boatGroup);

    // Boat Hull (Orange)
    const boatGeo = new THREE.CapsuleGeometry(2.5, 8, 16, 32);
    const boatMat = new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.2, roughness: 0.5 });
    const boat = new THREE.Mesh(boatGeo, boatMat);
    boat.rotation.z = Math.PI / 2;
    boatGroup.add(boat);

    // Canopy
    const canopyGeo = new THREE.CapsuleGeometry(2, 6, 16, 32);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 1;
    canopy.rotation.z = Math.PI / 2;
    boatGroup.add(canopy);

    // Water Bags (for load testing)
    const bagGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, transparent: true, opacity: 0.6 });
    const bags: THREE.Mesh[] = [];
    
    for (let i = -3; i <= 3; i += 2) {
      const bag = new THREE.Mesh(bagGeo, bagMat);
      bag.position.set(i, 0, 0);
      bag.visible = false;
      boatGroup.add(bag);
      bags.push(bag);
    }

    // Wire Ropes
    const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, 20, 8);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const rope1 = new THREE.Mesh(ropeGeo, ropeMat);
    const rope2 = new THREE.Mesh(ropeGeo, ropeMat);
    scene.add(rope1);
    scene.add(rope2);

    let animationId: number;
    const clock = new THREE.Clock();
    let boatY = 8; // Initial height

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { loadWeight, loweringSpeed, isTesting } = propsRef.current;

      if (isTesting) {
        // Lowering the boat
        if (boatY > -5) {
          boatY -= loweringSpeed * delta;
        }
        
        // Show water bags based on load weight
        const numBags = Math.floor((loadWeight / 110) * bags.length); // 110% is max test load
        bags.forEach((bag, index) => {
          bag.visible = index < numBags;
          // Scale bag slightly to simulate filling
          const scale = Math.min(1, (loadWeight / 110) * 1.5);
          bag.scale.set(scale, scale, scale);
        });

        // Deflect davit arms slightly under load
        const deflection = (loadWeight / 110) * 0.1;
        arm1.rotation.x = Math.PI / 4 + deflection;
        arm2.rotation.x = Math.PI / 4 + deflection;
        
        // Winch rotates
        winch.rotation.x += loweringSpeed * delta;
      } else {
        // Reset position
        if (boatY < 8) {
          boatY += 2 * delta; // Quick hoist back up
        }
        bags.forEach(bag => bag.visible = false);
        arm1.rotation.x = Math.PI / 4;
        arm2.rotation.x = Math.PI / 4;
      }

      boatGroup.position.y = boatY;
      boatGroup.position.z = 4; // Out from hull

      // Update ropes
      const arm1Tip = new THREE.Vector3(-6, 10 + Math.cos(arm1.rotation.x)*6, Math.sin(arm1.rotation.x)*6);
      const arm2Tip = new THREE.Vector3(6, 10 + Math.cos(arm2.rotation.x)*6, Math.sin(arm2.rotation.x)*6);
      
      const boatHook1 = new THREE.Vector3(-4, boatY + 2, 4);
      const boatHook2 = new THREE.Vector3(4, boatY + 2, 4);

      // Simple rope positioning (stretching cylinder)
      const dist1 = arm1Tip.distanceTo(boatHook1);
      rope1.position.copy(arm1Tip).lerp(boatHook1, 0.5);
      rope1.scale.set(1, dist1 / 20, 1);
      rope1.lookAt(boatHook1);
      rope1.rotateX(Math.PI / 2);

      const dist2 = arm2Tip.distanceTo(boatHook2);
      rope2.position.copy(arm2Tip).lerp(boatHook2, 0.5);
      rope2.scale.set(1, dist2 / 20, 1);
      rope2.lookAt(boatHook2);
      rope2.rotateX(Math.PI / 2);

      // Boat sway
      boatGroup.rotation.x = Math.sin(clock.getElapsedTime()) * 0.05;

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
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      hullGeo.dispose();
      hullMat.dispose();
      armGeo.dispose();
      armMat.dispose();
      winchGeo.dispose();
      winchMat.dispose();
      boatGeo.dispose();
      boatMat.dispose();
      canopyGeo.dispose();
      canopyMat.dispose();
      bagGeo.dispose();
      bagMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
