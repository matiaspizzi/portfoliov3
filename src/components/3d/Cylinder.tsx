/* eslint-disable react-hooks/purity */
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function CylinderShape() {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 1;
  const height = 2;
  const segments = 6;

  // Base geometry for the wireframe sphere
  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius, height, segments), [radius, height, segments]);
  const wireframeGeometry = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);

  return (
    <group ref={groupRef}>
      {/* 3D Wireframe */}
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.6} linewidth={1} />
      </lineSegments>

      {/* Visible nodes at vertices */}
      <points geometry={geometry}>
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={1} />
      </points>

      {/* Semi-transparent inner core to give the sphere volume and depth */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#061016" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function CylinderMenu({ isVisible }: GlobeMenuProps): React.JSX.Element | null {
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
      <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', outline: 'none', cursor: 'grab' }}>
        <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} gl={{ alpha: true }}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
          />
          <CylinderShape />
        </Canvas>
      </div>
    </div>
  );
}