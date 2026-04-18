<script lang="ts">
	import { auth } from '$lib/auth.svelte';
</script>

<svelte:head>
	<title>FreelancerID — Direktori Freelancer Indonesia</title>
	<meta name="description" content="Temukan dan terhubung dengan freelancer profesional di seluruh Indonesia." />
</svelte:head>

<!-- ─── HERO ─────────────────────────────────────────────────────────────── -->
<section class="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6">
	<div class="absolute inset-0 -z-10">
		<div class="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-700/15 rounded-full blur-3xl"></div>
	</div>

	<div class="max-w-3xl mx-auto text-center">
		<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/50 border border-brand-700/40 text-brand-300 text-xs font-semibold mb-7">
			<span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
			Direktori Aktif · Seluruh Indonesia
		</div>

		<h1 class="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
			Temukan & kenalkan dirimu<br class="hidden sm:block" />
			sebagai <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">freelancer Indonesia</span>
		</h1>

		<p class="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-9 leading-relaxed">
			Satu tempat untuk freelancer mendaftarkan diri, klien menemukan talenta, dan komunitas saling berbagi peluang — gratis, tanpa password, privasi terjaga.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
			{#if auth.userId}
				<a href="/directory" class="btn-primary text-base px-6 py-3 w-full sm:w-auto justify-center">Jelajahi Direktori</a>
				<a href="/board" class="btn-secondary text-base px-6 py-3 w-full sm:w-auto justify-center">Papan Lowongan</a>
				<a href="/board/create" class="btn-secondary text-base px-6 py-3 w-full sm:w-auto justify-center">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
				Buat Postingan
			</a>
			{:else}
				<a href="/register" class="btn-primary text-base px-7 py-3 w-full sm:w-auto justify-center">
					Daftar Gratis — 2 Menit
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
				</a>
				<a href="/directory" class="btn-secondary text-base px-6 py-3 w-full sm:w-auto justify-center">Lihat Direktori</a>
			{/if}
		</div>

		<!-- Stats row -->
		<div class="flex items-center justify-center gap-8 sm:gap-12">
			{#each [['38', 'Provinsi'], ['37+', 'Kategori'], ['Gratis', 'Selamanya']] as [val, lbl]}
				<div class="text-center">
					<p class="text-xl sm:text-2xl font-bold text-white">{val}</p>
					<p class="text-xs text-gray-500 mt-0.5">{lbl}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ─── FOR WHOM ──────────────────────────────────────────────────────────── -->
<section class="py-16 px-4 sm:px-6 border-t border-gray-800/60">
	<div class="max-w-5xl mx-auto grid sm:grid-cols-2 gap-4">
		<!-- Freelancer -->
		<div class="card p-7 relative overflow-hidden group hover:border-brand-700/60 transition-colors">
			<div class="absolute top-0 right-0 w-32 h-32 bg-brand-700/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-700/20 transition-colors"></div>
			<div class="w-10 h-10 rounded-xl bg-brand-900/70 border border-brand-700/40 flex items-center justify-center mb-5">
				<svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
			</div>
			<h2 class="text-lg font-bold text-white mb-2">Kamu seorang freelancer?</h2>
			<p class="text-sm text-gray-400 leading-relaxed mb-5">Daftarkan dirimu ke direktori dan biarkan klien menemukan keahlianmu. Profilmu terproteksi — kontak hanya terlihat oleh anggota terdaftar.</p>
			<ul class="space-y-2 mb-6">
				{#each ['Muncul di pencarian berdasarkan keahlian & lokasi', 'Posting penawaran jasa di papan lowongan', 'Bangun reputasi lewat sistem voting komunitas'] as item}
					<li class="flex items-start gap-2 text-sm text-gray-300">
						<svg class="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
						{item}
					</li>
				{/each}
			</ul>
			<a href="/register" class="btn-primary text-sm w-full justify-center">Daftar Sekarang</a>
		</div>

		<!-- Client -->
		<div class="card p-7 relative overflow-hidden group hover:border-gray-700 transition-colors">
			<div class="absolute top-0 right-0 w-32 h-32 bg-gray-700/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gray-700/20 transition-colors"></div>
			<div class="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-5">
				<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
			</div>
			<h2 class="text-lg font-bold text-white mb-2">Butuh freelancer?</h2>
			<p class="text-sm text-gray-400 leading-relaxed mb-5">Telusuri direktori freelancer dari seluruh Indonesia. Filter berdasarkan keahlian dan lokasi, atau posting lowongan agar talenta yang datang ke kamu.</p>
			<ul class="space-y-2 mb-6">
				{#each ['Filter 37+ kategori keahlian dari seluruh provinsi', 'Posting lowongan & terima tawaran dari freelancer', 'Lihat reputasi dari voting komunitas'] as item}
					<li class="flex items-start gap-2 text-sm text-gray-300">
						<svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
						{item}
					</li>
				{/each}
			</ul>
			<a href="/directory" class="btn-secondary text-sm w-full justify-center">Jelajahi Direktori</a>
		</div>
	</div>
</section>

<!-- ─── HOW IT WORKS ───────────────────────────────────────────────────────── -->
<section class="py-16 px-4 sm:px-6 border-t border-gray-800/60">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-12">
			<h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Mulai dalam 3 langkah</h2>
			<p class="text-gray-400 text-sm">Tidak perlu verifikasi email. Tidak perlu password.</p>
		</div>

		<div class="grid sm:grid-cols-3 gap-4">
			{#each [
				{ n: '1', title: 'Isi form', desc: 'Nama, LinkedIn, lokasi, dan bidang keahlian. Selesai dalam 2 menit.' },
				{ n: '2', title: 'Simpan ID-mu', desc: 'Kamu dapat ID 10 karakter unik. Ini satu-satunya kunci untuk login kembali.' },
				{ n: '3', title: 'Mulai terhubung', desc: 'Jelajahi direktori, posting lowongan, atau tawarkan jasamu.' }
			] as s}
				<div class="card p-6 flex flex-col">
					<div class="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center font-bold text-white text-sm mb-4">{s.n}</div>
					<h3 class="font-semibold text-gray-100 mb-2">{s.title}</h3>
					<p class="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ─── FEATURES HIGHLIGHT ────────────────────────────────────────────────── -->
<section class="py-16 px-4 sm:px-6 border-t border-gray-800/60">
	<div class="max-w-5xl mx-auto">
		<div class="text-center mb-12">
			<h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Dirancang untuk komunitas</h2>
			<p class="text-gray-400 text-sm">Bukan marketplace berbayar. Ini komunitas peer-to-peer untuk freelancer Indonesia.</p>
		</div>

		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each features as f}
				<div class="card p-5 hover:border-gray-700 transition-colors flex gap-4 items-start">
					<div class="w-9 h-9 rounded-lg bg-brand-900/60 border border-brand-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
						{@html f.icon}
					</div>
					<div>
						<h3 class="font-semibold text-gray-100 mb-1 text-sm">{f.title}</h3>
						<p class="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ─── CTA ───────────────────────────────────────────────────────────────── -->
{#if !auth.userId}
<section class="py-16 px-4 sm:px-6 border-t border-gray-800/60">
	<div class="max-w-2xl mx-auto text-center">
		<p class="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-4">Siap bergabung?</p>
		<h2 class="text-2xl sm:text-3xl font-bold text-white mb-3">Daftar gratis sekarang</h2>
		<p class="text-gray-400 mb-8 text-sm max-w-md mx-auto">Tidak perlu kartu kredit, tidak perlu password. Cukup isi form dan simpan ID unikmu.</p>
		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<a href="/register" class="btn-primary text-base px-7 py-3 justify-center">Daftar — 2 Menit</a>
			<a href="/directory" class="btn-secondary text-base px-6 py-3 justify-center">Lihat Direktori Dulu</a>
		</div>
	</div>
</section>
{/if}

<script lang="ts" module>
	const features = [
		{
			title: 'Enkripsi AES-256',
			desc: 'Nama, LinkedIn, dan portfolio dienkripsi — hanya bisa dibuka oleh anggota terdaftar.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`
		},
		{
			title: 'Voting & Reputasi',
			desc: 'Setiap postingan dinilai komunitas. Badge Trusted, Populer, atau Warning tampil otomatis.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
		},
		{
			title: 'Tanpa Password',
			desc: 'Akses akun cukup dengan ID 10 karakter. Simpan baik-baik — tidak ada reset.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>`
		},
		{
			title: 'Filter Keahlian & Lokasi',
			desc: '37+ kategori keahlian, 38 provinsi, ratusan kota. Cari yang paling relevan.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>`
		},
		{
			title: 'Papan Lowongan',
			desc: 'Post lowongan atau penawaran jasa. Maksimal 3 aktif, berlaku 1–14 hari.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`
		},
		{
			title: '100% Gratis',
			desc: 'Tidak ada biaya listing, tidak ada komisi, tidak ada fitur premium tersembunyi.',
			icon: `<svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`
		}
	];
</script>
