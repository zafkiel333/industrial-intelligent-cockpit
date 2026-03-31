import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropellerPolishingProps } from './three-types';

export const ThreeScene: React.FC<PropellerPolishingProps> = (props) => {
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
    // Underwater blue fog
    scene.fog = new THREE.FogExp2(0x002244, 0.03);
    scene.background = new THREE.Color(0x001122);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Underwater lighting
    const ambientLight = new THREE.AmbientLight(0x446688, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x88ccff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const propGroup = new THREE.Group();

    // Propeller Hub
    const hubGeo = new THREE.CylinderGeometry(1.5, 2, 4, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xbba977, metalness: 0.9, roughness: 0.2 }); // Bronze
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    propGroup.add(hub);

    // Propeller Blades
    const bladeGeo = new THREE.BoxGeometry(1, 8, 2);
    // Taper the blade
    const positions = bladeGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y > 0) {
            positions.setX(i, positions.getX(i) * 0.5);
            positions.setZ(i, positions.getZ(i) * 0.2);
        }
    }
    bladeGeo.computeVertexNormals();

    const blades: THREE.Mesh[] = [];
    const numBlades = 4;
    for (let i = 0; i < numBlades; i++) {
      const blade = new THREE.Mesh(bladeGeo, hubMat);
      blade.position.y = 4;
      
      const pivot = new THREE.Group();
      pivot.rotation.z = (i * Math.PI * 2) / numBlades;
      
      // Pitch angle
      blade.rotation.y = Math.PI / 6;
      
      pivot.add(blade);
      blades.push(blade);
      propGroup.add(pivot);
    }

    scene.add(propGroup);

    // Polishing Tool (ROV or Diver tool)
    const toolGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8 });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.rotation.x = Math.PI / 2;
    tool.position.set(4, 4, 2);
    tool.visible = false;
    scene.add(tool);

    // Particles (Bubbles/Debris)
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        particlePos[i] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.2,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { foulingLevel, isPolishing, waterTurbidity } = propsRef.current;

      // Adjust fog based on turbidity
      scene.fog.density = 0.02 + (waterTurbidity / 100) * 0.05;

      if (isPolishing) {
        // Polishing mode: tool moves around, propeller is still
        tool.visible = true;
        
        // Tool orbits the propeller
        tool.position.x = Math.cos(time * 2) * 6;
        tool.position.y = Math.sin(time * 2) * 6;
        tool.lookAt(0,0,0);

        // Clean the propeller (reduce roughness, increase metalness)
        const cleanFactor = 1 - (foulingLevel / 100);
        hubMat.roughness = 0.8 - (cleanFactor * 0.6);
        hubMat.color.setHex(0xbba977).lerp(new THREE.Color(0x556644), foulingLevel / 100); // Greenish if fouled

        // More bubbles near tool
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i < particleCount; i++) {
            if (Math.random() > 0.9) {
                positions[i*3] = tool.position.x + (Math.random() - 0.5);
                positions[i*3+1] = tool.position.y + (Math.random() - 0.5);
                positions[i*3+2] = tool.position.z + (Math.random() - 0.5);
            } else {
                positions[i*3+1] += delta * 2; // Bubbles go up
                if (positions[i*3+1] > 15) positions[i*3+1] = -15;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

      } else {
        // Normal mode: propeller rotates slowly, tool hidden
        tool.visible = false;
        propGroup.rotation.z -= delta * 0.5;

        // Apply fouling visual
        hubMat.roughness = 0.2 + (foulingLevel / 100) * 0.6;
        hubMat.color.setHex(0xbba977).lerp(new THREE.Color(0x445533), foulingLevel / 100); // Greenish/brownish fouling

        // Ambient bubbles
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i < particleCount; i++) {
            positions[i*3+1] += delta * 1; // Bubbles go up slowly
            if (positions[i*3+1] > 15) positions[i*3+1] = -15;
        }
        particles.geometry.attributes.position.needsUpdate = true;
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
      hubGeo.dispose();
      hubMat.dispose();
      bladeGeo.dispose();
      toolGeo.dispose();
      toolMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
