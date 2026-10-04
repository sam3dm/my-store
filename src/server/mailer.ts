/**
 * Direct e-mail delivery of chatbot lead reports (and, optionally, the nightly/alert reports).
 *
 * Configured only through environment variables, never in the repository:
 *   SMTP_USER   the sending Gmail address (e.g. samir.benkhadra82@gmail.com)
 *   SMTP_PASS   a Gmail "App password" (Google Account → Security → 2-Step Verification → App passwords)
 *   MAIL_TO     where reports are delivered (defaults to SMTP_USER)
 *   SMTP_HOST / SMTP_PORT   optional (default smtp.gmail.com : 465)
 * Without SMTP_USER/SMTP_PASS nothing here is active and the GoDaddy Inbox route is used as before.
 */
import nodemailer from "nodemailer";
import type { ReportSender } from "./stats";

export function smtpConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
	return Boolean(env.SMTP_USER && env.SMTP_PASS);
}

function mdToHtml(md: string): string {
	const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	const lines = md.split(/\r?\n/);
	const out: string[] = [];
	let table: string[] = [];
	const flush = () => {
		if (!table.length) return;
		const rows = table.filter((r) => !/^\|\s*-+/.test(r)).map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => esc(c.trim()).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")));
		out.push(`<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px">${c}</td>`).join("")}</tr>`).join("")}</table>`);
		table = [];
	};
	for (const l of lines) {
		if (l.startsWith("|")) {
			table.push(l);
			continue;
		}
		flush();
		if (/^#{1,3}\s/.test(l)) out.push(`<h3 style="font-family:Arial,sans-serif">${esc(l.replace(/^#+\s*/, ""))}</h3>`);
		else if (l.trim()) out.push(`<p style="font-family:Arial,sans-serif;font-size:14px">${esc(l).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")}</p>`);
	}
	flush();
	return out.join("\n");
}

export function smtpSender(env: NodeJS.ProcessEnv = process.env): ReportSender | null {
	if (!smtpConfigured(env)) return null;
	const port = Number(env.SMTP_PORT || 465);
	const transport = nodemailer.createTransport({
		host: env.SMTP_HOST || "smtp.gmail.com",
		port,
		secure: port === 465,
		auth: { user: env.SMTP_USER?.trim(), pass: (env.SMTP_PASS ?? "").replace(/\s+/g, "") },
		connectionTimeout: 15_000,
		socketTimeout: 20_000,
	});
	return async ({ title, body }) => {
		await transport.sendMail({
			from: `"Metropolitan Website" <${env.SMTP_USER}>`,
			to: env.MAIL_TO || env.SMTP_USER,
			subject: title.slice(0, 200),
			text: body,
			html: mdToHtml(body),
		});
	};
}

/** SMTP first (when configured), then the Inbox route; fails only when every available channel failed. */
export function combinedSender(inbox: ReportSender, smtp: ReportSender | null = smtpSender()): ReportSender {
	return async (r) => {
		let smtpError: unknown = null;
		if (smtp) {
			try {
				await smtp(r);
				return;
			} catch (e) {
				smtpError = e;
				console.error("[mail] smtp failed:", e instanceof Error ? e.message : e);
			}
		}
		try {
			await inbox(r);
		} catch (e) {
			throw smtpError ?? e;
		}
	};
}
