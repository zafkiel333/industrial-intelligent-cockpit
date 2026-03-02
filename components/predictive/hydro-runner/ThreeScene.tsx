import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RunnerSceneProps } from './three-types';

export const RunnerCavitationScene: React.FC<RunnerSceneProps> = ({ 
  rpm, 
  cavitationIntensity, 
  crackSeverity,
  showStressMap = true,
  viewMode = 'solid'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const runnerGroupRef = useRef<THREE.Group | null>(null);
  const bubblesRef = useRef<THREE.Points | null>(null);
  
  // 2026.02.28 - Bug修复：缓存实时更新的props值，避免依赖项变化触发useEffect重渲染
  // Bug情况：useEffect依赖项（rpm/cavitationIntensity等）频繁变化导致组件反复执行初始化逻辑，模型闪烁
  // Bug原因：useEffect依赖数组包含易变的props变量，每次变量更新都会触发整个3D场景重新初始化，导致渲染闪烁
  const propsRef = useRef({
    rpm,
    cavitationIntensity,
    crackSeverity,
    showStressMap,
    viewMode
  });
  
  // 实时更新ref中的props值，不触发useEffect
  useEffect(() => {
    propsRef.current = {
      rpm,
      cavitationIntensity,
      crackSeverity,
      showStressMap,
      viewMode
    };
  }, [rpm, cavitationIntensity, crackSeverity, showStressMap, viewMode]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-runner useEffect===");
    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.04); // Deep water fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -8, 12); // Look from bottom-side (draft tube view)
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased
    scene.add(ambientLight);
    
    // Add Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.8);
    scene.add(hemiLight);
    
    // Underwater blueish light
    const spotLight = new THREE.SpotLight(0x38bdf8, 5);
    spotLight.position.set(5, 10, 5);
    spotLight.angle = 0.5;
    scene.add(spotLight);

    const redAlertLight = new THREE.PointLight(0xef4444, 0, 20); // Intensity modulated by crackSeverity
    redAlertLight.position.set(0, -2, 0);
    scene.add(redAlertLight);

    // --- Geometry: Francis Runner ---
    const runnerGroup = new THREE.Group();
    runnerGroupRef.current = runnerGroup;
    scene.add(runnerGroup);

    // Materials
    const steelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      metalness: 0.5, // Reduced for better visibility without env map
      roughness: 0.4,
      flatShading: false
    });

    const stressMaterial = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0xef4444,
        emissiveIntensity: 0.5
    });

    // 1. Crown (Top Hub)
    const crownGeo = new THREE.ConeGeometry(3, 1.5, 32, 1, true);
    const crown = new THREE.Mesh(crownGeo, steelMaterial);
    crown.rotation.x = Math.PI; // Invert cone
    crown.position.y = 1;
    runnerGroup.add(crown);

    const shaftCoupling = new THREE.CylinderGeometry(1.5, 1.5, 1, 32);
    const shaftMesh = new THREE.Mesh(shaftCoupling, steelMaterial);
    shaftMesh.position.y = 2;
    runnerGroup.add(shaftMesh);

    // 2. Band (Bottom Ring) - Outer shell
    const bandGeo = new THREE.CylinderGeometry(4.5, 5.0, 3, 32, 1, true);
    const band = new THREE.Mesh(bandGeo, new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.3, // Semi-transparent to see blades
        side: THREE.DoubleSide
    }));
    runnerGroup.add(band);

    // 3. Blades
    const bladeCount = 13;
    const bladeGeo = new THREE.BoxGeometry(2.5, 3.2, 0.1, 4, 4, 1);
    
    // Deform blade to look like an airfoil/hydrofoil curve
    const positionAttribute = bladeGeo.attributes.position;
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
        const y = positionAttribute.getY( i );
        const x = positionAttribute.getX( i );
        const z = positionAttribute.getZ( i );
        // Twist and curve
        const angle = (y + 1.6) * 0.5; 
        const newX = x * Math.cos(angle) - z * Math.sin(angle);
        const newZ = x * Math.sin(angle) + z * Math.cos(angle);
        // Add camber
        const camber = Math.sin(y) * 0.5;
        
        positionAttribute.setXYZ( i, newX + camber, y, newZ );
    }
    bladeGeo.computeVertexNormals();

    // 存储叶片引用，用于后续裂纹更新
    const bladeRefs: THREE.Mesh[] = [];
    for(let i=0; i<bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        const blade = new THREE.Mesh(bladeGeo, steelMaterial);
        
        // Position blades between Crown and Band
        const r = 3.5;
        blade.position.set(Math.cos(angle)*r, 0, Math.sin(angle)*r);
        blade.rotation.y = -angle + 0.5; // Angled attack
        blade.rotation.x = 0.2; // Tilt
        
        runnerGroup.add(blade);
        bladeRefs.push(blade);

        // 初始化裂纹（后续根据crackSeverity动态更新）
        blade.userData.crack = null;
        blade.userData.stressHighlight = null;
    }

    // 4. Cavitation Bubbles Particle System
    // Particles should appear near the trailing edge (bottom/exit of blades)
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pLife = new Float32Array(pCount); // Life for animation

    for(let i=0; i<pCount; i++) {
        // Random position in ring at bottom
        const theta = Math.random() * Math.PI * 2;
        const r = 4.0 + (Math.random() - 0.5) * 1.5;
        pPos[i*3] = Math.cos(theta) * r;
        pPos[i*3+1] = -1.5 + (Math.random() * 1.0); // Bottom area
        pPos[i*3+2] = Math.sin(theta) * r;
        pLife[i] = Math.random();
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('life', new THREE.BufferAttribute(pLife, 1));

    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.0, // Start invisible, logic in animate handles opacity based on intensity
        blending: THREE.AdditiveBlending,
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png')
    });

    const bubbles = new THREE.Points(pGeo, pMat);
    bubblesRef.current = bubbles;
    scene.add(bubbles);

    // --- 裂纹更新函数（2026.02.28 新增） ---
    const updateCracks = (severity: number, showStress: boolean) => {
        bladeRefs.forEach(blade => {
            // 清除原有裂纹和高亮
            if (blade.userData.crack) {
                blade.remove(blade.userData.crack);
                blade.userData.crack = null;
            }
            if (blade.userData.stressHighlight) {
                blade.remove(blade.userData.stressHighlight);
                blade.userData.stressHighlight = null;
            }

            // 根据严重度生成新裂纹
            if (severity > 0 && Math.random() < (severity/100)) {
                const crackGeo = new THREE.BufferGeometry();
                const pts = [];
                for(let k=0; k<10; k++) {
                    pts.push(new THREE.Vector3((k-5)*0.2, -1.2 + Math.random()*0.1, 0.06));
                }
                crackGeo.setFromPoints(pts);
                const crackMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
                const crack = new THREE.Line(crackGeo, crackMat);
                blade.add(crack);
                blade.userData.crack = crack;

                // 应力高亮
                if (showStress) {
                    const highlight = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 0.5, 0.12),
                        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4 })
                    );
                    highlight.position.set(0, -1.2, 0);
                    blade.add(highlight);
                    blade.userData.stressHighlight = highlight;
                }
            }
        });
    };

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // 2026.02.28 - 读取缓存的最新props值
      const { rpm: currentRpm, cavitationIntensity: currentCavIntensity, crackSeverity: currentCrackSeverity, showStressMap: currentShowStress } = propsRef.current;

      // Rotate Runner（使用缓存的rpm值）
      if (runnerGroupRef.current) {
          runnerGroupRef.current.rotation.y -= (currentRpm / 60) * 0.03;
      }

      // Animate Cavitation Bubbles（使用缓存的空化强度值）
      if (bubblesRef.current) {
          const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
          const lives = bubblesRef.current.geometry.attributes.life.array as Float32Array;
          
          // Intensity determines how many particles are visible/active
          const activeThreshold = currentCavIntensity / 100;
          
          // Bubbles rotate with runner but slightly slower (slip) and move down
          const rotSpeed = (currentRpm / 60) * 0.1;

          for(let i=0; i<pCount; i++) {
              if (i > pCount * activeThreshold) {
                  // Hide unused particles
                  positions[i*3+1] = -1000; 
                  continue;
              }

              // Reset if out of bounds
              if (positions[i*3+1] < -3 || positions[i*3+1] > -1.0) {
                  const theta = Math.random() * Math.PI * 2;
                  const r = 4.0 + (Math.random() - 0.5) * 1.0;
                  positions[i*3] = Math.cos(theta) * r;
                  positions[i*3+1] = -1.0; // Reset to top of exit
                  positions[i*3+2] = Math.sin(theta) * r;
              }

              // Move down (flow)
              positions[i*3+1] -= 0.02 + Math.random() * 0.02;
              
              // Spiral motion
              const x = positions[i*3];
              const z = positions[i*3+2];
              const ca = Math.cos(-rotSpeed);
              const sa = Math.sin(-rotSpeed);
              positions[i*3] = x * ca - z * sa;
              positions[i*3+2] = x * sa + z * ca;
          }
          bubblesRef.current.geometry.attributes.position.needsUpdate = true;
          
          // Update opacity based on intensity
          (bubblesRef.current.material as THREE.PointsMaterial).opacity = Math.min(0.8, activeThreshold);
          (bubblesRef.current.material as THREE.PointsMaterial).size = 0.05 + (activeThreshold * 0.1);
      }

      // Pulse red light if cracks exist（使用缓存的裂纹严重度值）
      if (currentCrackSeverity > 0) {
          redAlertLight.intensity = (Math.sin(time * 10) + 1) * (currentCrackSeverity / 20);
          // 动态更新裂纹显示
          updateCracks(currentCrackSeverity, currentShowStress);
      } else {
          redAlertLight.intensity = 0;
          // 清除所有裂纹
          updateCracks(0, false);
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
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // 释放几何和材质内存
      bladeRefs.forEach(blade => {
          blade.geometry.dispose();
          (blade.material as THREE.Material).dispose();
      });
      pGeo.dispose();
      pMat.dispose();
    };
  }, []); // 2026.02.28 - 移除所有易变依赖项，仅在挂载/卸载时执行

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};