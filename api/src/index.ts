import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import { z } from "zod";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const messageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
});

const chatSchema = z.object({
	messages: z.array(messageSchema),
	model: z.string(),
});

const imageSchema = z.object({
	prompt: z.string(),
});

app.use(cors());

app.post("/chat", async (c) => {
	const data = chatSchema.parse(await c.req.json());
	const model = data.model;
	const openai = new OpenAI({
		baseURL: `https://api.cloudflare.com/client/v4/accounts/${c.env.CF_ACCOUNT_ID}/ai/v1`,
		apiKey: c.env.CF_API_TOKEN,
	});
	const response = await openai.chat.completions.create({
		messages: data.messages,
		model: model,
		stream: true,
	});
	const stream = response.toReadableStream();
	const encoder = new TextEncoder();
	const { readable, writable } = new TransformStream({
		transform(chunk: string, controller) {
			if (chunk === "") {
				return;
			}
			const data = JSON.parse(chunk) as ChatCompletionChunk;
			const content = data.choices[0].delta.content;
			if (content) {
				controller.enqueue(encoder.encode(content));
			}
		},
	});
	stream.pipeThrough(new TextDecoderStream()).pipeTo(writable);
	return new Response(readable);
});
const summarizeSchema = z.object({
	messages: z.array(messageSchema),
});

app.post("/summarize", async (c) => {
	const data = summarizeSchema.parse(await c.req.json());
	const messages = data.messages.concat({
		role: "system",
		content: "请你根据上面的对话, 给出一个10个词内的标题,只回答标题即可",
	});
	const openai = new OpenAI({
		baseURL: `https://api.cloudflare.com/client/v4/accounts/${c.env.CF_ACCOUNT_ID}/ai/v1`,
		apiKey: c.env.CF_API_TOKEN,
	});
	const response = await openai.chat.completions.create({
		messages: messages,
		model: "@cf/qwen/qwen1.5-14b-chat-awq",
		max_completion_tokens: 20,
	});
	const content = response.choices[0].message.content;
	return c.json(content);
});

app.post("/images", async (c) => {
	const data = imageSchema.parse(await c.req.json());
	const response = await c.env.AI.run(
		// @ts-ignore
		"@cf/black-forest-labs/flux-1-schnell",
		{
			prompt: data.prompt,
			num_steps: 8,
		},
		{
			gateway: "openchat",
		},
	);
	return c.json(response);
});

export default app;
