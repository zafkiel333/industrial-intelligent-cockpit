import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CrusherLinerReplacementProps } from './three-types';

export const ThreeScene: React.FC<CrusherLinerReplacementProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  // Update ref when props change to avoid re-initializing the scene
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Cleanup existing canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // Grid helper for sci-fi feel
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x003333);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    
    // Crusher Body
    const bodyGeo = new THREE.BoxGeometry(6, 8, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a3b4c, wireframe: true });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    scene.add(body);

    // Fixed Jaw
    const fixedJawGeo = new THREE.BoxGeometry(1, 6, 5);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.8 });
    const fixedJaw = new THREE.Mesh(fixedJawGeo, jawMat);
    fixedJaw.position.set(-2, 0, 0);
    fixedJaw.rotation.z = -Math.PI / 12;
    scene.add(fixedJaw);

    // Moving Jaw
    const movingJaw = new THREE.Mesh(fixedJawGeo, jawMat);
    movingJaw.position.set(2, 0, 0);
    movingJaw.rotation.z = Math.PI / 12;
    scene.add(movingJaw);

    // Liners (the parts to be replaced)
    const linerGeo = new THREE.BoxGeometry(0.2, 5.8, 4.8);
    const linerMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    
    const liner1 = new THREE.Mesh(linerGeo, linerMat);
    liner1.position.set(0.6, 0, 0);
    fixedJaw.add(liner1);

    const liner2 = new THREE.Mesh(linerGeo, linerMat);
    liner2.position.set(-0.6, 0, 0);
    movingJaw.add(liner2);

    // Rocks
    const rocks = new THREE.Group();
    for(let i=0; i<20; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.2);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set((Math.random()-0.5)*2, Math.random()*4, (Math.random()-0.5)*4);
      rocks.add(rock);
    }
    scene.add(rocks);

    const animateScene = (time) => {
      const { wearLevel = 0, status } = propsRef.current;
      
      scene.rotation.y = time * 0.2;

      // Liner color based on wear
      const color = new THREE.Color().setHSL(0.1, 1, 0.5 - (wearLevel/100)*0.3);
      linerMat.color.copy(color);

      if (status === '更换中') {
        // Disassemble animation
        liner1.position.x = 0.6 + Math.sin(time)*0.5 + 0.5;
        liner2.position.x = -0.6 - Math.sin(time)*0.5 - 0.5;
        linerMat.emissive.setHex(0x331100);
        rocks.visible = false;
      } else {
        liner1.position.x = 0.6;
        liner2.position.x = -0.6;
        linerMat.emissive.setHex(0x000000);
        rocks.visible = true;
        
        // Crushing animation
        movingJaw.rotation.z = Math.PI / 12 + Math.sin(time * 10) * 0.05;
        
        rocks.children.forEach(rock => {
          rock.position.y -= 0.05;
          if (rock.position.y < -3) {
            rock.position.y = 4;
            rock.position.x = (Math.random()-0.5)*2;
          }
        });
      }
    };
    

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      animateScene(time);
      
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
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      
      // Dispose resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array ensures initialization only happens once

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
