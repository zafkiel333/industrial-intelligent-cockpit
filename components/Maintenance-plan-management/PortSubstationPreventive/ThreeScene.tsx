import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortSubstationPreventiveProps } from './three-types';

export const ThreeScene: React.FC<PortSubstationPreventiveProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

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

    const pointLight = new THREE.PointLight(0x4488ff, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Transformer Group
    const transformerGroup = new THREE.Group();
    scene.add(transformerGroup);

    // Main Tank
    const tankGeo = new THREE.BoxGeometry(8, 6, 6);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 3;
    transformerGroup.add(tank);

    // Cooling Fins (Radiators)
    const finGeo = new THREE.BoxGeometry(0.1, 4, 4);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.6, roughness: 0.4 });
    
    for (let i = -3; i <= 3; i += 0.5) {
      const fin1 = new THREE.Mesh(finGeo, finMat);
      fin1.position.set(i, 3, 3.5);
      transformerGroup.add(fin1);
      
      const fin2 = new THREE.Mesh(finGeo, finMat);
      fin2.position.set(i, 3, -3.5);
      transformerGroup.add(fin2);
    }

    // High Voltage Bushings
    const bushingGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.1, roughness: 0.9 }); // Ceramic
    const bushings: THREE.Mesh[] = [];

    for (let i = -2; i <= 2; i += 2) {
      const bushing = new THREE.Mesh(bushingGeo, bushingMat);
      bushing.position.set(i, 7.5, 0);
      transformerGroup.add(bushing);
      bushings.push(bushing);

      // Corona rings
      const ringGeo = new THREE.TorusGeometry(0.6, 0.05, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(i, 8.5, 0);
      ring.rotation.x = Math.PI / 2;
      transformerGroup.add(ring);
    }

    // Electrical Arcs (for testing mode)
    const arcGeo = new THREE.BufferGeometry();
    const arcCount = 50;
    const arcPos = new Float32Array(arcCount * 3);
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
    const arcMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.visible = false;
    scene.add(arcLine);

    // Heat Map Overlay (simulated with a point light and color change)
    const heatLight = new THREE.PointLight(0xff0000, 0, 15);
    heatLight.position.set(0, 3, 0);
    transformerGroup.add(heatLight);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { voltage, temperature, isTesting } = propsRef.current;

      // Temperature effect
      const tempRatio = Math.max(0, Math.min(1, (temperature - 40) / 60)); // 40C to 100C
      const heatColor = new THREE.Color(0x334455).lerp(new THREE.Color(0xaa3322), tempRatio);
      tankMat.color.copy(heatColor);
      heatLight.intensity = tempRatio * 2;

      // Testing mode effects
      if (isTesting) {
        // Simulate high voltage test arcs between bushings
        arcLine.visible = true;
        const positions = arcGeo.attributes.position.array as Float32Array;
        
        const startBushing = bushings[0].position.clone().add(new THREE.Vector3(0, 1, 0));
        const endBushing = bushings[1].position.clone().add(new THREE.Vector3(0, 1, 0));
        
        for (let i = 0; i < arcCount; i++) {
          const t = i / (arcCount - 1);
          const p = new THREE.Vector3().lerpVectors(startBushing, endBushing, t);
          // Add random jitter
          p.x += (Math.random() - 0.5) * 0.5;
          p.y += (Math.random() - 0.5) * 0.5;
          p.z += (Math.random() - 0.5) * 0.5;
          
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }
        arcGeo.attributes.position.needsUpdate = true;
        
        // Flash intensity based on voltage
        arcMat.opacity = 0.5 + Math.random() * 0.5;
        
        // Shake transformer slightly
        transformerGroup.position.x = (Math.random() - 0.5) * 0.05;
        transformerGroup.position.z = (Math.random() - 0.5) * 0.05;
      } else {
        arcLine.visible = false;
        transformerGroup.position.set(0, 0, 0);
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
      tankGeo.dispose();
      tankMat.dispose();
      finGeo.dispose();
      finMat.dispose();
      bushingGeo.dispose();
      bushingMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
