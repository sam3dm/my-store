/**
 * Chatbot lead reports. The browser posts the finished report here; it is sanitised, rate-limited and
 * delivered to the owner's Gmail (SMTP when configured, otherwise the GoDaddy Inbox route).
 */
import type { Request, Response } from "express";
import { sanitizeJson } from "./sanitize";
import { clientInfo } from "./security";
import type { ReportSender } from "./stats";

const hits = new Map<string, number[]>();

export function chatLeadHandler(send: ReportSender) {
	return async (req: Request, res: Response) => {
		res.setHeader("Cache-Control", "no-store");
		const ip = clientInfo(req).ip;
		const now = Date.now();
		const recent = (hits.get(ip) ?? []).filter((t) => t > now - 60_000);
		if (recent.length >= 4) {
			res.status(429).json({ success: false, error: "Too many requests" });
			return;
		}
		recent.push(now);
		hits.set(ip, recent);
		const b = sanitizeJson(req.body) as { title?: unknown; body?: unknown } | undefined;
		const title = typeof b?.title === "string" ? b.title.trim().slice(0, 200) : "";
		const body = typeof b?.body === "string" ? b.body.trim().slice(0, 20000) : "";
		if (!title || !body) {
			res.status(400).json({ success: false, error: "title and body are required" });
			return;
		}
		try {
			await send({ title, body });
			res.status(200).json({ success: true });
		} catch (e) {
			console.error("[chat-lead] delivery failed:", e instanceof Error ? e.message : e);
			res.status(502).json({ success: false, error: "Failed to send" });
		}
	};
}
