<script lang="ts">
	import { onMount } from 'svelte';
	import { DISCIPLINES } from '$lib/constants';
	import { api } from '$lib/rpc';
	import { auth } from '$lib/auth.svelte';

	type Opportunity = {
		id: string; type: string; title: string; description: string;
		field: string | null; image_url: string | null; link_url: string | null;
		required_skills: string | null; budget: string | null; created_at: number;
		expires_at: number; edit_count: number; thumbs_up: number; thumbs_down: number;
		user_id: string; author_name: string; author_field: string; author_province: string;
	};

	let activeTab = $state<'JOB' | 'TALENT'>('JOB');
	let fieldFilter = $state('');
	let skillFilter = $state('');
	let skillInput = $state('');
	let items = $state<Opportunity[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(false);
	let page = $state(1);

	let skillTimeout: ReturnType<typeof setTimeout>;
	function onSkillInput() {
		clearTimeout(skillTimeout);
		skillTimeout = setTimeout(() => {
			skillFilter = skillInput.trim();
			load(true);
		}, 400);
	}

	async function load(reset = false) {
		if (reset) { page = 1; loading = true; }
		try {
			const res = await api.getOpportunities({ type: activeTab, page, limit: 20, fieldFilter, skillFilter });
			if (reset || page === 1) items = res.items;
			else items = [...items, ...res.items];
			hasMore = res.hasMore;
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	onMount(() => load(true));

	function switchTab(tab: 'JOB' | 'TALENT') {
		activeTab = tab;
		load(true);
	}

	async function loadMore() {
		loadingMore = true;
		page++;
		await load();
	}

	function timeSince(ts: number) {
		const diff = Date.now() / 1000 - ts;
		if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
		return `${Math.floor(diff / 86400)} hari lalu`;
	}

	function daysLeft(ts: number) {
		const diff = ts - Date.now() / 1000;
		if (diff <= 0) return 'Kedaluwarsa';
		const days = Math.ceil(diff / 86400);
		return `${days} hari lagi`;
	}

	function getBadges(item: Opportunity) {
		const badges: { label: string; cls: string }[] = [];
		if (item.thumbs_up >= 25) badges.push({ label: 'Trusted', cls: 'badge-green' });
		else if (item.thumbs_up >= 10) badges.push({ label: 'Populer', cls: 'badge-blue' });
		if (item.thumbs_down >= 10) badges.push({ label: 'Warning', cls: 'badge-red' });
		else if (item.thumbs_down >= 5) badges.push({ label: 'Warning', cls: 'badge-yellow' });
		return badges;
	}

	function getBorderClass(item: Opportunity) {
		if (item.thumbs_down >= 10) return 'border-red-700/60';
		if (item.thumbs_down >= 5) return 'border-yellow-700/60';
		if (item.thumbs_up >= 25) return 'border-green-700/60';
		return 'border-gray-800';
	}
</script>

<svelte:head>
	<title>Papan Lowongan — FreelancerID</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold text-white mb-1">Papan Lowongan</h1>
			<p class="text-gray-400">Cari proyek atau tawarkan jasamu</p>
		</div>
		<a href="/board/create" class="btn-primary self-start sm:self-auto">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
			Buat Postingan
		</a>
	</div>

	<!-- Filter bar -->
	<div class="bg-gray-900 border border-gray-800 rounded-2xl p-2 mb-6 flex flex-col sm:flex-row gap-2">
		<!-- Tabs -->
		<div class="flex gap-1 p-0.5">
			<button
				class="px-4 py-2 rounded-xl text-sm font-semibold transition-all {activeTab === 'JOB' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}"
				onclick={() => switchTab('JOB')}
			>Butuh Freelancer</button>
			<button
				class="px-4 py-2 rounded-xl text-sm font-semibold transition-all {activeTab === 'TALENT' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}"
				onclick={() => switchTab('TALENT')}
			>Tawarkan Jasa</button>
		</div>

		<div class="w-px bg-gray-800 hidden sm:block self-stretch my-1"></div>

		<!-- Field filter -->
		<select class="select flex-1 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none" bind:value={fieldFilter} onchange={() => load(true)}>
			<option value="">Semua Bidang</option>
			{#each DISCIPLINES as d}
				<option value={d}>{d}</option>
			{/each}
		</select>

		<div class="w-px bg-gray-800 hidden sm:block self-stretch my-1"></div>

		<!-- Skill filter -->
		<div class="relative flex-1">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			<input
				class="w-full bg-transparent pl-9 pr-8 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none"
				type="text"
				placeholder="Cari keahlian (React, Figma...)"
				bind:value={skillInput}
				oninput={onSkillInput}
			/>
			{#if skillFilter}
				<button class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onclick={() => { skillInput = ''; skillFilter = ''; load(true); }}>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Cards -->
	{#if loading}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each Array(6) as _}
				<div class="card p-5 animate-pulse">
					<div class="h-5 bg-gray-800 rounded mb-3 w-4/5"></div>
					<div class="h-3 bg-gray-800 rounded mb-2"></div>
					<div class="h-3 bg-gray-800 rounded w-3/4 mb-4"></div>
					<div class="flex gap-2">
						<div class="h-6 w-16 bg-gray-800 rounded-full"></div>
						<div class="h-6 w-16 bg-gray-800 rounded-full"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if items.length === 0}
		<div class="text-center py-20">
			<svg class="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
			<p class="text-gray-500 mb-2">Belum ada postingan {activeTab === 'JOB' ? 'lowongan' : 'jasa'}</p>
			<a href="/board/create" class="btn-primary text-sm">Buat yang pertama</a>
		</div>
	{:else}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each items as item}
				{@const badges = getBadges(item)}
				{@const borderCls = getBorderClass(item)}
				<a
					href="/board/{item.id}"
					class="card p-5 hover:border-gray-600 transition-all flex flex-col border {borderCls}"
				>
					<!-- Type badge + expiry -->
					<div class="flex items-center justify-between mb-3">
						<span class="badge {item.type === 'JOB' ? 'badge-blue' : 'badge-purple'} text-xs">
							{item.type === 'JOB' ? 'Butuh Freelancer' : 'Tawarkan Jasa'}
						</span>
						<span class="text-xs text-gray-600">{daysLeft(item.expires_at)}</span>
					</div>

					<!-- Title -->
					<h3 class="font-semibold text-gray-100 mb-2 line-clamp-2 leading-snug">{item.title}</h3>

					<!-- Budget -->
					{#if item.budget}
						<p class="text-xs text-green-400 font-medium mb-2">{item.budget}</p>
					{/if}

					<!-- Description -->
					<p class="text-sm text-gray-400 line-clamp-3 mb-3 flex-1">
						{!auth.userId && item.type === 'JOB' ? item.description.slice(0, 20) + '...' : item.description}
					</p>

					<!-- Badges -->
					{#if badges.length > 0}
						<div class="flex gap-1.5 mb-3 flex-wrap">
							{#each badges as b}
								<span class={b.cls}>{b.label}</span>
							{/each}
						</div>
					{/if}

					<!-- Field + Skills -->
					<div class="flex flex-wrap gap-1.5 mb-3">
						{#if item.field}
							<span class="badge bg-gray-800 text-gray-400 border border-gray-700 text-xs">{item.field}</span>
						{/if}
						{#if item.required_skills}
							{#each item.required_skills.split(',').filter(Boolean) as skill}
								<button
									class="badge-purple text-xs cursor-pointer hover:bg-brand-800/60 transition-colors"
									onclick={(e) => { e.stopPropagation(); skillInput = skill.trim(); skillFilter = skill.trim(); load(true); }}
								>{skill.trim()}</button>
							{/each}
						{/if}
					</div>

					<!-- Footer -->
					<div class="pt-3 border-t border-gray-800 flex items-center justify-between">
						<div class="text-xs text-gray-500 truncate max-w-[60%]">
							{item.author_name} · {item.author_province}
						</div>
						<div class="flex items-center gap-2 text-xs text-gray-500">
							<span class="flex items-center gap-0.5 {item.thumbs_up > 0 ? 'text-green-500' : ''}">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
								{item.thumbs_up}
							</span>
							<span class="flex items-center gap-0.5 {item.thumbs_down > 0 ? 'text-red-500' : ''}">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/></svg>
								{item.thumbs_down}
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		{#if hasMore}
			<div class="text-center mt-8">
				<button class="btn-secondary" onclick={loadMore} disabled={loadingMore}>
					{loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
				</button>
			</div>
		{/if}
	{/if}
</div>
