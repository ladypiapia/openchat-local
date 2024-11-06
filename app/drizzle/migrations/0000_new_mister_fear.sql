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
