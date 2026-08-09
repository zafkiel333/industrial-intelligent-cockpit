import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RobotStatus } from './three-types';

interface ThreeSceneProps {
  status: RobotStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<RobotStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // Robot Model (Simplified 6-axis)
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const baseGeom = new THREE.CylinderGeometry(3, 3, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    robotGroup.add(base);

    // Joint 1
    const j1Group = new THREE.Group();
    j1Group.position.y = 0.5;
    robotGroup.add(j1Group);

    const j1Geom = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const j1Mat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const j1 = new THREE.Mesh(j1Geom, j1Mat);
    j1Group.add(j1);

    // Arm 1
    const arm1Geom = new THREE.BoxGeometry(1, 6, 1);
    const arm1 = new THREE.Mesh(arm1Geom, j1Mat);
    arm1.position.y = 3;
    j1Group.add(arm1);

    // Joint 2
    const j2Group = new THREE.Group();
    j2Group.position.y = 6;
    j1Group.add(j2Group);

    const j2Geom = new THREE.SphereGeometry(1.2, 32, 32);
    const j2Mat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.2 });
    const j2 = new THREE.Mesh(j2Geom, j2Mat);
    j2Group.add(j2);

    // Arm 2
    const arm2Geom = new THREE.BoxGeometry(1, 5, 1);
    const arm2 = new THREE.Mesh(arm2Geom, j1Mat);
    arm2.position.y = 2.5;
    j2Group.add(arm2);

    // Joint 3
    const j3Group = new THREE.Group();
    j3Group.position.y = 5;
    j2Group.add(j3Group);

    const j3Geom = new THREE.SphereGeometry(1, 32, 32);
    const j3 = new THREE.Mesh(j3Geom, j2Mat);
    j3Group.add(j3);

    // End Effector
    const toolGeom = new THREE.ConeGeometry(0.5, 1.5, 32);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 0.5 });
    const tool = new THREE.Mesh(toolGeom, toolMat);
    tool.position.y = 1.5;
    j3Group.add(tool);

    // Wear Indicators (Glow spheres at joints)
    const indicators = [j1, j2, j3].map((j, i) => {
      const g = new THREE.SphereGeometry(0.5, 16, 16);
      const m = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(g, m);
      j.add(mesh);
      return m;
    });

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x00ffff, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      if (s.isMoving) {
        j1Group.rotation.y = Math.sin(time) * 0.5;
        j2Group.rotation.z = Math.cos(time * 0.8) * 0.3;
        j3Group.rotation.z = Math.sin(time * 1.2) * 0.4;
      }

      // Wear visual feedback
      indicators.forEach((m, i) => {
        const wear = s.jointWear[i] || 0;
        if (wear > 0.7) {
          m.color.setHex(0xff0000);
          m.opacity = 0.5 + Math.sin(time * 10) * 0.5;
        } else if (wear > 0.4) {
          m.color.setHex(0xffff00);
          m.opacity = 0.8;
        } else {
          m.color.setHex(0x00ff00);
          m.opacity = 0.4;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
