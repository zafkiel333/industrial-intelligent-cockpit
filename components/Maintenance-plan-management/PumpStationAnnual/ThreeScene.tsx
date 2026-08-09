import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PumpStationAnnualProps } from './three-types';

export const ThreeScene: React.FC<PumpStationAnnualProps> = ({ flowRate = 120, status = '运行中', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pumpRef = useRef<THREE.Group | null>(null);
  const impellerRef = useRef<THREE.Mesh | null>(null);
  const waterRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const propsRef = useRef({ flowRate, status, maintenanceProgress });

  useEffect(() => {
    propsRef.current = { flowRate, status, maintenanceProgress };
  }, [flowRate, status, maintenanceProgress]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Pump Station Group
    const pumpGroup = new THREE.Group();
    
    // Motor Casing (Top)
    const motorGeo = new THREE.CylinderGeometry(3, 3, 8, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.4 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 8;
    pumpGroup.add(motor);

    // Motor Cooling Fins
    const finMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5, roughness: 0.5 });
    for (let i = 0; i < 16; i++) {
      const finGeo = new THREE.BoxGeometry(0.2, 7, 6.5);
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.y = 8;
      fin.rotation.y = (i * Math.PI) / 8;
      pumpGroup.add(fin);
    }

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 1;
    pumpGroup.add(shaft);

    // Volute Casing (Bottom, cutaway view)
    const voluteGeo = new THREE.TorusGeometry(4, 2, 16, 32, Math.PI * 1.5); // Cutaway
    const voluteMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.5, 
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.rotation.x = Math.PI / 2;
    volute.position.y = -2;
    pumpGroup.add(volute);

    // Inlet Pipe
    const inletGeo = new THREE.CylinderGeometry(2, 2, 8, 32);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.6 });
    const inlet = new THREE.Mesh(inletGeo, pipeMat);
    inlet.position.set(0, -6, 0);
    pumpGroup.add(inlet);

    // Outlet Pipe
    const outletGeo = new THREE.CylinderGeometry(2, 2, 10, 32);
    const outlet = new THREE.Mesh(outletGeo, pipeMat);
    outlet.rotation.z = Math.PI / 2;
    outlet.position.set(8, -2, 0);
    pumpGroup.add(outlet);

    // Impeller
    const impellerGroup = new THREE.Group();
    const hubGeo = new THREE.CylinderGeometry(1, 1, 1.5, 16);
    const impellerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const hub = new THREE.Mesh(hubGeo, impellerMat);
    impellerGroup.add(hub);

    for (let i = 0; i < 5; i++) {
      const bladeGeo = new THREE.BoxGeometry(3.5, 1, 0.2);
      // Curve the blade slightly
      const positions = bladeGeo.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        const x = positions.getX(j);
        const z = positions.getZ(j);
        positions.setZ(j, z + Math.sin(x * 0.5) * 0.5);
      }
      bladeGeo.computeVertexNormals();
      
      const blade = new THREE.Mesh(bladeGeo, impellerMat);
      blade.position.x = 2;
      
      const bladePivot = new THREE.Group();
      bladePivot.rotation.y = (i * Math.PI * 2) / 5;
      bladePivot.add(blade);
      impellerGroup.add(bladePivot);
    }
    impellerGroup.position.y = -2;
    pumpGroup.add(impellerGroup);
    impellerRef.current = impellerGroup;

    scene.add(pumpGroup);
    pumpRef.current = pumpGroup;

    // Water Flow Visualization
    const waterGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });
    
    for (let i = 0; i < 100; i++) {
      const particle = new THREE.Mesh(particleGeo, particleMat);
      // Random initial positions along the flow path
      particle.userData = {
        phase: Math.random(),
        speed: Math.random() * 0.5 + 0.5,
        offset: (Math.random() - 0.5) * 2
      };
      waterGroup.add(particle);
    }
    scene.add(waterGroup);
    waterRef.current = waterGroup;

    // Maintenance scaffolding (hidden by default)
    const scaffoldGroup = new THREE.Group();
    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
    
    // Base platform
    const platformGeo = new THREE.BoxGeometry(12, 0.5, 12);
    const platform = new THREE.Mesh(platformGeo, scaffoldMat);
    platform.position.y = -4;
    scaffoldGroup.add(platform);
    
    // Supports
    for(let x of [-5, 5]) {
        for(let z of [-5, 5]) {
            const supportGeo = new THREE.CylinderGeometry(0.2, 0.2, 16);
            const support = new THREE.Mesh(supportGeo, scaffoldMat);
            support.position.set(x, 4, z);
            scaffoldGroup.add(support);
        }
    }
    
    scaffoldGroup.visible = false;
    scene.add(scaffoldGroup);

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.016;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Animate Impeller
      if (impellerRef.current) {
        if (currentProps.status === '运行中' || currentProps.status === '测试中') {
          // Rotation speed based on flow rate
          impellerRef.current.rotation.y -= (currentProps.flowRate / 100) * 0.2;
        }
      }

      // Animate Water Flow
      if (waterRef.current) {
        waterRef.current.visible = (currentProps.status === '运行中' || currentProps.status === '测试中') && currentProps.flowRate > 0;
        
        if (waterRef.current.visible) {
          waterRef.current.children.forEach((particle) => {
            const data = particle.userData;
            data.phase += data.speed * (currentProps.flowRate / 100) * 0.05;
            if (data.phase > 1) data.phase -= 1;

            // Path: Up inlet -> swirl in volute -> out outlet
            if (data.phase < 0.3) {
              // Up inlet
              const p = data.phase / 0.3;
              particle.position.set(
                Math.cos(data.offset * Math.PI) * 1.5,
                -10 + p * 8,
                Math.sin(data.offset * Math.PI) * 1.5
              );
            } else if (data.phase < 0.6) {
              // Swirl in volute
              const p = (data.phase - 0.3) / 0.3;
              const angle = p * Math.PI * 2 + data.offset;
              const radius = 2 + p * 1.5;
              particle.position.set(
                Math.cos(angle) * radius,
                -2 + (Math.random() - 0.5) * 1,
                Math.sin(angle) * radius
              );
            } else {
              // Out outlet
              const p = (data.phase - 0.6) / 0.4;
              particle.position.set(
                4 + p * 10,
                -2 + Math.cos(data.offset * Math.PI) * 1.5,
                Math.sin(data.offset * Math.PI) * 1.5
              );
            }
          });
        }
      }

      // Handle maintenance visualization
      if (currentProps.status === '停机检修') {
        scaffoldGroup.visible = true;
        
        // Disassemble pump based on progress
        if (pumpRef.current) {
            const motor = pumpRef.current.children[0];
            const shaft = pumpRef.current.children[17]; // Assuming shaft is added after 16 fins
            
            if (currentProps.maintenanceProgress > 20) {
                // Lift motor
                motor.position.y = 8 + Math.min(5, (currentProps.maintenanceProgress - 20) * 0.2);
                // Lift fins with motor
                for(let i=1; i<=16; i++) {
                    pumpRef.current.children[i].position.y = 8 + Math.min(5, (currentProps.maintenanceProgress - 20) * 0.2);
                }
            } else {
                motor.position.y = 8;
                for(let i=1; i<=16; i++) {
                    pumpRef.current.children[i].position.y = 8;
                }
            }
            
            if (currentProps.maintenanceProgress > 50 && impellerRef.current) {
                // Lift impeller
                impellerRef.current.position.y = -2 + Math.min(8, (currentProps.maintenanceProgress - 50) * 0.3);
            } else if (impellerRef.current) {
                impellerRef.current.position.y = -2;
            }
        }
      } else {
        scaffoldGroup.visible = false;
        // Reset positions
        if (pumpRef.current) {
            const motor = pumpRef.current.children[0];
            motor.position.y = 8;
            for(let i=1; i<=16; i++) {
                pumpRef.current.children[i].position.y = 8;
            }
            if (impellerRef.current) impellerRef.current.position.y = -2;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    resizeObserverRef.current = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        for (let entry of entries) {
          if (entry.target === mountRef.current) {
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            if (cameraRef.current && rendererRef.current && width > 0 && height > 0) {
              cameraRef.current.aspect = width / height;
              cameraRef.current.updateProjectionMatrix();
              rendererRef.current.setSize(width, height, false);
            }
          }
        }
      });
    });

    if (mountRef.current) {
      resizeObserverRef.current.observe(mountRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
              else object.material.dispose();
            }
          }
        });
      }
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
