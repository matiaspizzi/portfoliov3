# portfoliov3 — React + Three.js Portfolio

## Tech Stack

- **React 19** + TypeScript 5.9 (strict mode)
- **Vite 8** — build tool, dev server on `localhost:3000`
- **Three.js 0.172** via `@react-three/fiber` + `@react-three/drei`
- **Tailwind CSS 4** — via `@tailwindcss/vite` plugin (no config file needed)
- **Framer Motion 11** — animations
- **Zustand 5** — global state (`src/store/useSectionStore.ts`)
- **Lucide React** — icons
- `clsx` + `tailwind-merge` → aliased as `cn()` in `src/lib/utils.ts`

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Type-check + build (tsc -b && vite build)
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── 3d/          # Three.js/R3F components (Cylinder, Globe, NebulaBackground, WarpBackground)
│   ├── ui/          # React UI components (Hero, NavBar, FloatingMenu)
│   └── SectionObserver.tsx
├── sections/        # Page sections (Hero, About, Experience, Projects, Contact)
├── store/           # Zustand stores
├── hooks/           # Custom hooks (useIsVisible)
├── lib/             # Utilities (cn helper)
└── types/           # TypeScript types
```

## Patterns & Conventions

**Components**
- Functional components only, no class components
- Props typed inline or with a `type Props = {}` (not interfaces for simple props)
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes

**3D (Three.js / R3F)**
- All 3D components live in `src/components/3d/`
- Use `@react-three/fiber` for scene graph, `@react-three/drei` for helpers
- Canvas is defined in `App.tsx` — 3D components render inside it
- Keep `useFrame` hooks lean; avoid heavy logic inside render loops

**State**
- Local UI state: `useState` / `useReducer`
- Cross-section state: Zustand (`useSectionStore`)
- No Context API currently in use

**Animations**
- Page/element animations: Framer Motion
- Warp animation system in `App.tsx` has 4 phases: `idle → warping → arrived → reverse-warping`

**Styling**
- Tailwind CSS 4 — utility classes only, no custom CSS unless unavoidable
- Custom font: `ADAM.CG PRO` loaded in `src/assets/fonts/`

**TypeScript**
- Strict mode enabled — no `any`, no `@ts-ignore`
- `@types/three` is installed — use Three.js types directly

## MCP Servers

**Three.js MCP** — real-time manipulation of Three.js scenes via WebSocket, 47 tools for object creation/movement/rotation/scene inspection.
- Repo: https://github.com/locchung/three-js-mcp

## Notes

- No router — single-page app, no React Router
- No test framework configured — no Vitest/Jest
- Sections (About, Experience, Projects, Contact) are stubbed out / under construction
