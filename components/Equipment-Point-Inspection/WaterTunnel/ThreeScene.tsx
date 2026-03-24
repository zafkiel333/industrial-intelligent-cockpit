import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WaterTunnelProps } from './three-types';

export const ThreeScene: React.FC<WaterTunnelProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900
    scene.fog = new THREE.FogExp2('#0f172a', 0.015);

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);

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
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1, 50); // blue-500
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Tunnel Geometry (Concrete lining)
    const tunnelGeo = new THREE.CylinderGeometry(10, 10, 80, 32, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, // slate-600
      roughness: 0.8,
      side: THREE.BackSide,
      wireframe: false
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);

    // Structural Stress Overlay (Wireframe cylinder slightly inside)
    const stressGeo = new THREE.CylinderGeometry(9.9, 9.9, 80, 32, 16, true);
    const stressMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6, // blue-500
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const stressOverlay = new THREE.Mesh(stressGeo, stressMat);
    stressOverlay.rotation.x = Math.PI / 2;
    scene.add(stressOverlay);

    // Water Flow Particles
    const particleCount = 3000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random position within the cylinder
      const radius = Math.random() * 9.5;
      const theta = Math.random() * Math.PI * 2;
      particlePos[i * 3] = radius * Math.cos(theta); // x
      particlePos[i * 3 + 1] = radius * Math.sin(theta); // y
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 80; // z
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa, // blue-400
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Sensors along the tunnel
    const sensorGeo = new THREE.BoxGeometry(1, 1, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // emerald-500
    const sensors: THREE.Mesh[] = [];
    
    for (let i = -30; i <= 30; i += 20) {
      const sensor = new THREE.Mesh(sensorGeo, sensorMat.clone());
      sensor.position.set(9.5, 0, i); // Attached to the wall
      scene.add(sensor);
      sensors.push(sensor);
    }

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { flowVelocity, structuralStress, isAlert } = propsRef.current;

      // Animate water flow
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Move particles along Z axis based on flow velocity
        positions[i * 3 + 2] += flowVelocity * 0.1;
        
        // Reset if they go past the end of the tunnel
        if (positions[i * 3 + 2] > 40) {
          positions[i * 3 + 2] = -40;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Update Stress Overlay Color
      if (structuralStress > 12) {
        stressMat.color.setHex(0xef4444); // Red
        stressMat.opacity = 0.5 + Math.sin(time * 5) * 0.2; // Pulse
      } else if (structuralStress > 8) {
        stressMat.color.setHex(0xfacc15); // Yellow
        stressMat.opacity = 0.4;
      } else {
        stressMat.color.setHex(0x3b82f6); // Blue
        stressMat.opacity = 0.2;
      }

      // Update Sensor Colors based on Alert
      sensors.forEach((sensor, index) => {
        const mat = sensor.material as THREE.MeshStandardMaterial;
        if (isAlert) {
          mat.color.setHex(0xef4444); // Red
          // Flash sensors sequentially
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = (Math.sin(time * 10 + index) + 1) / 2;
        } else {
          mat.color.setHex(0x10b981); // Emerald
          mat.emissiveIntensity = 0;
        }
      });

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
