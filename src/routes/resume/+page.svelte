<script lang="ts">
	import { onMount } from 'svelte';
	import TitledPage from '$lib/components/common/titled-page/titled-page.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let prompt = '';
	let role = '';
	let company = '';
	let hiringManager = '';
	let companyAddress = '';
	let coverLetterLanguage: 'english' | 'portuguese' = 'english';
	let loading = false;
	let error: string | null = null;
	let cvUrl: string | null = null;
	let coverUrl: string | null = null;

	async function generate(type: 'cv' | 'cover' = 'cv') {
		error = null;
		if (!prompt.trim()) {
			error = 'Please enter the project description or role the client is targeting.';
			return;
		}

		loading = true;
		try {
			const fullPrompt = `Role: ${role || 'Software Engineer'}\nCompany: ${company || 'Target Company'}\nContext: ${prompt}`;
			
			const body: any = { prompt: fullPrompt, type };
			
			// For cover letters, include optional client details and language
			if (type === 'cover') {
				body.coverLetterData = {
					hiringManager: hiringManager || null,
					company: company || null,
					companyAddress: companyAddress || null,
					language: coverLetterLanguage
				};
			}
			
			const res = await fetch('/resume/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const txt = await res.text();
				throw new Error(`Generation failed: ${res.status} ${txt}`);
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			
			if (type === 'cv') {
				if (cvUrl) URL.revokeObjectURL(cvUrl);
				cvUrl = url;
			} else {
				if (coverUrl) URL.revokeObjectURL(coverUrl);
				coverUrl = url;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	function download(url: string, filename: string) {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	onMount(() => {
		return () => {
			if (cvUrl) URL.revokeObjectURL(cvUrl);
			if (coverUrl) URL.revokeObjectURL(coverUrl);
		};
	});
</script>

<TitledPage title="Resume & Cover Letter Generator">
	<div class="mx-auto max-w-4xl space-y-6 p-4">
		<p class="text-center text-muted-foreground">Generate a tailored CV and cover letter powered by AI. Tell us about the role and company, and we'll craft documents that showcase your best fit.</p>

		<div class="space-y-4 rounded-lg border border-border bg-card p-6">
			<div class="grid gap-4 md:grid-cols-2">
				<label class="block">
					<span class="text-sm font-medium text-foreground">Target Role *</span>
					<input type="text" class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" bind:value={role} placeholder="e.g. Senior Full-Stack Engineer" />
				</label>
				<label class="block">
					<span class="text-sm font-medium text-foreground">Company (optional)</span>
					<input type="text" class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" bind:value={company} placeholder="e.g. TechCorp Inc." />
				</label>
			</div>

			<label class="block">
				<span class="text-sm font-medium text-foreground">Project / Role Context *</span>
				<textarea class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" rows="5" bind:value={prompt} placeholder="Describe the role, tech stack, team structure, and company culture. Be as detailed as possible."></textarea>
			</label>

			<details class="rounded border border-border p-3">
				<summary class="cursor-pointer text-sm font-medium text-foreground">Cover Letter Details (optional)</summary>
				<div class="mt-4 space-y-3">
					<label class="block">
						<span class="text-sm font-medium text-foreground">Language</span>
						<select class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" bind:value={coverLetterLanguage}>
							<option value="english">English</option>
							<option value="portuguese">Portuguese</option>
						</select>
					</label>
					<label class="block">
						<span class="text-sm font-medium text-foreground">Hiring Manager Name</span>
						<input type="text" class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" bind:value={hiringManager} placeholder="e.g. John Smith" />
					</label>
					<label class="block">
						<span class="text-sm font-medium text-foreground">Company Address</span>
						<input type="text" class="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" bind:value={companyAddress} placeholder="e.g. 123 Tech Street, San Francisco, CA 94105" />
					</label>
					<p class="text-xs text-muted-foreground">Leave blank if information is not available. Placeholder fields will be omitted from the generated cover letter.</p>
				</div>
			</details>

			{#if error}
				<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
			{/if}

			<div class="flex items-center gap-3 pt-2">
				<Button on:click={() => generate('cv')} disabled={loading} class="flex-1">{loading ? 'Generating...' : 'Generate CV'}</Button>
				<Button on:click={() => generate('cover')} disabled={loading} class="flex-1">{loading ? 'Generating...' : 'Generate Cover Letter'}</Button>
				<Button variant="outline" on:click={() => { prompt = ''; role = ''; company = ''; hiringManager = ''; companyAddress = ''; coverLetterLanguage = 'english'; if (cvUrl) { URL.revokeObjectURL(cvUrl); cvUrl = null; } if (coverUrl) { URL.revokeObjectURL(coverUrl); coverUrl = null; } }} disabled={loading}>Clear</Button>
			</div>
		</div>

		{#if cvUrl}
			<div class="space-y-3 rounded-lg border border-border bg-card p-4">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-foreground">📄 CV Preview</h3>
					<div class="flex gap-2">
						<a href={cvUrl} target="_blank" rel="noreferrer" class="text-sm text-primary underline hover:text-primary/80">Open in New Tab</a>
						<button on:click={() => download(cvUrl!, 'tailored_cv.pdf')} class="text-sm text-primary underline hover:text-primary/80">Download</button>
					</div>
				</div>
				<iframe title="CV Preview" src={cvUrl} class="h-[600px] w-full rounded border border-border"></iframe>
			</div>
		{/if}

		{#if coverUrl}
			<div class="space-y-3 rounded-lg border border-border bg-card p-4">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-foreground">📬 Cover Letter Preview</h3>
					<div class="flex gap-2">
						<a href={coverUrl} target="_blank" rel="noreferrer" class="text-sm text-primary underline hover:text-primary/80">Open in New Tab</a>
						<button on:click={() => download(coverUrl!, 'tailored_cover_letter.pdf')} class="text-sm text-primary underline hover:text-primary/80">Download</button>
					</div>
				</div>
				<iframe title="Cover Letter Preview" src={coverUrl} class="h-[600px] w-full rounded border border-border"></iframe>
			</div>
		{/if}

		<!-- <p class="text-xs text-muted-foreground">This feature uses AI (Gemini) to generate tailored documents based on your profile and the role description. Results are cached to improve performance on subsequent requests. You must configure GEMINI_API_KEY to use this feature.</p> -->
	</div>
</TitledPage>
