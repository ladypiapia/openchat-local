import { Stack } from "@chakra-ui/react";
import { Outlet, useLocation, useSearchParams } from "react-router";
import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EllipsisVerticalIcon, PlusIcon, SmileIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuTrigger,
} from "~/components/ui/menu";
import { Skeleton } from "~/components/ui/skeleton";
import { toaster } from "~/components/ui/toaster";
import { db, schema } from "~/.client/db";
import type { Conversation } from "~/drizzle/schema";
import { EmptyState } from "~/components/ui/empty-state";

export default function ChatLayout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const conversationId = searchParams.get("id");

	const { data: conversations, isPending: isConversationsPending } = useQuery({
		queryKey: ["conversations"],
		queryFn: async () => {
			return db.query.conversations.findMany({
				orderBy({ createdAt }, { desc }) {
					return desc(createdAt);
				},
			});
		},
	});

	const createConversationMuration = useMutation({
		mutationKey: ["createConversation"],
		mutationFn: async () => {
			const result = await db
				.insert(schema.conversations)
				.values({
					name: "",
				})
				.returning();
			return result[0];
		},
		onSuccess(data) {
			queryClient.setQueryData(["conversations"], (oldData: Conversation[]) => {
				return [data, ...oldData];
			});
			navigate(`/chat?id=${data.id}`, {
				viewTransition: true,
				state: {
					new: true,
				},
			});
		},
	});

	const deleteConversationMutation = useMutation({
		mutationKey: ["deleteConversation"],
		mutationFn: async (conversationId: string) => {
			const promise = db
				.delete(schema.conversations)
				.where(eq(schema.conversations.id, conversationId))
				.execute();
			toaster.promise(promise, {
				success: {
					title: "删除成功",
					description: "会话已删除",
				},
				error: {
					title: "删除失败",
					description: "会话删除失败",
				},
				loading: {
					title: "删除中",
					description: "正在删除会话",
				},
			});
			return conversationId;
		},
		onSuccess(data) {
			queryClient.setQueryData(["conversations"], (oldData: Conversation[]) => {
				return oldData.filter((conversation) => conversation.id !== data);
			});
			if (conversationId === data) {
				navigate("/", {
					viewTransition: true,
				});
			}
		},
	});

	return (
		<Stack flexDir="row" w="full" flex={1} minH={0}>
			<VStack
				minH={0}
				w={{ base: "full", md: "270px" }}
				display={{
					base: location.pathname === "/" ? "flex" : "none",
					md: "flex",
				}}
				p={2}
				flexShrink={0}
				borderRightWidth="1px"
				borderColor="bg.muted"
			>
				<HStack w="full">
					<Text fontWeight="bold">会话列表</Text>
					<Spacer />
					<Button
						variant="subtle"
						aspectRatio="square"
						size="sm"
						loading={createConversationMuration.status === "pending"}
						onClick={() => createConversationMuration.mutate()}
					>
						<PlusIcon />
					</Button>
				</HStack>
				<VStack
					flex={1}
					w="full"
					overflowY="auto"
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
					{conversations?.length === 0 && (
						<EmptyState
							icon={<SmileIcon />}
							title="暂无会话"
							description="点击右上角按钮创建一个新会话"
						/>
					)}
					{isConversationsPending && (
						<>
							<Skeleton w="full" h={10} />
							<Skeleton w="full" h={10} />
							<Skeleton w="full" h={10} />
						</>
					)}
					{conversations?.map((converation) => {
						return (
							<Button
								w="full"
								key={`conversation-${converation.id}`}
								asChild
								justifyContent="start"
								variant={converation.id === conversationId ? "subtle" : "ghost"}
								onClick={() => {
									navigate(`/chat/?id=${converation.id}`, {
										viewTransition: true,
									});
								}}
							>
								<HStack>
									<Text truncate flex={1}>
										{converation.name === "" ? "新会话" : converation.name}
									</Text>
									<MenuRoot
										onSelect={async (e) => {
											switch (e.value) {
												case "delete":
													deleteConversationMutation.mutate(converation.id);
													break;
												default:
													break;
											}
										}}
									>
										<MenuTrigger onClick={(e) => e.stopPropagation()} asChild>
											<IconButton size="xs" variant="ghost">
												<EllipsisVerticalIcon />
											</IconButton>
										</MenuTrigger>
										<MenuContent>
											<MenuItem
												value="delete"
												color="fg.error"
												_hover={{ bg: "bg.error", color: "fg.error" }}
												onClick={(e) => e.stopPropagation()}
											>
												删除
											</MenuItem>
										</MenuContent>
									</MenuRoot>
								</HStack>
							</Button>
						);
					})}
				</VStack>
			</VStack>
			<Outlet />
		</Stack>
	);
}
