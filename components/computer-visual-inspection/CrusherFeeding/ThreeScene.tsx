import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RockParticle } from './three-types';

interface ThreeSceneProps {
  rocks: RockParticle[];
  isFeeding: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ rocks, isFeeding }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ rocks, isFeeding });

  useEffect(() => {
    propsRef.current = { rocks, isFeeding };
  }, [rocks, isFeeding]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Tech Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x0891b2, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // 2. Chute / Conveyor (Tech Style)
    const chuteGeo = new THREE.BoxGeometry(14, 0.5, 8);
    const chuteMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      transparent: true, 
      opacity: 0.8,
      emissive: 0x0891b2,
      emissiveIntensity: 0.1
    });
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.y = -1.5;
    scene.add(chute);

    // 3. Scanning Laser Effect
    const laserGeo = new THREE.PlaneGeometry(0.1, 8);
    const laserMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      transparent: true, 
      opacity: 0.5, 
      side: THREE.DoubleSide 
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.x = Math.PI / 2;
    laser.position.set(0, 1, 0);
    scene.add(laser);

    // 4. Rocks Group
    const rocksGroup = new THREE.Group();
    scene.add(rocksGroup);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x06b6d4, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xef4444, 20);
    pointLight2.position.set(-5, 5, -5);
    scene.add(pointLight2);

    // 6. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { rocks: currentRocks, isFeeding: currentFeeding } = propsRef.current;

      // Laser scanning animation
      laser.position.x = Math.sin(Date.now() * 0.002) * 6;

      if (currentFeeding) {
        rocksGroup.children.forEach(rock => {
          const rockData = rock.userData as RockParticle;
          rock.position.x -= rockData.velocity || 0.05;
          rock.rotation.x += rockData.rotationSpeed?.[0] || 0.01;
          rock.rotation.y += rockData.rotationSpeed?.[1] || 0.01;
          
          if (rock.position.x < -7) {
            rock.position.x = 7;
          }
          
          // Scanning detection effect
          const dist = Math.abs(rock.position.x - laser.position.x);
          if (dist < 0.2) {
            (rock as any).material.emissiveIntensity = 1;
          } else {
            (rock as any).material.emissiveIntensity = rockData.isOversized ? 0.6 : 0;
          }
        });
      }

      // Update rocks if count changed
      if (rocksGroup.children.length !== currentRocks.length) {
        while(rocksGroup.children.length > 0) {
          const r = rocksGroup.children[0] as THREE.Mesh;
          r.geometry.dispose();
          (r.material as THREE.Material).dispose();
          rocksGroup.remove(r);
        }
        currentRocks.forEach((rock) => {
          const rockGeo = new THREE.DodecahedronGeometry(rock.size / 250, 0);
          const rockMat = new THREE.MeshPhongMaterial({ 
            color: rock.isOversized ? 0xef4444 : 0x94a3b8,
            emissive: rock.isOversized ? 0xef4444 : 0x06b6d4,
            emissiveIntensity: 0,
            flatShading: true,
            wireframe: false
          });
          const rockMesh = new THREE.Mesh(rockGeo, rockMat);
          rockMesh.position.set(rock.position[0], rock.position[1], rock.position[2]);
          rockMesh.userData = rock;
          rocksGroup.add(rockMesh);
        });
      }

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
