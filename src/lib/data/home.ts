import BaseData from './base';
import masterData from './master.json';
import { getSkills } from './skills';
import type { Skill } from './types';

const title = 'Home';

// Cast hero from master.json with proper types
const hero = {
	title: masterData.hero.title,
	description: masterData.hero.description,
	socialLinks: masterData.hero.socialLinks.map((link) => ({
		label: link.label,
		href: link.href,
		icon: link.icon // Now just a path string
	}))
};

const carousel: Array<Skill> = getSkills(
	...masterData.skills
		.filter((s) => ['pro-lang', 'framework', 'library'].includes(s.category || ''))
		.slice(0, 8)
		.map((s) => s.slug)
);

const HomeData = {
	title,
	hero,
	carousel
};

export default HomeData;
