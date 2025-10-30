// QuickCV-inspired data structure
export interface Details {
  name?: string;
  role?: string;
  about?: string;
}

export interface WorkExp {
  company: string;
  title: string;
  date: string;
  desc: string; // newline-separated bullet points (e.g., "- Point 1\n- Point 2")
}

export interface Education {
  institution: string;
  date: string;
  qualification: string;
  gpa?: string;
}

export interface Project {
  name: string;
  desc: string;
  link: string;
}

export interface Skill {
  name: string;
}

export interface CVData {
  details: Details;
  workExp: WorkExp[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
}

// Legacy types for backwards compatibility (deprecated)
export interface HighlightedSkill {
  slug: string;
  reason: string;
}

export interface PrioritizedProject {
  slug: string;
  reason: string;
}

export interface SelectedExperience {
  slug: string;
  highlight: string;
}

export interface CustomSection {
  title: string;
  html: string;
}
