import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CompressorSceneProps } from './three-types';

export const AirCompressorThreeScene: React.FC<CompressorSceneProps> = ({
  parts,
  motorRpm,
  airFlowIntensity,
  oilCirculationSpeed,
  compressionRatio,
  viewMode,
  selectedId,
  onSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);
  const screwsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const cyanLight = new THREE.PointLight(0x0ea5e9, 5, 50);
    cyanLight.position.set(10, 15, 10);
    scene.add(cyanLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2, 50);
    amberLight.position.set(-10, 5, -5);
    scene.add(amberLight);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.9, roughness: 0.3,
      transparent: viewMode === 'xray',
      opacity: viewMode === 'xray' ? 0.2 : 1.0
    });

    const innerMetalMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, metalness: 1.0, roughness: 0.1
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, transmission: 0.5, transparent: true, opacity: 0.6
    });

    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Motor
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 32), metalMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.x = -4;
    mainGroup.add(motor);

    // 2. Air-End (Screws)
    const airEndGroup = new THREE.Group();
    const housingGeo = new THREE.BoxGeometry(3, 3, 4);
    const housing = new THREE.Mesh(housingGeo, metalMat);
    airEndGroup.add(housing);
    
    // Internal Screws
    const screws = new THREE.Group();
    screwsRef.current = screws;
    for(let i=0; i<2; i++) {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 8), innerMetalMat);
        screw.rotation.x = Math.PI/2;
        screw.position.x = i === 0 ? -0.7 : 0.7;
        screws.add(screw);
    }
    airEndGroup.add(screws);
    mainGroup.add(airEndGroup);

    // 3. Oil Separator Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 6, 32), metalMat);
    tank.position.set(4, 1.5, 0);
    mainGroup.add(tank);

    // 4. Air Flow Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*20;
        pPos[i*3+1] = Math.random()*10;
        pPos[i*3+2] = (Math.random()-0.5)*10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 5. Oil Circulation Particles (Inside)
    const opCount = 300;
    const opGeo = new THREE.BufferGeometry();
    const opPos = new Float32Array(opCount * 3);
    for(let i=0; i<opCount; i++) {
        opPos[i*3] = 4 + (Math.random()-0.5)*3.8;
        opPos[i*3+1] = 1.5 + (Math.random()-0.5)*5.8;
        opPos[i*3+2] = (Math.random()-0.5)*3.8;
    }
    opGeo.setAttribute('position', new THREE.BufferAttribute(opPos, 3));
    const opMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.15, transparent: true, opacity: 0.8 });
    const oilParticles = new THREE.Points(opGeo, opMat);
    oilParticlesRef.current = oilParticles;
    mainGroup.add(oilParticles);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -1.5;
    scene.add(grid);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    mountRef.current.addEventListener('mousemove', onMouseMove);

    // Animation
    let frameId: number;
    let time = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      if (screwsRef.current) {
          screwsRef.current.children[0].rotation.y += motorRpm * 0.001;
          screwsRef.current.children[1].rotation.y -= motorRpm * 0.0015; // Different ratio
          screwsRef.current.visible = viewMode !== 'standard';
      }

      if (particlesRef.current) {
          const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] -= 0.05 * airFlowIntensity; // Sinking flow
              if (pos[i*3+1] < -1.5) pos[i*3+1] = 10;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (oilParticlesRef.current) {
          const pos = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<opCount; i++) {
              pos[i*3+1] += 0.02 * oilCirculationSpeed;
              if (pos[i*3+1] > 4.5) pos[i*3+1] = -1.5;
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          oilParticlesRef.current.visible = viewMode === 'xray';
      }

      // Selected Highlight
      if (selectedId && mainGroupRef.current) {
          // Logic to pulse selected part
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode, motorRpm, airFlowIntensity, oilCirculationSpeed]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};