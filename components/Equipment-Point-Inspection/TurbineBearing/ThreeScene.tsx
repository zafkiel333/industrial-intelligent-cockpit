import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TurbineBearingProps } from './three-types';

export const ThreeScene: React.FC<TurbineBearingProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0a');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

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
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Bearing Structure
    const bearingGroup = new THREE.Group();
    
    // Outer Ring
    const outerGeo = new THREE.TorusGeometry(8, 2, 32, 64);
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x888888, 
      metalness: 0.9, 
      roughness: 0.2 
    });
    const outerRing = new THREE.Mesh(outerGeo, metalMat);
    outerRing.rotation.x = Math.PI / 2;
    bearingGroup.add(outerRing);

    // Inner Ring
    const innerGeo = new THREE.TorusGeometry(4, 1.5, 32, 64);
    const innerRing = new THREE.Mesh(innerGeo, metalMat);
    innerRing.rotation.x = Math.PI / 2;
    bearingGroup.add(innerRing);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(2.5, 2.5, 20, 32);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    bearingGroup.add(shaft);

    // Rollers (spheres for simplicity)
    const rollersGroup = new THREE.Group();
    const rollerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const rollerCount = 12;
    for (let i = 0; i < rollerCount; i++) {
      const angle = (i / rollerCount) * Math.PI * 2;
      const roller = new THREE.Mesh(rollerGeo, metalMat);
      roller.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6);
      rollersGroup.add(roller);
    }
    bearingGroup.add(rollersGroup);

    // Heatmap Overlay (Inner Ring)
    const heatMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const heatRing = new THREE.Mesh(innerGeo, heatMat);
    heatRing.rotation.x = Math.PI / 2;
    heatRing.scale.set(1.02, 1.02, 1.02);
    bearingGroup.add(heatRing);

    scene.add(bearingGroup);

    const clock = new THREE.Clock();
    let animationId: number;
    const initialPosition = bearingGroup.position.clone();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { temperature, vibration, oilPressure, isAlert } = propsRef.current;

      // Rotation
      innerRing.rotation.z += 0.05;
      shaft.rotation.y += 0.05;
      rollersGroup.rotation.y += 0.02;

      // Vibration
      if (vibration > 0) {
        const vibIntensity = vibration / 100;
        bearingGroup.position.x = initialPosition.x + (Math.random() - 0.5) * vibIntensity;
        bearingGroup.position.y = initialPosition.y + (Math.random() - 0.5) * vibIntensity;
        bearingGroup.position.z = initialPosition.z + (Math.random() - 0.5) * vibIntensity;
      }

      // Temperature visualization
      heatMat.opacity = Math.max(0, (temperature - 60) / 40); // Starts showing above 60C

      if (isAlert) {
        pointLight.color.setHex(0xff0000);
      } else {
        pointLight.color.setHex(0x00ffff);
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
