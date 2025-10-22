import type { Skill, SkillCategory } from './types';
import masterData from './master.json';

// Get categories from master.json
const categories: Array<SkillCategory> = masterData.skillCategories;

// Transform master.json skills to Skill type
const items: Array<Skill> = masterData.skills.map((skill) => ({
	slug: skill.slug,
	name: skill.name,
	color: skill.color,
	logo: skill.logo,
	description: skill.description,
	shortDescription: skill.shortDescription,
	category: skill.category
		? categories.find((cat) => cat.slug === skill.category)
		: undefined
}));

export const getSkills = (...slugs: Array<string>): Array<Skill> => {
	return items.filter((it) => (slugs.length === 0 ? true : slugs.includes(it.slug)));
};

export const getSkillsBySlug = (...slugs: Array<string>): Array<Skill> => {
	return getSkills(...slugs);
};

export const groupByCategory = (
	query: string
): Array<{ category: SkillCategory; items: Array<Skill> }> => {
	const out: ReturnType<typeof groupByCategory> = [];

	const others: Array<Skill> = [];

	items.forEach((item) => {
		if (query.trim() && !item.name.toLowerCase().includes(query.trim().toLowerCase())) return;

		// push to others if item does not have a category
		if (!item.category) {
			others.push(item);
			return;
		}

		// check if category exists
		let category = out.find((it) => it.category.slug === item.category?.slug);

		if (!category) {
			category = { items: [], category: item.category };

			out.push(category);
		}

		category.items.push(item);
	});

	if (others.length !== 0) {
		out.push({ category: { name: 'Others', slug: 'others' }, items: others });
	}

	return out;
};

const title = 'Skills';

const SkillsData = {
	title,
	items
};

export default SkillsData;
