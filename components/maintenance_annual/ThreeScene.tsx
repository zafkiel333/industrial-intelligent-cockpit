import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AnnualThreeProps } from './three-types';

export const AnnualThreeScene: React.FC<AnnualThreeProps> = ({ 
  isScanning, 
  scanProgress,
  scanColor = '#f59e0b',
  inspectionPoints = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Dark industrial background
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Objects: Pressure Vessel ---

    const vesselGroup = new THREE.Group();
    scene.add(vesselGroup);

    // Main Body Cylinder
    const bodyGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32, 1, true);
    // Standard industrial metal material
    const metalMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x475569, 
      metalness: 0.8, 
      roughness: 0.2, 
      side: THREE.DoubleSide,
      clearcoat: 0.5
    });
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.rotation.x = Math.PI / 2; // Horizontal orientation
    vesselGroup.add(body);

    // End Caps (Spheres)
    const capGeo = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const leftCap = new THREE.Mesh(capGeo, metalMat);
    leftCap.rotation.z = Math.PI / 2;
    leftCap.position.x = -3;
    vesselGroup.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, metalMat);
    rightCap.rotation.z = -Math.PI / 2;
    rightCap.position.x = 3;
    vesselGroup.add(rightCap);

    // Weld Seams (Torus rings)
    const seamGeo = new THREE.TorusGeometry(1.51, 0.05, 16, 100);
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    
    [-3, -1, 1, 3].forEach(x => {
        const seam = new THREE.Mesh(seamGeo, seamMat);
        seam.rotation.y = Math.PI / 2;
        seam.position.x = x;
        vesselGroup.add(seam);
    });

    // Support Legs
    const legGeo = new THREE.BoxGeometry(0.5, 1, 2);
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(-2, -1.8, 0);
    vesselGroup.add(leg1);
    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(2, -1.8, 0);
    vesselGroup.add(leg2);

    // Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, metalMat);
    nozzle.position.set(0, 1.8, 0);
    vesselGroup.add(nozzle);


    // Scanning Ring (Laser Effect)
    const scanRingGeo = new THREE.RingGeometry(1.8, 2.0, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({ 
        color: scanColor, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.6,
        blending: THREE.AdditiveBlending 
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.y = Math.PI / 2;
    scene.add(scanRing);

    // Scan Plane (The laser sheet)
    const scanPlaneGeo = new THREE.PlaneGeometry(0.2, 4);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
        color: scanColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    // Create a circular array of planes to simulate a volume scan
    const scanVol = new THREE.Group();
    for(let i=0; i<8; i++) {
        const p = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
        p.rotation.x = (i/8) * Math.PI;
        p.rotation.y = Math.PI / 2;
        scanVol.add(p);
    }
    scanRing.add(scanVol);


    // Inspection Points Markers
    const markersGroup = new THREE.Group();
    vesselGroup.add(markersGroup);

    inspectionPoints.forEach(pt => {
        const geo = new THREE.SphereGeometry(0.1, 16, 16);
        const color = pt.status === 'issue' ? 0xef4444 : (pt.status === 'ok' ? 0x10b981 : 0x64748b);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pt.position);
        
        // Add a pulsing ring
        const ringG = new THREE.TorusGeometry(0.15, 0.01, 8, 16);
        const ringM = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringG, ringM);
        // orient ring to surface normal roughly (simplified)
        ring.lookAt(new THREE.Vector3(0,0,0));
        mesh.add(ring);

        markersGroup.add(mesh);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const scanLight = new THREE.PointLight(scanColor, 2, 5);
    scene.add(scanLight);


    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (isScanning) {
          scanRing.visible = true;
          scanLight.visible = true;
          // Map progress 0-100 to X position -4 to 4
          const xPos = -4 + (scanProgress / 100) * 8;
          scanRing.position.x = xPos;
          scanLight.position.set(xPos, 0, 0);

          // Rotate scan volume
          scanVol.rotation.x += 0.1;
      } else {
          scanRing.visible = false;
          scanLight.visible = false;
      }
      
      // Pulse markers
      const time = Date.now() * 0.003;
      markersGroup.children.forEach(m => {
          m.scale.setScalar(1 + Math.sin(time) * 0.2);
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
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isScanning, scanProgress, scanColor, inspectionPoints]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
