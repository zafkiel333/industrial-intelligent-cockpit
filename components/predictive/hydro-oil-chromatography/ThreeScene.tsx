import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OilSceneProps } from './three-types';

export const OilChromatographyScene: React.FC<OilSceneProps> = ({ 
  oilTemp,
  gasData,
  faultLocation,
  oilClarity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const faultGlowRef = useRef<THREE.PointLight | null>(null);

  // 2026.03.02 - Bug修复：创建ref存储实时props值，避免依赖项变化触发useEffect重建场景
  // Bug情况：模型频繁闪烁，原因是useEffect依赖项(oilTemp/gasData/faultLocation/oilClarity)反复变化，导致场景被反复创建和销毁
  const oilTempRef = useRef(oilTemp);
  const gasDataRef = useRef(gasData);
  const faultLocationRef = useRef(faultLocation);
  const oilClarityRef = useRef(oilClarity);

  // 2026.03.02 - 仅更新ref值，不触发场景重建
  useEffect(() => {
    oilTempRef.current = oilTemp;
    gasDataRef.current = gasData;
    faultLocationRef.current = faultLocation;
    oilClarityRef.current = oilClarity;
  }, [oilTemp, gasData, faultLocation, oilClarity]);

  // 2026.03.02 - 清空依赖项，仅初始化一次场景，避免反复触发导致闪烁
  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-oil-chromatography useEffect===");

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Deep amber fog simulating oil
    scene.fog = new THREE.FogExp2(0x1a1100, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
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

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const topLight = new THREE.SpotLight(0xffaa00, 5);
    topLight.position.set(0, 10, 0);
    topLight.angle = 0.5;
    topLight.penumbra = 0.5;
    scene.add(topLight);

    // Fault indicator light (internal glow)
    const faultLight = new THREE.PointLight(0xff0000, 0, 10);
    faultLight.position.set(0, 0, 0);
    scene.add(faultLight);
    faultGlowRef.current = faultLight;

    // --- Geometry: Abstract Transformer Internal ---
    const group = new THREE.Group();
    scene.add(group);

    // 1. Tank Boundary (Glassy)
    const tankGeo = new THREE.BoxGeometry(6, 5, 4);
    const tankMat = new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, // Amber
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    group.add(tank);

    // 2. Coils (Stylized)
    const coilGroup = new THREE.Group();
    group.add(coilGroup);
    
    // Create 3 phases
    [-1.5, 0, 1.5].forEach(x => {
        const coilGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32, 1, true);
        const coilMat = new THREE.MeshStandardMaterial({
            color: 0xb45309, // Copper
            metalness: 0.6,
            roughness: 0.4,
            wireframe: true
        });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.position.set(x, 0, 0);
        coilGroup.add(coil);

        // Core leg inside
        const coreGeo = new THREE.CylinderGeometry(0.5, 0.5, 4.2, 16);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(x, 0, 0);
        coilGroup.add(core);
    });

    // 3. Gas Particles (Bubbles)
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);

    const colorH2 = new THREE.Color(0x3b82f6); // Blue
    const colorCH4 = new THREE.Color(0xfacc15); // Yellow
    const colorC2H2 = new THREE.Color(0xff0000); // Red (Acetylene - Danger)
    const colorCO = new THREE.Color(0xffffff); // White

    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 5.5;
        pPos[i*3+1] = (Math.random() - 0.5) * 4.5;
        pPos[i*3+2] = (Math.random() - 0.5) * 3.5;
        
        // Default init
        pColors[i*3] = 1; pColors[i*3+1] = 1; pColors[i*3+2] = 1;
        pSizes[i] = 0; // Hidden by default
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        size: 0.1,
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png'),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    group.add(particles);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 2026.03.02 - 读取ref中的最新props值，替代直接使用props
      const currentOilTemp = oilTempRef.current;
      const currentGasData = gasDataRef.current;
      const currentFaultLocation = faultLocationRef.current;
      const currentOilClarity = oilClarityRef.current;

      // 1. Particle Logic
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
          const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;

          // Map gas data to particle visualization
          // H2 -> Fast, upward
          // C2H2 -> Generated at fault location
          
          const totalPPM = currentGasData.reduce((a, b) => a + b.concentration, 0);
          const maxPPM = 1000; // Visual scale cap
          const particleDensity = Math.min(1.0, totalPPM / maxPPM);

          for(let i=0; i<pCount; i++) {
              // Only render a subset based on density
              if (i > pCount * particleDensity) {
                  sizes[i] = 0;
                  continue;
              }

              // Assign types cyclically for visual variety
              let typeColor = colorCO;
              let speed = 0.01;
              let isFaultGas = false;

              const typeIndex = i % 4;
              if (typeIndex === 0) { typeColor = colorH2; speed = 0.03; } // H2
              if (typeIndex === 1) { typeColor = colorCH4; speed = 0.015; } // CH4
              if (typeIndex === 2) { typeColor = colorC2H2; speed = 0.02; isFaultGas = true; } // C2H2
              if (typeIndex === 3) { typeColor = colorCO; speed = 0.01; } // CO

              colors[i*3] = typeColor.r;
              colors[i*3+1] = typeColor.g;
              colors[i*3+2] = typeColor.b;
              sizes[i] = 0.1 + (Math.sin(time*2 + i)*0.02);

              // Movement - 使用最新油温
              positions[i*3+1] += speed * (1 + (currentOilTemp - 20)/100); // Temp affects speed

              // Reset
              if (positions[i*3+1] > 2.5) {
                  positions[i*3+1] = -2.5;
                  
                  // If fault location is defined, emit fault gases from there
                  if (currentFaultLocation && isFaultGas) {
                      positions[i*3] = currentFaultLocation[0] * 3 + (Math.random()-0.5)*0.5;
                      positions[i*3+1] = currentFaultLocation[1] * 2.5;
                      positions[i*3+2] = currentFaultLocation[2] * 2 + (Math.random()-0.5)*0.5;
                  } else {
                      positions[i*3] = (Math.random() - 0.5) * 5.5;
                      positions[i*3+2] = (Math.random() - 0.5) * 3.5;
                  }
              }
          }

          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          particlesRef.current.geometry.attributes.color.needsUpdate = true;
          particlesRef.current.geometry.attributes.size.needsUpdate = true;
      }

      // 2. Fault Light Pulse - 使用最新故障位置和气体数据
      if (faultGlowRef.current && currentFaultLocation) {
          faultGlowRef.current.position.set(currentFaultLocation[0]*3, currentFaultLocation[1]*2.5, currentFaultLocation[2]*2);
          // Intensity based on C2H2 content roughly
          const c2h2 = currentGasData.find(g => g.type === 'C2H2')?.concentration || 0;
          faultGlowRef.current.intensity = (c2h2 > 0 ? 2 : 0) + Math.sin(time * 10) * 1;
      }

      // 3. Oil Clarity (Tank opacity) - 使用最新油透明度
      // Dirtier oil = more opaque / darker
      tankMat.opacity = 0.3 + (1 - currentOilClarity) * 0.5;
      tankMat.color.setHSL(0.08, 1.0, 0.5 * currentOilClarity); // Darken if dirty

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
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // 2026.03.02 - 清空依赖项，仅初始化一次

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};