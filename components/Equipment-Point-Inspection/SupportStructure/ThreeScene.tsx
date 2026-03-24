import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const ThreeScene: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ progress });
  useEffect(() => {
    propsRef.current = { progress };
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);

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

    // 1. 创建拱形巷道 (透明材质以体现内部巡检)
    const tunnelGeo = new THREE.CylinderGeometry(5, 5, 30, 32, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.2,
      wireframe: true 
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    scene.add(tunnel);

    // 2. 锚杆阵列 (支护核心)
    const bolts = new THREE.Group();
    const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5);
    const boltHeadGeo = new THREE.SphereGeometry(0.15, 8, 8);
    
    for (let z = -12; z <= 12; z += 3) {
      for (let angle = 0.4; angle < Math.PI - 0.4; angle += 0.6) {
        const x = Math.cos(angle) * 5;
        const y = Math.sin(angle) * 5;
        
        const isWarning = Math.random() > 0.85;
        const color = isWarning ? 0xfb923c : 0x38bdf8;
        
        const bolt = new THREE.Mesh(boltGeo, new THREE.MeshStandardMaterial({ color }));
        bolt.position.set(z, y - 1.25, x);
        bolt.rotation.x = angle - Math.PI/2;
        
        const head = new THREE.Mesh(boltHeadGeo, new THREE.MeshBasicMaterial({ color }));
        head.position.set(z, y, x);
        
        // 如果是异常点，添加发光环
        if (isWarning) {
            const glowGeo = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
            const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
            glow.position.copy(head.position);
            glow.rotation.x = angle;
            scene.add(glow);
        }

        bolts.add(bolt, head);
      }
    }
    scene.add(bolts);

    // 3. 巡检机器人
    const robot = new THREE.Group();
    const robotBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    robot.add(robotBody);
    // 扫描灯光
    const scanLight = new THREE.SpotLight(0x38bdf8, 5, 8, Math.PI/4);
    scanLight.position.set(0, 0.5, 0);
    scanLight.target.position.set(0, 5, 0);
    robot.add(scanLight, scanLight.target);
    scene.add(robot);

    // 4. 环境灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();

      const currentProgress = propsRef.current.progress;

      // 模拟机器人巡检移动
      const time = Date.now() * 0.001;
      robot.position.x = Math.sin(time * 0.5) * 12;
      robot.position.y = 0.5;
      
      // Update robot position based on progress if needed
      // robot.position.z = -12 + (24 * (currentProgress / 100));

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
