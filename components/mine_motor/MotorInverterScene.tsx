
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MinePowerThreeProps } from './three-types';

export const MotorInverterScene: React.FC<MinePowerThreeProps> = ({ 
  components, 
  activeId, 
  onSelect,
  frequency,
  viewMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 核心光影方案 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // 主工业顶灯 (冷白)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 电机热感/电气紫氛围光
    const auraLight = new THREE.PointLight(0x8b5cf6, 8, 30);
    auraLight.position.set(-5, 5, 5);
    scene.add(auraLight);

    // --- 模型组建 ---
    const group = new THREE.Group();
    scene.add(group);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 1,
      roughness: 0.2,
      clearcoat: 1,
    });

    const activeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      metalness: 0.5
    });

    // 1. 大型矿用电机 (Mining Motor)
    const motorGroup = new THREE.Group();
    motorGroup.position.x = -6;
    group.add(motorGroup);

    // 电机外壳 (带有散热片感)
    const statorGeo = new THREE.CylinderGeometry(4, 4, 8, 32);
    const stator = new THREE.Mesh(statorGeo, activeId === 'MOTOR-01' ? activeMat : metalMat);
    stator.rotation.z = Math.PI / 2;
    stator.userData = { id: 'MOTOR-01' };
    motorGroup.add(stator);

    // 内部转子轴 (Rotor)
    const rotorGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 32);
    const rotor = new THREE.Mesh(rotorGeo, metalMat);
    rotor.rotation.z = Math.PI / 2;
    motorGroup.add(rotor);

    // 2. 变频器机柜 (Inverter Rack)
    const rackGroup = new THREE.Group();
    rackGroup.position.set(6, 0, 0);
    group.add(rackGroup);

    const cabinetGeo = new THREE.BoxGeometry(4, 10, 4);
    const cabinet = new THREE.Mesh(cabinetGeo, activeId === 'INV-RACK-01' ? activeMat : metalMat);
    cabinet.userData = { id: 'INV-RACK-01' };
    rackGroup.add(cabinet);

    // 内部功率模块 (模拟层级)
    for(let i=0; i<4; i++) {
        const modGeo = new THREE.BoxGeometry(3.5, 1.5, 3.8);
        const mod = new THREE.Mesh(modGeo, metalMat);
        mod.position.y = -3 + i * 2.2;
        cabinet.add(mod);
    }

    // --- 特效：磁场线 (Magnetic Field) ---
    const fieldCount = 20;
    const fieldLines: THREE.Line[] = [];
    if (viewMode === 'magnetic') {
        for (let i = 0; i < fieldCount; i++) {
            const curve = new THREE.EllipseCurve(0, 0, 5, 6, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(50);
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.3 });
            const line = new THREE.Line(geo, mat);
            line.rotation.y = (i / fieldCount) * Math.PI;
            line.position.x = -6;
            scene.add(line);
            fieldLines.push(line);
        }
    }

    // --- 交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([stator, cabinet]);
      if (intersects.length > 0 && intersects[0].object.userData.id) {
        onSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // 电机旋转模拟
      rotor.rotation.x += frequency * 0.01;
      
      if (viewMode === 'magnetic') {
          fieldLines.forEach((line, idx) => {
              line.scale.setScalar(1 + Math.sin(frame * 5 + idx) * 0.05);
          });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [frequency, viewMode, activeId]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
