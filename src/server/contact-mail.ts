/**
 * Contact-us form → the owner's Gmail directly (SMTP), never through the GoDaddy Inbox.
 *
 * Registered before the generated /api/contact/:formName route. When SMTP is not configured the request is
 * passed on (`next()`), so local runs without credentials keep working as before.
 */
import type { NextFunction, Request, Response } from "express";
import { clientInfo } from "./security";
import { sanitizeJson } from "./sanitize";
import type { ReportSender } from "./stats";

const hits = new Map<string, number[]>();

export function contactMailHandler(getSender: () => ReportSender | null) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const send = getSender();
		if (!send) {
			next();
			return;
		}
		res.setHeader("Cache-Control", "no-store");
		const body = sanitizeJson(req.body) as Record<string, any> | undefined;
		if (body?._gotcha) {
			res.status(200).json({ success: true }); // honeypot: pretend success
			return;
		}
		const user = (body?.user ?? {}) as { email?: unknown; mobile?: unknown; name?: unknown };
		const email = typeof user.email === "string" ? user.email.trim().slice(0, 200) : "";
		const mobile = typeof user.mobile === "string" ? user.mobile.trim().slice(0, 60) : "";
		const name = typeof user.name === "string" ? user.name.trim().slice(0, 120) : "";
		const message = body?.conversation?.messages_attributes?.[0]?.body;
		if ((!email && !mobile) || typeof message !== "string" || !message.trim()) {
			res.status(400).json({ success: false, error: "email or mobile and a message are required" });
			return;
		}
		if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
			res.status(400).json({ success: false, error: "invalid email" });
			return;
		}
		const ip = clientInfo(req).ip;
		const now = Date.now();
		const recent = (hits.get(ip) ?? []).filter((t) => t > now - 60_000);
		if (recent.length >= 4) {
			res.status(429).json({ success: false, error: "Too many requests" });
			return;
		}
		recent.push(now);
		hits.set(ip, recent);
		const data = (body?.conversation?.data ?? {}) as Record<string, unknown>;
		const rawTitle = typeof data.__gd_contact_form_title === "string" ? data.__gd_contact_form_title : "CONTACT FORM";
		const title = `${rawTitle} — ${name || email || mobile}`.slice(0, 200);
		const lines = [
			message.trim().slice(0, 12000),
			"",
			`Reply to: ${email || mobile}${email && mobile ? ` / ${mobile}` : ""}`,
		];
		try {
			await send({ title, body: lines.join("\n") });
			res.status(200).json({ success: true });
		} catch (e) {
			console.error("[contact-mail] delivery failed:", e instanceof Error ? e.message : e);
			res.status(502).json({ success: false, error: "Failed to submit contact form" });
		}
	};
}
