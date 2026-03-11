/* eslint-disable react-hooks/purity */
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';


// Función auxiliar para seleccionar puntos distribuidos uniformemente usando Farthest Point Sampling
const farthestPointSampling = (points: THREE.Vector3[], count: number): number[] => {
  const selectedIndices: number[] = [];
  if (points.length < count) {
    return points.map((_, i) => i);
  }

  // 1. Elegir un punto aleatorio como punto de partida
  const firstIndex = Math.floor(Math.random() * points.length);
  selectedIndices.push(firstIndex);

  // 2. Encontrar el resto de los puntos que maximicen la distancia mínima a los seleccionados
  for (let i = 1; i < count; i++) {
    let maxDist = -Infinity;
    let bestIndex = -1;

    for (let j = 0; j < points.length; j++) {
      if (selectedIndices.includes(j)) continue;

      let minDist = Infinity;
      for (const selectedIdx of selectedIndices) {
        const dist = points[j].distanceTo(points[selectedIdx]);
        if (dist < minDist) {
          minDist = dist;
        }
      }

      if (minDist > maxDist) {
        maxDist = minDist;
        bestIndex = j;
      }
    }

    if (bestIndex !== -1) {
      selectedIndices.push(bestIndex);
    }
  }

  return selectedIndices;
};

// Nuevo componente para renderizar un punto amarillo brillante y editable
interface GlowingNodeProps {
  position: THREE.Vector3;
}

function GlowingNode({ position }: GlowingNodeProps) {
  // Puedes editar este componente más adelante.
  // Por ahora, renderizaremos un pequeño mesh esférico con un material brillante.
  // Elevaremos ligeramente el nodo por encima de la superficie de la malla principal.

  const smallNodeRadius = 0.12;
  const glowingColor = "#facc15";

  // Ejemplo de estado para edición futura
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group position={position.clone().multiplyScalar(1.05)}> {/* Elevado ligeramente */}
      {/* El nodo base editable (ej. para interacción) */}
      <mesh
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[smallNodeRadius, 8, 8]} />
        <meshBasicMaterial color={isHovered ? "#ffffff" : glowingColor} />
      </mesh>

      {/* El resplandor (usando THREE.AdditiveBlending para el efecto de luz) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1}
            array={new Float32Array([0, 0, 0])} // Centrado en el grupo
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color={glowingColor}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={false} // Para que se vea nítido
        />
      </points>
    </group>
  );
}

function GlobeSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 3;
  const detail = 2;

  // Base geometry for the wireframe sphere
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(radius, detail), [radius, detail]);
  const wireframeGeometry = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);

  // Lógica para seleccionar los 5 vértices distribuidos uniformemente
  const selectedVertices = useMemo(() => {
    const positionAttribute = geometry.getAttribute('position');
    const allPoints: THREE.Vector3[] = [];
    const vertexCount = positionAttribute.count;

    // Extraer todos los vértices como THREE.Vector3
    for (let i = 0; i < vertexCount; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      allPoints.push(new THREE.Vector3(x, y, z));
    }

    // Usar FPS para seleccionar 5 índices
    const selectedIndices = farthestPointSampling(allPoints, 6);
    // Devolver los vectores de los vértices seleccionados
    return selectedIndices.map(index => allPoints[index]);
  }, [geometry]);

  useFrame((_, delta) => {
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
        <pointsMaterial size={0.08} color="#ffffff" transparent opacity={1} />
      </points>

      {/* Nodos amarillos distribuidos (nuevos componentes) */}
      {selectedVertices.map((vertex, index) => (
        <GlowingNode key={index} position={vertex} />
      ))}

      {/* Semi-transparent inner core to give the sphere volume and depth */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#061016" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function GlobeMenu(): React.JSX.Element | null {

  return (
    <div
      className='absolute z-5 flex items-center justify-center h-fit w-fit p-10 m-10'
      style={{
        animation: 'fadeIn 1s ease-out forwards',
      }}
    >
      <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', outline: 'none', cursor: 'grab' }}>
        <Canvas camera={{ position: [0, 0, 8.5], fov: 90 }} gl={{ alpha: true }}>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
          />
          <GlobeSphere />
        </Canvas>
      </div>
    </div>
  );
}