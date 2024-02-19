import { Ai } from '@cloudflare/ai';
import { Env } from '../worker-configuration';

function generateRequestBody(question: string) {
	return {
		stream: true,
		messages: [
			{
				role: 'system',
				content: 'Your task is to extract the account ID from the users question so we can use it to generate an API request',
			},
			{ role: 'user', content: 'My account id is 123456. Dates 11/2 and 11/4' },
			{ role: 'assistant', content: '123456' },
			{ role: 'user', content: 'account_id 999555444' },
			{ role: 'assistant', content: '999555444' },
			{ role: 'user', content: question },
		],
	};
}

async function makeAIReq(context: EventContext<Env, any, any>, question: string) {
	const model = '@cf/mistral/mistral-7b-instruct-v0.1';
	const body = generateRequestBody(question);
	let answer;
	try {
		const ai = new Ai(context.env.AI);
		answer = await ai.run(model, body);
	} catch (e) {
		console.log('AI binding failed. Trying to use rest api');
		answer = fetch(`https://api.cloudflare.com/client/v4/accounts/${context.env.ACCOUNT_ID}/ai/run/${model}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${context.env.CF_AI_API_TOKEN}` },
			body: JSON.stringify(body),
		});
		return answer;
	}
	return new Response(answer, { headers: { 'content-type': 'text/event-stream' } });
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const request = context.request;
	const u = new URL(request.url);
	const question = u.searchParams.get('question') || 'no question';
	return await makeAIReq(context, question);
};
