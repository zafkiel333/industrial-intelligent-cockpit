import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STSCraneWireRopeProps } from './three-types';

export const ThreeScene: React.FC<STSCraneWireRopeProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x0a192f, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);

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
    
    const spotLight = new THREE.SpotLight(0x00ffff, 2);
    spotLight.position.set(0, 30, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const craneGroup = new THREE.Group();

    // Drum
    const drumGeo = new THREE.CylinderGeometry(3, 3, 10, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.rotation.z = Math.PI / 2;
    drum.position.y = 10;
    craneGroup.add(drum);

    // Wire Ropes
    const ropeGeo = new THREE.CylinderGeometry(0.1, 0.1, 20, 16);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 });
    
    const ropes: THREE.Mesh[] = [];
    const flaws: THREE.Mesh[] = [];
    const flawGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const flawMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = -3; i <= 3; i += 2) {
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(i, 0, 0);
      ropes.push(rope);
      craneGroup.add(rope);

      // Add potential flaws to each rope
      for (let j = 0; j < 3; j++) {
        const flaw = new THREE.Mesh(flawGeo, flawMat);
        flaw.position.set(0, (Math.random() - 0.5) * 18, 0);
        flaw.visible = false;
        rope.add(flaw);
        flaws.push(flaw);
      }
    }

    // Spreader (Load)
    const spreaderGeo = new THREE.BoxGeometry(8, 1, 4);
    const spreaderMat = new THREE.MeshStandardMaterial({ color: 0xddaa00, metalness: 0.6, roughness: 0.4 });
    const spreader = new THREE.Mesh(spreaderGeo, spreaderMat);
    spreader.position.y = -10;
    craneGroup.add(spreader);

    // Scanner Ring (for inspection)
    const scannerGeo = new THREE.TorusGeometry(4, 0.2, 16, 64);
    const scannerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.rotation.x = Math.PI / 2;
    scanner.position.y = 8;
    craneGroup.add(scanner);

    scene.add(craneGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ffcc, 0x003344);
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { flawCount, ropeTension, isInspecting } = propsRef.current;

      if (isInspecting) {
        // Inspection mode: scanner moves up and down
        scanner.visible = true;
        scanner.position.y = Math.sin(time * 2) * 9;
        
        // Show flaws based on count
        flaws.forEach((flaw, index) => {
          flaw.visible = index < flawCount;
          if (flaw.visible) {
            const scale = 1 + Math.sin(time * 10) * 0.2;
            flaw.scale.set(scale, scale, scale);
          }
        });

        // Ropes are still
        drum.rotation.x = 0;
        spreader.position.y = -10;
      } else {
        // Normal mode: drum rotates, spreader moves
        scanner.visible = false;
        flaws.forEach(f => f.visible = false);

        const speed = (ropeTension / 100) * 2;
        drum.rotation.x += speed * delta;
        
        // Simulate lifting/lowering
        spreader.position.y = -10 + Math.sin(time * 0.5) * 5;
        
        // Adjust rope length visually (simple scale)
        const ropeLength = 10 - spreader.position.y;
        ropes.forEach(rope => {
          rope.scale.y = ropeLength / 20;
          rope.position.y = 10 - ropeLength / 2;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      drumGeo.dispose();
      drumMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
      flawGeo.dispose();
      flawMat.dispose();
      spreaderGeo.dispose();
      spreaderMat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
