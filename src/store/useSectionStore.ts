import { create } from 'zustand';

export const SECTIONS = ['about', 'experience', 'projects', 'contact', 'hero'] as const;

export type SectionId = (typeof SECTIONS)[number];

interface SectionState {
  currentSection: SectionId;
  setCurrentSection: (id: SectionId) => void;
}

export const useSectionStore = create<SectionState>((set) => ({
  currentSection: 'hero',
  setCurrentSection: (section) => set({ currentSection: section }),
}));