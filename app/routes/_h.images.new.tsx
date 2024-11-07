import {
	Card,
	Center,
	HStack,
	IconButton,
	Image,
	Spacer,
	Spinner,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	DownloadIcon,
	DraftingCompassIcon,
	InfoIcon,
	SparklesIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { db, schema } from "~/.client/db";
import { generateImages } from "~/api";
import { AutoResizedTextarea } from "~/components/auto-resized-textarea";
import { Button } from "~/components/ui/button";
import { ClipboardIconButton, ClipboardRoot } from "~/components/ui/clipboard";
import { EmptyState } from "~/components/ui/empty-state";
import {
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "~/components/ui/popover";

export const handle = { deep: true };

export async function clientLoader() {
	return null;
}

const prompts = [
	"a woman wearing a Victorian style dress, she has brown hair pull up in a tight bun, she walks through a foggy street at night, the full moon can barely be seen in the sky through the fog and cloud, she is lit the side by the orange light of a nearby lamp. close up on her face, she has piercing blue eyes, and is blushing",
	"Inkpunk Anime, inksketch in red and black, image of shinto shrine on top of a mountain, long flight of steps up to it, canyon, ravine, sunset, mist",
	"A tall, narrow house with a vibrant mustard-yellow facade, standing solitary on a rocky ledge. The buildingâs walls are aged, with visible cracks and patches of weathered paint, adding a rustic charm. Black-framed windows and a dark wooden door are set against the bold yellow, creating a stark, almost surreal contrast. Leafless, spindly trees surround the house, their branches stretching upward, almost touching the structure. The sky is a flat, desaturated beige, giving the scene an eerie, isolated mood, as if the house has been untouched for decades. Fine art photography style, with high detail on the textures of the stone, cracked paint, and bare branches.",
	"A vast snowy landscape with a lone traveler, equipped with a backpack and a helmet, walking towards a massive, derelict spaceship. The spaceship, appearing aged and worn out, has a prominent circular window emitting a glowing orange light. The sky is overcast, and the overall ambiance is cold and desolate.",
];

function downloadImage(src: string) {
	const a = document.createElement("a");
	a.href = src;
	a.download = "image.png";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

export default function ImagesNew() {
	const [prompt, setPrompt] = useState("");
	const [loadingPrompt, setLoadingPrompt] = useState("");
	const [imageSrc, setImageSrc] = useState("");
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationKey: ["newImages"],
		mutationFn: async (data: { prompt: string }) => {
			setLoadingPrompt(data.prompt);
			setPrompt("");
			const { image } = await generateImages(data.prompt);
			const url = `data:image/png;base64,${image}`;
			await db
				.insert(schema.images)
				.values({ url, prompt: data.prompt })
				.execute();
			return url;
		},
		onSuccess: (url) => {
			setImageSrc(url);
		},
	});

	function randomPrompt() {
		const randomIndex = Math.floor(Math.random() * prompts.length);
		setPrompt(prompts[randomIndex]);
		mutation.mutate({ prompt: prompts[randomIndex] });
	}

	return (
		<VStack h="dvh" flex={1} w="full" maxW="4xl" mx="auto">
			<HStack w="full" p={1}>
				<IconButton size="sm" variant="ghost" onClick={() => navigate(-1)}>
					<ArrowLeftIcon />
				</IconButton>
				<Spacer />
			</HStack>
			<VStack flex={1} p={2} w="full">
				{imageSrc === "" && mutation.status === "idle" && (
					<EmptyState
						icon={<DraftingCompassIcon />}
						title="请输入提示词"
						description="请在下方输入提示词,或者点击随机按钮生成"
					>
						<Button onClick={() => randomPrompt()}>随机</Button>
					</EmptyState>
				)}
				{imageSrc === "" && mutation.status === "pending" && (
					<Card.Root size="sm" maxW="sm" w="full" overflow="hidden">
						<Center w="full" maxW="sm" aspectRatio="square">
							<Spinner />
						</Center>
						<Card.Body>
							<Card.Description lineClamp={5}>{loadingPrompt}</Card.Description>
						</Card.Body>
					</Card.Root>
				)}
				{imageSrc !== "" && (
					<Card.Root size="sm" maxW="sm" w="full" overflow="hidden">
						<Image src={imageSrc} alt={prompt} maxW="sm" />
						<Card.Body>
							<Card.Description lineClamp={5}>{loadingPrompt}</Card.Description>
						</Card.Body>
						<Card.Footer>
							<ClipboardRoot value={loadingPrompt}>
								<ClipboardIconButton />
							</ClipboardRoot>
							<Button
								size="xs"
								variant="subtle"
								onClick={() => downloadImage(imageSrc)}
							>
								<DownloadIcon />
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
											<Text>{loadingPrompt}</Text>
										</Stack>
									</PopoverBody>
								</PopoverContent>
							</PopoverRoot>
						</Card.Footer>
					</Card.Root>
				)}
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
						value={prompt}
						onInput={(e) => setPrompt(e.currentTarget.value)}
					/>
					<Button
						type="submit"
						loading={mutation.status === "pending"}
						onClick={() => mutation.mutate({ prompt })}
					>
						<SparklesIcon />
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
}
