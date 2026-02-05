
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BoomFatigueSceneProps } from './three-types';

export const BoomFatigueThreeScene: React.FC<BoomFatigueSceneProps> = ({
  boomAngle,
  armAngle,
  bucketAngle,
  stressFactor,
  weldHealth,
  strainGauges,
  showStrainSensors,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boomGroupRef = useRef<THREE.Group | null>(null);
  const armGroupRef = useRef<THREE.Group | null>(null);
  const bucketGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 5, 0);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const stressLight = new THREE.PointLight(0xff0000, 0, 20); // Dynamic red light for high stress
    stressLight.position.set(0, 8, 0);
    scene.add(stressLight);

    // --- Materials ---
    // Base steel material
    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.6,
        roughness: 0.4,
        flatShading: false
    });
    
    // Hydraulic cylinder material
    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.1
    });

    // Sensor material
    const sensorMat = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
    });

    materialsRef.current = [steelMat]; // Track materials for dynamic updates

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Base / Swing Platform (Simplified)
    const baseGeo = new THREE.CylinderGeometry(4, 4, 1, 32);
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({color: 0x1e293b}));
    mainGroup.add(base);

    // 2. Boom (动臂)
    const boomGroup = new THREE.Group();
    boomGroup.position.set(1, 1, 0); // Pivot point
    boomGroupRef.current = boomGroup;
    mainGroup.add(boomGroup);

    // Boom structure (Curved box shape approximation)
    const boomGeo = new THREE.BoxGeometry(1.5, 12, 2);
    // Deform vertices to look like a boom
    const pos = boomGeo.attributes.position;
    for(let i=0; i<pos.count; i++){
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if(y > 0) {
            pos.setZ(i, z - 1.5); // Curve forward at top
        }
    }
    boomGeo.computeVertexNormals();
    const boomMesh = new THREE.Mesh(boomGeo, steelMat.clone());
    materialsRef.current.push(boomMesh.material as THREE.MeshStandardMaterial);
    boomMesh.position.y = 6;
    boomMesh.rotation.x = -0.2;
    boomGroup.add(boomMesh);

    // Boom Cylinders
    const cyl1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 16), chromeMat);
    cyl1.position.set(-1, 3, 1);
    cyl1.rotation.x = -0.5;
    boomGroup.add(cyl1);
    const cyl2 = cyl1.clone();
    cyl2.position.set(1, 3, 1);
    boomGroup.add(cyl2);


    // 3. Arm (斗杆)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 11, -2); // Top of boom approx
    armGroupRef.current = armGroup;
    boomGroup.add(armGroup);

    const armGeo = new THREE.BoxGeometry(1.2, 8, 1.2);
    const armMesh = new THREE.Mesh(armGeo, steelMat.clone());
    materialsRef.current.push(armMesh.material as THREE.MeshStandardMaterial);
    armMesh.position.y = -3;
    armGroup.add(armMesh);

    // Arm Cylinder
    const armCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 16), chromeMat);
    armCyl.position.set(0, 1, 0.8);
    armCyl.rotation.x = 0.3;
    armGroup.add(armCyl);

    // 4. Bucket (铲斗)
    const bucketGroup = new THREE.Group();
    bucketGroup.position.set(0, -7, 0); // Bottom of arm
    bucketGroupRef.current = bucketGroup;
    armGroup.add(bucketGroup);

    const bucketGeo = new THREE.BoxGeometry(2, 2, 2.5);
    const bucketMesh = new THREE.Mesh(bucketGeo, new THREE.MeshStandardMaterial({color: 0x334155, metalness: 0.8, roughness: 0.6}));
    bucketGroup.add(bucketMesh);
    
    // Teeth
    for(let i=0; i<4; i++) {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), new THREE.MeshStandardMaterial({color: 0x94a3b8}));
        tooth.rotation.x = Math.PI;
        tooth.position.set(-0.75 + i*0.5, -1.2, 0.5);
        bucketGroup.add(tooth);
    }

    // 5. Strain Gauges (Sensors)
    const sensorGroup = new THREE.Group();
    boomGroup.add(sensorGroup); // Attach to boom for now as primary stress point

    strainGauges.forEach(gauge => {
        const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.1), sensorMat.clone());
        sensor.position.set(...gauge.position);
        sensor.lookAt(new THREE.Vector3(gauge.position[0]*2, gauge.position[1], gauge.position[2]*2)); // Face outward roughly
        sensor.userData = { id: gauge.id, val: gauge.value };
        sensorGroup.add(sensor);
        
        // Wire visual
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0), new THREE.Vector3(0, -2, 0)
        ]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.5}));
        sensor.add(line);
    });
    
    // Ground Grid
    const grid = new THREE.GridHelper(50, 25, 0x1e293b, 0x0f172a);
    grid.position.y = 0;
    scene.add(grid);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Mechanical Movement
      if (boomGroupRef.current) {
          // Map 0-90 deg to radians roughly
          const targetRot = THREE.MathUtils.degToRad(boomAngle - 45); // -45 to +45 range approx
          boomGroupRef.current.rotation.x = THREE.MathUtils.lerp(boomGroupRef.current.rotation.x, targetRot, 0.1);
      }
      if (armGroupRef.current) {
          const targetRot = THREE.MathUtils.degToRad(armAngle - 90);
          armGroupRef.current.rotation.x = THREE.MathUtils.lerp(armGroupRef.current.rotation.x, targetRot, 0.1);
      }
      if (bucketGroupRef.current) {
          const targetRot = THREE.MathUtils.degToRad(bucketAngle);
          bucketGroupRef.current.rotation.x = THREE.MathUtils.lerp(bucketGroupRef.current.rotation.x, targetRot, 0.1);
      }

      // 2. Stress Heatmap Visualization
      // Interpolate color from Steel (Grey) -> Stress (Red)
      materialsRef.current.forEach(mat => {
          if (viewMode === 'stress') {
              // Base color
              const baseColor = new THREE.Color(0x475569);
              // Stress color (Red/Orange)
              const stressColor = new THREE.Color(0xff3300);
              
              // Pulse the stress factor slightly for dynamic effect
              const dynamicFactor = stressFactor * (0.9 + Math.sin(time * 5) * 0.1);
              
              mat.color.lerpColors(baseColor, stressColor, dynamicFactor);
              mat.emissive.copy(stressColor);
              mat.emissiveIntensity = dynamicFactor * 0.5;
              mat.wireframe = false;
          } else if (viewMode === 'wireframe') {
              mat.color.setHex(0x00ff00);
              mat.emissive.setHex(0x000000);
              mat.wireframe = true;
          } else {
              // Standard
              mat.color.setHex(0x475569);
              mat.emissive.setHex(0x000000);
              mat.wireframe = false;
          }
      });

      // 3. Sensor Animation
      if (showStrainSensors) {
          sensorGroup.visible = true;
          sensorGroup.children.forEach((child: any) => {
               // Flash sensors based on their 'value' (mocked via random here or passed props)
               const val = child.userData.val || 0;
               const intensity = (val / 1000) + Math.sin(time * 10) * 0.2;
               child.material.color.setHSL(0.3 - intensity * 0.3, 1.0, 0.5); // Green to Red
          });
      } else {
          sensorGroup.visible = false;
      }

      // 4. Fatigue Crack Visual (If health is low)
      if (weldHealth < 80) {
          // Visual warning light
          stressLight.intensity = (100 - weldHealth) * 0.1 * (Math.sin(time * 5) + 1);
      } else {
          stressLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [boomAngle, armAngle, bucketAngle, stressFactor, weldHealth, strainGauges, showStrainSensors, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
