import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const freelancers = sqliteTable('freelancers', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	field: text('field').notNull(),
	sub_field: text('sub_field'),
	province: text('province').notNull(),
	city: text('city').notNull(),
	details: text('details'),
	portfolio: text('portfolio'),
	linkedin: text('linkedin').notNull(),
	created_at: integer('created_at').notNull().default(sql`(unixepoch())`)
});

export const opportunities = sqliteTable('opportunities', {
	id: text('id').primaryKey(),
	user_id: text('user_id').notNull().references(() => freelancers.id),
	type: text('type').notNull(), // 'JOB' | 'TALENT'
	title: text('title').notNull(),
	description: text('description').notNull(),
	field: text('field'),
	image_url: text('image_url'),
	link_url: text('link_url'),
	required_skills: text('required_skills'), // comma-separated, max 5
	budget: text('budget'),
	project_duration: text('project_duration'), // JOB only
	availability: text('availability'),         // TALENT only
	created_at: integer('created_at').notNull().default(sql`(unixepoch())`),
	expires_at: integer('expires_at').notNull(),
	edit_count: integer('edit_count').notNull().default(0),
	thumbs_up: integer('thumbs_up').notNull().default(0),
	thumbs_down: integer('thumbs_down').notNull().default(0)
});

export const opportunity_votes = sqliteTable('opportunity_votes', {
	id: text('id').primaryKey(),
	opportunity_id: text('opportunity_id').notNull().references(() => opportunities.id),
	user_id: text('user_id').notNull().references(() => freelancers.id),
	value: integer('value').notNull() // 1 or -1
});
