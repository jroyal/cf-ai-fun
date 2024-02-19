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

async function makeAIReq(context: EventContext<Env, any, any>, question: string) {}

export const onRequest: PagesFunction<Env> = async (context) => {
	console.log(context.env.CF_AI_API_TOKEN);
	const request = context.request;
	const u = new URL(request.url);
	const question = u.searchParams.get('question') || 'no question';
	// const data: any = await request.json()
	console.log(question);
	const ai = new Ai(context.env.AI);

	try {
		const answer = await ai.run(
			// '@cf/meta/llama-2-7b-chat-int8',
			// '@hf/thebloke/neural-chat-7b-v3-1-awq',
			// '@hf/thebloke/codellama-7b-instruct-awq',
			'@cf/mistral/mistral-7b-instruct-v0.1',
			generateRequestBody(question)
		);

		console.log(answer);
		return new Response(answer, { headers: { 'content-type': 'text/event-stream' } });
	} catch (e) {
		console.log(e);
		return new Response('something went wrong my dude');
	}
};
