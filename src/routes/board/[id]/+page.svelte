<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { api } from '$lib/rpc';

	type Post = {
		id: string; type: string; title: string; description: string;
		field: string | null; image_url: string | null; created_at: number;
		expires_at: number; edit_count: number; thumbs_up: number; thumbs_down: number;
		user_id: string;
		author: { id: string; name: string; field: string; province: string; city: string; linkedin: string; portfolio: string | null; details: string | null } | null;
	};

	let post = $state<Post | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let userVote = $state(0);
	let voteLoading = $state(false);
	let showDelete = $state(false);
	let deleting = $state(false);
	let showEdit = $state(false);

	// Edit form
	let editTitle = $state('');
	let editDesc = $state('');
	let editField = $state('');
	let editImg = $state('');
	let editError = $state('');
	let editLoading = $state(false);

	const postId = page.params.id ?? '';
	const isOwner = $derived(!!auth.userId && !!post && auth.userId === post.user_id);

	onMount(async () => {
		try {
			const res = await api.getOpportunityById(postId);
			if (!res) { notFound = true; return; }
			post = res;
			if (auth.userId) userVote = await api.getUserVote(postId, auth.userId as string);
		} finally {
			loading = false;
		}
	});

	async function vote(v: 1 | -1) {
		if (!auth.userId || !post) return;
		const uid = auth.userId as string;
		voteLoading = true;
		try {
			await api.voteOpportunity(postId, uid, v);
			const updated = await api.getOpportunityById(postId);
			if (updated) post = updated;
			userVote = await api.getUserVote(postId, uid);
		} finally {
			voteLoading = false; }
	}

	async function deletePost() {
		if (!auth.userId || !post) return;
		deleting = true;
		try {
			await api.deleteOpportunity(postId, auth.userId as string);
			goto('/board');
		} catch (e: unknown) {
			alert(e instanceof Error ? e.message : 'Gagal menghapus');
			deleting = false;
		}
	}

	function startEdit() {
		if (!post) return;
		editTitle = post.title;
		editDesc = post.description;
		editField = post.field ?? '';
		editImg = post.image_url ?? '';
		showEdit = true;
	}

	async function submitEdit() {
		if (!auth.userId || !post) return;
		if (!editTitle.trim() || !editDesc.trim()) { editError = 'Judul dan deskripsi wajib diisi'; return; }
		editError = '';
		editLoading = true;
		try {
			await api.editOpportunity(postId, auth.userId as string, { title: editTitle, description: editDesc, field: editField, image_url: editImg });
			const updated = await api.getOpportunityById(postId);
			if (updated) post = updated;
			showEdit = false;
		} catch (e: unknown) {
			editError = e instanceof Error ? e.message : 'Gagal menyimpan';
		} finally {
			editLoading = false;
		}
	}

	function getBadges() {
		if (!post) return [];
		const badges: { label: string; cls: string }[] = [];
		if (post.thumbs_up >= 25) badges.push({ label: 'Trusted', cls: 'badge-green' });
		else if (post.thumbs_up >= 10) badges.push({ label: 'Populer', cls: 'badge-blue' });
		if (post.thumbs_down >= 10) badges.push({ label: 'Warning', cls: 'badge-red' });
		else if (post.thumbs_down >= 5) badges.push({ label: 'Warning', cls: 'badge-yellow' });
		return badges;
	}

	function daysLeft(ts: number) {
		const diff = ts - Date.now() / 1000;
		if (diff <= 0) return 'Kedaluwarsa';
		return `${Math.ceil(diff / 86400)} hari lagi`;
	}

	function formatDate(ts: number) {
		return new Date(ts * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{post?.title ?? 'Postingan'} — FreelancerID</title>
</svelte:head>

<!-- Edit modal -->
{#if showEdit && post}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
		<div class="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg font-bold text-white mb-4">Edit Postingan ({3 - post.edit_count} edit tersisa)</h2>
			{#if editError}
				<div class="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">{editError}</div>
			{/if}
			<div class="space-y-4">
				<div>
					<label class="label" for="edit-title">Judul</label>
					<input id="edit-title" class="input" bind:value={editTitle} maxlength="150" />
				</div>
				<div>
					<label class="label" for="edit-desc">Deskripsi</label>
					<textarea id="edit-desc" class="textarea" rows="6" bind:value={editDesc} maxlength="3000"></textarea>
				</div>
				<div>
					<label class="label" for="edit-img">URL Gambar</label>
					<input id="edit-img" class="input" bind:value={editImg} placeholder="https://..." />
				</div>
			</div>
			<div class="flex gap-2 mt-5">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showEdit = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center" onclick={submitEdit} disabled={editLoading}>
					{editLoading ? 'Menyimpan...' : 'Simpan'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete confirm -->
{#if showDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
		<div class="card p-6 w-full max-w-sm text-center">
			<svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
			<h2 class="text-lg font-bold text-white mb-2">Hapus Postingan?</h2>
			<p class="text-sm text-gray-400 mb-6">Tindakan ini tidak bisa dibatalkan.</p>
			<div class="flex gap-2">
				<button class="btn-secondary flex-1 justify-center" onclick={() => (showDelete = false)}>Batal</button>
				<button class="btn-primary flex-1 justify-center bg-red-600 hover:bg-red-500" onclick={deletePost} disabled={deleting}>
					{deleting ? 'Menghapus...' : 'Hapus'}
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
	<a href="/board" class="btn-ghost text-sm mb-6 -ml-2">
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
		Kembali
	</a>

	{#if loading}
		<div class="card p-8 animate-pulse">
			<div class="h-6 bg-gray-800 rounded mb-4 w-3/4"></div>
			<div class="space-y-3">
				<div class="h-4 bg-gray-800 rounded"></div>
				<div class="h-4 bg-gray-800 rounded w-4/5"></div>
				<div class="h-4 bg-gray-800 rounded w-3/5"></div>
			</div>
		</div>
	{:else if notFound || !post}
		<div class="card p-10 text-center">
			<p class="text-gray-400">Postingan tidak ditemukan atau sudah kedaluwarsa.</p>
			<a href="/board" class="btn-primary mt-4">Lihat semua postingan</a>
		</div>
	{:else}
		<div class="card p-6 sm:p-8">
			<!-- Header -->
			<div class="flex flex-wrap items-start gap-2 mb-4">
				<span class="badge {post.type === 'JOB' ? 'badge-blue' : 'badge-purple'}">
					{post.type === 'JOB' ? 'Butuh Freelancer' : 'Tawarkan Jasa'}
				</span>
				{#each getBadges() as b}
					<span class={b.cls}>{b.label}</span>
				{/each}
				{#if post.field}
					<span class="badge bg-gray-800 text-gray-400 border border-gray-700">{post.field}</span>
				{/if}
			</div>

			<h1 class="text-2xl font-bold text-white mb-4">{post.title}</h1>

			<!-- Image -->
			{#if post.image_url}
				<img src={post.image_url} alt="Post" class="w-full rounded-xl mb-6 max-h-64 object-cover" />
			{/if}

			<!-- Description -->
			<div class="text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">{post.description}</div>

			<!-- Meta -->
			<div class="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mb-6">
				<span>Diposting: {formatDate(post.created_at)}</span>
				<span>Berlaku: {daysLeft(post.expires_at)}</span>
				{#if post.edit_count > 0}<span>Diedit {post.edit_count}x</span>{/if}
			</div>

			<!-- Voting -->
			<div class="flex items-center gap-3 py-4 border-y border-gray-800 mb-6">
				<span class="text-sm text-gray-400">Nilai postingan ini:</span>
				<button
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all {userVote === 1 ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-gray-800 text-gray-400 hover:text-green-400'}"
					onclick={() => vote(1)}
					disabled={voteLoading || !auth.userId}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
					{post.thumbs_up}
				</button>
				<button
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all {userVote === -1 ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 'bg-gray-800 text-gray-400 hover:text-red-400'}"
					onclick={() => vote(-1)}
					disabled={voteLoading || !auth.userId}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/></svg>
					{post.thumbs_down}
				</button>
				{#if !auth.userId}
					<span class="text-xs text-gray-600">Login untuk voting</span>
				{/if}
			</div>

			<!-- Author -->
			{#if post.author}
				<div class="card p-5 mb-6">
					<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Pembuat Postingan</h2>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
							{post.author.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
						</div>
						<div>
							<p class="font-semibold text-gray-100">{post.author.name}</p>
							<p class="text-sm text-gray-500">{post.author.field} · {post.author.city}, {post.author.province}</p>
						</div>
					</div>
					{#if auth.userId}
						<div class="flex gap-2 mt-4">
							<a href={post.author.linkedin} target="_blank" rel="noopener noreferrer" class="btn-secondary text-sm py-2">
								LinkedIn
							</a>
							{#if post.author.portfolio}
								<a href={post.author.portfolio} target="_blank" rel="noopener noreferrer" class="btn-ghost text-sm">Portfolio</a>
							{/if}
						</div>
					{:else}
						<p class="text-xs text-gray-600 mt-3">Login untuk melihat kontak pembuat</p>
					{/if}
				</div>
			{/if}

			<!-- Owner actions -->
			{#if isOwner}
				<div class="flex gap-2 pt-4 border-t border-gray-800">
					<button
						class="btn-secondary text-sm"
						onclick={startEdit}
						disabled={post.edit_count >= 3}
					>
						{post.edit_count >= 3 ? 'Edit habis (3/3)' : `Edit (${post.edit_count}/3)`}
					</button>
					<button
						class="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20"
						onclick={() => (showDelete = true)}
					>Hapus</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
