import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UndergroundTransportTrackProps } from './three-types';

export const ThreeScene: React.FC<UndergroundTransportTrackProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1b4b'); // indigo-950
    scene.fog = new THREE.FogExp2('#1e1b4b', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // Tunnel
    const tunnelGeo = new THREE.CylinderGeometry(15, 15, 100, 32, 1, true, 0, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.9, side: THREE.BackSide }); // indigo-900
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.y = Math.PI / 2;
    scene.add(tunnel);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(100, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    scene.add(floor);

    // Tracks
    const trackGroup = new THREE.Group();
    const railGeo = new THREE.BoxGeometry(100, 0.5, 0.5);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, -4.75, -2);
    trackGroup.add(leftRail);
    
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, -4.75, 2);
    trackGroup.add(rightRail);

    // Sleepers (Ties)
    const sleeperGeo = new THREE.BoxGeometry(0.5, 0.5, 6);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    for (let i = -45; i <= 45; i += 2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(i, -5, 0);
      trackGroup.add(sleeper);
    }
    scene.add(trackGroup);

    // Mine Cart
    const cartGroup = new THREE.Group();
    const cartBodyGeo = new THREE.BoxGeometry(6, 4, 4);
    const cartBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.5 }); // amber-500
    const cartBody = new THREE.Mesh(cartBodyGeo, cartBodyMat);
    cartBody.position.y = -2;
    cartGroup.add(cartBody);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-2, -4, -2.2], [2, -4, -2.2],
      [-2, -4, 2.2], [2, -4, 2.2]
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      cartGroup.add(wheel);
      wheels.push(wheel);
    });

    // Headlight
    const headlightGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.rotation.z = Math.PI / 2;
    headlight.position.set(3.1, -1, 0);
    cartGroup.add(headlight);

    const headlightSpot = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 6, 0.5, 1);
    headlightSpot.position.set(3.1, -1, 0);
    headlightSpot.target.position.set(10, -1, 0);
    cartGroup.add(headlightSpot);
    cartGroup.add(headlightSpot.target);

    scene.add(cartGroup);

    // Obstacle (Rock)
    const rockGeo = new THREE.DodecahedronGeometry(2);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(30, -3, 0);
    scene.add(rock);

    // Deformation visualization (Red glowing plane under track)
    const deformGeo = new THREE.PlaneGeometry(10, 6);
    const deformMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const deformPlane = new THREE.Mesh(deformGeo, deformMat);
    deformPlane.rotation.x = -Math.PI / 2;
    deformPlane.position.set(0, -4.9, 0);
    scene.add(deformPlane);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { trackDeformation, cartSpeed, obstacleDistance, isAlert } = propsRef.current;

      // Cart Movement
      const speedFactor = cartSpeed / 10; // Scale speed
      cartGroup.position.x += speedFactor * 0.1;
      
      // Loop cart back
      if (cartGroup.position.x > 40) {
        cartGroup.position.x = -40;
      }

      // Wheel rotation
      wheels.forEach(wheel => {
        wheel.rotation.y -= speedFactor * 0.1;
      });

      // Obstacle position relative to cart
      rock.position.x = cartGroup.position.x + obstacleDistance;

      // Track deformation visualization
      if (trackDeformation > 5) {
        deformMat.opacity = 0.3 + Math.sin(time * 5) * 0.2;
        deformPlane.position.x = cartGroup.position.x + 5; // Highlight area ahead
      } else {
        deformMat.opacity = 0;
      }

      // Alert state
      if (isAlert) {
        cartBodyMat.color.setHex(0xef4444); // Red cart
        headlightMat.color.setHex(0xef4444);
        headlightSpot.color.setHex(0xff0000);
      } else {
        cartBodyMat.color.setHex(0xf59e0b); // Amber cart
        headlightMat.color.setHex(0xffffff);
        headlightSpot.color.setHex(0xffffff);
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
