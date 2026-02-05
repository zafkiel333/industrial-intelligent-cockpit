
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BearingSceneProps } from './three-types';

export const BearingLifeScene: React.FC<BearingSceneProps> = ({ 
  rpm,
  padTemperatures,
  oilFilmThickness,
  selectedPadIndex = null,
  onPadSelect,
  showOilFlow = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shaftGroupRef = useRef<THREE.Group | null>(null);
  const padsGroupRef = useRef<THREE.Group | null>(null);
  const oilParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050810, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 1.8; // Don't go below the floor

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased intensity
    scene.add(ambientLight);
    
    // Add Hemisphere Light for better general visibility
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);
    
    // Warm light for oil/metal
    const mainLight = new THREE.PointLight(0xf59e0b, 2, 20);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const rimLight = new THREE.SpotLight(0x3b82f6, 4);
    rimLight.position.set(-5, 2, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // --- Materials ---
    const shaftMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.5, // Reduced for visibility
      roughness: 0.4 
    });

    const padBaseMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Babbitt metal color
      metalness: 0.3, // Reduced
      roughness: 0.6
    });

    const oilMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.4,
      ior: 1.45
    });

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Shaft & Thrust Collar (Rotating)
    const shaftGroup = new THREE.Group();
    shaftGroupRef.current = shaftGroup;
    mainGroup.add(shaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 64);
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftGroup.add(shaftMesh);

    const collarGeo = new THREE.CylinderGeometry(4, 4, 0.5, 64);
    const collarMesh = new THREE.Mesh(collarGeo, shaftMat);
    collarMesh.position.y = 0; // The collar sits on the pads
    shaftGroup.add(collarMesh);

    // Add some texture/detail to collar to see rotation
    const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
    for(let i=0; i<8; i++) {
        const bolt = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
        const angle = (i/8) * Math.PI * 2;
        bolt.position.set(Math.cos(angle)*3.5, 0.35, Math.sin(angle)*3.5);
        shaftGroup.add(bolt);
    }

    // 2. Thrust Pads (Stationary)
    const padsGroup = new THREE.Group();
    padsGroup.position.y = -0.5; // Below collar
    padsGroupRef.current = padsGroup;
    mainGroup.add(padsGroup);

    const padCount = 12;
    const rInner = 1.8;
    const rOuter = 3.8;
    const padShape = new THREE.Shape();
    // Create sector shape
    const angleStep = (Math.PI * 2) / padCount;
    const padGap = 0.05; // Gap between pads in radians
    const padAngle = angleStep - padGap;

    padShape.moveTo(Math.cos(-padAngle/2)*rInner, Math.sin(-padAngle/2)*rInner);
    padShape.lineTo(Math.cos(-padAngle/2)*rOuter, Math.sin(-padAngle/2)*rOuter);
    // Outer arc
    const segs = 10;
    for(let i=1; i<=segs; i++) {
        const th = -padAngle/2 + (padAngle * i / segs);
        padShape.lineTo(Math.cos(th)*rOuter, Math.sin(th)*rOuter);
    }
    padShape.lineTo(Math.cos(padAngle/2)*rInner, Math.sin(padAngle/2)*rInner);
    // Inner arc
    for(let i=segs-1; i>=0; i--) {
        const th = -padAngle/2 + (padAngle * i / segs);
        padShape.lineTo(Math.cos(th)*rInner, Math.sin(th)*rInner);
    }

    const padGeo = new THREE.ExtrudeGeometry(padShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    padGeo.rotateX(-Math.PI/2); // Lay flat

    // Create pads
    for(let i=0; i<padCount; i++) {
        const pad = new THREE.Mesh(padGeo, padBaseMat.clone());
        pad.rotation.y = - i * angleStep;
        pad.userData = { index: i };
        padsGroup.add(pad);
    }

    // 3. Oil Bath (Container)
    const tankGeo = new THREE.CylinderGeometry(4.5, 4.5, 2.5, 64, 1, true);
    const tank = new THREE.Mesh(tankGeo, new THREE.MeshPhysicalMaterial({
        color: 0x334155, metalness: 0.8, roughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.2
    }));
    tank.position.y = -0.5;
    mainGroup.add(tank);

    // 4. Oil Particles (Flow Visualization)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const r = 2 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        pPos[i*3] = Math.cos(theta) * r;
        pPos[i*3+1] = -0.5 + Math.random() * 0.5; // Between pads and collar
        pPos[i*3+2] = Math.sin(theta) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    oilParticlesRef.current = particles;
    if(showOilFlow) mainGroup.add(particles);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
        if (!onPadSelect) return;
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(padsGroup.children);
        
        if (intersects.length > 0) {
            onPadSelect(intersects[0].object.userData.index);
        } else {
            onPadSelect(-1); // Deselect
        }
    };
    mountRef.current.addEventListener('click', onMouseClick);


    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // Rotate Shaft
      if (shaftGroupRef.current) {
          shaftGroupRef.current.rotation.y -= (rpm / 60) * 0.05;
          // Visual lift for oil film
          shaftGroupRef.current.position.y = (oilFilmThickness / 100) * 0.5; 
      }

      // Animate Particles
      if (oilParticlesRef.current) {
          oilParticlesRef.current.rotation.y -= (rpm / 60) * 0.02; // Slower than shaft
          const positions = oilParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3+1] = -0.25 + Math.sin(time * 2 + i) * 0.05; // Bobbing
          }
          oilParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Update Pad Colors based on Temperature Props
      if (padsGroupRef.current && padTemperatures.length > 0) {
          padsGroupRef.current.children.forEach((pad: any, i) => {
              const temp = padTemperatures[i] || 60;
              const isSelected = selectedPadIndex === i;
              
              const mat = pad.material as THREE.MeshStandardMaterial;
              
              // Color mapping: 50(Blue) -> 70(Green) -> 90(Red)
              const tNorm = Math.min(1, Math.max(0, (temp - 50) / 50));
              const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5); // Hue 0.6(blue) to 0.0(red)
              
              mat.color.copy(color);
              
              if (isSelected) {
                  mat.emissive.setHex(0xffffff);
                  mat.emissiveIntensity = 0.3;
              } else {
                  mat.emissive.copy(color);
                  mat.emissiveIntensity = tNorm * 0.5; // Hotter pads glow more
              }
          });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onMouseClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rpm, padTemperatures, oilFilmThickness, selectedPadIndex, showOilFlow]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" title="Click pads to view details" />;
};
