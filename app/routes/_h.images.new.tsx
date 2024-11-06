import {
	HStack,
	IconButton,
	Image,
	Spacer,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { db, schema } from "~/.client/db";
import { generateImages } from "~/api";
import { AutoResizedTextarea } from "~/components/auto-resized-textarea";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export const handle = { deep: true };

export async function clientLoader() {
	return null;
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

	return (
		<VStack h="dvh" flex={1} w="full" maxW="4xl" mx="auto">
			<HStack w="full" p={1}>
				<IconButton size="sm" variant="ghost" onClick={() => navigate(-1)}>
					<ArrowLeftIcon />
				</IconButton>
				<Spacer />
			</HStack>
			<VStack flex={1} p={2}>
				{mutation.status === "pending" && (
					<Skeleton w="300px" maxW="md" aspectRatio="square" />
				)}
				{imageSrc && (
					<Image
						src={imageSrc}
						w="300px"
						alt="Generated"
						maxW="md"
						rounded="md"
					/>
				)}
				<Text>{loadingPrompt}</Text>
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
