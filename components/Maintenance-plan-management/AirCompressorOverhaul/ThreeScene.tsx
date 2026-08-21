import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AirCompressorOverhaulProps } from './three-types';

export const ThreeScene: React.FC<AirCompressorOverhaulProps> = (props) => {
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

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffff, 3, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // Compressor Group
    const compressorGroup = new THREE.Group();
    scene.add(compressorGroup);

    // Casing
    const casingGeo = new THREE.CylinderGeometry(4, 4, 12, 32);
    casingGeo.rotateZ(Math.PI / 2);
    const casingMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x223344, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    compressorGroup.add(casing);

    // Twin Screws (Male and Female rotors)
    const screwGroup = new THREE.Group();
    compressorGroup.add(screwGroup);

    const createScrew = (color: number, radius: number, length: number, twists: number) => {
      const geo = new THREE.CylinderGeometry(radius, radius, length, 32, 32);
      // Twist the vertices to create a helical shape
      const posAttribute = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttribute.count; i++) {
        v.fromBufferAttribute(posAttribute, i);
        const angle = (v.y / length) * Math.PI * 2 * twists;
        const x = v.x * Math.cos(angle) - v.z * Math.sin(angle);
        const z = v.x * Math.sin(angle) + v.z * Math.cos(angle);
        posAttribute.setXYZ(i, x, v.y, z);
      }
      geo.computeVertexNormals();
      geo.rotateZ(Math.PI / 2);
      
      const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.3 });
      return new THREE.Mesh(geo, mat);
    };

    const maleRotor = createScrew(0xaaaaaa, 1.5, 10, 3);
    maleRotor.position.set(0, 0, 1.2);
    screwGroup.add(maleRotor);

    const femaleRotor = createScrew(0x8899aa, 1.5, 10, -3);
    femaleRotor.position.set(0, 0, -1.2);
    screwGroup.add(femaleRotor);

    // Particles for air flow
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    compressorGroup.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { rpm, pressure, isOverhauling } = propsRef.current;

      if (!isOverhauling) {
        // Normal operation
        casingMat.opacity = 0.9;
        casingMat.wireframe = false;
        
        maleRotor.rotation.x += (rpm / 60) * Math.PI * 2 * delta;
        femaleRotor.rotation.x -= (rpm / 60) * Math.PI * 2 * delta; // Counter-rotate

        // Air flow
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += (pressure / 2) * delta; // Move along X
          if (positions[i * 3] > 5) {
            positions[i * 3] = -5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
        particles.visible = true;

        // Reset positions
        maleRotor.position.y = 0;
        femaleRotor.position.y = 0;
      } else {
        // Overhaul mode
        casingMat.opacity = 0.2;
        casingMat.wireframe = true;
        particles.visible = false;

        // Slowly rotate for inspection
        maleRotor.rotation.x += 0.5 * delta;
        femaleRotor.rotation.x -= 0.5 * delta;

        // Separate rotors
        maleRotor.position.y += (2 - maleRotor.position.y) * 0.05;
        femaleRotor.position.y += (-2 - femaleRotor.position.y) * 0.05;
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
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      casingGeo.dispose();
      casingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
