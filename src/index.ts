/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Env } from '../worker-configuration';
import handleProxy from './proxy';
import handleRedirect from './redirect';
import handleAI from './ai-test'
import apiRouter from './router';

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);
		console.log(url.pathname)

		// You can get pretty far with simple logic like if/switch-statements
		switch (url.pathname) {
			case '/redirect':
				return handleRedirect.fetch(request, env, ctx);

			case '/proxy':
				return handleProxy.fetch(request, env, ctx);

			case '/ai':
				return handleAI.fetch(request, env, ctx)
		}

		if (url.pathname.startsWith('/api/')) {
			// You can also use more robust routing
			return apiRouter.handle(request);
		}

		return new Response(
			`<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>AI Prompt Question</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100vh;
						margin: 0;
						background-color: #f0f0f0;
					}
					.container {
						text-align: center;
						background-color: white;
						padding: 20px;
						border-radius: 10px;
						box-shadow: 0 4px 8px rgba(0,0,0,0.1);
					}
					input[type="text"], button {
						width: 300px;
						padding: 10px;
						margin: 10px 0;
						border-radius: 5px;
					}
					input[type="text"] {
						border: 1px solid #ddd;
					}
					button {
						border: none;
						background-color: #007bff;
						color: white;
						cursor: pointer;
					}
					button:hover {
						background-color: #0056b3;
					}
					#answer {
						margin-top: 20px;
						text-align: left;
						border: 1px solid #ddd;
						border-radius: 5px;
						background-color: #f9f9f9;
						padding: 10px;
					}
			
					/* Spinner styles */
					.spinner {
						border: 4px solid rgba(0,0,0,0.1);
						border-radius: 50%;
						border-top: 4px solid #3498db;
						width: 20px;
						height: 20px;
						animation: spin 1s linear infinite;
						position: absolute;
						left: 50%;
						top: 50%;
						transform: translate(-50%, -50%);
					}
					@keyframes spin {
						0% { transform: translate(-50%, -50%) rotate(0deg); }
						100% { transform: translate(-50%, -50%) rotate(360deg); }
					}
				</style>
			</head>
			<body>
				<div class="container">
					<form id="questionForm">
						<input type="text" id="questionInput" placeholder="Ask your question here" autofocus>
						<button type="submit">Ask</button>
					</form>
					<div id="answer"></div>
				</div>
			
				<script>
					function askQuestion() {
						var question = document.getElementById('questionInput').value;
						// Placeholder for making an API call to your Cloudflare Worker
						// For now, just display the question in the answer div
						document.getElementById('answer').innerText = 'Question asked: ' + question;
						var answerDiv = document.getElementById('answer');
						answerDiv.innerHTML = '<div class="spinner"></div>'; // Show spinner while processing
						
						// Example: Fetch API call to Cloudflare Worker
						fetch('/ai', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ question: question })
						})
						.then(response => response.json())
						.then(data => {
							document.getElementById('answer').innerText = 'Answer: ' + data.answer;
						})
						.catch(error => console.error('Error:', error));
					}
			
					document.getElementById('questionForm').addEventListener('submit', function(event) {
						event.preventDefault()
						askQuestion()
					})
					
				</script>
			</body>
			</html>
						`,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
};
