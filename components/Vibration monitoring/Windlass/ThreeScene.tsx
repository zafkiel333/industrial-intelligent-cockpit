import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WindlassState } from './three-types';

export const ThreeScene: React.FC<{ state: WindlassState }> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.01);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(25, 20, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xf59e0b, 2);
    mainLight.position.set(20, 30, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    // --- Windlass Model (Procedural) ---
    const windlassGroup = new THREE.Group();
    scene.add(windlassGroup);

    // 1. Base Platform (Bento-style structural base)
    const baseGeo = new THREE.BoxGeometry(16, 1.2, 10);
    const techMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x0f172a
    });
    const base = new THREE.Mesh(baseGeo, techMat);
    base.position.y = 0.6;
    windlassGroup.add(base);

    // Structural Beams
    const beamGeo = new THREE.BoxGeometry(0.4, 0.4, 10);
    for (let i = 0; i < 4; i++) {
      const beam = new THREE.Mesh(beamGeo, techMat);
      beam.position.set(-7 + i * 4.6, 1.4, 0);
      windlassGroup.add(beam);
    }

    // 2. Main Shaft Support (A-Frame style)
    const supportGroup = new THREE.Group();
    windlassGroup.add(supportGroup);

    const createSupport = (x: number) => {
      const sGroup = new THREE.Group();
      sGroup.position.set(x, 4, 0);
      
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 7, 2), techMat);
      s1.rotation.z = 0.1;
      s1.position.x = -0.5;
      sGroup.add(s1);

      const s2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 7, 2), techMat);
      s2.rotation.z = -0.1;
      s2.position.x = 0.5;
      sGroup.add(s2);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16), techMat);
      top.rotation.x = Math.PI / 2;
      top.position.y = 3.5;
      sGroup.add(top);

      return sGroup;
    };

    supportGroup.add(createSupport(-4));
    supportGroup.add(createSupport(4));

    // 3. Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 16);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 1 }));
    shaft.rotation.z = Math.PI / 2;
    shaft.position.y = 7.5;
    windlassGroup.add(shaft);

    // 4. Wildcat (Chain Wheel) - More detailed
    const wildcatGroup = new THREE.Group();
    wildcatGroup.position.y = 7.5;
    windlassGroup.add(wildcatGroup);

    const wildcatBodyGeo = new THREE.CylinderGeometry(3.5, 3.5, 2.5, 16);
    const wildcatMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.4,
      emissive: 0x1e293b
    });
    const wildcatBody = new THREE.Mesh(wildcatBodyGeo, wildcatMat);
    wildcatBody.rotation.z = Math.PI / 2;
    wildcatGroup.add(wildcatBody);

    // Wildcat Pockets (Teeth)
    for (let i = 0; i < 6; i++) {
      const pocketGeo = new THREE.BoxGeometry(1.5, 1.5, 3);
      const pocket = new THREE.Mesh(pocketGeo, wildcatMat);
      const angle = (i / 6) * Math.PI * 2;
      pocket.position.set(0, Math.cos(angle) * 3.5, Math.sin(angle) * 3.5);
      pocket.rotation.x = angle;
      wildcatGroup.add(pocket);
    }

    // 5. Chain Links (A loop of links)
    const chainGroup = new THREE.Group();
    scene.add(chainGroup);

    const linkGeo = new THREE.TorusGeometry(0.6, 0.18, 12, 24);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 1, roughness: 0.1 });
    
    const links: THREE.Mesh[] = [];
    const linkCount = 40;
    for (let i = 0; i < linkCount; i++) {
      const link = new THREE.Mesh(linkGeo, linkMat);
      link.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
      chainGroup.add(link);
      links.push(link);
    }

    // 6. Motor & Gearbox (Futuristic design)
    const motorGroup = new THREE.Group();
    motorGroup.position.set(-9, 4, 0);
    windlassGroup.add(motorGroup);

    const motorGeo = new THREE.CylinderGeometry(2, 2, 5, 16);
    const motor = new THREE.Mesh(motorGeo, techMat);
    motor.rotation.z = Math.PI / 2;
    motorGroup.add(motor);

    // Cooling Fins
    for (let i = 0; i < 12; i++) {
      const finGeo = new THREE.BoxGeometry(0.1, 0.6, 5);
      const fin = new THREE.Mesh(finGeo, techMat);
      const angle = (i / 12) * Math.PI * 2;
      fin.position.set(0, Math.cos(angle) * 2.1, Math.sin(angle) * 2.1);
      fin.rotation.x = angle;
      motorGroup.add(fin);
    }

    const gearboxGeo = new THREE.BoxGeometry(4, 5, 5);
    const gearbox = new THREE.Mesh(gearboxGeo, techMat);
    gearbox.position.set(3, 0, 0);
    motorGroup.add(gearbox);

    // 7. Scanning Laser Effect
    const laserGeo = new THREE.PlaneGeometry(16, 0.1);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    laser.position.y = 8;
    scene.add(laser);

    // 8. Grid Helper
    const grid = new THREE.GridHelper(50, 50, 0xf59e0b, 0x1e293b);
    grid.position.y = 0.1;
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { chainSpeed, vibrationIntensity, isOperating, operationMode } = stateRef.current;

      // Scanning Laser
      laser.position.z = Math.sin(time * 0.5) * 5;

      if (isOperating && operationMode !== 'STOP') {
        const direction = operationMode === 'ANCHOR_UP' ? 1 : -1;
        const rotSpeed = chainSpeed * 0.5 * direction;
        
        wildcatGroup.rotation.x += rotSpeed;
        shaft.rotation.x += rotSpeed;

        // Chain Animation
        links.forEach((link, i) => {
          const t = (time * chainSpeed * 0.2 * direction + i / linkCount) % 1;
          const angle = t * Math.PI * 2;
          
          // Follow a path: Down from top, around wildcat, then straight out
          if (t < 0.25) { // Vertical down
            link.position.set(0, 7.5 + (0.25 - t) * 40, 3.5);
            link.rotation.x = Math.PI / 2;
          } else if (t < 0.75) { // Around wildcat
            const arcT = (t - 0.25) / 0.5;
            const arcAngle = arcT * Math.PI - Math.PI / 2;
            link.position.set(0, 7.5 + Math.cos(arcAngle) * 3.5, Math.sin(arcAngle) * 3.5);
            link.rotation.x = arcAngle;
          } else { // Straight out
            link.position.set(0, 4, -3.5 - (t - 0.75) * 40);
            link.rotation.x = 0;
          }
          link.rotation.y = (i % 2 === 0) ? 0 : Math.PI / 2;
        });
      }

      // Vibration Effect
      const vib = Math.sin(time * 120) * (vibrationIntensity * 0.08);
      windlassGroup.position.y = vib;
      windlassGroup.position.x = Math.cos(time * 130) * (vibrationIntensity * 0.03);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
