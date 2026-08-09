import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SluiceGateSealReplacementProps } from './three-types';

export const ThreeScene: React.FC<SluiceGateSealReplacementProps> = ({ leakageRate = 15.5, status = '预警', maintenanceProgress = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Scene objects
  const gateRef = useRef<THREE.Group | null>(null);
  const sealRef = useRef<THREE.Mesh | null>(null);
  const waterParticlesRef = useRef<THREE.Group | null>(null);
  const scaffoldRef = useRef<THREE.Group | null>(null);

  const propsRef = useRef({ leakageRate, status, maintenanceProgress });

  useEffect(() => {
    propsRef.current = { leakageRate, status, maintenanceProgress };
  }, [leakageRate, status, maintenanceProgress]);

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
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(15, 10, 20);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Concrete Structure (Piers)
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    
    const leftPier = new THREE.Mesh(new THREE.BoxGeometry(4, 20, 10), concreteMat);
    leftPier.position.set(-8, 0, 0);
    scene.add(leftPier);

    const rightPier = new THREE.Mesh(new THREE.BoxGeometry(4, 20, 10), concreteMat);
    rightPier.position.set(8, 0, 0);
    scene.add(rightPier);

    const bottomSill = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 6), concreteMat);
    bottomSill.position.set(0, -9, 0);
    scene.add(bottomSill);

    // Gate Group
    const gateGroup = new THREE.Group();
    
    // Main Gate Panel
    const gateGeo = new THREE.BoxGeometry(12, 16, 1);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const gatePanel = new THREE.Mesh(gateGeo, gateMat);
    gateGroup.add(gatePanel);

    // Seal (Rubber)
    const sealGeo = new THREE.BoxGeometry(12.2, 16.2, 0.5);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.z = 0.5;
    gateGroup.add(seal);
    sealRef.current = seal;

    gateGroup.position.set(0, -1, 0);
    scene.add(gateGroup);
    gateRef.current = gateGroup;

    // Water (Upstream)
    const waterGeo = new THREE.BoxGeometry(20, 14, 20);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0284c7, 
        transparent: true, 
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -2, -10.5);
    scene.add(water);

    // Leakage Particles
    const particlesGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < 50; i++) {
        const particle = new THREE.Mesh(particleGeo, particleMat);
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                -Math.random() * 5 - 2,
                Math.random() * 5 + 2
            ),
            life: Math.random()
        };
        // Position along the edges of the gate
        const isSide = Math.random() > 0.5;
        if (isSide) {
            particle.position.set(
                (Math.random() > 0.5 ? 6 : -6),
                (Math.random() - 0.5) * 16,
                1
            );
        } else {
            particle.position.set(
                (Math.random() - 0.5) * 12,
                -8,
                1
            );
        }
        particlesGroup.add(particle);
    }
    scene.add(particlesGroup);
    waterParticlesRef.current = particlesGroup;

    // Maintenance Scaffolding
    const scaffoldGroup = new THREE.Group();
    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, wireframe: true });
    
    const platform = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 6), scaffoldMat);
    platform.position.set(0, -5, 4);
    scaffoldGroup.add(platform);
    
    for (let x of [-7, 7]) {
        for (let z of [2, 6]) {
            const support = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 10), scaffoldMat);
            support.position.set(x, -10, z);
            scaffoldGroup.add(support);
        }
    }
    scaffoldGroup.visible = false;
    scene.add(scaffoldGroup);
    scaffoldRef.current = scaffoldGroup;

    let time = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      time += 0.016;
      controlsRef.current.update();

      const currentProps = propsRef.current;

      // Animate Leakage Particles
      if (waterParticlesRef.current) {
          waterParticlesRef.current.visible = currentProps.leakageRate > 0;
          
          if (waterParticlesRef.current.visible) {
              const activeParticles = Math.floor((currentProps.leakageRate / 20) * 50);
              
              waterParticlesRef.current.children.forEach((particle, index) => {
                  particle.visible = index < activeParticles;
                  
                  if (particle.visible) {
                      const data = particle.userData;
                      data.life -= 0.02;
                      
                      particle.position.addScaledVector(data.velocity, 0.016);
                      data.velocity.y -= 9.8 * 0.016; // Gravity
                      
                      if (data.life <= 0 || particle.position.y < -10) {
                          data.life = 1;
                          data.velocity.set(
                              (Math.random() - 0.5) * 2,
                              -Math.random() * 2,
                              Math.random() * 5 + 2
                          );
                          
                          const isSide = Math.random() > 0.5;
                          if (isSide) {
                              particle.position.set(
                                  (Math.random() > 0.5 ? 6 : -6),
                                  (Math.random() - 0.5) * 16,
                                  1
                              );
                          } else {
                              particle.position.set(
                                  (Math.random() - 0.5) * 12,
                                  -8,
                                  1
                              );
                          }
                      }
                  }
              });
          }
      }

      // Seal Visual State
      if (sealRef.current) {
          if (currentProps.status === '预警') {
              // Pulse red when warning
              const pulse = (Math.sin(time * 5) + 1) / 2;
              (sealRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x1e293b).lerp(new THREE.Color(0xef4444), pulse * 0.5);
          } else if (currentProps.status === '更换中') {
              // Highlight new seal being installed
              const progressColor = new THREE.Color(0x1e293b).lerp(new THREE.Color(0x10b981), currentProps.maintenanceProgress / 100);
              (sealRef.current.material as THREE.MeshStandardMaterial).color.copy(progressColor);
          } else {
              (sealRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x1e293b);
          }
      }

      // Maintenance Visualization
      if (scaffoldRef.current && gateRef.current) {
          if (currentProps.status === '更换中') {
              scaffoldRef.current.visible = true;
              // Lift gate slightly for maintenance
              gateRef.current.position.y = -1 + Math.sin(time) * 0.1;
          } else {
              scaffoldRef.current.visible = false;
              gateRef.current.position.y = -1;
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
