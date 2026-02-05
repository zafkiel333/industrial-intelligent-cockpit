import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencyThreeProps } from './three-types';

export const EmergencyThreeScene: React.FC<EmergencyThreeProps> = ({ 
  alerts = [
    { id: '1', position: [-3, 0, -2], level: 'P1' },
    { id: '2', position: [4, 0, 3], level: 'P2' },
    { id: '3', position: [0, 0, -5], level: 'P1' }
  ],
  onAlertSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Environment
    const grid = new THREE.GridHelper(20, 40, 0xef4444, 0x111827);
    grid.position.y = -0.01;
    scene.add(grid);

    // Glowing Base
    const baseGeo = new THREE.CylinderGeometry(10, 10, 0.2, 6, 1);
    const baseMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      transparent: true, 
      opacity: 0.8,
      wireframe: true 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.1;
    scene.add(base);

    // Alert Markers Group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const alertMeshes: THREE.Mesh[] = [];

    alerts.forEach(alert => {
        const height = alert.level === 'P1' ? 4 : 2;
        const color = alert.level === 'P1' ? 0xef4444 : 0xf59e0b;
        
        // Pulsating Tower
        const towerGeo = new THREE.CylinderGeometry(0.1, 0.5, height, 32, 1, true);
        const towerMat = new THREE.MeshBasicMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(alert.position[0], height/2, alert.position[2]);
        tower.userData = { id: alert.id };
        markersGroup.add(tower);
        alertMeshes.push(tower);

        // Ground Ripple
        const ringGeo = new THREE.TorusGeometry(1, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI/2;
        ring.position.set(alert.position[0], 0.05, alert.position[2]);
        markersGroup.add(ring);
        (ring as any).userData = { isRipple: true, speed: 0.02 + Math.random() * 0.02 };
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const redPoint = new THREE.PointLight(0xef4444, 10, 20);
    redPoint.position.set(0, 5, 0);
    scene.add(redPoint);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(alertMeshes);
        if (intersects.length > 0) {
            onAlertSelect?.(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.05;

      markersGroup.children.forEach((child: any) => {
          if (child.userData.isRipple) {
              child.scale.setScalar(1 + Math.sin(frame * child.userData.speed) * 0.5);
              child.material.opacity = 1 - (child.scale.x - 0.5) / 1.5;
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || width;
      const h = mountRef.current?.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [alerts, onAlertSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};