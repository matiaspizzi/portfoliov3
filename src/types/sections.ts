export const SECTIONS = ["About", "Experience", "Projects", "Contact"] as const;

export type Section = (typeof SECTIONS)[number];
