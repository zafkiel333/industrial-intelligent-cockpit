import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortWaterQualityProps } from './three-types';

export const ThreeScene: React.FC<PortWaterQualityProps> = (props) => {
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
    scene.fog = new THREE.FogExp2('#0a0e17', 0.02);

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x0088ff, 2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Water surface
    const waterGeo = new THREE.PlaneGeometry(50, 50, 64, 64);
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x004488,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Monitoring Buoy
    const buoyGroup = new THREE.Group();
    
    // Buoy base
    const baseGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5;
    buoyGroup.add(base);

    // Buoy body
    const bodyGeo = new THREE.CylinderGeometry(1.5, 2, 3, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2.5;
    buoyGroup.add(body);

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 6;
    buoyGroup.add(antenna);

    // Sensor unit (underwater)
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.y = -1.5;
    buoyGroup.add(sensor);

    // Sensor glow
    const glowGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -3;
    buoyGroup.add(glow);

    scene.add(buoyGroup);

    // Data particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Water wave animation
      const positions = waterGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
      }
      waterGeo.attributes.position.needsUpdate = true;

      // Buoy bobbing
      buoyGroup.position.y = Math.sin(time * 2) * 0.3;
      buoyGroup.rotation.z = Math.sin(time * 1.5) * 0.05;
      buoyGroup.rotation.x = Math.cos(time * 1.2) * 0.05;

      // Particles floating
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for(let i = 1; i < particleCount * 3; i += 3) {
        pPositions[i] += Math.sin(time + pPositions[i-1]) * 0.01;
        if (pPositions[i] > 5) pPositions[i] = -5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update based on props
      const { isAlert, turbidity } = propsRef.current;
      
      if (isAlert) {
        glowMat.color.setHex(0xff0000);
        pointLight.color.setHex(0xff0000);
      } else {
        glowMat.color.setHex(0x00ff00);
        pointLight.color.setHex(0x0088ff);
      }

      waterMat.opacity = 0.8 - (turbidity / 100) * 0.5;

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
