import ky from "ky";

export const BASE_API_URL = "https://api.pexni.com";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
	refreshSubscribers.push(cb);
}
function onRefreshed(token: string) {
	for (const subscriber of refreshSubscribers) {
		subscriber(token);
	}
	refreshSubscribers = [];
}
const refreshAccessToken = async (): Promise<string> => {
	const refresh_token = localStorage.getItem("refresh_token");
	const resp = await api
		.post("refresh_token", {
			json: { token: refresh_token },
		})
		.json<SigninResp>();
	localStorage.setItem("access_token", resp.access_token);
	localStorage.setItem("refresh_token", resp.refresh_token);
	onRefreshed(resp.access_token);
	return resp.access_token;
};
export const api = ky.create({
	prefixUrl: BASE_API_URL,
	hooks: {
		beforeRequest: [
			(request) => {
				const token = localStorage.getItem("access_token");
				if (token) {
					request.headers.set("Authorization", `Bearer ${token}`);
				}
			},
		],
		afterResponse: [
			async (request, options, response) => {
				if (response.status === 401) {
					if (!isRefreshing) {
						isRefreshing = true;
						try {
							const token = await refreshAccessToken();
							request.headers.set("Authorization", `Bearer ${token}`);
							return api(request, options);
						} catch (error) {
							console.error("Failed to refresh token", error);
						} finally {
							isRefreshing = false;
						}
					} else {
						return new Promise((resolve) => {
							subscribeTokenRefresh((token) => {
								request.headers.set("Authorization", `Bearer ${token}`);
								resolve(api(request, options));
							});
						});
					}
				}
			},
		],
	},
});

interface SigninResp {
	access_token: string;
	refresh_token: string;
}

interface User {
	id: string;
	username: string;
}

export interface Conversation {
	id: string;
	name: string;
	pinned: boolean;
	created_at: string;
	updated_at: string;
}

export interface Message {
	id: string;
	conversation_id: string;
	user_id: string;
	role: string;
	content: string;
	created_at: string;
	updated_at: string;
}

export interface SendMessageData {
	role: string;
	content: string;
}

export const signin = (data: { username: string; password: string }) =>
	api.post("signin", { json: data }).json<SigninResp>();

export const signup = (data: { username: string; password: string }) =>
	api.post("signup", { json: data }).json<User>();

export const account = () => api.get("account").json<User>();

export const getConversations = () =>
	api.get("conversations").json<Conversation[]>();

export const createConversation = () =>
	api.post("conversations").json<Conversation>();

export const getConversation = (conversationId: string) =>
	api.get(`conversations/${conversationId}`).json<Conversation>();

export const deleteConversation = (conversationId: string) =>
	api.delete(`conversations/${conversationId}`);

export const getMessages = (conversationId: string) =>
	api.get(`conversations/${conversationId}/messages`).json<Message[]>();

export const chat = (messages: SendMessageData[]) =>
	api.post("chat", {
		json: {
			messages: messages,
			model: "@cf/qwen/qwen1.5-14b-chat-awq",
		},
	});

export const generateImages = (prompt: string) =>
	api.post("images", { json: { prompt }, timeout: 200000 }).json<{
		image: string;
	}>();

export const getImageBinary = (key: string) => api.get(`images/${key}`).blob();

export const summarize = (messages: SendMessageData[]) =>
	api
		.post("summarize", {
			json: {
				messages: messages,
			},
		})
		.json<string>();
