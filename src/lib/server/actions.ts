import { and, desc, eq, gt, like, or, sql } from 'drizzle-orm';
import { getDb } from './db';
import { encrypt, decrypt } from './encryption';
import { nanoid } from './nanoid';
import { freelancers, opportunities, opportunity_votes } from './schema';

type Env = { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string; ENCRYPTION_KEY: string };

// ─── Freelancers ────────────────────────────────────────────────────────────

export async function registerUser(
	env: Env,
	data: { name: string; linkedin: string; province: string; city: string; field: string; sub_field?: string; details?: string; portfolio?: string }
) {
	const db = getDb(env);
	const id = nanoid(10);
	const encName = await encrypt(data.name, env.ENCRYPTION_KEY);
	const encLinkedin = await encrypt(data.linkedin, env.ENCRYPTION_KEY);
	const encDetails = data.details ? await encrypt(data.details, env.ENCRYPTION_KEY) : null;
	const encPortfolio = data.portfolio ? await encrypt(data.portfolio, env.ENCRYPTION_KEY) : null;

	await db.insert(freelancers).values({
		id,
		name: encName,
		field: data.field,
		sub_field: data.sub_field ?? null,
		province: data.province,
		city: data.city,
		details: encDetails,
		portfolio: encPortfolio,
		linkedin: encLinkedin
	});
	return { id };
}

export async function getUserById(env: Env, id: string) {
	const db = getDb(env);
	const row = await db.select().from(freelancers).where(eq(freelancers.id, id)).get();
	if (!row) return null;
	return {
		...row,
		name: await decrypt(row.name, env.ENCRYPTION_KEY),
		linkedin: await decrypt(row.linkedin, env.ENCRYPTION_KEY),
		details: row.details ? await decrypt(row.details, env.ENCRYPTION_KEY) : null,
		portfolio: row.portfolio ? await decrypt(row.portfolio, env.ENCRYPTION_KEY) : null
	};
}

export async function updateUser(
	env: Env,
	id: string,
	data: { name: string; linkedin: string; province: string; city: string; field: string; sub_field?: string; details?: string; portfolio?: string }
) {
	const db = getDb(env);
	await db
		.update(freelancers)
		.set({
			name: await encrypt(data.name, env.ENCRYPTION_KEY),
			linkedin: await encrypt(data.linkedin, env.ENCRYPTION_KEY),
			field: data.field,
			sub_field: data.sub_field ?? null,
			province: data.province,
			city: data.city,
			details: data.details ? await encrypt(data.details, env.ENCRYPTION_KEY) : null,
			portfolio: data.portfolio ? await encrypt(data.portfolio, env.ENCRYPTION_KEY) : null
		})
		.where(eq(freelancers.id, id));
	return { ok: true };
}

export async function getFreelancers(
	env: Env,
	{ page = 1, limit = 20, search = '', fieldFilter = '' }: { page?: number; limit?: number; search?: string; fieldFilter?: string }
) {
	const db = getDb(env);
	const offset = (page - 1) * limit;

	let query = db.select().from(freelancers);
	const conditions = [];

	if (fieldFilter) conditions.push(eq(freelancers.field, fieldFilter));

	if (search) {
		conditions.push(
			or(
				like(freelancers.province, `%${search}%`),
				like(freelancers.city, `%${search}%`),
				like(freelancers.field, `%${search}%`)
			)
		);
	}

	const rows = await (conditions.length
		? query.where(and(...conditions))
		: query
	)
		.orderBy(desc(freelancers.created_at))
		.limit(limit)
		.offset(offset);

	const decrypted = await Promise.all(
		rows.map(async (r) => ({
			...r,
			name: await decrypt(r.name, env.ENCRYPTION_KEY),
			linkedin: await decrypt(r.linkedin, env.ENCRYPTION_KEY),
			details: r.details ? await decrypt(r.details, env.ENCRYPTION_KEY) : null,
			portfolio: r.portfolio ? await decrypt(r.portfolio, env.ENCRYPTION_KEY) : null
		}))
	);

	// Client-side name search on decrypted data
	const filtered = search
		? decrypted.filter(
				(f) =>
					f.name.toLowerCase().includes(search.toLowerCase()) ||
					f.province.toLowerCase().includes(search.toLowerCase()) ||
					f.city.toLowerCase().includes(search.toLowerCase()) ||
					f.field.toLowerCase().includes(search.toLowerCase()) ||
					(f.details ?? '').toLowerCase().includes(search.toLowerCase())
			)
		: decrypted;

	return { items: filtered, hasMore: rows.length === limit };
}

// ─── Opportunities ───────────────────────────────────────────────────────────

export async function getActivePostCount(env: Env, userId: string) {
	const db = getDb(env);
	const now = Math.floor(Date.now() / 1000);
	const rows = await db
		.select()
		.from(opportunities)
		.where(and(eq(opportunities.user_id, userId), gt(opportunities.expires_at, now)));
	return rows.length;
}

export async function createOpportunity(
	env: Env,
	data: { user_id: string; type: 'JOB' | 'TALENT'; title: string; description: string; field?: string; image_url?: string; link_url?: string; required_skills?: string; days?: number }
) {
	const db = getDb(env);
	const count = await getActivePostCount(env, data.user_id);
	if (count >= 3) throw new Error('Batas 3 postingan aktif tercapai');

	if (data.link_url && data.link_url.toLowerCase().includes('micro1') && data.user_id !== 'ZFfZUVLLDh')
		throw new Error('Terjadi kesalahan');

	const days = Math.min(Math.max(data.days ?? 14, 1), 14);
	const now = Math.floor(Date.now() / 1000);
	const id = nanoid(10);

	// Normalize skills: trim, max 5, remove empty
	const skills = data.required_skills
		? data.required_skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5).join(',')
		: null;

	await db.insert(opportunities).values({
		id,
		user_id: data.user_id,
		type: data.type,
		title: data.title,
		description: data.description,
		field: data.field ?? null,
		image_url: data.image_url ?? null,
		link_url: data.link_url ?? null,
		required_skills: skills,
		created_at: now,
		expires_at: now + days * 86400,
		edit_count: 0,
		thumbs_up: 0,
		thumbs_down: 0
	});
	return { id };
}

export async function editOpportunity(
	env: Env,
	id: string,
	userId: string,
	data: { title: string; description: string; field?: string; image_url?: string; link_url?: string; required_skills?: string }
) {
	const db = getDb(env);
	const post = await db.select().from(opportunities).where(eq(opportunities.id, id)).get();
	if (!post) throw new Error('Post tidak ditemukan');
	if (post.user_id !== userId) throw new Error('Tidak punya akses');
	if (post.edit_count >= 3) throw new Error('Batas edit (3x) sudah tercapai');

	if (data.link_url && data.link_url.toLowerCase().includes('micro1') && userId !== 'ZFfZUVLLDh')
		throw new Error('Terjadi kesalahan');

	const skills = data.required_skills
		? data.required_skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5).join(',')
		: null;

	await db
		.update(opportunities)
		.set({
			title: data.title,
			description: data.description,
			field: data.field ?? null,
			image_url: data.image_url ?? null,
			link_url: data.link_url ?? null,
			required_skills: skills,
			edit_count: post.edit_count + 1
		})
		.where(eq(opportunities.id, id));
	return { ok: true };
}

export async function deleteOpportunity(env: Env, id: string, userId: string) {
	const db = getDb(env);
	const post = await db.select().from(opportunities).where(eq(opportunities.id, id)).get();
	if (!post) throw new Error('Post tidak ditemukan');
	if (post.user_id !== userId) throw new Error('Tidak punya akses');
	await db.delete(opportunity_votes).where(eq(opportunity_votes.opportunity_id, id));
	await db.delete(opportunities).where(eq(opportunities.id, id));
	return { ok: true };
}

export async function getOpportunities(
	env: Env,
	{ type, page = 1, limit = 20, fieldFilter = '', skillFilter = '' }: { type?: string; page?: number; limit?: number; fieldFilter?: string; skillFilter?: string }
) {
	const db = getDb(env);
	const now = Math.floor(Date.now() / 1000);
	const offset = (page - 1) * limit;
	const conditions = [gt(opportunities.expires_at, now)];
	if (type) conditions.push(eq(opportunities.type, type));
	if (fieldFilter) conditions.push(eq(opportunities.field, fieldFilter));
	if (skillFilter) conditions.push(like(opportunities.required_skills, `%${skillFilter}%`));

	const rows = await db
		.select({
			opp: opportunities,
			author_name: freelancers.name,
			author_field: freelancers.field,
			author_province: freelancers.province
		})
		.from(opportunities)
		.leftJoin(freelancers, eq(opportunities.user_id, freelancers.id))
		.where(and(...conditions))
		.orderBy(desc(opportunities.created_at))
		.limit(limit)
		.offset(offset);

	const items = await Promise.all(
		rows.map(async (r) => ({
			...r.opp,
			author_name: r.author_name ? await decrypt(r.author_name, env.ENCRYPTION_KEY) : 'Anonim',
			author_field: r.author_field ?? '',
			author_province: r.author_province ?? ''
		}))
	);

	return { items, hasMore: rows.length === limit };
}

export async function getOpportunityById(env: Env, id: string) {
	const db = getDb(env);
	const row = await db
		.select({
			opp: opportunities,
			author: freelancers
		})
		.from(opportunities)
		.leftJoin(freelancers, eq(opportunities.user_id, freelancers.id))
		.where(eq(opportunities.id, id))
		.get();

	if (!row) return null;

	const author = row.author
		? {
				...row.author,
				name: await decrypt(row.author.name, env.ENCRYPTION_KEY),
				linkedin: await decrypt(row.author.linkedin, env.ENCRYPTION_KEY),
				details: row.author.details ? await decrypt(row.author.details, env.ENCRYPTION_KEY) : null,
				portfolio: row.author.portfolio
					? await decrypt(row.author.portfolio, env.ENCRYPTION_KEY)
					: null
			}
		: null;

	return { ...row.opp, author };
}

// ─── Voting ──────────────────────────────────────────────────────────────────

export async function voteOpportunity(
	env: Env,
	opportunityId: string,
	userId: string,
	value: 1 | -1
) {
	const db = getDb(env);
	const existing = await db
		.select()
		.from(opportunity_votes)
		.where(and(eq(opportunity_votes.opportunity_id, opportunityId), eq(opportunity_votes.user_id, userId)))
		.get();

	const post = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId)).get();
	if (!post) throw new Error('Post tidak ditemukan');

	if (existing) {
		if (existing.value === value) {
			// toggle off
			await db.delete(opportunity_votes).where(eq(opportunity_votes.id, existing.id));
			const delta = value === 1 ? { thumbs_up: post.thumbs_up - 1 } : { thumbs_down: post.thumbs_down - 1 };
			await db.update(opportunities).set(delta).where(eq(opportunities.id, opportunityId));
			return { action: 'removed' };
		} else {
			// switch
			await db.update(opportunity_votes).set({ value }).where(eq(opportunity_votes.id, existing.id));
			const delta =
				value === 1
					? { thumbs_up: post.thumbs_up + 1, thumbs_down: post.thumbs_down - 1 }
					: { thumbs_up: post.thumbs_up - 1, thumbs_down: post.thumbs_down + 1 };
			await db.update(opportunities).set(delta).where(eq(opportunities.id, opportunityId));
			return { action: 'switched' };
		}
	}

	// new vote
	await db.insert(opportunity_votes).values({
		id: nanoid(10),
		opportunity_id: opportunityId,
		user_id: userId,
		value
	});
	const delta = value === 1 ? { thumbs_up: post.thumbs_up + 1 } : { thumbs_down: post.thumbs_down + 1 };
	await db.update(opportunities).set(delta).where(eq(opportunities.id, opportunityId));
	return { action: 'added' };
}

export async function getUserVote(env: Env, opportunityId: string, userId: string) {
	const db = getDb(env);
	const row = await db
		.select()
		.from(opportunity_votes)
		.where(and(eq(opportunity_votes.opportunity_id, opportunityId), eq(opportunity_votes.user_id, userId)))
		.get();
	return row ? row.value : 0;
}

export async function verifyUser(env: Env, id: string) {
	const db = getDb(env);
	const row = await db.select({ id: freelancers.id }).from(freelancers).where(eq(freelancers.id, id)).get();
	return !!row;
}
