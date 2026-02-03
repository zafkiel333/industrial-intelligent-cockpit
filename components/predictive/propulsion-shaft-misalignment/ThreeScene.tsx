import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaftAlignmentAnimatables } from './three-types';

interface ThreeSceneProps {
  misalignmentFactor?: number; // 0 (Ideal) to 1 (Critical)
  viewMode?: 'standard' | 'xray';
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  misalignmentFactor = 0.3,
  viewMode = 'standard'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(18, 12, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 光影环境 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const topLight = new THREE.DirectionalLight(0xffffff, 2);
    topLight.position.set(5, 20, 10);
    scene.add(topLight);

    const greenPoint = new THREE.PointLight(0x10b981, 15, 50);
    greenPoint.position.set(-10, 5, 5);
    scene.add(greenPoint);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const animatables: ShaftAlignmentAnimatables = { shaftSegments: [], flangeConnections: [] };
    const disposables: any[] = [];

    // --- 1. 理想中心基准线 (Laser Baseline) ---
    const linePoints = [new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x22d3ee, dashSize: 0.5, gapSize: 0.2 });
    const baseline = new THREE.Line(lineGeo, lineMat);
    baseline.computeLineDistances();
    scene.add(baseline);
    disposables.push(lineGeo, lineMat);

    // --- 2. 分段轴系模型 (Segmented Shaft) ---
    const segmentConfigs = [
        { len: 5, radius: 0.6, name: 'MainEngine' },
        { len: 8, radius: 0.5, name: 'Intermediate' },
        { len: 7, radius: 0.5, name: 'TailShaft' }
    ];

    let currentX = -12;
    segmentConfigs.forEach((config, idx) => {
        const segGroup = new THREE.Group();
        segGroup.position.x = currentX + config.len / 2;
        
        // 几何偏差：随不对中系数增加位移和旋转
        if (idx > 0) {
            segGroup.position.y = (idx * 0.15) * misalignmentFactor;
            segGroup.rotation.z = (idx * 0.02) * misalignmentFactor;
        }

        const geo = new THREE.CylinderGeometry(config.radius, config.radius, config.len, 32);
        geo.rotateZ(Math.PI / 2);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x475569, 
            metalness: 0.9, 
            roughness: 0.2,
            transparent: viewMode === 'xray',
            opacity: viewMode === 'xray' ? 0.3 : 1
        });
        const mesh = new THREE.Mesh(geo, mat);
        segGroup.add(mesh);
        
        mainGroup.add(segGroup);
        animatables.shaftSegments?.push(segGroup);
        disposables.push(geo, mat);

        // 法兰盘连接处 (Flanges)
        if (idx < segmentConfigs.length - 1) {
            const fGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.4, 32);
            fGeo.rotateZ(Math.PI / 2);
            const fMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
            const flange = new THREE.Mesh(fGeo, fMat);
            flange.position.x = config.len / 2;
            segGroup.add(flange);
            disposables.push(fGeo, fMat);
        }

        currentX += config.len;
    });

    // --- 3. 轴承支座 (Bearing Pedestals) ---
    const bPositions = [-12, -7, 1, 9, 13];
    bPositions.forEach((pos, idx) => {
        const bGeo = new THREE.BoxGeometry(1.2, 2, 2);
        const bMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.set(pos, -1.2, 0);
        mainGroup.add(b);
        disposables.push(bGeo, bMat);

        // 偏差提示标签
        const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
        ringGeo.rotateY(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: misalignmentFactor > 0.6 ? 0xef4444 : 0x22d3ee, 
            transparent: true, 
            opacity: 0.4 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(pos, 0, 0);
        mainGroup.add(ring);
        disposables.push(ringGeo, ringMat);
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 轴系旋转模拟
      animatables.shaftSegments?.forEach((seg, i) => {
          seg.rotation.x += 0.05;
          // 不对中引起的涡动效果 (Whirling)
          if (misalignmentFactor > 0.4) {
              const wobble = (i * 0.02) * misalignmentFactor;
              seg.position.y += Math.sin(time * 10 + i) * wobble * 0.01;
              seg.position.z += Math.cos(time * 10 + i) * wobble * 0.01;
          }
      });

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
  }, [misalignmentFactor, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};