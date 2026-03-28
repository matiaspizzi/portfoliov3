import data from './experience.json';

export type ExperienceEntry = {
  title: string
  company: string
  companyDetail?: string
  location: string
  period: string
  bullets: string[]
  tech: string[]
}

export type EducationEntry = {
  title: string
  institution: string
  location: string
  period: string
}

export type CertificationEntry = {
  name: string
  credlyUrl?: string
  badgeImage?: string
}

export const experiences: ExperienceEntry[] = data.experience ?? [];
export const education: EducationEntry[] = data.education ?? [];
export const certifications: CertificationEntry[] = (data.certifications ?? []) as CertificationEntry[];
