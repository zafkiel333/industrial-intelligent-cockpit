
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InspectionSceneProps, ChannelEntity } from './three-types';

export const ChannelInspectionThreeScene: React.FC<InspectionSceneProps> = ({ activeEntityId, onEntitySelect, waterLevel = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const entities: ChannelEntity[] = [
    { id: 'buoy-01', type: 'buoy', position: [-5, 0, 8], status: 'good', label: 'No.12 Starboard' },
    { id: 'buoy-02', type: 'buoy', position: [6, 0, 2], status: 'warning', label: 'No.13 Port' },
    { id: 'beacon-01', type: 'beacon', position: [-12, 2, -10], status: 'good', label: 'Sector Light A' },
    { id: 'drone-01', type: 'drone', position: [2, 10, 5], status: 'inspecting', label: 'UAV-X4' },
    { id: 'usv-01', type: 'usv', position: [4, 0, -5], status: 'inspecting', label: 'USV-Patrol', rotation: Math.PI }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const moonLight = new THREE.DirectionalLight(0xa5f3fc, 1.5);
    moonLight.position.set(-20, 30, -20);
    scene.add(moonLight);
    
    // Beacon Light (Spotlight)
    const beaconLight = new THREE.SpotLight(0x22c55e, 20, 100, 0.3, 0.5, 1);
    beaconLight.position.set(-12, 12, -10);
    beaconLight.target.position.set(-20, 0, -30);
    scene.add(beaconLight);
    scene.add(beaconLight.target);

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x082f49, 
      specular: 0x111111,
      shininess: 100,
      transparent: true, 
      opacity: 0.8,
      wireframe: false,
      flatShading: true
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // River Banks (Abstract)
    const bankGeo = new THREE.BoxGeometry(40, 5, 200);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const leftBank = new THREE.Mesh(bankGeo, bankMat);
    leftBank.position.set(-30, -1, 0);
    scene.add(leftBank);
    
    const rightBank = new THREE.Mesh(bankGeo, bankMat);
    rightBank.position.set(35, -1, 0);
    scene.add(rightBank);

    // Entities Group
    const entityGroup = new THREE.Group();
    scene.add(entityGroup);
    
    const entityMeshes: THREE.Mesh[] = [];

    entities.forEach(ent => {
        const group = new THREE.Group();
        group.position.set(...ent.position);
        
        let mesh;
        const color = ent.status === 'good' ? 0x22c55e : ent.status === 'warning' ? 0xeab308 : 0xef4444;

        if (ent.type === 'buoy') {
            // Buoy Shape
            const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1, 2), new THREE.MeshPhongMaterial({ color: 0xef4444 }));
            base.position.y = 0.5;
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3), new THREE.MeshPhongMaterial({ color: 0xffffff }));
            tower.position.y = 2.5;
            const light = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
            light.position.y = 4.2;
            
            group.add(base, tower, light);
            mesh = base; // Hit target

            // Watch Circle (The allowable drift area)
            const circleGeo = new THREE.RingGeometry(3, 3.2, 32);
            const circleMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, opacity: 0.3, transparent: true, side: THREE.DoubleSide });
            const circle = new THREE.Mesh(circleGeo, circleMat);
            circle.rotation.x = Math.PI / 2;
            circle.position.y = 0.1;
            group.add(circle);

        } else if (ent.type === 'beacon') {
            // Beacon Tower
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.5, 8), new THREE.MeshPhongMaterial({ color: 0xffffff }));
            tower.position.y = 4;
            const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0x22c55e }));
            top.position.y = 8.5;
            group.add(tower, top);
            mesh = tower;

        } else if (ent.type === 'drone') {
            // Drone
            const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshPhongMaterial({ color: 0x94a3b8 }));
            const rotorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8);
            const rotorMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
            
            [[0.8,0.8], [-0.8,0.8], [0.8,-0.8], [-0.8,-0.8]].forEach(([x,z]) => {
                const r = new THREE.Mesh(rotorGeo, rotorMat);
                r.position.set(x, 0.1, z);
                body.add(r);
            });
            group.add(body);
            mesh = body;

            // Scanning Frustum
            const coneGeo = new THREE.ConeGeometry(2, 6, 4, 1, true);
            const coneMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, wireframe: true });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.rotation.x = -Math.PI;
            cone.position.y = -3;
            group.add(cone);

        } else if (ent.type === 'usv') {
            // USV Boat
            const hull = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 4), new THREE.MeshPhongMaterial({ color: 0xf97316 }));
            hull.position.y = 0.4;
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 1), new THREE.MeshPhongMaterial({ color: 0x333333 }));
            cabin.position.set(0, 1, -0.5);
            group.add(hull, cabin);
            mesh = hull;
            if (ent.rotation) group.rotation.y = ent.rotation;
        } else {
            mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xffffff}));
            group.add(mesh);
        }

        mesh.userData = { id: ent.id };
        entityMeshes.push(mesh);
        entityGroup.add(group);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(entityMeshes);
      if (intersects.length > 0) {
        onEntitySelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Water
      const posAttribute = water.geometry.attributes.position;
      const vertex = new THREE.Vector3();
      for (let i = 0; i < posAttribute.count; i++) {
          vertex.fromBufferAttribute(posAttribute, i);
          // Simple wave function
          vertex.z = Math.sin(vertex.x * 0.2 + time) * 0.5 + Math.cos(vertex.y * 0.15 + time * 0.8) * 0.5;
          posAttribute.setZ(i, vertex.z);
      }
      posAttribute.needsUpdate = true;
      water.position.y = waterLevel;

      // Animate Entities
      entityGroup.children.forEach((child, i) => {
          const entityType = entities[i].type;
          
          if (entityType === 'buoy') {
              // Bobbing motion
              child.position.y = Math.sin(time * 2 + i) * 0.3 + waterLevel;
              child.rotation.x = Math.sin(time + i) * 0.1;
              child.rotation.z = Math.cos(time * 1.5 + i) * 0.1;
          } else if (entityType === 'drone') {
              // Hovering
              child.position.y = 10 + Math.sin(time * 3) * 0.2;
              // Scanning rotation
              child.children[1].rotation.y += 0.05; // Rotate cone
          } else if (entityType === 'usv') {
              // Moving forward slowly
              child.position.z -= 0.05;
              if (child.position.z < -20) child.position.z = 20;
              // Bobbing
              child.position.y = Math.sin(time * 3) * 0.1 + waterLevel;
          } else if (entityType === 'beacon') {
              // Rotate light if beacon
              // (Beacon light is separate object in scene, rotate its target actually)
              beaconLight.target.position.x = -12 + Math.sin(time) * 30;
              beaconLight.target.position.z = -10 + Math.cos(time) * 30;
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeEntityId, waterLevel]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
