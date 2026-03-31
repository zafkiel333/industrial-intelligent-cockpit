import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UndergroundRefugeChamberProps } from './three-types';

export const ThreeScene: React.FC<UndergroundRefugeChamberProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x0a192f, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const chamberGroup = new THREE.Group();

    // Chamber Body (Cutaway view)
    const bodyGeo = new THREE.CylinderGeometry(5, 5, 20, 32, 1, false, 0, Math.PI);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x223344, 
      metalness: 0.8, 
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.rotation.x = Math.PI / 2;
    chamberGroup.add(body);

    // Floor
    const floorGeo = new THREE.BoxGeometry(20, 0.5, 9.8);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.5, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    chamberGroup.add(floor);

    // Air Lock Doors
    const doorGeo = new THREE.BoxGeometry(0.5, 6, 4);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.9, roughness: 0.1 });
    
    const door1 = new THREE.Mesh(doorGeo, doorMat);
    door1.position.set(-10, 2, 0);
    chamberGroup.add(door1);

    const door2 = new THREE.Mesh(doorGeo, doorMat);
    door2.position.set(-6, 2, 0);
    chamberGroup.add(door2);

    // Oxygen Tanks
    const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.6, roughness: 0.4 });
    const tanks: THREE.Mesh[] = [];

    for (let i = 0; i < 5; i++) {
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(8, 1, -3 + i * 1.5);
      tanks.push(tank);
      chamberGroup.add(tank);
    }

    // Seats
    const seatGeo = new THREE.BoxGeometry(1, 0.5, 1);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x445566 });
    for (let i = 0; i < 6; i++) {
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(-4 + i * 2, -0.5, 3);
      chamberGroup.add(seat);
    }

    // Environmental Aura (Visualizing pressure/oxygen)
    const auraGeo = new THREE.CylinderGeometry(4.5, 4.5, 19, 32, 1, false, 0, Math.PI);
    const auraMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffcc, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.z = Math.PI / 2;
    aura.rotation.x = Math.PI / 2;
    chamberGroup.add(aura);

    scene.add(chamberGroup);

    // Rock tunnel
    const tunnelGeo = new THREE.CylinderGeometry(6, 6, 30, 16, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0, side: THREE.BackSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { oxygenLevel, pressure, isTesting } = propsRef.current;

      if (isTesting) {
        // Testing mode: doors close, aura pulses based on pressure, tanks glow based on O2
        door1.position.y = Math.max(2, door1.position.y - delta * 2);
        door2.position.y = Math.max(2, door2.position.y - delta * 2);

        const pressureColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), (pressure - 100) / 50);
        auraMat.color.copy(pressureColor);
        auraMat.opacity = 0.2 + Math.sin(time * 3) * 0.1;

        const o2Color = new THREE.Color(0xff0000).lerp(new THREE.Color(0x00ffcc), oxygenLevel / 100);
        tanks.forEach(tank => {
          tank.material.color.copy(o2Color);
          tank.material.emissive.copy(o2Color).multiplyScalar(0.5);
        });
      } else {
        // Normal mode: doors open, steady aura
        door1.position.y = Math.min(6, door1.position.y + delta * 2);
        door2.position.y = Math.min(6, door2.position.y + delta * 2);
        
        auraMat.color.setHex(0x00ffcc);
        auraMat.opacity = 0.05;
        
        tanks.forEach(tank => {
          tank.material.color.setHex(0x00ffcc);
          tank.material.emissive.setHex(0x000000);
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
      bodyGeo.dispose();
      bodyMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      doorGeo.dispose();
      doorMat.dispose();
      tankGeo.dispose();
      tankMat.dispose();
      seatGeo.dispose();
      seatMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      tunnelGeo.dispose();
      tunnelMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
