import masterData from './master.json';
import { getSkillsBySlug } from './skills';
import { ContractType, type Experience } from './types';
import type { Color } from './colors';

// Map contract strings to enum values
const getContractType = (contract: string): ContractType => {
	const contractMap: Record<string, ContractType> = {
		'Full-time': ContractType.FullTime,
		'Part-time': ContractType.PartTime,
		'Self-employed': ContractType.SelfEmployed,
		Freelance: ContractType.Freelance,
		Contract: ContractType.Contract,
		Internship: ContractType.Internship
	};
	return contractMap[contract] || ContractType.Freelance;
};

// Transform master.json experience to Experience type
const items: Array<Experience> = masterData.experience.map((exp) => ({
	slug: exp.slug,
	name: exp.name,
	company: exp.company,
	type: exp.type,
	contract: getContractType(exp.contract),
	location: exp.location,
	color: exp.color as Color,
	logo: exp.logo,
	shortDescription: exp.shortDescription,
	description: exp.description,
	links: exp.links,
	skills: getSkillsBySlug(...exp.skills),
	period: {
		from: exp.startDate ? new Date(exp.startDate) : new Date(),
		to: exp.endDate ? new Date(exp.endDate) : undefined
	}
}));

const title = 'Experience';

const ExperienceData = { title, items };

export default ExperienceData;
