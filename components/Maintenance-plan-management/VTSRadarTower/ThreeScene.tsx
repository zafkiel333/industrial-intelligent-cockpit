import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VTSRadarTowerProps } from './three-types';

export const ThreeScene: React.FC<VTSRadarTowerProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x88aacc, 0.01); // Sky blue fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, 40);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 20, 0); // Look at the top

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 50, 20);
    scene.add(dirLight);

    // Tower Structure
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    // Lattice Tower (Simplified with cylinders)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.4 });
    const legGeo = new THREE.CylinderGeometry(0.5, 2, 30, 8);
    
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeo, steelMat);
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      leg.position.set(Math.cos(angle) * 3, 15, Math.sin(angle) * 3);
      // Lean inwards
      leg.lookAt(0, 35, 0);
      leg.rotateX(Math.PI / 2);
      towerGroup.add(leg);
    }

    // Platform
    const platformGeo = new THREE.CylinderGeometry(4, 4, 1, 16);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.5, roughness: 0.8 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 30;
    towerGroup.add(platform);

    // Motor Housing
    const motorGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 16);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.7, roughness: 0.3 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 31.5;
    towerGroup.add(motor);

    // Radar Antenna Array
    const antennaGroup = new THREE.Group();
    antennaGroup.position.y = 33;
    towerGroup.add(antennaGroup);

    // Main Array
    const arrayGeo = new THREE.BoxGeometry(12, 1.5, 0.5);
    const arrayMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.8 });
    const array = new THREE.Mesh(arrayGeo, arrayMat);
    antennaGroup.add(array);

    // Support arms
    const armGeo = new THREE.BoxGeometry(0.5, 1, 2);
    const arm = new THREE.Mesh(armGeo, steelMat);
    arm.position.set(0, -0.5, -1);
    antennaGroup.add(arm);

    // Wind effect (Clouds)
    const cloudGeo = new THREE.BufferGeometry();
    const cloudCount = 200;
    const cloudPos = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount; i++) {
      cloudPos[i * 3] = (Math.random() - 0.5) * 100;
      cloudPos[i * 3 + 1] = 20 + Math.random() * 30;
      cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    const cloudMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.3 });
    const clouds = new THREE.Points(cloudGeo, cloudMat);
    scene.add(clouds);

    // Inspection Highlight
    const highlightGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.2, 16);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true, transparent: true, opacity: 0.8 });
    const highlight = new THREE.Mesh(highlightGeo, highlightMat);
    highlight.position.y = 31.5;
    highlight.visible = false;
    towerGroup.add(highlight);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { rpm, windSpeed, isInspecting } = propsRef.current;

      if (!isInspecting) {
        // Normal rotation
        antennaGroup.rotation.y -= (rpm / 60) * Math.PI * 2 * delta;
        highlight.visible = false;
        motorMat.color.setHex(0x223344);
      } else {
        // Inspection mode: stop rotation, highlight motor
        highlight.visible = true;
        highlight.rotation.y += delta; // Spin wireframe
        motorMat.color.setHex(0x552222); // Show heat/issue
      }

      // Wind effect on clouds
      const positions = cloudGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < cloudCount; i++) {
        positions[i * 3] += (windSpeed / 10) * delta; // Move clouds based on wind
        if (positions[i * 3] > 50) {
          positions[i * 3] = -50;
        }
      }
      cloudGeo.attributes.position.needsUpdate = true;

      // Tower sway based on wind
      const sway = Math.sin(clock.getElapsedTime() * 2) * (windSpeed / 1000);
      towerGroup.rotation.z = sway;

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
      legGeo.dispose();
      steelMat.dispose();
      platformGeo.dispose();
      platformMat.dispose();
      motorGeo.dispose();
      motorMat.dispose();
      arrayGeo.dispose();
      arrayMat.dispose();
      armGeo.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      highlightGeo.dispose();
      highlightMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
