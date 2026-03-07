/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

const NEBULA_TEXTURE_SIZE = 128;

interface NebulaBlob {
  readonly scale: number;
  readonly rotationSpeed: number;
  readonly opacity: number;
  readonly color: string;
  readonly position: readonly [number, number, number];
  readonly timeOffset: number;
}

// Allowed dark/violet/purple nebula color palette
const NEBULA_COLORS = [
  '#2a2a6e', '#411059', '#24245e', '#3b1c61',
  '#561466', '#1a103c', '#4a154b', '#2c1b4d'
];

// Constants for nebula generation limits
const NEBULA_CONFIG = {
  MIN_COUNT: 12,
  MAX_COUNT: 16,
  MIN_SCALE: 15,
  MAX_SCALE: 55,
  MIN_OPACITY: 0.20,
  MAX_OPACITY: 0.45,
  MAX_ROTATION_SPEED: 0.0025,
  POSITION_RANGE: {
    X: 35, // -17.5 to 17.5
    Y: 25, // -12.5 to 12.5
    Z_START: -15,
    Z_RANGE: 20 // -15 to -35
  }
} as const;

/** Creates a soft, cloud-like radial gradient texture. */
function createNebulaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = NEBULA_TEXTURE_SIZE;
  canvas.height = NEBULA_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context for nebula texture.');

  const center = NEBULA_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, NEBULA_TEXTURE_SIZE, NEBULA_TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders subtle, slowly-rotating nebula clouds in the background.
 * Uses billboard sprites with soft radial gradients and additive blending
 * for a faint cosmic fog effect that breaks up the flat black.
 */
export function NebulaBackground(): React.JSX.Element {
  const spritesRef = useRef<(THREE.Sprite | null)[]>([]);
  const nebulaTexture = useMemo(() => createNebulaTexture(), []);

  // Generamos instancias aleatorias para tener posiciones, colores, tamaños e inicios diferentes cada vez
  const randomizedBlobs = useMemo<NebulaBlob[]>(() => {
    // Cantidad aleatoria entre MIN_COUNT y MAX_COUNT
    const numClouds = Math.floor(Math.random() * (NEBULA_CONFIG.MAX_COUNT - NEBULA_CONFIG.MIN_COUNT + 1)) + NEBULA_CONFIG.MIN_COUNT;

    return Array.from({ length: numClouds }).map(() => {
      // Posición
      const randomX = (Math.random() - 0.5) * NEBULA_CONFIG.POSITION_RANGE.X;
      const randomY = (Math.random() - 0.5) * NEBULA_CONFIG.POSITION_RANGE.Y;
      const randomZ = NEBULA_CONFIG.POSITION_RANGE.Z_START - Math.random() * NEBULA_CONFIG.POSITION_RANGE.Z_RANGE;

      // Propiedades
      const scale = NEBULA_CONFIG.MIN_SCALE + Math.random() * (NEBULA_CONFIG.MAX_SCALE - NEBULA_CONFIG.MIN_SCALE);
      const rotationSpeed = (Math.random() - 0.5) * (NEBULA_CONFIG.MAX_ROTATION_SPEED * 2);
      const opacity = NEBULA_CONFIG.MIN_OPACITY + Math.random() * (NEBULA_CONFIG.MAX_OPACITY - NEBULA_CONFIG.MIN_OPACITY);
      const color = NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)]!;
      const timeOffset = Math.random() * 100;     // Desfase en la animación

      return {
        scale,
        rotationSpeed,
        opacity,
        color,
        position: [randomX, randomY, randomZ] as const,
        timeOffset
      };
    });
  }, []);

  useFrame((_state: RootState, delta: number) => {
    const time = _state.clock.elapsedTime;

    for (let i = 0; i < randomizedBlobs.length; i++) {
      const sprite = spritesRef.current[i];
      if (sprite) {
        const blob = randomizedBlobs[i];
        const t = time + blob.timeOffset;

        // Rotación continua
        sprite.material.rotation += blob.rotationSpeed * delta * 60;

        // Movimiento suave de deriva
        const xOffset = Math.sin(t * 0.2) * 1.5;
        const yOffset = Math.cos(t * 0.15) * 1.0;
        sprite.position.x = blob.position[0] + xOffset;
        sprite.position.y = blob.position[1] + yOffset;

        // Efecto de respiración (escala)
        const scaleOscillation = Math.sin(t * 0.6) * 2.5;
        const newScale = Math.max(1, blob.scale + scaleOscillation);
        sprite.scale.set(newScale, newScale, 1);

        // Pulsación de opacidad
        const opacityOscillation = Math.sin(t * 0.5) * 0.08;
        sprite.material.opacity = Math.max(0.05, blob.opacity + opacityOscillation);
      }
    }
  });

  return (
    <group>
      {randomizedBlobs.map((blob, index) => (
        <sprite
          key={`nebula-${index}`}
          ref={(el) => { spritesRef.current[index] = el; }}
          position={blob.position}
          scale={[blob.scale, blob.scale, 1]}
        >
          <spriteMaterial
            map={nebulaTexture}
            color={blob.color}
            transparent
            opacity={blob.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}
