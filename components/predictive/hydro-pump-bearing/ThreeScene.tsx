import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpBearingSceneProps } from './three-types';

export const PumpBearingScene: React.FC<PumpBearingSceneProps> = ({ 
  rpm,
  bearingTempUpper,
  bearingTempLower,
  impellerWear,
  vibrationAmp,
  showHousing = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shaftGroupRef = useRef<THREE.Group | null>(null);
  const upperBearingRef = useRef<THREE.Mesh | null>(null);
  const lowerBearingRef = useRef<THREE.Mesh | null>(null);
  const impellerRef = useRef<THREE.Mesh | null>(null);
  const housingRef = useRef<THREE.Group | null>(null);

  const propsRef = useRef({
    rpm,
    bearingTempUpper,
    bearingTempLower,
    impellerWear,
    vibrationAmp,
    showHousing
  });
  
  useEffect(() => {
    propsRef.current = {
      rpm,
      bearingTempUpper,
      bearingTempLower,
      impellerWear,
      vibrationAmp,
      showHousing
    };
  }, [rpm, bearingTempUpper, bearingTempLower, impellerWear, vibrationAmp, showHousing]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.04); // 雾效保留，仅调光线

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    // 调整1：提升曝光度（核心提亮手段，不修改材质）
    renderer.toneMappingExposure = 1.8; 

    console.log("=== hydro-pump-bearing excute clear canvas ===");
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights 光线调整核心区域 ---
    // 调整2：提升环境光强度（基础补光，让暗部不那么黑）
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); 
    scene.add(ambientLight);

    // 调整3：提升聚光灯强度+优化参数（主光源增强）
    const spotLight = new THREE.SpotLight(0xffffff, 4); 
    spotLight.position.set(10, 20, 5);
    spotLight.angle = 0.6; // 扩大光照角度
    spotLight.penumbra = 0.2; // 增加半影效果，过渡更自然
    spotLight.distance = 50; // 延长光照距离
    spotLight.decay = 1.2; // 降低衰减速度
    scene.add(spotLight);

    // 调整4：新增方向补光（补充侧面/底部光照，避免局部过暗）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(-8, 10, -8); // 与聚光灯形成对角，补全阴影/暗部
    directionalLight.castShadow = false; // 关闭阴影避免性能损耗
    scene.add(directionalLight);

    // 报警红灯保留（强度0不影响）
    const redLight = new THREE.PointLight(0xff0000, 0, 20);
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    // --- Materials 材质完全保留，无任何修改 ---
    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, metalness: 0.8, roughness: 0.3 
    });
    
    const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0xcd7f32, metalness: 0.6, roughness: 0.4
    });

    const housingMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });

    const wornBronzeMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513, metalness: 0.2, roughness: 0.9
    });

    // --- Geometry 模型几何完全保留 ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const shaftGroup = new THREE.Group();
    shaftGroupRef.current = shaftGroup;
    mainGroup.add(shaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    const shaft = new THREE.Mesh(shaftGeo, steelMat);
    shaftGroup.add(shaft);

    const impellerGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 16);
    const bladeGeo = new THREE.BoxGeometry(0.2, 0.8, 2.8);
    
    const impellerMesh = new THREE.Mesh(impellerGeo, bronzeMat);
    impellerMesh.position.y = -5;
    impellerRef.current = impellerMesh;
    shaftGroup.add(impellerMesh);
    
    for(let i=0; i<6; i++) {
        const blade = new THREE.Mesh(bladeGeo, bronzeMat);
        blade.position.set(Math.cos(i*Math.PI/3)*1.5, 0, Math.sin(i*Math.PI/3)*1.5);
        blade.rotation.y = -i*Math.PI/3 + 0.5;
        impellerMesh.add(blade);
    }

    const bearingGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32);
    const bearingUpper = new THREE.Mesh(bearingGeo, steelMat.clone());
    bearingUpper.position.y = 3;
    upperBearingRef.current = bearingUpper;
    mainGroup.add(bearingUpper);

    const bearingLower = new THREE.Mesh(bearingGeo, steelMat.clone());
    bearingLower.position.y = -2;
    lowerBearingRef.current = bearingLower;
    mainGroup.add(bearingLower);

    const housingG = new THREE.Group();
    housingRef.current = housingG;
    mainGroup.add(housingG);

    const motorGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
    const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    motor.position.y = 6.5;
    housingG.add(motor);

    const guardGeo = new THREE.CylinderGeometry(1.2, 1.2, 8, 32, 1, true);
    const guard = new THREE.Mesh(guardGeo, housingMat);
    guard.position.y = 1;
    housingG.add(guard);

    const voluteGeo = new THREE.TorusGeometry(3.5, 1.5, 16, 32);
    const volute = new THREE.Mesh(voluteGeo, housingMat);
    volute.rotation.x = Math.PI/2;
    volute.position.y = -5;
    housingG.add(volute);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      const { rpm, bearingTempUpper, bearingTempLower, impellerWear, vibrationAmp, showHousing } = propsRef.current;

      if (shaftGroupRef.current) {
          shaftGroupRef.current.rotation.y -= (rpm / 60) * 0.1;
          const shake = vibrationAmp * 0.05;
          shaftGroupRef.current.position.x = Math.sin(time * 50) * shake;
          shaftGroupRef.current.position.z = Math.cos(time * 50) * shake;
      }

      const updateHeat = (mesh: THREE.Mesh | null, temp: number) => {
          if (!mesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const tNorm = Math.min(1, Math.max(0, (temp - 40) / 80));
          const color = new THREE.Color().setHSL(0.6 - tNorm * 0.6, 1.0, 0.5);
          mat.color.lerp(color, 0.1);
          mat.emissive.copy(color);
          mat.emissiveIntensity = tNorm * 0.8;
      };
      updateHeat(upperBearingRef.current, bearingTempUpper);
      updateHeat(lowerBearingRef.current, bearingTempLower);

      if (impellerRef.current) {
          const mat = impellerRef.current.material as THREE.MeshStandardMaterial;
          if (impellerWear > 50) {
             mat.color.lerp(new THREE.Color(0x5D4037), 0.1);
             mat.roughness = 0.9;
          } else {
             mat.color.lerp(new THREE.Color(0xcd7f32), 0.1);
             mat.roughness = 0.4;
          }
          impellerRef.current.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                  const cMat = child.material as THREE.MeshStandardMaterial;
                  cMat.copy(mat);
              }
          });
      }

      if (housingRef.current) {
          housingRef.current.visible = showHousing;
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
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};