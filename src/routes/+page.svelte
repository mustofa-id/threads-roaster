<script>
	import { navigating } from '$app/stores';

	export let data;

	$: loading = !!$navigating;
</script>

<main>
	<form method="get">
		<label>
			<span>Threads username:</span>
			<input type="text" name="u" value={data.setup.username} required />
		</label>

		<label>
			<span>Language:</span>
			<select name="l" value={data.setup.lang} required>
				{#each Object.entries(data.supported_langs) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>

		<button disabled={loading}>Roast</button>
	</form>

	<article>
		<p>{data.result || 'No result'}</p>

		{#if data.message}
			<em>{data.message}</em>
		{/if}
	</article>
</main>
