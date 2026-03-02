import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DegradationSceneProps } from './three-types';

export const DegradationEvolutionScene: React.FC<DegradationSceneProps> = ({ 
  currentPoint, 
  historyPath, 
  predictionPaths,
  showEnvelope = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pathGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const currentMarkerRef = useRef<THREE.Mesh | null>(null);
  
  // 2026.02.28 - Bug修复：使用ref缓存实时更新的props值，避免依赖项变化触发useEffect重渲染
  // Bug情况：3D模型频繁闪烁，useEffect因依赖项（currentPoint/historyPath/predictionPaths/showEnvelope）反复变化被频繁触发
  // Bug原因：依赖项为引用类型（数组/对象），每次父组件渲染都会生成新引用，导致useEffect反复执行，3D场景被重复初始化
  const propsRef = useRef({
    currentPoint,
    historyPath,
    predictionPaths,
    showEnvelope
  });
  // 实时更新ref中的props值，不触发useEffect
  useEffect(() => {
    propsRef.current = {
      currentPoint,
      historyPath,
      predictionPaths,
      showEnvelope
    };
  }, [currentPoint, historyPath, predictionPaths, showEnvelope]);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===hydro-degradation useEffect===");
    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 5, 0);

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

    // --- Helpers ---
    // Axes Helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x333333, 0x111111);
    scene.add(gridHelper);

    // Labels (Using Sprites for simplicity or just knowing X=Load, Y=Vib, Z=Temp)
    
    // --- Data Objects ---
    
    // 1. History Path (Line)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 2 });
    const lineGeo = new THREE.BufferGeometry();
    pathGeoRef.current = lineGeo;
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    // 2. Current State Marker (Glowing Sphere)
    const markerGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    scene.add(marker);
    currentMarkerRef.current = marker;

    // Glow effect for marker
    const glowGeo = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png'),
        color: 0x0ea5e9,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Sprite(glowGeo);
    glow.scale.set(4, 4, 1);
    marker.add(glow);

    // 3. Prediction Paths (Faint Lines)
    const predGroup = new THREE.Group();
    scene.add(predGroup);

    // 4. Safety Envelope (Wireframe Box/Sphere representing limits)
    // 2026.02.28 - 从propsRef读取showEnvelope值，避免直接依赖
    if (propsRef.current.showEnvelope) {
        const envGeo = new THREE.BoxGeometry(15, 10, 15);
        const envMat = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.1 
        });
        const envelope = new THREE.Mesh(envGeo, envMat);
        envelope.position.set(5, 5, 5); // Offset center
        scene.add(envelope);
    }

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // 2026.02.28 - 从propsRef读取实时props值，而非直接依赖
      const { currentPoint: latestPoint, historyPath: latestHistory, predictionPaths: latestPreds } = propsRef.current;

      // Update Geometry based on props
      if (pathGeoRef.current && latestHistory.length > 0) {
          const points = latestHistory.map(p => new THREE.Vector3(p.x, p.y, p.z));
          pathGeoRef.current.setFromPoints(points);
      }

      if (currentMarkerRef.current) {
          currentMarkerRef.current.position.set(latestPoint.x, latestPoint.y, latestPoint.z);
          // Pulse effect
          const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
          currentMarkerRef.current.scale.set(scale, scale, scale);
      }

      // Rebuild predictions if needed (simplified here, ideally use ref to avoid rebuild)
      predGroup.clear();
      latestPreds.forEach((path, i) => {
          const pts = path.map(p => new THREE.Vector3(p.x, p.y, p.z));
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          // Fade color based on index
          const mat = new THREE.LineBasicMaterial({ 
              color: i === 0 ? 0xf59e0b : 0xef4444, // 0=Likely(Orange), Others=Risk(Red)
              transparent: true, 
              opacity: 0.3 
          });
          const l = new THREE.Line(geo, mat);
          predGroup.add(l);
      });

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
  }, []); // 2026.02.28 - 清空依赖项，避免useEffect反复触发

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};