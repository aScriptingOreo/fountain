import masterData from './master.json';
import type { Education } from './types';

// Transform master.json education to Education type
const items: Array<Education> = masterData.education.map((edu) => ({
	slug: edu.slug,
	name: edu.name,
	organization: edu.organization,
	degree: edu.degree,
	location: edu.location,
	logo: edu.logo,
	shortDescription: edu.shortDescription,
	description: edu.description,
	subjects: edu.subjects,
	period: {
		from: edu.startDate ? new Date(edu.startDate) : new Date(),
		to: edu.endDate ? new Date(edu.endDate) : undefined
	}
}));

const title = 'Education';

const EducationData = { title, items };

export default EducationData;
