import { HStack, VStack, Text } from "@chakra-ui/react";
import { BotIcon } from "lucide-react";
import { memo } from "react";
import { formatRelative } from "date-fns";
import { zhCN } from "date-fns/locale";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Avatar } from "~/components/ui/avatar";
import { Prose } from "~/components/ui/prose";
import { Message } from "~/drizzle/schema";

interface ChatBubbleProps {
	message: Message;
}

export const ChatBubbleMemo = memo(({ message }: ChatBubbleProps) => {
	return <ChatBubble message={message} />;
});

export function ChatBubble({ message }: ChatBubbleProps) {
	return (
		<HStack
			w="full"
			rounded="sm"
			p={2}
			alignItems="start"
			flexDir={message.role === "user" ? "row-reverse" : "row"}
		>
			{message.role !== "user" && (
				<Avatar
					size="sm"
					fallback={<BotIcon size={20} strokeWidth="1.5px" />}
				/>
			)}
			<VStack w="full" alignItems={message.role === "user" ? "end" : "start"}>
				<Text textStyle="xs" color="gray">
					{formatRelative(message.createdAt, new Date(), {
						locale: zhCN,
					})}
				</Text>
				<Prose
					bgColor="gray.100"
					color="gray.800"
					px={3}
					rounded="2xl"
					css={{
						"& pre": {
							whiteSpace: "pre-wrap",
						},
					}}
				>
					<Markdown
						rehypePlugins={[rehypeHighlight]}
						remarkPlugins={[remarkGfm]}
					>
						{message.content}
					</Markdown>
				</Prose>
			</VStack>
		</HStack>
	);
}
