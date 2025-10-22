<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import type { Skill } from '$lib/data/types';
	import { href } from '$lib/utils';
	import { mode } from 'mode-watcher';

	const { skill }: { skill: Skill } = $props();

	// Icon middleware: handle [INVERTED] logic
	function getIconSrc() {
		const currentMode = $mode;
		const primaryPath = currentMode === 'dark' ? skill.logo.dark : skill.logo.light;
		const fallbackPath = currentMode === 'dark' ? skill.logo.light : skill.logo.dark;

		if (primaryPath.includes('[INVERTED]')) {
			return fallbackPath.replace('[INVERTED]', '');
		} else {
			return primaryPath;
		}
	}

	function shouldInvertIcon() {
		const currentMode = $mode;
		const primaryPath = currentMode === 'dark' ? skill.logo.dark : skill.logo.light;
		return primaryPath.includes('[INVERTED]');
	}
</script>

<Tooltip openDelay={100}>
	<TooltipTrigger class="group">
		<a href={href(`/skills/${skill.slug}`)}>
			<Button size="icon" variant="outline">
				<img
					class="size-[18px] grayscale-[0.75] group-hover:grayscale-0 {shouldInvertIcon() ? 'invert' : ''}"
					src={getIconSrc()}
					alt={skill.name}
				/>
			</Button>
		</a>
	</TooltipTrigger>
	<TooltipContent>{skill.name}</TooltipContent>
</Tooltip>
