import { Ai } from '@cloudflare/ai'
import { Env } from '../worker-configuration'

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const data: any = await request.json()
    console.log(data.question)
    const ai = new Ai(env.AI)

    const answer = await ai.run(
      // '@cf/meta/llama-2-7b-chat-int8',
      '@hf/thebloke/neural-chat-7b-v3-1-awq',
      {
        messages: [
          { role: 'user', content: data.question }
        ]
      }
    )

    console.log(answer)

    return new Response(JSON.stringify({answer: answer.response}))
	}
}