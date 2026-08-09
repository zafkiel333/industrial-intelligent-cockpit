
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

// Helper to create stress-colorable mesh
const createStressMesh = (geometry: THREE.BufferGeometry) => {
    // Ensure vertex colors exist
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        colors[i*3] = 0.2; // Blue-ish base
        colors[i*3+1] = 0.4;
        colors[i*3+2] = 1.0;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.MeshStandardMaterial({ 
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.6,
        flatShading: false
    });
    return new THREE.Mesh(geometry, material);
};

export const initMineEquipStrengthScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment
  const grid = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
  grid.position.y = -4;
  group.add(grid);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  group.add(dirLight);

  // 2. Excavator Arm Assembly
  const armGroup = new THREE.Group();
  group.add(armGroup);
  animatables.excavatorArm = armGroup;

  // Base pivot
  const baseGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  disposables.push(baseGeo, baseMat);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -3.5;
  armGroup.add(base);

  // Boom (The large arm) - Stress Mesh
  // Use a subdivided box to allow smooth color gradients for stress
  const boomGeo = new THREE.BoxGeometry(2, 12, 2, 8, 24, 8);
  // Shift pivot to bottom
  boomGeo.translate(0, 6, 0); 
  const boom = createStressMesh(boomGeo);
  disposables.push(boomGeo, boom.material);
  boom.position.y = -3;
  armGroup.add(boom);
  animatables.stressMeshBoom = boom;

  // Stick (The forearm) - Stress Mesh attached to Boom tip
  const stickGroup = new THREE.Group();
  stickGroup.position.set(0, 12, 0); // End of boom
  boom.add(stickGroup);
  
  const stickGeo = new THREE.BoxGeometry(1.5, 8, 1.5, 6, 16, 6);
  stickGeo.translate(0, -4, 0); // Pivot at top connecting to boom
  const stick = createStressMesh(stickGeo);
  disposables.push(stickGeo, stick.material);
  stickGroup.add(stick);
  animatables.stressMeshStick = stick;

  // Bucket (The tool)
  const bucketGroup = new THREE.Group();
  bucketGroup.position.set(0, -8, 0); // End of stick
  stick.add(bucketGroup);
  
  // Custom bucket shape
  const bucketShape = new THREE.Shape();
  bucketShape.moveTo(0,0);
  bucketShape.lineTo(2, -1);
  bucketShape.quadraticCurveTo(1, -3, -1, -3);
  bucketShape.lineTo(-2, 0);
  bucketShape.lineTo(0, 0);
  const bucketGeo = new THREE.ExtrudeGeometry(bucketShape, { depth: 2, bevelEnabled: false });
  bucketGeo.center();
  // Ensure enough vertices for stress coloring
  const bucket = createStressMesh(bucketGeo); 
  disposables.push(bucketGeo, bucket.material);
  bucketGroup.add(bucket);
  animatables.stressMeshBucket = bucket;

  // Load (Rock) inside bucket
  const loadGeo = new THREE.DodecahedronGeometry(1.2, 0);
  const loadMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, wireframe: true });
  disposables.push(loadGeo, loadMat);
  const load = new THREE.Mesh(loadGeo, loadMat);
  load.visible = false;
  bucketGroup.add(load);
  animatables.loadRock = load;

  // 3. Hydraulic Cylinders (Visual only, simple lines or thin cylinders)
  animatables.hydraulicCylinders = [];
  const cylGeo = new THREE.CylinderGeometry(0.3, 0.3, 6);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  disposables.push(cylGeo, cylMat);
  
  // Boom Cylinder
  const cyl1Group = new THREE.Group();
  const cyl1 = new THREE.Mesh(cylGeo, cylMat);
  cyl1.position.y = 3;
  cyl1Group.add(cyl1);
  cyl1Group.position.set(0, -3, 1.5);
  // Look at mid-boom
  cyl1Group.lookAt(0, 5, 0);
  armGroup.add(cyl1Group);
  animatables.hydraulicCylinders.push(cyl1Group);

  // 4. Force Arrow (Vector)
  const dir = new THREE.Vector3(0, -1, 0);
  const origin = new THREE.Vector3(0, 0, 0);
  const arrowHelper = new THREE.ArrowHelper(dir, origin, 5, 0xff0000, 1, 1);
  bucketGroup.add(arrowHelper);
  animatables.forceArrows = [arrowHelper];
};

export const animateMineEquipStrengthScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // Sim Data: { load: number (0-100), cycle: string ('DIG'|'DUMP'|'RETURN') }
    const loadFactor = simData?.load / 100 || 0;
    
    // 1. Arm Movement (Kinematics)
    const boom = animatables.stressMeshBoom;
    const stickGroup = boom?.children.find(c => c.type === 'Group');
    const bucketGroup = animatables.stressMeshStick?.children.find(c => c.type === 'Group');
    
    if (boom && stickGroup && bucketGroup) {
        // Digging Cycle Animation
        // t cycle approx 5 seconds
        const t = time % 5;
        
        // Boom Rotation (Shoulder)
        // 0-2s: Dig (Lower)
        // 2-3s: Lift
        // 3-4s: Dump
        // 4-5s: Return
        let boomAngle = 0;
        let stickAngle = 0;
        let bucketAngle = 0;
        let hasLoad = false;

        if (t < 2) {
             // Digging phase
             const p = t/2;
             boomAngle = THREE.MathUtils.lerp(-0.2, 0.5, p);
             stickAngle = THREE.MathUtils.lerp(-0.5, 1.0, p);
             bucketAngle = THREE.MathUtils.lerp(-1, 0.5, p);
             if (p > 0.5) hasLoad = true;
        } else if (t < 3.5) {
             // Lifting/Swinging
             const p = (t-2)/1.5;
             boomAngle = THREE.MathUtils.lerp(0.5, -0.1, p);
             stickAngle = 1.0;
             bucketAngle = 0.5;
             hasLoad = true;
        } else {
             // Return
             const p = (t-3.5)/1.5;
             boomAngle = THREE.MathUtils.lerp(-0.1, -0.2, p);
             stickAngle = THREE.MathUtils.lerp(1.0, -0.5, p);
             bucketAngle = THREE.MathUtils.lerp(0.5, -1, p);
             hasLoad = false;
        }

        boom.rotation.x = boomAngle;
        stickGroup.rotation.x = stickAngle;
        bucketGroup.rotation.x = bucketAngle;

        // Rock visibility
        if (animatables.loadRock) animatables.loadRock.visible = hasLoad;
        
        // Force Arrow Scale
        if (animatables.forceArrows && animatables.forceArrows[0]) {
            const arrow = animatables.forceArrows[0];
            const force = hasLoad ? 1 + loadFactor * 2 : 0.2;
            arrow.setLength(force * 3, 1, 0.5);
            // Orient arrow down world space? Local space is bucket.
            // Simplified: Arrow points roughly against motion or down
        }

        // 2. Stress Visualization (Heatmap)
        // We update vertex colors based on "stress"
        // Stress is high at joints: Boom Base (Pivot), Stick-Boom Joint.
        // Stress increases with Load and Extension.
        
        const applyStressColor = (mesh: THREE.Mesh, jointY: number, maxStress: number) => {
            const geo = mesh.geometry;
            const pos = geo.attributes.position;
            const col = geo.attributes.color;
            const count = pos.count;
            
            const cBlue = new THREE.Color(0x3b82f6);
            const cGreen = new THREE.Color(0x22c55e);
            const cRed = new THREE.Color(0xef4444);
            const cYellow = new THREE.Color(0xeab308);

            for(let i=0; i<count; i++) {
                const y = pos.getY(i);
                // Distance from joint
                const dist = Math.abs(y - jointY);
                // Stress falls off with distance
                const localStress = maxStress * Math.exp(-dist * 0.5);
                
                // Color ramp
                const c = new THREE.Color().copy(cBlue);
                if (localStress > 0.3) c.lerp(cGreen, (localStress-0.3)/0.3);
                if (localStress > 0.6) c.lerp(cYellow, (localStress-0.6)/0.2);
                if (localStress > 0.8) c.lerp(cRed, (localStress-0.8)/0.2);
                
                col.setXYZ(i, c.r, c.g, c.b);
            }
            col.needsUpdate = true;
        };

        // Calculate dynamic stress factors
        // Higher when arm is extended (lever arm) and has load
        const extension = Math.sin(stickAngle) + 1; // approx
        const dynamicLoad = hasLoad ? loadFactor * 1.5 : 0.1;
        const totalStress = dynamicLoad * (1 + extension * 0.5);

        // Update Boom (Pivot at bottom, roughly y=-5 in local)
        // Boom geometry translated 6 up, pos y is -3. So center is 3. 
        // Boom joint is at bottom of visual mesh.
        // Mesh local bounds: approx -6 to 6. Pivot at -6.
        applyStressColor(boom, -6, totalStress);

        // Update Stick (Pivot at top, y=4 in local)
        // Stick geometry translated -4. Mesh local bounds -8 to 0. Pivot at 0.
        applyStressColor(animatables.stressMeshStick!, 0, totalStress * 0.8);
    }
};
