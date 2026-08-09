import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SpillwayProps } from './three-types';

export const ThreeScene: React.FC<SpillwayProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0e17');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(30, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 30, 10);
    scene.add(directionalLight);

    // Spillway Structure
    const spillwayGroup = new THREE.Group();
    
    // Main channel
    const channelGeo = new THREE.BoxGeometry(20, 2, 40);
    const channelMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const channel = new THREE.Mesh(channelGeo, channelMat);
    channel.rotation.x = Math.PI / 12; // Sloped
    spillwayGroup.add(channel);

    // Side walls
    const wallGeo = new THREE.BoxGeometry(2, 10, 40);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
    
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-11, 4, 0);
    leftWall.rotation.x = Math.PI / 12;
    spillwayGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(11, 4, 0);
    rightWall.rotation.x = Math.PI / 12;
    spillwayGroup.add(rightWall);

    // Erosion overlay
    const erosionGeo = new THREE.PlaneGeometry(19.8, 39.8, 32, 32);
    const erosionMat = new THREE.MeshBasicMaterial({
      color: 0x8b4513,
      transparent: true,
      opacity: 0,
    });
    const erosion = new THREE.Mesh(erosionGeo, erosionMat);
    erosion.rotation.x = -Math.PI / 2;
    erosion.position.y = 1.1;
    channel.add(erosion);

    scene.add(spillwayGroup);

    // Water flow particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 18; // x
      posArray[i+1] = Math.random() * 2; // y
      posArray[i+2] = (Math.random() - 0.5) * 40; // z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.rotation.x = Math.PI / 12;
    particles.position.y = 1;
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { flowRate, erosionLevel, isAlert } = propsRef.current;

      // Water flow animation
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for(let i = 2; i < particleCount * 3; i += 3) {
        pPositions[i] += (flowRate / 100) * 2;
        if (pPositions[i] > 20) {
          pPositions[i] = -20;
          pPositions[i-2] = (Math.random() - 0.5) * 18; // reset x
          pPositions[i-1] = Math.random() * 2; // reset y
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Erosion visualization
      erosionMat.opacity = (erosionLevel / 100) * 0.8;
      
      if (isAlert) {
        particleMat.color.setHex(0xff5500); // Danger water color
      } else {
        particleMat.color.setHex(0x00ffff); // Normal water color
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
