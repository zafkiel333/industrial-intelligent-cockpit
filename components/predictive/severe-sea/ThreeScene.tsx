
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SevereSeaAnimatables, SeaRiskViewMode } from './three-types';

interface ThreeSceneProps {
  waveHeight?: number; // 0-10m
  shipPitch?: number; // 模拟纵摇幅度
  rpm?: number;
  viewMode?: SeaRiskViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  waveHeight = 4.0,
  shipPitch = 0.5,
  rpm = 90,
  viewMode = 'propeller-racing'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a111c);
    scene.fog = new THREE.FogExp2(0x0a111c, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-20, 10, 20); // View from stern quarter

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 60;
    controls.minDistance = 10;

    // --- 暴风雨光效 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const lightningLight = new THREE.PointLight(0xa5f3fc, 0, 100);
    lightningLight.position.set(0, 30, 0);
    scene.add(lightningLight);

    const warningLight = new THREE.SpotLight(0xff0000, 0);
    warningLight.position.set(-10, 5, 0);
    warningLight.angle = 0.5;
    scene.add(warningLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: SevereSeaAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 动态海面 (Dynamic Sea Surface) ---
    const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f2436, 
        roughness: 0.1, 
        metalness: 0.6,
        wireframe: viewMode === 'hydro-elasticity',
        transparent: true,
        opacity: 0.9
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    scene.add(water);
    animatables.waterMesh = water;
    disposables.push(waterGeo, waterMat);

    // --- 2. 船艉结构 (Ship Stern) ---
    const shipGroup = new THREE.Group();
    group.add(shipGroup);
    animatables.shipStern = shipGroup;

    // 船体
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 0);
    hullShape.bezierCurveTo(5, 0, 10, 5, 12, 12); // Stern profile
    hullShape.lineTo(-20, 12);
    hullShape.lineTo(-20, 0);
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 8, bevelEnabled: false });
    hullGeo.translate(0, -5, -4); // Center it
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    shipGroup.add(hull);

    // 螺旋桨
    const propGroup = new THREE.Group();
    const hubGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 16);
    hubGeo.rotateZ(Math.PI/2);
    const propMat = new THREE.MeshStandardMaterial({ 
        color: 0xb45309, 
        metalness: 0.8, 
        roughness: 0.3,
        emissive: 0xff0000,
        emissiveIntensity: 0
    });
    const hub = new THREE.Mesh(hubGeo, propMat);
    propGroup.add(hub);

    const bladeGeo = new THREE.BoxGeometry(0.2, 3.5, 1.2);
    for(let i=0; i<4; i++) {
        const blade = new THREE.Mesh(bladeGeo, propMat);
        blade.rotation.x = (i * Math.PI) / 2;
        blade.rotation.y = 0.5;
        blade.position.y = Math.cos(i*Math.PI/2) * 1.5;
        blade.position.z = Math.sin(i*Math.PI/2) * 1.5;
        propGroup.add(blade);
    }
    propGroup.position.set(0, -3, 0); // Position under stern
    shipGroup.add(propGroup);
    animatables.propeller = propGroup as any; // Cast for rotation

    // 舵叶
    const rudderGeo = new THREE.BoxGeometry(3, 5, 0.5);
    const rudder = new THREE.Mesh(rudderGeo, hullMat);
    rudder.position.set(2, -3, 0);
    shipGroup.add(rudder);
    animatables.rudder = rudder;

    // --- 3. 冲击波特效 (Impact Shock) ---
    const shockGeo = new THREE.RingGeometry(1, 6, 32);
    shockGeo.rotateY(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const shock = new THREE.Mesh(shockGeo, shockMat);
    shock.position.set(0, -3, 0);
    shipGroup.add(shock);
    animatables.shockWave = shock;

    // --- 4. 飞溅粒子 (Spray) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100; // Hide initially
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.2, transparent: true, opacity: 0.6 });
    const spray = new THREE.Points(pGeo, pMat);
    scene.add(spray); // World space for spray
    animatables.sprayParticles = spray;

    let time = 0;
    let animationId: number;

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        // 1. 模拟海浪 (Wave Motion)
        if (animatables.waterMesh) {
            const pos = animatables.waterMesh.geometry.attributes.position;
            const vertex = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++) {
                vertex.fromBufferAttribute(pos, i);
                // 叠加正弦波模拟不规则海浪
                const z = 
                    Math.sin(vertex.x * 0.2 + time) * waveHeight * 0.5 +
                    Math.cos(vertex.y * 0.15 + time * 1.2) * waveHeight * 0.3;
                pos.setZ(i, z);
            }
            pos.needsUpdate = true;
        }

        // 2. 船体运动 (Ship Motions)
        if (animatables.shipStern) {
            // Pitch (纵摇) & Heave (垂荡)
            const pitch = Math.sin(time * 0.8) * shipPitch * 0.2;
            const heave = Math.cos(time * 0.8 + 0.5) * waveHeight * 0.4;
            
            animatables.shipStern.rotation.z = pitch; // Along Z axis for side view pitch
            animatables.shipStern.position.y = heave;

            // 螺旋桨深度检测
            const propDepth = heave + (-3); // Prop center Y relative to calm water
            const waterLevelAtProp = Math.sin(0 * 0.2 + time) * waveHeight * 0.5; // Water level at X=0
            
            const immersion = waterLevelAtProp - propDepth;

            // 3. 螺旋桨飞车/出水逻辑 (Propeller Racing)
            if (immersion < 1.0) { // Propeller nearing surface
                 // 飞车加速
                 if (animatables.propeller) animatables.propeller.rotation.x += (rpm / 60) * 0.3;
                 
                 // 变红警告
                 if (animatables.propeller) {
                    // Accessing children materials
                    (animatables.propeller as any).children.forEach((c: any) => {
                         c.material.emissiveIntensity = 1.0 - Math.max(0, immersion);
                    });
                 }
                 warningLight.intensity = 2;
            } else {
                 // 正常转速
                 if (animatables.propeller) animatables.propeller.rotation.x += (rpm / 60) * 0.1;
                 if (animatables.propeller) {
                    (animatables.propeller as any).children.forEach((c: any) => {
                         c.material.emissiveIntensity = 0;
                    });
                 }
                 warningLight.intensity = 0;
            }

            // 4. 入水冲击 (Slamming)
            if (immersion > 3.0 && Math.sin(time * 0.8) < -0.8) {
                if (animatables.shockWave) {
                    animatables.shockWave.scale.x += 0.5;
                    animatables.shockWave.scale.y += 0.5;
                    (animatables.shockWave.material as THREE.MeshBasicMaterial).opacity = 1 - (animatables.shockWave.scale.x / 10);
                    if (animatables.shockWave.scale.x > 10) {
                        animatables.shockWave.scale.set(1,1,1);
                    }
                }
            } else {
                if (animatables.shockWave) (animatables.shockWave.material as THREE.MeshBasicMaterial).opacity = 0;
            }
        }

        // 5. 闪电效果
        if (Math.random() > 0.99) {
            lightningLight.intensity = 20;
            scene.background = new THREE.Color(0x1e293b);
        } else {
            lightningLight.intensity *= 0.9;
            scene.background = new THREE.Color(0x0a111c);
        }

        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        if (mountRef.current?.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
        }
        disposables.forEach(d => d?.dispose());
        renderer.dispose();
    };
  }, [waveHeight, shipPitch, rpm, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
