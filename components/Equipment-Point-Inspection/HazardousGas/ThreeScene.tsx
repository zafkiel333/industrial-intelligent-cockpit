import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HazardousGasProps } from './three-types';

export const ThreeScene: React.FC<HazardousGasProps> = (props) => {
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
    scene.fog = new THREE.FogExp2('#0f172a', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Tunnel Geometry (Working face)
    const tunnelGeo = new THREE.CylinderGeometry(12, 12, 60, 32, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      roughness: 0.9,
      side: THREE.BackSide
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    tunnel.rotation.z = Math.PI / 2;
    scene.add(tunnel);

    // End wall (Working face)
    const wallGeo = new THREE.CircleGeometry(12, 32, 0, Math.PI);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 }); // slate-800
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.z = -30;
    scene.add(wall);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(60, 24);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -12;
    scene.add(floor);

    // Ventilation Duct (Tube)
    const ductGeo = new THREE.CylinderGeometry(1.5, 1.5, 60, 16);
    const ductMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 }); // yellow-400
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.rotation.x = Math.PI / 2;
    duct.position.set(-8, 8, 0);
    scene.add(duct);

    // Gas Sensor Node
    const sensorGeo = new THREE.BoxGeometry(1, 2, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // blue-500
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0, 5, -25); // Near the working face
    scene.add(sensor);

    // Gas Particles (CH4 - Methane, CO - Carbon Monoxide)
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleTypes = new Float32Array(particleCount); // 0 for CH4, 1 for CO

    for (let i = 0; i < particleCount; i++) {
      // Start near the working face
      particlePos[i * 3] = (Math.random() - 0.5) * 20; // x
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      particlePos[i * 3 + 2] = -30 + Math.random() * 10; // z
      
      // Randomly assign type (mostly CH4 for this simulation)
      particleTypes[i] = Math.random() > 0.8 ? 1 : 0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('type', new THREE.BufferAttribute(particleTypes, 1));

    // Custom shader material to color particles based on type and concentration
    const particleShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        ch4Level: { value: 0 },
        coLevel: { value: 0 },
        ventRate: { value: 0 }
      },
      vertexShader: `
        attribute float type;
        varying float vType;
        varying vec3 vPos;
        uniform float time;
        uniform float ventRate;
        
        void main() {
          vType = type;
          vPos = position;
          
          // Move particles based on ventilation (pushing them out +Z)
          vec3 pos = position;
          pos.z += mod(time * ventRate * 0.1 + pos.z + 30.0, 60.0) - 30.0 - pos.z;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 4.0 * (30.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vType;
        varying vec3 vPos;
        uniform float ch4Level;
        uniform float coLevel;
        
        void main() {
          // Circular particle
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;
          
          vec3 color;
          float alpha = 0.0;
          
          if (vType < 0.5) {
            // CH4 (Methane) - Typically visualized as light blue/green or invisible. We use a toxic green/yellow here.
            color = vec3(0.5, 1.0, 0.0); // Green-yellow
            // Opacity based on concentration (0-5% LEL is normal, >5% is dangerous)
            alpha = smoothstep(0.0, 10.0, ch4Level) * 0.8;
          } else {
            // CO (Carbon Monoxide) - Invisible, but we use red/purple for danger
            color = vec3(1.0, 0.2, 0.5); // Pink-red
            // Opacity based on concentration (0-24ppm normal, >24 dangerous)
            alpha = smoothstep(0.0, 50.0, coLevel) * 0.8;
          }
          
          // Fade out near the camera/exit
          alpha *= smoothstep(20.0, -10.0, vPos.z);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleShaderMat);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { ch4Level, coLevel, ventilationRate, isAlert } = propsRef.current;

      // Update Shader Uniforms
      particleShaderMat.uniforms.time.value = time;
      particleShaderMat.uniforms.ch4Level.value = ch4Level;
      particleShaderMat.uniforms.coLevel.value = coLevel;
      particleShaderMat.uniforms.ventRate.value = ventilationRate;

      // Alert Colors on Sensor
      if (isAlert) {
        sensorMat.color.setHex(0xef4444); // Red
        // Pulse sensor
        sensor.scale.setScalar(1 + Math.sin(time * 10) * 0.1);
      } else if (ch4Level > 1.0 || coLevel > 24) {
        sensorMat.color.setHex(0xfacc15); // Yellow
        sensor.scale.setScalar(1);
      } else {
        sensorMat.color.setHex(0x3b82f6); // Blue
        sensor.scale.setScalar(1);
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
