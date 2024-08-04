<script>
	import { navigating, page } from '$app/stores';
	import FireIcon from '$lib/icon/fire.svg?raw';
	import ShareIcon from '$lib/icon/share.svg?raw';
	import WarnIcon from '$lib/icon/warn.svg?raw';

	export let data;

	$: loading = !!$navigating;
	$: excerpt = data.result.slice(0, 73);

	const app = {
		title: 'Threads Roaster',
		description: `Roasting pedas akun Threads berdasarkan thread-nya 🌶`,
		issues_url: 'https://github.com/mustofa-id/threads-roaster/issues',
		repo_url: 'https://github.com/mustofa-id/threads-roaster',
		my_threads: `@habib.mustofa.id`
	};

	function get_og_url() {
		const params = new URLSearchParams({
			title: excerpt || app.description,
			author: data.setup.username ? `@${data.setup.username}` : '',
			websiteUrl: $page.url.origin,
			theme: 'Github'
		});
		return `https://dynamic-og-image-generator.vercel.app/api/generate?${params}`;
	}
</script>

<svelte:head>
	<title>{data.setup.username ? `${data.setup.username} - ` : ''}{app.title}</title>
	<meta name="description" content={excerpt || app.description} />
	<meta property="og:image" content={get_og_url()} />
</svelte:head>

<main class="m-4 max-w-xl sm:mx-auto">
	<article class="m-4 my-8 sm:m-8">
		<p class="text-center text-2xl font-bold">🌶 {app.title} 🌶</p>
	</article>

	<form class="mt-3">
		<section class="flex gap-2">
			<label class="input input-bordered flex w-full items-center gap-2">
				<span>@</span>
				<input
					class="grow"
					type="text"
					name="u"
					value={data.setup.username}
					disabled={loading}
					placeholder="Threads username"
					required
				/>
			</label>
			<button class="btn btn-primary uppercase text-base-200" disabled={loading}>
				{#if loading}
					<span class="loading loading-spinner"></span>
				{:else}
					<span class="h-6 w-6">{@html FireIcon}</span>
				{/if}
				Roast!
			</button>
		</section>

		<label class="mt-1 flex items-center">
			<span class="text-sm">Bahasa:</span>
			<select
				class="select select-ghost select-sm"
				name="l"
				value={data.setup.lang}
				disabled={loading}
				required
			>
				{#each Object.entries(data.supported_langs) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>
	</form>

	{#if data.message}
		<article role="alert" class="alert alert-warning mt-3">
			<span class="h-6 w-6">{@html WarnIcon}</span>
			<span>{data.message}</span>
		</article>
	{/if}

	<article class="card mt-3 bg-base-200">
		<section class="card-body">
			{#if data.setup.username}
				<p class="card-title">@{data.setup.username}</p>
				<hr class="my-1 border-neutral-400 dark:border-neutral-600" />
			{/if}

			{#if data.result}
				{@const share_uri = encodeURIComponent(
					$page.url.origin + `?u=${data.setup.username}&l=${data.setup.lang}`
				)}
				<p class="text-center text-lg sm:text-xl">{data.result}</p>

				<div class="card-actions justify-end">
					<a
						class="btn btn-ghost"
						href="https://threads.net/intent/post?text={share_uri}"
						target="_blank"
					>
						<span class="h-6 w-6">{@html ShareIcon}</span>
					</a>
				</div>
			{:else}
				<p class="text-center">Ketik username Threads kamu di atas lalu tekan tombol Roast!</p>
			{/if}
		</section>
	</article>

	<footer class="mt-5 text-center">
		<p>&copy; 2024 {app.title}</p>
		<div class="text-sm">
			Laporkan masalah di
			<a class="link link-info" href={app.issues_url} target="_blank"> sini </a>
			&bullet; Kode sumber di
			<a class="link link-info" href={app.repo_url} target="_blank"> Github </a>
		</div>
		<p class="text-sm">
			Follow me on Threads <a
				class="link link-info"
				href="https://www.threads.net/{app.my_threads}"
			>
				{app.my_threads}
			</a>
		</p>
	</footer>
</main>
