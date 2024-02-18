import { Ai } from '@cloudflare/ai';
import { Env } from '../worker-configuration';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const u = new URL(request.url);
		const question = u.searchParams.get('question') || 'no question';
		// const data: any = await request.json()
		console.log(question);
		const ai = new Ai(env.AI);

		const answer = await ai.run(
			// '@cf/meta/llama-2-7b-chat-int8',
			'@hf/thebloke/neural-chat-7b-v3-1-awq',
			{
				stream: true,
				messages: [
					// { role: 'system', content: 'Use 10 words or less to answer the prompt if possible. Do not add context or notes. ' },
					{ role: 'user', content: question },
				],
			}
		);

		console.log(answer);

		return new Response(answer, { headers: { 'content-type': 'text/event-stream' } });
	},
};
