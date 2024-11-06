import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	Center,
	HStack,
	IconButton,
	Spacer,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	Skeleton,
	SkeletonCircle,
	SkeletonText,
} from "~/components/ui/skeleton";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
	ArrowLeftIcon,
	ArrowUpIcon,
	MessageSquareDashedIcon,
} from "lucide-react";
import { ChatBubbleMemo } from "~/components/chat-bubble";
import { AutoResizedTextarea } from "~/components/auto-resized-textarea";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { db, schema } from "~/.client/db";
import type { Conversation, Message } from "~/drizzle/schema";
import { chat, summarize } from "~/api";
import { eq } from "drizzle-orm";

export const handle = { deep: true };

export async function clientLoader() {
	// prevent hydration mismatch
	return null;
}

export default function Chat() {
	const [content, setContent] = useState("");
	const [outputing, setOutputing] = useState("");

	const [searchParams] = useSearchParams();
	const conversationId = searchParams.get("id") as string;

	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();

	// make sure the state only used once
	useEffect(() => {
		if (location.state) {
			history.replaceState(null, "");
		}
	}, [location]);

	const { data: messages, isPending: isMessagesPending } = useQuery({
		queryKey: ["messages", conversationId],
		queryFn: async () => {
			return db.query.messages.findMany({
				where(item, { eq }) {
					return eq(item.conversationId, conversationId);
				},
				orderBy({ createdAt }, { asc }) {
					return asc(createdAt);
				},
			});
		},
		initialData: location.state?.new ? [] : undefined,
	});
	const { data: conversation, isPending: isConversationsPending } = useQuery({
		queryKey: ["conversation", conversationId],
		queryFn: async () => {
			return db.query.conversations.findFirst({
				where(item, { eq }) {
					return eq(item.id, conversationId);
				},
			});
		},
	});
	const chatMutation = useMutation({
		mutationKey: ["chat", conversationId],
		mutationFn: async (content: string) => {
			setContent("");
			const userMessages = await db
				.insert(schema.messages)
				.values({
					conversationId,
					role: "user",
					content: content,
				})
				.returning()
				.execute();
			const userMessage = userMessages[0];
			queryClient.setQueryData(
				["messages", conversationId],
				(oldData: Message[]) => {
					return [...oldData, userMessage];
				},
			);
			setOutputing("...");
			const sendMessageData =
				messages?.map((message) => ({
					role: message.role,
					content: message.content,
				})) ?? [];
			sendMessageData.push({ role: "user", content: content });
			const resp = await chat(sendMessageData);
			const reader = resp.body?.getReader();
			if (!reader) {
				return;
			}
			const decoder = new TextDecoder();
			let tmp = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				const text = decoder.decode(value);
				tmp += text;
				setOutputing(tmp);
			}
			const respMessages = await db
				.insert(schema.messages)
				.values({
					conversationId,
					role: "assistant",
					content: tmp,
				})
				.returning()
				.execute();
			return respMessages[0];
		},
		async onSuccess(data) {
			setOutputing("");
			if (!data) return;
			queryClient.setQueryData(
				["messages", conversationId],
				(oldData: Message[]) => {
					return [...oldData, data];
				},
			);
			if (
				conversation &&
				conversation.name === "" &&
				messages &&
				messages.length > 0
			) {
				const messagesSend = messages.map((message) => {
					return {
						role: message.role,
						content: message.content,
					};
				});
				const topic = await summarize(messagesSend);
				await db
					.update(schema.conversations)
					.set({
						name: topic,
					})
					.where(eq(schema.conversations.id, conversationId))
					.execute();
				queryClient.setQueryData(
					["conversation", conversationId],
					(oldData: Conversation) => {
						return {
							...oldData,
							name: topic,
						};
					},
				);
			}
			queryClient.invalidateQueries({
				queryKey: ["conversations"],
			});
			// update the conversation list
			// queryClient.setQueryData(
			// 	["conversations"],
			// 	async (oldData: Conversation[]) => {
			// 		if (!conversation) return
			// 		// remove the conversation from the list
			// 		const data = oldData.filter(
			// 			(conversation) => conversation.id !== conversationId,
			// 		);
			// 		// add the conversation to the top
			// 		data.unshift(conversation);
			// 		return data;
			// 	},
			// );
		},
		onError() {
			setOutputing("");
		},
	});

	const reverseMessages = messages?.slice().reverse() ?? [];

	return (
		<VStack flex={1} gap={2} w="full" mx="auto" h="dvh" maxW="4xl">
			<HStack w="full" px={2} py={1}>
				<IconButton
					size="sm"
					variant="ghost"
					onClick={() =>
						navigate("/", {
							viewTransition: true,
						})
					}
				>
					<ArrowLeftIcon />
				</IconButton>
				{isConversationsPending ? (
					<SkeletonText noOfLines={1} />
				) : (
					<Text truncate fontSize="sm">
						{conversation?.name}
					</Text>
				)}
				<Spacer />
			</HStack>
			<VStack
				flex={1}
				overflowY="auto"
				w="full"
				p={2}
				flexDirection="column-reverse"
				justifyContent="flex-start"
				css={{
					"&::-webkit-scrollbar": {
						width: "6px",
					},
					"&::-webkit-scrollbar-thumb": {
						bg: {
							base: "gray.300",
							_dark: "gray.700",
						},
						borderRadius: "full",
					},
				}}
			>
				<Spacer />
				{isMessagesPending && <ChatSkeleton />}
				{!isMessagesPending && reverseMessages.length === 0 && (
					<Center h="full">
						<EmptyState
							icon={<MessageSquareDashedIcon />}
							title="请输入消息"
							description="在下方输入框输入消息，然后按回车键发送"
						/>
					</Center>
				)}
				{outputing !== "" && (
					<ChatBubbleMemo
						key="outputing"
						message={{
							id: "outputing",
							conversationId: conversationId,
							role: "assistant",
							content: outputing,
							createdAt: new Date(),
							updatedAt: new Date(),
						}}
					/>
				)}
				{reverseMessages.map((message) => (
					<ChatBubbleMemo key={`chat-bubble-${message.id}`} message={message} />
				))}
			</VStack>
			<VStack w="full" p={2}>
				<HStack w="full" alignItems="start">
					<AutoResizedTextarea
						name="content"
						minH="initial"
						resize="none"
						overflow="hidden"
						lineHeight="inherit"
						maxH={20}
						required
						value={content}
						onInput={(e) => setContent(e.currentTarget.value)}
					/>
					<Button
						type="submit"
						loading={chatMutation.status === "pending"}
						onClick={() => chatMutation.mutate(content)}
					>
						<ArrowUpIcon />
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
}

function ChatSkeleton() {
	return (
		<VStack w="full">
			{Array.from({ length: 3 }).map((_, index) => (
				<HStack
					key={`skeleton-${index}`}
					w="full"
					rounded="sm"
					p={2}
					alignItems="start"
					flexDir={index % 2 === 0 ? "row-reverse" : "row"}
				>
					{index % 2 !== 0 && <SkeletonCircle size={10} />}
					<VStack w="full" alignItems={index % 2 === 0 ? "end" : "start"}>
						<Skeleton h="6" w="24" />
						<Skeleton h="12" w="80%" rounded="2xl" />
					</VStack>
				</HStack>
			))}
		</VStack>
	);
}
