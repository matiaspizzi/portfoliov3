import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const PARTICLE_COUNT = 800;
const SPREAD = 40;
const DEPTH_OFFSET = -20;
const CAMERA_PASS_THRESHOLD = 5;
const RESET_Z = -40;
const GLOW_TEXTURE_SIZE = 64;

const STREAK_LENGTH_WARP = 1.8;
const STREAK_LENGTH_IDLE = 0.0;

type WarpDirection = 'forward' | 'backward';

interface WarpBackgroundProps {
  readonly isWarping: boolean;
  readonly direction: WarpDirection;
}

interface Starfield {
  readonly positions: Float32Array;
  readonly speeds: Float32Array;
}

/** Generates initial star positions and speeds. */
function createStarfield(): Starfield {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD + DEPTH_OFFSET;
    speeds[i] = Math.random() * 0.02 + 0.01;
  }

  return { positions, speeds };
}

/** Creates a soft circular glow texture for the point sprites. */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context for glow texture.');

  const center = GLOW_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders a starfield with two layers:
 * 1. Points — glowing star sprites (always visible).
 * 2. Fat LineSegments2 — wide streak trails behind each star (visible during warp).
 */
export function WarpBackground({ isWarping, direction }: WarpBackgroundProps): React.JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { size } = useThree();
  const [starfield] = useState(createStarfield);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const currentStreakLength = useRef(STREAK_LENGTH_IDLE);

  const lineSegmentsRef = useRef<LineSegments2 | null>(null);
  const lineGeometryRef = useRef<LineSegmentsGeometry | null>(null);
  const lineMaterialRef = useRef<LineMaterial | null>(null);
  const linePositionsBuffer = useRef(new Float32Array(PARTICLE_COUNT * 6));

  useEffect(() => {
    const group = groupRef.current;
    const geometry = new LineSegmentsGeometry();
    const material = new LineMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0,
      resolution: new THREE.Vector2(size.width, size.height),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    geometry.setPositions(linePositionsBuffer.current);
    const segments = new LineSegments2(geometry, material);

    lineSegmentsRef.current = segments;
    lineGeometryRef.current = geometry;
    lineMaterialRef.current = material;

    if (group) {
      group.add(segments);
    }

    return () => {
      geometry.dispose();
      material.dispose();
      if (group) {
        group.remove(segments);
      }
    };
  }, [size.width, size.height]);

  useEffect(() => {
    if (lineMaterialRef.current) {
      lineMaterialRef.current.resolution.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((_state: RootState, delta: number) => {
    if (!pointsRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const lineArray = linePositionsBuffer.current;

    const directionSign = direction === 'backward' ? -1 : 1;
    const speedMultiplier = isWarping ? 16.0 : 0.3;
    const frameDelta = delta * 60;

    const targetStreak = isWarping ? STREAK_LENGTH_WARP : STREAK_LENGTH_IDLE;
    currentStreakLength.current +=
      (targetStreak - currentStreakLength.current) * 0.08;
    const streak = currentStreakLength.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const velocity = starfield.speeds[i] * speedMultiplier * frameDelta * directionSign;
      posArray[i * 3 + 2] += velocity;

      if (direction === 'backward' && posArray[i * 3 + 2] < RESET_Z) {
        posArray[i * 3 + 2] = CAMERA_PASS_THRESHOLD;
        posArray[i * 3] = (Math.random() - 0.5) * SPREAD;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      } else if (direction === 'forward' && posArray[i * 3 + 2] > CAMERA_PASS_THRESHOLD) {
        posArray[i * 3 + 2] = RESET_Z;
        posArray[i * 3] = (Math.random() - 0.5) * SPREAD;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      }

      const headIdx = i * 6;
      const tailIdx = i * 6 + 3;

      lineArray[headIdx] = posArray[i * 3];
      lineArray[headIdx + 1] = posArray[i * 3 + 1];
      lineArray[headIdx + 2] = posArray[i * 3 + 2];

      lineArray[tailIdx] = posArray[i * 3];
      lineArray[tailIdx + 1] = posArray[i * 3 + 1];
      lineArray[tailIdx + 2] = posArray[i * 3 + 2] - velocity * streak * 30;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (lineGeometryRef.current) {
      lineGeometryRef.current.setPositions(lineArray);
    }

    if (pointsMaterialRef.current) {
      const targetSize = isWarping ? 0.35 : 0.18;
      pointsMaterialRef.current.size +=
        (targetSize - pointsMaterialRef.current.size) * 0.05;
    }

    if (lineMaterialRef.current) {
      const targetOpacity = isWarping ? 0.8 : 0.0;
      lineMaterialRef.current.opacity +=
        (targetOpacity - lineMaterialRef.current.opacity) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow points layer */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={starfield.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          size={0.18}
          color="#ffffff"
          map={glowTexture}
          transparent
          opacity={1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
