import { IdbFs, PGlite } from "@electric-sql/pglite";
import { getItem, setItem } from "localforage";
import wasm from "node_modules/@electric-sql/pglite/dist/postgres.wasm?url";
import wasmData from "node_modules/@electric-sql/pglite/dist/postgres.data?url";
import { drizzle } from "drizzle-orm/pglite";
import * as s from "~/drizzle/schema";

async function getWasm() {
	const item = (await getItem("pg_wasm")) as ArrayBuffer;
	if (item) {
		return await WebAssembly.compile(item);
	}
	const resp = await fetch(wasm);
	const data = await resp.arrayBuffer();
	await setItem("pg_wasm", data);
	return await WebAssembly.compile(data);
}

async function getWasmData() {
	const item = (await getItem("pg_data")) as Blob;
	if (item) {
		return item;
	}
	const resp = await fetch(wasmData);
	const data = await resp.blob();
	await setItem("pg_data", data);
	return data;
}

export const client = new PGlite({
	wasmModule: await getWasm(),
	fsBundle: await getWasmData(),
	fs: new IdbFs("chatbot"),
});

await client.exec(`
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" varchar PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"prompt" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
	`);

export const schema = s;
export const db = drizzle(client, {
	schema,
});
