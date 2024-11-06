import { Button, VStack, Text, Heading } from "@chakra-ui/react";
import { db, schema } from "~/.client/db";
import { Avatar } from "~/components/ui/avatar";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";

async function cleanConversations() {
	await db.delete(schema.conversations).execute();
	await db.delete(schema.messages).execute();
}

async function cleanImages() {
	await db.delete(schema.images).execute();
}

export default function Account() {
	return (
		<VStack flex={1} p={4} w="full" maxW="4xl" mx="auto">
			<Avatar />
			<Heading size="md">匿名账户</Heading>
			<DeleteConversationsDialog />
			<DeleteImagesDialog />
		</VStack>
	);
}

function DeleteConversationsDialog() {
	return (
		<DialogRoot size="xs" placement="center" role="alertdialog">
			<DialogTrigger asChild>
				<Button variant="subtle" size="sm" w="full">
					清空会话
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>确认清空?</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Text color="gray.500" fontSize="sm">
						此操作将删除所有会话和消息,不可逆。
					</Text>
				</DialogBody>
				<DialogFooter>
					<DialogActionTrigger asChild>
						<Button variant="outline">取消</Button>
					</DialogActionTrigger>
					<DialogActionTrigger asChild>
						<Button colorPalette="red" onClick={cleanConversations}>
							确认
						</Button>
					</DialogActionTrigger>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
}

function DeleteImagesDialog() {
	return (
		<DialogRoot size="xs" placement="center" role="alertdialog">
			<DialogTrigger asChild>
				<Button variant="subtle" size="sm" w="full">
					清空图片
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>确认清空?</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Text color="gray.500" fontSize="sm">
						此操作将删除所有图片,不可逆。
					</Text>
				</DialogBody>
				<DialogFooter>
					<DialogActionTrigger asChild>
						<Button variant="outline">取消</Button>
					</DialogActionTrigger>
					<DialogActionTrigger asChild>
						<Button colorPalette="red" onClick={cleanImages}>
							确认
						</Button>
					</DialogActionTrigger>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
}
