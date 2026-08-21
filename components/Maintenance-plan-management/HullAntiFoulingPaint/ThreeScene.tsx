import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HullAntiFoulingPaintProps } from './three-types';

export const ThreeScene: React.FC<HullAntiFoulingPaintProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 15, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Industrial dock lighting
    const spotLight1 = new THREE.SpotLight(0xffffff, 1.5);
    spotLight1.position.set(20, 30, 20);
    spotLight1.angle = Math.PI / 4;
    scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0xffffff, 1.5);
    spotLight2.position.set(-20, 30, -20);
    spotLight2.angle = Math.PI / 4;
    scene.add(spotLight2);

    // Dry Dock Structure
    const dockGeo = new THREE.BoxGeometry(60, 10, 30);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.y = -5;
    scene.add(dock);

    // Ship Hull (Simplified shape)
    const hullGroup = new THREE.Group();
    
    // Base hull (old paint/primer)
    const hullGeo = new THREE.CylinderGeometry(5, 8, 40, 32, 1, false, 0, Math.PI);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.8 }); // Old rusty red
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.z = Math.PI / 2;
    hull.rotation.x = Math.PI; // Flip so flat part is up (deck)
    hull.position.y = 5;
    hullGroup.add(hull);

    // New Paint Layer (Slightly larger, uses clipping plane to reveal)
    const paintMat = new THREE.MeshStandardMaterial({ 
        color: 0xcc2222, // Fresh anti-fouling red
        roughness: 0.4,
        side: THREE.DoubleSide
    });
    const paintHull = new THREE.Mesh(hullGeo, paintMat);
    paintHull.rotation.z = Math.PI / 2;
    paintHull.rotation.x = Math.PI;
    paintHull.position.y = 5;
    paintHull.scale.set(1.01, 1.01, 1.01); // Slightly larger to cover old hull
    
    // Setup clipping plane for paint progress
    const localPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -20); // Start at one end
    renderer.localClippingEnabled = true;
    paintMat.clippingPlanes = [localPlane];

    hullGroup.add(paintHull);
    scene.add(hullGroup);

    // Painting Robot / Scaffolding
    const robotGeo = new THREE.BoxGeometry(2, 12, 4);
    const robotMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const robot = new THREE.Mesh(robotGeo, robotMat);
    robot.position.set(-20, 5, 9); // Start position
    scene.add(robot);

    // Spray particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const particlePos = new Float32Array(particleCount * 3);
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xcc2222, size: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.visible = false;
    scene.add(particles);

    // Grid
    const gridHelper = new THREE.GridHelper(60, 60, 0x444444, 0x222222);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { paintProgress, isPainting, humidity } = propsRef.current;

      // Update clipping plane based on progress (0 to 100 maps to -20 to 20 on X axis)
      const targetX = -20 + (paintProgress / 100) * 40;
      localPlane.constant = targetX;

      if (isPainting) {
        // Move robot along the hull
        robot.position.x = targetX;
        
        // Robot moves up and down slightly to simulate spraying
        robot.position.y = 5 + Math.sin(time * 5) * 2;

        // Show and animate spray particles
        particles.visible = true;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i < particleCount; i++) {
            positions[i*3] = robot.position.x + (Math.random() - 0.5);
            positions[i*3+1] = robot.position.y + (Math.random() - 0.5) * 2;
            positions[i*3+2] = robot.position.z - 1 - Math.random() * 2; // Spray towards hull
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Visual effect of high humidity (paint looks glossier/wetter)
        paintMat.roughness = 0.4 - (humidity / 100) * 0.3;

      } else {
        particles.visible = false;
        robot.position.x = targetX; // Stay at current progress
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      
      cancelAnimationFrame(animationId);
      renderer.localClippingEnabled = false;
      renderer.dispose();
      dockGeo.dispose();
      dockMat.dispose();
      hullGeo.dispose();
      hullMat.dispose();
      paintMat.dispose();
      robotGeo.dispose();
      robotMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
