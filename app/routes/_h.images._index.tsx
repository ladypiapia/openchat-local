import {
	Heading,
	HStack,
	IconButton,
	Spacer,
	VStack,
	Grid,
	GridItem,
	Image,
	Center,
	Spinner,
	Card,
	Text,
	Stack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { DownloadIcon, InfoIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { db, schema } from "~/.client/db";
import { Button } from "~/components/ui/button";
import { ClipboardIconButton, ClipboardRoot } from "~/components/ui/clipboard";
import {
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "~/components/ui/popover";
import type { Image as ImageType } from "~/drizzle/schema";

export default function Images() {
	const queryClient = useQueryClient();

	const { data: images, isPending: isImagesPending } = useQuery({
		queryKey: ["images"],
		queryFn: async () => {
			return db.query.images.findMany({
				orderBy({ createdAt }, { desc }) {
					return desc(createdAt);
				},
			});
		},
	});

	const deleteImageMutation = useMutation({
		mutationKey: ["deleteImage"],
		mutationFn: async (id: string) => {
			await db.delete(schema.images).where(eq(schema.images.id, id)).execute();
			return id;
		},
		onSuccess: (id) => {
			queryClient.setQueryData(["images"], (images: ImageType[]) => {
				return images.filter((image) => image.id !== id);
			});
		},
	});

	function downloadImage(src: string) {
		const a = document.createElement("a");
		a.href = src;
		a.download = "image.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	return (
		<VStack flex={1} minH="1">
			<HStack w="full" px={2} py={1}>
				<Heading size="md">绘画列表</Heading>
				<Spacer />
				<IconButton size="sm" variant="subtle" asChild>
					<Link to="/images/new" viewTransition>
						<PlusIcon />
					</Link>
				</IconButton>
			</HStack>
			{isImagesPending && (
				<Center h="full">
					<Spinner />
				</Center>
			)}
			<Grid
				gap={2}
				p={2}
				overflowY="auto"
				w="full"
				gridTemplateColumns={{
					base: "repeat(1, minmax(0, 1fr))",
					sm: "repeat(2, minmax(0, 1fr))",
					md: "repeat(3, minmax(0, 1fr))",
					lg: "repeat(4, minmax(0, 1fr))",
					xl: "repeat(5, minmax(0, 1fr))",
				}}
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
				{images?.map((image) => (
					<GridItem key={image.id} h="fit">
						<Card.Root size="sm" maxW="sm" overflow="hidden">
							<Image src={image.url} alt={image.prompt} />
							<Card.Body>
								<Card.Description lineClamp={1}>
									{image.prompt}
								</Card.Description>
							</Card.Body>
							<Card.Footer>
								<ClipboardRoot value={image.prompt}>
									<ClipboardIconButton />
								</ClipboardRoot>
								<Button
									size="xs"
									variant="subtle"
									onClick={() => downloadImage(image.url)}
								>
									<DownloadIcon />
								</Button>
								<Button
									size="xs"
									variant="ghost"
									colorPalette="red"
									onClick={() => deleteImageMutation.mutate(image.id)}
								>
									<Trash2Icon />
								</Button>
								<Spacer />
								<PopoverRoot size="xs">
									<PopoverTrigger asChild>
										<Button size="xs" variant="plain">
											<InfoIcon />
										</Button>
									</PopoverTrigger>
									<PopoverContent>
										<PopoverArrow />
										<PopoverBody>
											<Stack
												maxH="200px"
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
												<Text>{image.prompt}</Text>
											</Stack>
										</PopoverBody>
									</PopoverContent>
								</PopoverRoot>
							</Card.Footer>
						</Card.Root>
					</GridItem>
				))}
			</Grid>
		</VStack>
	);
}
