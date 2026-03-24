import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DamGalleryProps } from './three-types';

export const ThreeScene: React.FC<DamGalleryProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950
    scene.fog = new THREE.FogExp2('#020617', 0.03);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x475569, 0.5); // slate-600
    scene.add(ambientLight);
    
    // Tunnel lights
    const tunnelLights: THREE.PointLight[] = [];
    for (let i = -30; i <= 30; i += 15) {
      const light = new THREE.PointLight(0xfef08a, 0.8, 20); // yellow-200
      light.position.set(0, 8, i);
      scene.add(light);
      tunnelLights.push(light);
      
      // Light fixture
      const fixtureGeo = new THREE.BoxGeometry(1, 0.2, 0.5);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(0, 8.1, i);
      scene.add(fixture);
    }

    // Gallery Structure (Tunnel)
    const galleryGroup = new THREE.Group();
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 80, 10, 40);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    galleryGroup.add(floor);

    // Walls
    const wallGeo = new THREE.PlaneGeometry(80, 10, 40, 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // slate-600
      roughness: 0.9,
      metalness: 0.1
    });
    
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-5, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    galleryGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(5, 5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    galleryGroup.add(rightWall);

    // Ceiling
    const ceilingGeo = new THREE.CylinderGeometry(5, 5, 80, 16, 1, true, 0, Math.PI);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 5;
    ceiling.rotation.x = Math.PI / 2;
    galleryGroup.add(ceiling);

    // Seepage Water (Floor reflection/puddles)
    const waterGeo = new THREE.PlaneGeometry(8, 80);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.05; // slightly above floor
    galleryGroup.add(water);

    // Crack on the wall
    const crackGeo = new THREE.PlaneGeometry(2, 6);
    const crackTex = new THREE.CanvasTexture(createCrackTexture());
    const crackMat = new THREE.MeshBasicMaterial({
      map: crackTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const crack = new THREE.Mesh(crackGeo, crackMat);
    crack.position.set(-4.9, 4, 0);
    crack.rotation.y = Math.PI / 2;
    galleryGroup.add(crack);

    // Inspection Robot
    const robotGroup = new THREE.Group();
    const robotBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, 2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    robotBody.position.y = 0.5;
    robotGroup.add(robotBody);
    
    // Robot Camera
    const robotCam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    robotCam.position.set(0, 1.2, 0.8);
    robotCam.rotation.x = Math.PI / 2;
    robotGroup.add(robotCam);

    // Robot Scanner
    const scannerGeo = new THREE.ConeGeometry(4, 8, 32, 1, true);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.position.set(0, 1.2, 4);
    scanner.rotation.x = Math.PI / 2;
    robotGroup.add(scanner);

    robotGroup.position.set(0, 0, 10);
    scene.add(robotGroup);

    scene.add(galleryGroup);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { humidity, seepageRate, crackWidth, isAlert } = propsRef.current;

      // Robot movement
      robotGroup.position.z = 10 - (time * 2) % 40; // Move forward and loop
      
      // Scanner animation
      scanner.rotation.y = Math.sin(time * 5) * 0.5;

      // Water level based on seepage
      water.position.y = 0.05 + (seepageRate / 100) * 0.2;
      waterMat.opacity = 0.2 + (seepageRate / 100) * 0.6;

      // Crack scaling based on width
      crack.scale.x = 1 + (crackWidth / 10);

      // Alert visualization
      if (isAlert) {
        scannerMat.color.setHex(0xf87171); // red-400
        tunnelLights.forEach((light, index) => {
          // Blinking effect for alert
          light.color.setHex(Math.sin(time * 10 + index) > 0 ? 0xf87171 : 0x7f1d1d);
        });
      } else {
        scannerMat.color.setHex(0x38bdf8); // sky-400
        tunnelLights.forEach(light => {
          light.color.setHex(0xfef08a); // yellow-200
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

  // Helper to create a crack texture
  function createCrackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 256, 512);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(128, 0);
      let x = 128;
      for (let y = 0; y <= 512; y += 20) {
        x += (Math.random() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Add some branches
      ctx.beginPath();
      ctx.moveTo(128, 256);
      ctx.lineTo(80, 300);
      ctx.lineTo(60, 380);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    return canvas;
  }

  return <div ref={mountRef} className="w-full h-full" />;
};
