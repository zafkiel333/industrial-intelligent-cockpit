
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AutomationThreeProps } from './three-types';

export const AutomationThreeScene: React.FC<AutomationThreeProps> = ({ 
  modules, 
  activeModuleId, 
  onModuleSelect,
  isDiagnosing
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Scene Objects ---
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    // 1. Backplane / Rack Frame
    const rackWidth = 14;
    const rackHeight = 5;
    const rackDepth = 1;
    
    const frameGeo = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
    const frameMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.6;
    rackGroup.add(frame);

    // DIN Rail effect
    const railGeo = new THREE.BoxGeometry(rackWidth - 1, 0.5, 0.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const railTop = new THREE.Mesh(railGeo, railMat);
    railTop.position.set(0, 1.5, -0.1);
    rackGroup.add(railTop);
    const railBottom = new THREE.Mesh(railGeo, railMat);
    railBottom.position.set(0, -1.5, -0.1);
    rackGroup.add(railBottom);

    // 2. Modules
    const moduleMeshes: THREE.Mesh[] = [];
    const moduleWidth = 1.0;
    const spacing = 0.2;
    const startX = -((10 * (moduleWidth + spacing)) / 2) + moduleWidth/2;

    modules.forEach((mod) => {
        if (mod.type === 'EMPTY') return;

        const xPos = startX + mod.slotIndex * (moduleWidth + spacing);
        
        // Module Body
        const modGeo = new THREE.BoxGeometry(moduleWidth, 4, 3);
        
        let color = 0x334155; // Default grey
        if (mod.type === 'CPU') color = 0x475569;
        if (mod.type === 'PWR') color = 0x1e293b;
        
        const modMat = new THREE.MeshPhysicalMaterial({ 
            color: color, 
            metalness: 0.6, 
            roughness: 0.2,
            clearcoat: 0.5
        });
        const mesh = new THREE.Mesh(modGeo, modMat);
        mesh.position.set(xPos, 0, 1.5);
        mesh.userData = { id: mod.id };
        
        // Add specific module details (simplified)
        // LED Status Light
        const ledGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const ledColor = mod.status === 'normal' ? 0x10b981 : (mod.status === 'warning' ? 0xf59e0b : 0xef4444);
        const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 1.5, 1.55);
        mesh.add(led);
        (led as any).userData = { isLed: true, status: mod.status };

        // Connector Ports (Visual)
        const portGeo = new THREE.BoxGeometry(0.6, 0.4, 0.1);
        const portMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const port1 = new THREE.Mesh(portGeo, portMat);
        port1.position.set(0, -1, 1.55);
        mesh.add(port1);

        // Highlight selection
        if (activeModuleId === mod.id) {
            mesh.material.emissive.setHex(0x0ea5e9);
            mesh.material.emissiveIntensity = 0.3;
            // Pull out effect
            mesh.position.z += 1.5;
            mesh.position.y += 0.5;
        }

        rackGroup.add(mesh);
        moduleMeshes.push(mesh);
    });

    // 3. Data Cables (Abstract Holographic Lines)
    if (isDiagnosing) {
        const lineMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
        const lineGeo = new THREE.BufferGeometry();
        const points = [];
        
        // Connect active modules
        const activeMeshes = moduleMeshes.filter(m => m.position.z > 2 || Math.random() > 0.5);
        for(let i=0; i<activeMeshes.length - 1; i++) {
            points.push(activeMeshes[i].position.clone().add(new THREE.Vector3(0,0,1.6)));
            points.push(activeMeshes[i+1].position.clone().add(new THREE.Vector3(0,0,1.6)));
        }
        lineGeo.setFromPoints(points);
        const connections = new THREE.LineSegments(lineGeo, lineMat);
        rackGroup.add(connections);
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    const topLight = new THREE.SpotLight(0x0ea5e9, 5);
    topLight.position.set(5, 10, 8);
    topLight.castShadow = true;
    scene.add(topLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    purpleLight.position.set(-5, 0, 5);
    scene.add(purpleLight);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(moduleMeshes);
        if (intersects.length > 0) onModuleSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.05;

      // Pulse LEDs
      moduleMeshes.forEach(mesh => {
          mesh.children.forEach((child: any) => {
              if (child.userData.isLed) {
                  const baseScale = 1;
                  const pulse = Math.sin(time * 5) * 0.2;
                  child.scale.setScalar(baseScale + pulse);
                  
                  if (child.userData.status === 'error') {
                      child.material.color.setHex(time % 1 > 0.5 ? 0xef4444 : 0x000000); // Blink fast
                  }
              }
          });
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modules, activeModuleId, isDiagnosing]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
