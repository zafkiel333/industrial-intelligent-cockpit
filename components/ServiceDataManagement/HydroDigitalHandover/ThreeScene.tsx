
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HandoverSceneProps, HandoverAsset } from './three-types';

export const HydroHandoverThreeScene: React.FC<HandoverSceneProps> = ({ 
  scanProgress, assets, activeAssetId, onAssetSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, localClippingEnabled: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(-10, 50, 20);
    scene.add(dirLight);
    
    // Scanning Plane (Clipping Plane)
    // The plane moves along X axis. 
    // Objects "behind" the plane are Solid (Completed), "ahead" are Wireframe (Pending).
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    
    // Group for "Blueprint" (Wireframe) - Always visible
    const blueprintGroup = new THREE.Group();
    scene.add(blueprintGroup);

    // Group for "Digital Twin" (Solid) - Clipped
    const solidGroup = new THREE.Group();
    scene.add(solidGroup);

    // Helper to create geometries based on type
    const createMesh = (asset: HandoverAsset, isSolid: boolean) => {
        let geo;
        if (asset.type === 'dam') {
            // Arc Dam Shape
            const shape = new THREE.Shape();
            shape.absarc(0, 0, 20, 0.5, Math.PI - 0.5, false);
            const settings = { depth: 15, bevelEnabled: false, curveSegments: 32 };
            geo = new THREE.ExtrudeGeometry(shape, settings);
            geo.rotateX(Math.PI / 2);
            geo.rotateZ(Math.PI / 2);
            geo.translate(0, 7.5, 0);
        } else if (asset.type === 'powerhouse') {
            geo = new THREE.BoxGeometry(10, 8, 15);
            geo.translate(15, 4, 0);
        } else if (asset.type === 'penstock') {
            geo = new THREE.CylinderGeometry(1, 1, 15, 16);
            geo.rotateZ(Math.PI / 2.5);
            geo.translate(5, 5, 0);
        } else {
             geo = new THREE.BoxGeometry(2,2,2);
        }

        let mat;
        if (isSolid) {
            // Active/Completed look
            mat = new THREE.MeshPhongMaterial({
                color: asset.handoverStatus === 'error' ? 0xef4444 : 0x06b6d4,
                emissive: asset.handoverStatus === 'error' ? 0x7f1d1d : 0x083344,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
                clippingPlanes: [clipPlane], // Magic happens here
                clipShadows: true,
                transparent: true,
                opacity: 0.9
            });
        } else {
            // Blueprint/Pending look
            mat = new THREE.MeshBasicMaterial({
                color: 0x334155,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
        }
        
        const mesh = new THREE.Mesh(geo, mat);
        if (asset.rotation) mesh.rotation.set(...asset.rotation);
        
        // Add Position Offset
        mesh.position.add(new THREE.Vector3(...asset.position));

        mesh.userData = { id: asset.id };
        return mesh;
    };

    const interactiveMeshes: THREE.Mesh[] = [];

    assets.forEach(asset => {
        // 1. Add Wireframe version (The "Design")
        const wireMesh = createMesh(asset, false);
        blueprintGroup.add(wireMesh);

        // 2. Add Solid version (The "Reality")
        const solidMesh = createMesh(asset, true);
        solidGroup.add(solidMesh);
        interactiveMeshes.push(solidMesh);

        // 3. Add Data Points (floating icons/particles)
        if (asset.handoverStatus === 'processing') {
            const pCount = 50;
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(pCount * 3);
            for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random()-0.5) * 5;
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.2 });
            const particles = new THREE.Points(pGeo, pMat);
            particles.position.set(...asset.position);
            particles.position.x += 15; // Rough center adjust
            scene.add(particles);
            // Simple animation loop would be needed here for particles
        }
    });

    // Scan Plane Visualizer (A glowing line/plane)
    const scanPlaneGeo = new THREE.PlaneGeometry(0.5, 60);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
        color: 0x22d3ee, 
        transparent: true, 
        opacity: 0.5, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const scanVisual = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanVisual.rotation.y = Math.PI / 2;
    scanVisual.rotation.z = Math.PI / 2; // Vertical line
    scene.add(scanVisual);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(80, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        onAssetSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update Clipping Plane based on scanProgress (map 0..1 to world coords -20..+30)
      const scanX = -30 + scanProgress * 60;
      clipPlane.constant = scanX; 
      
      // Move visual plane
      scanVisual.position.x = -scanX; // Plane constant is distance from origin, visual needs position

      // Highlight Active Asset
      interactiveMeshes.forEach(mesh => {
         if (mesh.userData.id === activeAssetId) {
             (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 1.0;
         } else {
             (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2;
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
  }, [scanProgress, activeAssetId, assets]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
