import type { RequestHandler } from './$types';
import * as actions from '$lib/server/actions';
import { env as privateEnv } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, platform }) => {
	const cfEnv = (platform as App.Platform | undefined)?.env;

	const resolvedEnv = {
		TURSO_DATABASE_URL: cfEnv?.TURSO_DATABASE_URL ?? privateEnv.TURSO_DATABASE_URL,
		TURSO_AUTH_TOKEN: cfEnv?.TURSO_AUTH_TOKEN ?? privateEnv.TURSO_AUTH_TOKEN,
		ENCRYPTION_KEY: cfEnv?.ENCRYPTION_KEY ?? privateEnv.ENCRYPTION_KEY
	};

	const { method, params } = await request.json();

	try {
		let result;
		switch (method) {
			case 'registerUser':
				result = await actions.registerUser(resolvedEnv, params);
				break;
			case 'getUserById':
				result = await actions.getUserById(resolvedEnv, params.id);
				break;
			case 'updateUser':
				result = await actions.updateUser(resolvedEnv, params.id, params.data);
				break;
			case 'getFreelancers':
				result = await actions.getFreelancers(resolvedEnv, params);
				break;
			case 'getActivePostCount':
				result = await actions.getActivePostCount(resolvedEnv, params.userId);
				break;
			case 'createOpportunity':
				result = await actions.createOpportunity(resolvedEnv, params);
				break;
			case 'editOpportunity':
				result = await actions.editOpportunity(resolvedEnv, params.id, params.userId, params.data);
				break;
			case 'deleteOpportunity':
				result = await actions.deleteOpportunity(resolvedEnv, params.id, params.userId);
				break;
			case 'getOpportunities':
				result = await actions.getOpportunities(resolvedEnv, params);
				break;
			case 'getOpportunityById':
				result = await actions.getOpportunityById(resolvedEnv, params.id);
				break;
			case 'voteOpportunity':
				result = await actions.voteOpportunity(resolvedEnv, params.opportunityId, params.userId, params.value);
				break;
			case 'getUserVote':
				result = await actions.getUserVote(resolvedEnv, params.opportunityId, params.userId);
				break;
			case 'verifyUser':
				result = await actions.verifyUser(resolvedEnv, params.id);
				break;
			default:
				return new Response(JSON.stringify({ error: 'Unknown method' }), { status: 400 });
		}
		return new Response(JSON.stringify({ result }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Terjadi kesalahan';
		return new Response(JSON.stringify({ error: message }), { status: 500 });
	}
};
