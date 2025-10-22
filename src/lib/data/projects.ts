import masterData from './master.json';
import { getSkillsBySlug } from './skills';
import type { Project } from './types';
import type { Color } from './colors';

// Transform master.json projects to Project type
const items: Array<Project> = masterData.projects.map((proj) => ({
	slug: proj.slug,
	name: proj.name,
	type: proj.type,
	color: proj.color as Color,
	logo: proj.logo,
	shortDescription: proj.shortDescription,
	description: proj.description,
	links: proj.links,
	skills: getSkillsBySlug(...proj.skills),
	period: {
		from: proj.startDate ? new Date(proj.startDate) : new Date(),
		to: proj.endDate ? new Date(proj.endDate) : undefined
	},
	screenshots: proj.screenshots
}));

const title = 'Projects';

const ProjectsData = { title, items };

export default ProjectsData;
