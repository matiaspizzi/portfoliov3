import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCORPIO_STARS, SCORPIO_EDGES } from '../../data/scorpio';

const STAR_COUNT = 500;
const STAR_FIELD_RADIUS = 8;

/** Creates a soft radial glow texture on a canvas. */
function createGlowTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Random background stars filling the sky. */
function BackgroundStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createGlowTexture(32), []);

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const ph = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      ph[i] = Math.random() * Math.PI * 2; // random phase for twinkle
    }

    return { positions: pos, phases: ph };
  }, []);

  const sizesAttr = useRef<THREE.BufferAttribute>(null);
  const baseSizes = useMemo(() => {
    const s = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      s[i] = 0.02 + Math.random() * 0.04;
    }
    return s;
  }, []);

  const sizes = useMemo(() => new Float32Array(baseSizes), [baseSizes]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < STAR_COUNT; i++) {
      const twinkle = 0.7 + 0.3 * Math.sin(t * (0.5 + (i % 7) * 0.15) + phases[i]);
      sizes[i] = baseSizes[i] * twinkle;
    }
    if (sizesAttr.current) {
      sizesAttr.current.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          ref={sizesAttr}
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.6}
        color="#ffffff"
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** The Scorpio constellation with glowing stars and connecting lines. */
function ScorpioConstellation() {
  const groupRef = useRef<THREE.Group>(null);
  const antaresRef = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => createGlowTexture(64), []);

  // Convert 2D constellation data to 3D positions on a plane at z=-2
  const starPositions = useMemo(() => {
    return SCORPIO_STARS.map((star) => new THREE.Vector3(
      star.x * 3,   // scale up for visibility
      star.y * 3,
      -2
    ));
  }, []);

  // Line segments geometry
  const linePositions = useMemo(() => {
    const pos: number[] = [];
    for (const [a, b] of SCORPIO_EDGES) {
      const sa = starPositions[a];
      const sb = starPositions[b];
      pos.push(sa.x, sa.y, sa.z, sb.x, sb.y, sb.z);
    }
    return new Float32Array(pos);
  }, [starPositions]);

  // Antares pulse
  useFrame((state) => {
    if (antaresRef.current) {
      const t = state.clock.elapsedTime;
      const pulse = 1 + 0.3 * Math.sin(t * 1.5);
      const baseSize = 0.35;
      antaresRef.current.scale.set(baseSize * pulse, baseSize * pulse, 1);
      antaresRef.current.material.opacity = 0.6 + 0.2 * Math.sin(t * 2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Constellation lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Constellation stars as glowing sprites */}
      {SCORPIO_STARS.map((star, i) => {
        const pos = starPositions[i];
        const isAntares = star.name === 'Antares';
        const size = 0.08 + star.brightness * 0.2;

        return (
          <sprite
            key={star.name}
            ref={isAntares ? antaresRef : undefined}
            position={[pos.x, pos.y, pos.z]}
            scale={[size, size, 1]}
          >
            <spriteMaterial
              map={texture}
              color={isAntares ? '#ff6040' : '#e8d5b0'}
              transparent
              opacity={0.4 + star.brightness * 0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        );
      })}
    </group>
  );
}

/** Full starry sky with Scorpio constellation — meant to be used inside a Canvas. */
export function ScorpioSky() {
  const starsRef = useRef<THREE.Group>(null);

  // Only background stars rotate slowly
  useFrame((_state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <>
      <group ref={starsRef}>
        <BackgroundStars />
      </group>
      <group position={[0, 3.3, 0]}>
        <ScorpioConstellation />
      </group>
    </>
  );
}
