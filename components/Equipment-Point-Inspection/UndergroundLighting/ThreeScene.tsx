import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UndergroundLightingProps } from './three-types';

export const ThreeScene: React.FC<UndergroundLightingProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950 (very dark)
    scene.fog = new THREE.FogExp2('#020617', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Allow looking slightly up

    // Base ambient light (very low, represents darkness of the mine)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.1); // slate-800
    scene.add(ambientLight);

    // Tunnel Geometry
    const tunnelGeo = new THREE.CylinderGeometry(10, 10, 100, 32, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      roughness: 0.9,
      side: THREE.BackSide // Render inside
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    tunnel.rotation.z = Math.PI / 2;
    scene.add(tunnel);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(100, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 }); // slate-800
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    scene.add(floor);

    // Rails
    const railGeo = new THREE.BoxGeometry(100, 0.5, 0.5);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }); // slate-500
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(0, -9.75, -3);
    scene.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(0, -9.75, 3);
    scene.add(rail2);

    // Lighting System (Lamps)
    const lamps: { mesh: THREE.Mesh, light: THREE.PointLight }[] = [];
    const lampCount = 10;
    const spacing = 100 / lampCount;

    for (let i = 0; i < lampCount; i++) {
      const zPos = -50 + (i * spacing) + (spacing / 2);
      
      // Lamp Fixture
      const fixtureGeo = new THREE.BoxGeometry(1, 0.5, 2);
      const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x475569 }); // slate-600
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(0, 9.5, zPos);
      scene.add(fixture);

      // Bulb (Emissive)
      const bulbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const bulbMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0xffffff,
        emissiveIntensity: 0
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(0, -0.3, 0);
      fixture.add(bulb);

      // Point Light
      const pointLight = new THREE.PointLight(0xffffff, 0, 30);
      pointLight.position.set(0, -0.5, 0);
      fixture.add(pointLight);

      lamps.push({ mesh: bulb, light: pointLight });
    }

    // Miner/Cart (to show illumination)
    const cartGeo = new THREE.BoxGeometry(4, 3, 6);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }); // amber-700
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.set(0, -8, 0);
    scene.add(cart);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { luxLevel, activeLamps, isAlert } = propsRef.current;

      // 1. Update Lamps based on active percentage and lux level
      const activeCount = Math.floor((activeLamps / 100) * lampCount);
      
      // Map lux (e.g., 0-200) to light intensity (0-2)
      const targetIntensity = Math.min(2, luxLevel / 100);

      lamps.forEach((lamp, index) => {
        const mat = lamp.mesh.material as THREE.MeshStandardMaterial;
        
        if (index < activeCount) {
          // Lamp is ON
          lamp.light.intensity = targetIntensity;
          mat.emissiveIntensity = targetIntensity;
          
          if (isAlert) {
            // Flicker or turn red if alert
            lamp.light.color.setHex(0xef4444);
            mat.emissive.setHex(0xef4444);
            // Add flicker effect
            lamp.light.intensity *= (0.8 + Math.random() * 0.4);
          } else {
            // Normal warm white
            lamp.light.color.setHex(0xfef08a); // yellow-200
            mat.emissive.setHex(0xfef08a);
          }
        } else {
          // Lamp is OFF
          lamp.light.intensity = 0;
          mat.emissiveIntensity = 0;
        }
      });

      // 2. Animate Cart slowly moving
      cart.position.z = Math.sin(time * 0.2) * 20;

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
