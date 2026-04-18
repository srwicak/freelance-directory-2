async function rpc(method: string, params: unknown = {}) {
	const res = await fetch('/api/rpc', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ method, params })
	});
	const data = await res.json();
	if (data.error) throw new Error(data.error);
	return data.result;
}

export const api = {
	registerUser: (params: unknown) => rpc('registerUser', params),
	getUserById: (id: string) => rpc('getUserById', { id }),
	updateUser: (id: string, data: unknown) => rpc('updateUser', { id, data }),
	getFreelancers: (params: unknown) => rpc('getFreelancers', params),
	getActivePostCount: (userId: string) => rpc('getActivePostCount', { userId }),
	createOpportunity: (params: unknown) => rpc('createOpportunity', params),
	editOpportunity: (id: string, userId: string, data: unknown) => rpc('editOpportunity', { id, userId, data }),
	deleteOpportunity: (id: string, userId: string) => rpc('deleteOpportunity', { id, userId }),
	getOpportunities: (params: unknown) => rpc('getOpportunities', params),
	getOpportunityById: (id: string) => rpc('getOpportunityById', { id }),
	voteOpportunity: (opportunityId: string, userId: string, value: 1 | -1) =>
		rpc('voteOpportunity', { opportunityId, userId, value }),
	getUserVote: (opportunityId: string, userId: string) =>
		rpc('getUserVote', { opportunityId, userId }),
	verifyUser: (id: string) => rpc('verifyUser', { id })
};
