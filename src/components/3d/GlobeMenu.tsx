/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlobeMenuProps {
  readonly isVisible: boolean;
}

function GlobeSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 3;
  const detail = 2;

  // Base geometry for the wireframe sphere
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(radius, detail), [radius, detail]);
  const wireframeGeometry = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);

  // Crescent dots geometry - simulating the dense dot cluster on the top-left edge seen in the image
  const crescentPoints = useMemo(() => {
    const pts: number[] = [];
    const pointsCount = 6000;

    for (let i = 0; i < pointsCount; i++) {
      // Random point on sphere surface
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      // Keep points largely on the upper-left sphere quadrant and slightly forward
      if (x < -0.2 && y > 0.8 && z > -1.0) {
        // Apply slight noise/offset to elevate them out of the main lines
        pts.push(x * 1.02, y * 1.02, z * 1.02);
      }
    }
    return new Float32Array(pts);
  }, [radius]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Wireframe */}
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.6} linewidth={1} />
      </lineSegments>

      {/* Visible nodes at vertices */}
      <points geometry={geometry}>
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.8} />
      </points>

      {/* Glowing crescent dots layer */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={crescentPoints.length / 3}
            array={crescentPoints}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#00e5ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>

      {/* Semi-transparent inner core to give the sphere volume and depth */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#061016" transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function GlobeMenu({ isVisible }: GlobeMenuProps): React.JSX.Element | null {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 1s ease-out forwards',
      }}
    >
      <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', outline: 'none' }}>
        <Canvas camera={{ position: [0, 0, 8.5], fov: 60 }} gl={{ alpha: true }}>
          <GlobeSphere />
        </Canvas>
      </div>
    </div>
  );
}
