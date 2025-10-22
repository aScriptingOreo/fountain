<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card, CardFooter } from '$lib/components/ui/card';

	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { Screenshot } from '$lib/data/types';

	const { item }: { item: Screenshot } = $props();
</script>

<Dialog>
	<DialogTrigger>
		<Card class="flex flex-col justify-end overflow-hidden">
			<div class="relative">
				<img
					src={item.src}
					alt={item.label}
					class="w-full h-auto max-h-48 object-contain bg-gray-100 dark:bg-gray-800"
				/>
			</div>
			<Separator />
			<CardFooter class="rounded-b-md bg-[#00000099] pt-4 text-white backdrop-blur-sm"
				>{item.label}</CardFooter
			>
		</Card>
	</DialogTrigger>
	<DialogContent class="flex max-h-[90vh] max-w-[90vw] flex-col">
		<DialogTitle>{item.label}</DialogTitle>
		<div class="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 min-h-0 overflow-hidden">
			<img
				src={item.src}
				alt={item.label}
				class="max-w-full max-h-full w-auto h-auto object-contain"
			/>
		</div>
		<DialogFooter>
			<DialogClose>
				<Button>Close</Button>
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
