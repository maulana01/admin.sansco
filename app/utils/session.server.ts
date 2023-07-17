import { redirect, createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

export const storage = createCookieSessionStorage({
	cookie: {
		maxAge: 60 * 60 * 24, // 20 hours
		httpOnly: true,
		name: 'userSession',
		secrets: ["rahasia"]
	}
});

export async function logout(request: Request) {
	const session = await storage.getSession(request.headers.get("Cookie"));
	return redirect("/login", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
}

export async function createUserSession(
	token: string,
	redirectTo: string
) {
	const session = await storage.getSession();
	session.set("token", token);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
}
