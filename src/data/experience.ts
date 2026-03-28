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

const json = data as {
  experience?: ExperienceEntry[]
  education?: EducationEntry[]
  certifications?: CertificationEntry[]
};

export const experiences: ExperienceEntry[] = json.experience ?? [];
export const education: EducationEntry[] = json.education ?? [];
export const certifications: CertificationEntry[] = json.certifications ?? [];
