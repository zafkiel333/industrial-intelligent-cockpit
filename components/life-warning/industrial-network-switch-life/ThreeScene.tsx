import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NetworkSwitchState } from './three-types';

interface ThreeSceneProps {
  state: NetworkSwitchState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // neutral-950
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const switchGroup = new THREE.Group();
    scene.add(switchGroup);

    // Switch Chassis
    const chassisGeo = new THREE.BoxGeometry(10, 2, 6);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x262626, metalness: 0.8, roughness: 0.2 }); // neutral-800
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    switchGroup.add(chassis);

    // Heat Sink (Top)
    const heatSinkGeo = new THREE.BoxGeometry(8, 0.5, 4);
    
    // Shader to show CPU temperature
    const heatSinkMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x404040) }, // neutral-700
            uHeatColor: { value: new THREE.Color(0xef4444) }  // red-500
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            uniform vec3 uBaseColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uHeatColor, uTemp * 0.8);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });
    const heatSink = new THREE.Mesh(heatSinkGeo, heatSinkMat);
    heatSink.position.y = 1.25;
    switchGroup.add(heatSink);

    // Ports (Front face)
    const ports: THREE.Mesh[] = [];
    const portGeo = new THREE.BoxGeometry(0.6, 0.6, 0.2);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x171717, metalness: 0.5, roughness: 0.8 });

    for (let i = 0; i < 8; i++) {
        const port = new THREE.Mesh(portGeo, portMat);
        port.position.set(-3.5 + i * 1.0, 0, 3.1);
        switchGroup.add(port);
        ports.push(port);
    }

    // Data Packets (Particles flying into/out of ports)
    const packetCount = 100;
    const packetGeo = new THREE.BufferGeometry();
    const packetPos = new Float32Array(packetCount * 3);
    const packetColors = new Float32Array(packetCount * 3);
    
    for(let i=0; i<packetCount; i++) {
        packetPos[i*3] = -3.5 + Math.floor(Math.random() * 8) * 1.0; // Align with ports
        packetPos[i*3+1] = 0;
        packetPos[i*3+2] = 3.2 + Math.random() * 5; // Flying outwards
        
        // Default green color
        packetColors[i*3] = 0.1;
        packetColors[i*3+1] = 0.8;
        packetColors[i*3+2] = 0.3;
    }
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
    
    const packetMat = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const packetSystem = new THREE.Points(packetGeo, packetMat);
    switchGroup.add(packetSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      switchGroup.rotation.y = Math.sin(time * 0.2) * 0.1;

      // Update Heat Sink Shader
      // Normal temp ~40C, critical > 85C
      const tempRatio = Math.max(0, Math.min(1, (currentState.cpuTemperature - 30) / 60));
      heatSinkMat.uniforms.uTemp.value = tempRatio;

      // Update Packets
      const pPos = packetSystem.geometry.attributes.position.array as Float32Array;
      const pColors = packetSystem.geometry.attributes.color.array as Float32Array;
      
      // Packet loss ratio determines how many packets turn red and "drop"
      const lossRatio = currentState.packetLoss / 100;
      // Port errors determine chaotic movement
      const errorFactor = Math.min(1, currentState.portErrors / 50);

      for(let i=0; i<packetCount; i++) {
          // Move packets towards the switch
          pPos[i*3+2] -= 0.1;
          
          // Chaotic movement if errors
          if (errorFactor > 0) {
              pPos[i*3] += (Math.random() - 0.5) * errorFactor * 0.2;
              pPos[i*3+1] += (Math.random() - 0.5) * errorFactor * 0.2;
          }

          // Reset packet when it hits the port
          if (pPos[i*3+2] < 3.2) {
              pPos[i*3] = -3.5 + Math.floor(Math.random() * 8) * 1.0;
              pPos[i*3+1] = 0;
              pPos[i*3+2] = 8 + Math.random() * 2;
              
              // Determine if this packet is "lost" or "error"
              if (Math.random() < lossRatio) {
                  // Red (Lost)
                  pColors[i*3] = 0.9;
                  pColors[i*3+1] = 0.2;
                  pColors[i*3+2] = 0.2;
              } else if (Math.random() < errorFactor) {
                  // Yellow (Error)
                  pColors[i*3] = 0.9;
                  pColors[i*3+1] = 0.8;
                  pColors[i*3+2] = 0.1;
              } else {
                  // Green (Healthy)
                  pColors[i*3] = 0.1;
                  pColors[i*3+1] = 0.8;
                  pColors[i*3+2] = 0.3;
              }
          }
      }
      packetSystem.geometry.attributes.position.needsUpdate = true;
      packetSystem.geometry.attributes.color.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      heatSinkGeo.dispose();
      heatSinkMat.dispose();
      portGeo.dispose();
      portMat.dispose();
      packetGeo.dispose();
      packetMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
