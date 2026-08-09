import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MineLocomotiveOverhaulProps } from './three-types';

export const ThreeScene: React.FC<MineLocomotiveOverhaulProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x050a15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffaa00, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const locoGroup = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(12, 4, 5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    locoGroup.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(4, 3, 4.8);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x112255, metalness: 0.5, roughness: 0.5 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-3, 6.5, 0);
    locoGroup.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.1 });
    const wheels: THREE.Mesh[] = [];
    
    const wheelPositions = [
      [-4, 1.5, 2.5], [4, 1.5, 2.5],
      [-4, 1.5, -2.5], [4, 1.5, -2.5]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheels.push(wheel);
      locoGroup.add(wheel);
    });

    // Motor (Internal, visible during overhaul)
    const motorGeo = new THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.7, roughness: 0.3 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(0, 2.5, 0);
    locoGroup.add(motor);

    scene.add(locoGroup);

    // Track
    const trackGeo = new THREE.BoxGeometry(40, 0.2, 6);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5, roughness: 0.8 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.y = 0;
    scene.add(track);

    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x00ffcc, 0x003344);
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { batteryLevel, motorTemp, isOverhauling } = propsRef.current;

      if (isOverhauling) {
        // Overhaul mode: body lifts up, motor exposed
        body.position.y = Math.min(6, body.position.y + delta * 2);
        cabin.position.y = Math.min(9.5, cabin.position.y + delta * 2);
        bodyMat.opacity = 0.4; // Make body transparent
        
        // Motor pulses red if hot
        const tempColor = new THREE.Color(0xffaa00).lerp(new THREE.Color(0xff0000), (motorTemp - 40) / 60);
        motorMat.color.copy(tempColor);
        motorMat.emissive.copy(tempColor).multiplyScalar(0.5 + Math.sin(time * 5) * 0.2);
      } else {
        // Normal mode: body down, wheels rotate
        body.position.y = Math.max(3, body.position.y - delta * 2);
        cabin.position.y = Math.max(6.5, cabin.position.y - delta * 2);
        bodyMat.opacity = 0.9;
        motorMat.emissive.setHex(0x000000);
        
        const speed = (batteryLevel / 100) * 5;
        wheels.forEach(w => w.rotation.y += speed * delta);
        
        // Move loco slightly back and forth
        locoGroup.position.x = Math.sin(time * 0.5) * 5;
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
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      cabinGeo.dispose();
      cabinMat.dispose();
      wheelGeo.dispose();
      wheelMat.dispose();
      motorGeo.dispose();
      motorMat.dispose();
      trackGeo.dispose();
      trackMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
