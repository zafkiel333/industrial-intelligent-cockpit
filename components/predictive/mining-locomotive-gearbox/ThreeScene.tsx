
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LocoGearboxSceneProps } from './three-types';

export const LocoGearboxScene: React.FC<LocoGearboxSceneProps> = ({
  rpm,
  torqueLoad,
  oilDebrisDensity,
  viewMode,
  components,
  activeComponentId,
  onComponentSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinionRef = useRef<THREE.Group | null>(null);
  const wheelRef = useRef<THREE.Group | null>(null);
  const debrisSystemRef = useRef<THREE.Points | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-locomotive-gearbox useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030510, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
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
    controls.autoRotate = false;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xf59e0b, 2, 50); // Amber industrial light
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const blueLight = new THREE.SpotLight(0x3b82f6, 5);
    blueLight.position.set(-10, 5, -5);
    scene.add(blueLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, metalness: 0.8, roughness: 0.3 
    });
    
    const housingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      metalness: 0.5,
      roughness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    const stressMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Housing (Ghosted)
    const housingGeo = new THREE.BoxGeometry(8, 5, 4);
    const housing = new THREE.Mesh(housingGeo, housingMat);
    mainGroup.add(housing);
    
    const housingEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(housingGeo),
        new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 })
    );
    mainGroup.add(housingEdges);

    // Helper to create gears
    const createGear = (radius: number, teeth: number, width: number, color: number) => {
        const group = new THREE.Group();
        
        // Gear Body
        const bodyGeo = new THREE.CylinderGeometry(radius - 0.2, radius - 0.2, width, 32);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Teeth
        const toothGeo = new THREE.BoxGeometry(0.4, width, 0.4);
        for(let i=0; i<teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const tooth = new THREE.Mesh(toothGeo, bodyMat);
            tooth.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            tooth.rotation.y = -angle;
            group.add(tooth);
        }

        return group;
    };

    // 2. Pinion (Input - High Speed)
    const pinionGroup = createGear(1.2, 12, 1.5, 0x94a3b8);
    pinionGroup.position.set(-2, 0, 0);
    pinionGroup.userData = { id: 'pinion' };
    pinionRef.current = pinionGroup;
    mainGroup.add(pinionGroup);

    // 3. Wheel (Output - Low Speed)
    const wheelGroup = createGear(2.8, 28, 1.5, 0x64748b);
    wheelGroup.position.set(2.2, 0, 0); // Meshing distance
    // Rotate slightly to mesh
    wheelGroup.rotation.x = 0.1;
    wheelGroup.userData = { id: 'wheel' };
    wheelRef.current = wheelGroup;
    mainGroup.add(wheelGroup);

    // 4. Shafts
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 16);
    shaftGeo.rotateX(Math.PI / 2);
    
    const inputShaft = new THREE.Mesh(shaftGeo, steelMat);
    inputShaft.position.set(-2, 0, 0);
    mainGroup.add(inputShaft);

    const outputShaft = new THREE.Mesh(shaftGeo, steelMat);
    outputShaft.position.set(2.2, 0, 0);
    mainGroup.add(outputShaft);

    // 5. Debris Particles
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random()-0.5) * 7;
        pPos[i*3+1] = (Math.random()-0.5) * 4;
        pPos[i*3+2] = (Math.random()-0.5) * 3;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xd97706, // Oil/Metal chips color
        size: 0.08,
        transparent: true,
        opacity: 0.0, // Controlled by prop
        blending: THREE.AdditiveBlending
    });
    const debris = new THREE.Points(pGeo, pMat);
    debrisSystemRef.current = debris;
    mainGroup.add(debris);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        // Simplified hit test on groups
        // In reality, raycast against meshes
        const hits = raycaster.intersectObjects(mainGroup.children, true);
        if (hits.length > 0) {
            // Find parent group with ID
            let target: any = hits[0].object;
            while(target.parent && target.parent !== mainGroup) target = target.parent;
            if (target.userData.id) onComponentSelect(target.userData.id);
        } else {
            onComponentSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;
      controls.update();

      // Rotation Logic
      // Ratio approx 2.33 (28/12)
      const inputSpeed = rpm * 0.002;
      if (pinionRef.current) pinionRef.current.rotation.x -= inputSpeed;
      if (wheelRef.current) wheelRef.current.rotation.x += inputSpeed / 2.33;
      
      // Shafts rotate with gears
      inputShaft.rotation.x = (pinionRef.current?.rotation.x || 0);
      outputShaft.rotation.x = (wheelRef.current?.rotation.x || 0);

      // Visual Updates based on Props
      
      // 1. Debris Visibility
      if (debrisSystemRef.current) {
          const mat = debrisSystemRef.current.material as THREE.PointsMaterial;
          mat.opacity = oilDebrisDensity * (viewMode === 'particles' ? 0.8 : 0.2);
          
          // Agitate particles
          const pos = debrisSystemRef.current.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              pos[i*3+1] += Math.sin(time * 10 + i) * 0.01 * (rpm/1000);
          }
          debrisSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Material/View Mode
      const updateComponent = (group: THREE.Group, id: string) => {
          const data = components.find(c => c.id === id);
          const isSelected = activeComponentId === id;
          const meshes = group.children.filter(c => c instanceof THREE.Mesh) as THREE.Mesh[];

          meshes.forEach(mesh => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              
              if (viewMode === 'stress') {
                  // Heatmap: stress -> Red
                  const stress = data ? data.wearLevel / 100 : 0;
                  // Base blue, high stress red
                  const col = new THREE.Color().setHSL(0.6 - stress * 0.6, 0.8, 0.5);
                  mat.color.copy(col);
                  mat.emissive.copy(col);
                  mat.emissiveIntensity = 0.5;
                  mat.wireframe = true;
              } else {
                  // Standard / Mechanical
                  mat.wireframe = false;
                  mat.emissiveIntensity = isSelected ? 0.3 : 0;
                  
                  if (data && data.wearLevel > 70) {
                      // Worn texture color
                      mat.color.lerpColors(new THREE.Color(0x94a3b8), new THREE.Color(0x573e32), 0.5);
                      mat.roughness = 0.8;
                  } else {
                      mat.color.setHex(id === 'pinion' ? 0x94a3b8 : 0x64748b);
                      mat.roughness = 0.4;
                  }

                  if (isSelected) mat.emissive.setHex(0xffffff);
                  else mat.emissive.setHex(0x000000);
              }
          });
      };

      if (pinionRef.current) updateComponent(pinionRef.current, 'pinion');
      if (wheelRef.current) updateComponent(wheelRef.current, 'wheel');

      // Vibration Shake
      if (mainGroupRef.current) {
        if (torqueLoad > 80) {
            const shake = 0.02;
            mainGroupRef.current.position.x = (Math.random()-0.5) * shake;
            mainGroupRef.current.position.y = (Math.random()-0.5) * shake;
        } else {
            mainGroupRef.current.position.set(0,0,0);
        }
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
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [rpm, torqueLoad, oilDebrisDensity, viewMode, activeComponentId, components]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
