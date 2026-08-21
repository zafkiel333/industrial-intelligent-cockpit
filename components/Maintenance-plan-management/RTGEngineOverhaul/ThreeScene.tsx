import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RTGEngineOverhaulProps } from './three-types';

export const ThreeScene: React.FC<RTGEngineOverhaulProps> = (props) => {
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

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
    
    const dirLight = new THREE.DirectionalLight(0xffaa00, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const engineGroup = new THREE.Group();

    // Engine Block
    const blockGeo = new THREE.BoxGeometry(8, 5, 6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.3 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = 2.5;
    engineGroup.add(block);

    // Cylinder Heads (Top)
    const headGeo = new THREE.BoxGeometry(7.5, 1.5, 5.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 5.75;
    engineGroup.add(head);

    // Pistons (Internal, visible during overhaul)
    const pistonGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 });
    const pistons: THREE.Mesh[] = [];

    for (let i = -2.5; i <= 2.5; i += 1.6) {
      for (let j = -1.5; j <= 1.5; j += 3) {
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        piston.position.set(i, 4, j);
        pistons.push(piston);
        engineGroup.add(piston);
      }
    }

    // Crankshaft (Bottom)
    const crankGeo = new THREE.CylinderGeometry(0.5, 0.5, 9, 32);
    const crankMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.9, roughness: 0.2 });
    const crank = new THREE.Mesh(crankGeo, crankMat);
    crank.rotation.z = Math.PI / 2;
    crank.position.y = 1;
    engineGroup.add(crank);

    // Flywheel
    const flywheelGeo = new THREE.CylinderGeometry(2.5, 2.5, 1, 32);
    const flywheelMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.8, roughness: 0.3 });
    const flywheel = new THREE.Mesh(flywheelGeo, flywheelMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(4.5, 1, 0);
    engineGroup.add(flywheel);

    scene.add(engineGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffcc, 0x003344);
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { rpm, temperature, isOverhauling } = propsRef.current;

      if (isOverhauling) {
        // Overhaul mode: explode view
        head.position.y = Math.min(10, head.position.y + delta * 2);
        blockMat.opacity = 0.3;
        blockMat.transparent = true;
        
        // Highlight pistons based on temp
        const tempColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), (temperature - 60) / 40);
        pistons.forEach(p => {
          p.material.color.copy(tempColor);
          p.material.emissive.copy(tempColor).multiplyScalar(0.5);
        });

        // Stop rotation
        crank.rotation.x = 0;
        flywheel.rotation.x = 0;
      } else {
        // Normal mode: compact view, rotating parts
        head.position.y = Math.max(5.75, head.position.y - delta * 2);
        blockMat.opacity = 1.0;
        blockMat.transparent = false;
        
        pistons.forEach(p => {
          p.material.color.setHex(0x8899aa);
          p.material.emissive.setHex(0x000000);
        });

        const speed = (rpm / 1500) * 10; // Normalize RPM for animation speed
        crank.rotation.x += speed * delta;
        flywheel.rotation.x += speed * delta;

        // Animate pistons up and down
        pistons.forEach((p, index) => {
          const offset = (index % 2 === 0) ? 0 : Math.PI;
          p.position.y = 3.5 + Math.sin(time * speed + offset) * 1;
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
      blockGeo.dispose();
      blockMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      pistonGeo.dispose();
      pistonMat.dispose();
      crankGeo.dispose();
      crankMat.dispose();
      flywheelGeo.dispose();
      flywheelMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
