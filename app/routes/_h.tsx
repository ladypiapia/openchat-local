import { Center, HStack, Spinner, Stack, Text, VStack } from "@chakra-ui/react";
import { BotIcon, BrushIcon, MessageSquareIcon, UserIcon } from "lucide-react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

const navigations = [
	{ href: "/", title: "首页", icon: <MessageSquareIcon /> },
	{ href: "/images", title: "绘画", icon: <BrushIcon /> },
	{ href: "/account", title: "我的", icon: <UserIcon /> },
];

export default function HomeLayout() {
	const matches = useMatches();
	// @ts-ignore
	const deep = matches.some((match) => match.handle?.deep);

	const location = useLocation();
	const navigate = useNavigate();

	return (
		<Stack flexDir={{ base: "column", md: "row" }} h="dvh">
			<VStack
				display={{ base: "none", md: "flex" }}
				p={2}
				gap={2}
				borderRightWidth="1px"
				borderColor="bg.muted"
			>
				<HStack py={4}>
					<BotIcon />
				</HStack>
				{navigations.map((item) => {
					let isActive = location.pathname === item.href;
					if (item.href === "/" && location.pathname === "/chat") {
						isActive = true;
					}
					return (
						<Button
							key={`nav-${item.href}`}
							variant={isActive ? "subtle" : "ghost"}
							h="fit"
							onClick={() => navigate(item.href, { viewTransition: true })}
						>
							<VStack gap={0} py={2} color={isActive ? "blue.500" : ""}>
								{item.icon}
								<Text fontSize="smaller" fontWeight="normal">
									{item.title}
								</Text>
							</VStack>
						</Button>
					);
				})}
			</VStack>
			<Outlet />
			<HStack
				display={{ base: deep ? "none" : "flex", md: "none" }}
				p={2}
				gap={2}
			>
				{navigations.map((item) => {
					let isActive = location.pathname === item.href;
					if (item.href === "/" && location.pathname === "/chat") {
						isActive = true;
					}
					return (
						<Button
							key={`nav-${item.href}`}
							variant="plain"
							flex={1}
							h="fit"
							onClick={() => navigate(item.href, { viewTransition: true })}
						>
							<VStack gap={0} color={isActive ? "blue.500" : ""}>
								{item.icon}
								<Text fontSize="smaller" fontWeight="normal">
									{item.title}
								</Text>
							</VStack>
						</Button>
					);
				})}
			</HStack>
		</Stack>
	);
}

export function HydrateFallback() {
	return (
		<Center>
			<Spinner/>
		</Center>
	)
}