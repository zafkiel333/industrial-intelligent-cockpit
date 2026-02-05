
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SwingBearingSceneProps } from './three-types';

export const SwingBearingThreeScene: React.FC<SwingBearingSceneProps> = ({
  rotationAngle,
  tiltAngleX,
  tiltAngleZ,
  wearLevel,
  stressHotspots,
  lubricationStatus,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const innerRingRef = useRef<THREE.Mesh | null>(null);
  const rollersRef = useRef<THREE.Group | null>(null);
  const debrisRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.8;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2.2;

    // --- 灯光 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const blueLight = new THREE.PointLight(0x06b6d4, 2, 50);
    blueLight.position.set(10, 10, 10);
    scene.add(blueLight);

    const orangeLight = new THREE.PointLight(0xf97316, 1, 50);
    orangeLight.position.set(-10, 5, -10);
    scene.add(orangeLight);

    // --- 材质 ---
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.8,
        roughness: 0.2
    });

    const raceMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.5,
        roughness: 0.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: viewMode === 'transparent' ? 0.3 : 1.0,
        side: THREE.DoubleSide
    });

    const rollerMat = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1
    });

    const stressMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
    });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. 外圈 (Stationary Outer Race)
    const outerGeo = new THREE.CylinderGeometry(6, 6, 2, 64, 1, true);
    // Build a thick ring using extrusion or simple shapes
    // Simplified: Top and bottom rings + outer shell
    const outerGroup = new THREE.Group();
    
    const outerShell = new THREE.Mesh(new THREE.TorusGeometry(6, 0.5, 16, 100), raceMat);
    outerShell.rotation.x = Math.PI/2;
    outerShell.scale.z = 2;
    outerGroup.add(outerShell);
    
    // Teeth on outer ring (if external gear) - Let's assume internal gear or just plain for visual
    const teethGeo = new THREE.BoxGeometry(0.5, 1.8, 0.8);
    for(let i=0; i<48; i++) {
        const angle = (i/48) * Math.PI * 2;
        const tooth = new THREE.Mesh(teethGeo, steelMat);
        tooth.position.set(Math.cos(angle)*6.6, 0, Math.sin(angle)*6.6);
        tooth.rotation.y = -angle;
        outerGroup.add(tooth);
    }
    mainGroup.add(outerGroup);

    // 2. 内圈 (Rotating Inner Race)
    const innerGeo = new THREE.TorusGeometry(4, 0.5, 16, 100);
    const innerRing = new THREE.Mesh(innerGeo, raceMat);
    innerRing.rotation.x = Math.PI/2;
    innerRing.scale.z = 2;
    innerRingRef.current = innerRing;
    mainGroup.add(innerRing);

    // 3. 滚动体 (Rollers/Balls)
    const rollers = new THREE.Group();
    rollersRef.current = rollers;
    mainGroup.add(rollers);

    const rollerCount = 36;
    for(let i=0; i<rollerCount; i++) {
        const angle = (i/rollerCount) * Math.PI * 2;
        // Cross Roller simulation: alternate orientation
        const isHorizontal = i % 2 === 0;
        
        const rGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
        const roller = new THREE.Mesh(rGeo, rollerMat.clone());
        
        const r = 5; // Between 4 and 6
        roller.position.set(Math.cos(angle)*r, 0, Math.sin(angle)*r);
        
        // Orient roller
        // Base rotation to face center
        const pivot = new THREE.Group();
        pivot.position.copy(roller.position);
        pivot.rotation.y = -angle;
        
        // Local rotation
        if (isHorizontal) {
            roller.position.set(0,0,0);
            roller.rotation.x = Math.PI/2; 
        } else {
            roller.position.set(0,0,0);
            // Vertical
        }
        pivot.add(roller);
        rollers.add(pivot);

        // Stress Halo
        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), stressMat.clone());
        halo.name = 'stressHalo';
        halo.userData = { angleDeg: (angle * 180 / Math.PI) };
        roller.add(halo);
    }

    // 4. 磨损微粒 (Debris)
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 4.5 + Math.random();
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = (Math.random()-0.5) * 0.8;
        pPos[i*3+2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xd97706,
        size: 0.08,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const debris = new THREE.Points(pGeo, pMat);
    debrisRef.current = debris;
    mainGroup.add(debris);

    // --- 动画循环 ---
    let frameId: number;
    let time = 0;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.01;
        controls.update();

        // 1. 旋转动画 (Inner Ring rotates, Rollers orbit at half speed)
        // rotationAngle is target, we lerp to it for smoothness or just spin
        // Here we just spin based on 'rotationAngle' prop as a speed/position factor? 
        // Let's treat rotationAngle as the current position.
        const rad = (rotationAngle * Math.PI) / 180;
        
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = rad; // Rotating around Y actually (due to geometry rotation)
            // Fix: Torus was rotated X=90. So its local Z is world Y.
            // Let's rotate the object group
        }
        // Manual rotation logic
        mainGroup.children.forEach(c => {
             if(c === innerRing) c.rotation.z = rad; 
        });
        
        // Rollers orbit at approx 0.5 speed of race in pure rolling
        if (rollersRef.current) {
            rollersRef.current.rotation.y = -rad * 0.5;
            
            // Roller spin on own axis
            rollersRef.current.children.forEach(pivot => {
                const rollerMesh = pivot.children[0] as THREE.Mesh;
                rollerMesh.rotation.z += 0.1; // Spin effect

                // Stress Heatmap Update
                const halo = rollerMesh.getObjectByName('stressHalo') as THREE.Mesh;
                if (halo) {
                    const myAngle = (pivot.rotation.y + rollersRef.current!.rotation.y) * 180/Math.PI;
                    const normalizedAngle = Math.abs(myAngle % 360);
                    
                    // Check if close to a hotspot
                    let stress = 0;
                    if (viewMode === 'stress') {
                        stressHotspots.forEach(hot => {
                            const diff = Math.abs(normalizedAngle - hot);
                            if (diff < 30) stress += (30 - diff) / 30;
                        });
                    }
                    
                    // Tilt induced stress
                    const tiltStress = (Math.abs(tiltAngleX) + Math.abs(tiltAngleZ)) * 5;
                    // Add stress if this roller is in the tilt direction
                    
                    (halo.material as THREE.MeshBasicMaterial).opacity = Math.min(0.8, stress * 0.8 + tiltStress * 0.1);
                }
            });
        }

        // 2. 倾覆力矩模拟 (Tilt)
        // Apply tilt to the whole inner assembly relative to outer
        if (innerRingRef.current) {
             const tiltQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltAngleX * 0.05, 0, tiltAngleZ * 0.05));
             innerRingRef.current.quaternion.slerp(tiltQ, 0.1);
        }

        // 3. 磨损微粒
        if (debrisRef.current) {
            const mat = debrisRef.current.material as THREE.PointsMaterial;
            // Wear level 0-100 -> opacity 0-1
            // Lubrication low -> higher visibility of debris
            const visibility = (wearLevel / 100) * (1 - lubricationStatus + 0.2);
            mat.opacity = visibility;
            
            // Jitter particles
            const positions = debrisRef.current.geometry.attributes.position.array as Float32Array;
            for(let i=0; i<pCount; i++) {
                positions[i*3+1] += (Math.random()-0.5) * 0.02;
                // keep within bounds
                if (Math.abs(positions[i*3+1]) > 1) positions[i*3+1] *= 0.9;
            }
            debrisRef.current.geometry.attributes.position.needsUpdate = true;
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
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [rotationAngle, tiltAngleX, tiltAngleZ, wearLevel, stressHotspots, lubricationStatus, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
