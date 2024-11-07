import { Center } from "@chakra-ui/react";
import { MessageSquareIcon } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";

export default function Index() {
	return (
		<Center w="full" display={{ base: "none", md: "flex" }}>
			<EmptyState
				icon={<MessageSquareIcon />}
				title="请选择一个会话"
				description="点击左侧的会话列表，开始聊天"
			/>
		</Center>
	);
}
