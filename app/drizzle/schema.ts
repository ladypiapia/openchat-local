import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const conversations = pgTable("conversations", {
	id: varchar("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: varchar("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export type Conversation = typeof conversations.$inferSelect;
export type ConversationInsert = typeof conversations.$inferInsert;
export const conversationsInsertSchema = createInsertSchema(conversations);

export const conversationsRelations = relations(conversations, ({ many }) => ({
	messages: many(messages),
}));

export const messages = pgTable("messages", {
	id: varchar("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	conversationId: varchar("conversation_id").notNull(),
	role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export type Message = typeof messages.$inferSelect;
export type MessageInsert = typeof messages.$inferInsert;
export const messagesInsertSchema = createInsertSchema(messages);

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
}));

export const images = pgTable("images", {
	id: varchar("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	url: varchar("url").notNull(),
	prompt: varchar("prompt").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export type Image = typeof images.$inferSelect;
export type ImageInsert = typeof images.$inferInsert;
export const imagesInsertSchema = createInsertSchema(images);
