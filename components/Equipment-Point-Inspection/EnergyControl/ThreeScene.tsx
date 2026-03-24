import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ loadFactor?: number }> = ({ loadFactor = 0.6 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ loadFactor });
  useEffect(() => {
    propsRef.current = { loadFactor };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Clear any existing canvas elements to prevent duplicates
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. 变电站地基 (发光网格)
    const grid = new THREE.GridHelper(30, 20, 0x1e3a8a, 0x0f172a);
    scene.add(grid);

    // 2. 主变压器组 (Hologram 风格)
    const createTransformer = (x: number, z: number) => {
      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(3, 2.5, 4);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.3,
        wireframe: true 
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      
      const coreGeo = new THREE.BoxGeometry(2.4, 2, 3.4);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9, roughness: 0.2 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      
      group.add(body, core);
      group.position.set(x, 1.25, z);
      return group;
    };

    const trans1 = createTransformer(-5, 0);
    const trans2 = createTransformer(5, 0);
    scene.add(trans1, trans2);

    // 3. 电力输送脉冲线 (弧形)
    const curves: THREE.CatmullRomCurve3[] = [];
    const pulseSpheres: THREE.Mesh[] = [];

    const createPulseLine = (start: THREE.Vector3, end: THREE.Vector3) => {
      const mid = new THREE.Vector3((start.x + end.x)/2, 6, (start.z + end.z)/2);
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      curves.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2 });
      scene.add(new THREE.Mesh(tubeGeo, tubeMat));

      const sphereGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);
      pulseSpheres.push(sphere);
    };

    createPulseLine(new THREE.Vector3(-5, 2.5, 0), new THREE.Vector3(5, 2.5, 0));
    createPulseLine(new THREE.Vector3(0, 0, 10), new THREE.Vector3(-5, 1.5, 0));
    createPulseLine(new THREE.Vector3(0, 0, 10), new THREE.Vector3(5, 1.5, 0));

    // 4. 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x8b5cf6, 2, 40);
    spotLight.position.set(10, 15, 10);
    scene.add(spotLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const time = Date.now() * 0.001;
      const currentLoadFactor = propsRef.current.loadFactor;
      
      // 脉冲点沿着曲线运动
      pulseSpheres.forEach((sphere, idx) => {
        const t = (time * (0.5 + currentLoadFactor) + idx * 0.3) % 1;
        const pos = curves[idx].getPointAt(t);
        sphere.position.copy(pos);
      });

      // 变压器呼吸效果
      trans1.scale.y = 1 + Math.sin(time * 2) * 0.02;
      trans2.scale.y = 1 + Math.cos(time * 2) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
