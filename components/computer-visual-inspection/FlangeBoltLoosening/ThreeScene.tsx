import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlangeStatus } from './three-types';

interface ThreeSceneProps {
  status: FlangeStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);

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

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f2ff, 2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x7000ff, 2);
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

    // Flange Model
    const flangeGroup = new THREE.Group();
    scene.add(flangeGroup);

    // Main Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.x = Math.PI / 2;
    flangeGroup.add(pipe);

    // Flange Plates
    const plateGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.2, 32);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.1
    });
    
    const plate1 = new THREE.Mesh(plateGeo, plateMat);
    plate1.rotation.x = Math.PI / 2;
    plate1.position.z = 0.1;
    flangeGroup.add(plate1);

    const plate2 = new THREE.Mesh(plateGeo, plateMat);
    plate2.rotation.x = Math.PI / 2;
    plate2.position.z = -0.1;
    flangeGroup.add(plate2);

    // Bolts
    const bolts: THREE.Mesh[] = [];
    const boltCount = 12;
    const boltRadius = 1.1;
    const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
    
    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      
      bolt.position.x = Math.cos(angle) * boltRadius;
      bolt.position.y = Math.sin(angle) * boltRadius;
      bolt.rotation.x = Math.PI / 2;
      
      flangeGroup.add(bolt);
      bolts.push(bolt);

      // Add a small "marking line" on the bolt
      const markGeo = new THREE.BoxGeometry(0.02, 0.1, 0.21);
      const markMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const mark = new THREE.Mesh(markGeo, markMat);
      mark.position.y = 0.05;
      bolt.add(mark);
    }

    // Leak Particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = Math.random() * 0.2;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f2ff,
      size: 0.05,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const leakPoints = new THREE.Points(particles, particleMat);
    scene.add(leakPoints);

    // Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0x00f2ff, 0x1e293b);
    grid.position.y = -2;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      const currentStatus = statusRef.current;

      // Update bolt visual status
      bolts.forEach((bolt, idx) => {
        const boltMat = bolt.material as THREE.MeshStandardMaterial;
        const mark = bolt.children[0] as THREE.Mesh;
        
        if (currentStatus.looseBolts.includes(idx)) {
          boltMat.color.setHex(0xff4444);
          mark.rotation.z = Math.sin(Date.now() * 0.01) * 0.5; // Misaligned mark
          bolt.position.z = Math.sin(Date.now() * 0.005) * 0.05; // Loose vibration
        } else {
          boltMat.color.setHex(0x94a3b8);
          mark.rotation.z = 0;
          bolt.position.z = 0;
        }
      });

      // Update leak particles
      if (currentStatus.isLeaking) {
        particleMat.opacity = 0.6;
        const pos = particles.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += velocities[i * 3];
          pos[i * 3 + 1] += velocities[i * 3 + 1];
          pos[i * 3 + 2] += velocities[i * 3 + 2];

          if (Math.abs(pos[i * 3]) > 2 || Math.abs(pos[i * 3 + 1]) > 2 || pos[i * 3 + 2] > 3) {
            pos[i * 3] = 0;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = 0;
          }
        }
        particles.attributes.position.needsUpdate = true;
      } else {
        particleMat.opacity = 0;
      }

      // Vibration effect on the whole flange
      flangeGroup.position.y = Math.sin(Date.now() * 0.02) * currentStatus.vibration * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array as per requirements

  return <div ref={containerRef} className="w-full h-full" />;
};
