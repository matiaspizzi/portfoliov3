// Scorpius constellation - user-provided coordinates

type Star = {
  x: number
  y: number
  name: string
  brightness: number
}

const SCALE = -0.020;

export const SCORPIO_STARS: Star[] = [
  { x: -48 * SCALE, y: -43 * SCALE, name: 'Star 1', brightness: 0.6 },     // 0
  { x: -49 * SCALE, y: -34 * SCALE, name: 'Star 2', brightness: 0.6 },     // 1
  { x: -48 * SCALE, y: -20 * SCALE, name: 'Star 3', brightness: 0.6 },     // 2
  { x: -22 * SCALE, y: -23 * SCALE, name: 'Antares', brightness: 1.0 },    // 3
  { x: -15 * SCALE, y: -19 * SCALE, name: 'Star 5', brightness: 0.7 },     // 4
  { x: 0 * SCALE, y: 0 * SCALE, name: 'Star 6', brightness: 0.65 },        // 5
  { x: 2 * SCALE, y: 12 * SCALE, name: 'Star 7', brightness: 0.55 },       // 6
  { x: 6 * SCALE, y: 27 * SCALE, name: 'Star 8', brightness: 0.5 },        // 7
  { x: 19 * SCALE, y: 30 * SCALE, name: 'Star 9', brightness: 0.5 },       // 8
  { x: 35 * SCALE, y: 27 * SCALE, name: 'Star 10', brightness: 0.45 },     // 9
  { x: 42 * SCALE, y: 17 * SCALE, name: 'Star 11', brightness: 0.7 },      // 10
  { x: 40 * SCALE, y: 13 * SCALE, name: 'Star 12', brightness: 0.6 },      // 11
  { x: 31 * SCALE, y: 6 * SCALE, name: 'Star 13', brightness: 0.85 },      // 12
  { x: 30 * SCALE, y: 7 * SCALE, name: 'Star 14', brightness: 0.6 },       // 13
]

// Edges connecting stars (1-indexed in source, 0-indexed here)
export const SCORPIO_EDGES: [number, number][] = [
  [0, 3],   // 1-4
  [1, 3],   // 2-4
  [2, 3],   // 3-4
  [3, 4],   // 4-5
  [4, 5],   // 5-6
  [5, 6],   // 6-7
  [6, 7],   // 7-8
  [7, 8],   // 8-9
  [8, 9],   // 9-10
  [9, 10],  // 10-11
  [10, 11], // 11-12
  [11, 12], // 12-13
]
