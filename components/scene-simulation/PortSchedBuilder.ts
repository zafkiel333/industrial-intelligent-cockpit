
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initPortSchedScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Space Environment
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(50, 20, 50);
  group.add(sun);
  
  // Starfield background
  const starsGeo = new THREE.BufferGeometry();
  const starsPos = new Float32Array(3000 * 3);
  for(let i=0; i<3000; i++) {
      const r = 100 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starsPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      starsPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      starsPos[i*3+2] = r * Math.cos(phi);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0x555555, size: 0.5 });
  disposables.push(starsGeo, starsMat);
  const stars = new THREE.Points(starsGeo, starsMat);
  group.add(stars);

  // 2. Holographic Earth Globe
  const globeGroup = new THREE.Group();
  group.add(globeGroup);
  animatables.psGlobe = globeGroup;

  const globeGeo = new THREE.SphereGeometry(20, 64, 64);
  const globeMat = new THREE.MeshBasicMaterial({ 
      color: 0x050b1a, 
      transparent: true, 
      opacity: 0.9,
      wireframe: false
  });
  disposables.push(globeGeo, globeMat);
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globeGroup.add(globe);

  // Grid/Wireframe Overlay
  const gridGeo = new THREE.WireframeGeometry(globeGeo);
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.1 });
  disposables.push(gridGeo, gridMat);
  const gridMesh = new THREE.LineSegments(gridGeo, gridMat);
  globeGroup.add(gridMesh);

  // 3. Port Nodes
  animatables.psPorts = [];
  // Approx lat/lon mapping to 3D sphere
  const ports = [
      { name: 'Shanghai', lat: 31.2, lon: 121.5 },
      { name: 'Singapore', lat: 1.3, lon: 103.8 },
      { name: 'Rotterdam', lat: 51.9, lon: 4.4 },
      { name: 'Los Angeles', lat: 34.0, lon: -118.2 },
      { name: 'New York', lat: 40.7, lon: -74.0 },
      { name: 'Dubai', lat: 25.2, lon: 55.3 },
      { name: 'Hamburg', lat: 53.5, lon: 9.9 },
      { name: 'Tokyo', lat: 35.6, lon: 139.6 }
  ];

  const portGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const portMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  disposables.push(portGeo, portMat);
  const ringGeo = new THREE.RingGeometry(0.4, 0.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true });
  disposables.push(ringGeo, ringMat);

  const radius = 20;
  ports.forEach(p => {
      const phi = (90 - p.lat) * (Math.PI / 180);
      const theta = (p.lon + 180) * (Math.PI / 180);
      
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));
      
      const portGroup = new THREE.Group();
      portGroup.position.set(x, y, z);
      
      // Orient outwards
      portGroup.lookAt(x*2, y*2, z*2);
      
      const dot = new THREE.Mesh(portGeo, portMat);
      portGroup.add(dot);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      portGroup.add(ring);
      
      globeGroup.add(portGroup);
      animatables.psPorts?.push(portGroup);
      
      // Store data for routing
      (portGroup as any).userData = { ...p, vector: new THREE.Vector3(x, y, z) };
  });

  // 4. Routes (Arcs)
  animatables.psRoutes = [];
  animatables.portSchedShips = [];
  
  const shipGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
  shipGeo.rotateX(Math.PI / 2);
  const shipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  disposables.push(shipGeo, shipMat);

  // Define routes between ports indices
  const routePairs = [[0,1], [1,5], [5,2], [2,4], [1,7], [7,3]]; // SHA-SIN, SIN-DUB, DUB-ROT, ROT-NY, SIN-TOK, TOK-LA
  
  const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
  disposables.push(lineMat);

  routePairs.forEach(pair => {
      const p1 = (animatables.psPorts![pair[0]] as any).userData.vector;
      const p2 = (animatables.psPorts![pair[1]] as any).userData.vector;
      
      // Create Great Circle Arc
      const points = [];
      const segmentCount = 50;
      for (let i = 0; i <= segmentCount; i++) {
          const t = i / segmentCount;
          // Slerp logic approx
          const v = new THREE.Vector3().copy(p1).lerp(p2, t).normalize().multiplyScalar(radius + 0.1);
          // Add arc height (loft)
          const h = Math.sin(t * Math.PI) * 2;
          v.multiplyScalar(1 + h/radius);
          points.push(v);
      }
      
      const routeGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(routeGeo);
      const line = new THREE.Line(routeGeo, lineMat);
      globeGroup.add(line);
      animatables.psRoutes?.push(line);
      
      // Add ships to this route
      const numShips = Math.floor(Math.random() * 3) + 1;
      for(let k=0; k<numShips; k++) {
          const shipMesh = new THREE.Mesh(shipGeo, shipMat.clone());
          globeGroup.add(shipMesh);
          
          animatables.portSchedShips?.push({
              mesh: shipMesh,
              routeIdx: animatables.psRoutes!.length - 1,
              t: Math.random(),
              speed: 0.001 + Math.random() * 0.001,
              status: Math.random() > 0.8 ? 'late' : 'ok'
          });
      }
  });

  // 5. Satellites
  animatables.psSatellites = [];
  const satGeo = new THREE.BoxGeometry(0.5, 0.2, 0.5);
  const satMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  disposables.push(satGeo, satMat);
  
  for(let i=0; i<6; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      const orbitR = radius + 8;
      // Random orbit plane
      const axis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      
      (sat as any).userData = { axis, angle: Math.random() * Math.PI * 2, radius: orbitR, speed: 0.005 + Math.random()*0.005 };
      group.add(sat);
      animatables.psSatellites.push(sat as unknown as THREE.Group);
  }
};

export const animatePortSchedScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { speedMultiplier: number, showDelays: boolean }
    const speedMult = simData?.speedMultiplier || 1.0;
    
    // 1. Rotate Globe
    if (animatables.psGlobe) {
        animatables.psGlobe.rotation.y = time * 0.05;
    }

    // 2. Pulse Ports
    if (animatables.psPorts) {
        animatables.psPorts.forEach((p, i) => {
            const ring = p.children[1];
            const s = 1 + Math.sin(time * 3 + i) * 0.3;
            ring.scale.set(s, s, 1);
            (ring as THREE.Mesh).material.opacity = 1 - (s - 0.7);
        });
    }

    // 3. Move Ships
    if (animatables.portSchedShips && animatables.psRoutes) {
        animatables.portSchedShips.forEach(ship => {
            const routeLine = animatables.psRoutes![ship.routeIdx];
            // Access points from geometry
            const positions = routeLine.geometry.attributes.position.array as Float32Array;
            const ptCount = positions.length / 3;
            
            ship.t += ship.speed * speedMult;
            if (ship.t > 1) ship.t = 0;
            
            // Interpolate position along line points
            const floatIdx = ship.t * (ptCount - 1);
            const idx = Math.floor(floatIdx);
            const subT = floatIdx - idx;
            
            const nextIdx = Math.min(idx + 1, ptCount - 1);
            
            const p1 = new THREE.Vector3(positions[idx*3], positions[idx*3+1], positions[idx*3+2]);
            const p2 = new THREE.Vector3(positions[nextIdx*3], positions[nextIdx*3+1], positions[nextIdx*3+2]);
            
            const pos = new THREE.Vector3().lerpVectors(p1, p2, subT);
            
            // Transform local globe rotation to world if needed? 
            // Ships are children of globeGroup, so they rotate with it automatically.
            ship.mesh.position.copy(pos);
            
            // Orient along path
            // Need to look at next point
            ship.mesh.lookAt(p2);
            
            // Color status
            if (ship.status === 'late') {
                (ship.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
            } else {
                (ship.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
            }
        });
    }

    // 4. Orbit Satellites
    if (animatables.psSatellites) {
        animatables.psSatellites.forEach(sat => {
            const data = (sat as any).userData;
            data.angle += data.speed;
            
            // Calculate position on circle in arbitrary plane
            // P = R * (cos(a)*U + sin(a)*V) where U,V are orthogonal vectors in plane perpendicular to axis
            // Axis is normal to plane.
            
            // Find arbitrary perpendicular vector
            let tangent = new THREE.Vector3(0,1,0);
            if (Math.abs(data.axis.y) > 0.9) tangent = new THREE.Vector3(1,0,0);
            
            const U = new THREE.Vector3().crossVectors(data.axis, tangent).normalize();
            const V = new THREE.Vector3().crossVectors(data.axis, U).normalize();
            
            const x = data.radius * (Math.cos(data.angle) * U.x + Math.sin(data.angle) * V.x);
            const y = data.radius * (Math.cos(data.angle) * U.y + Math.sin(data.angle) * V.y);
            const z = data.radius * (Math.cos(data.angle) * U.z + Math.sin(data.angle) * V.z);
            
            sat.position.set(x, y, z);
            sat.lookAt(0,0,0);
        });
    }
};
