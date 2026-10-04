/**
 * Privacy-first site statistics and the nightly owner report.
 *
 * What is kept (only until the report has been sent, then deleted):
 *  - an anonymous per-day visitor count (salted hashes, never IPs) and page-view counts
 *  - one summary per chatbot conversation: interests, topics asked, and the name / phone numbers
 *    ONLY if the visitor chose to leave them. Raw conversations are never sent to or stored by the server.
 *
 * There is deliberately no endpoint that reads any of this back: it only ever leaves the server inside
 * the report e-mailed to the owner at 23:30 UAE time.
 */
import type { NextFunction, Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const REPORT_TZ = "Asia/Dubai";
export const REPORT_HOUR = 23;
export const REPORT_MINUTE = 30;

export interface ChatSnapshot {
	sid: string;
	lang: "ar" | "en";
	name?: string;
	mobile?: string;
	phone?: string;
	field?: string;
	services: string[];
	platforms: string[];
	location?: string;
	approach?: string;
	details: string[];
	questions: string[];
	voiceUrls: string[];
	turns: number;
	hasLead: boolean;
	origin?: string;
	updatedAt: number;
}

export interface DayStats {
	date: string;
	visitors: string[];
	pageviews: number;
	pages: Record<string, number>;
	langs: Record<string, number>;
	chats: Record<string, ChatSnapshot>;
}

/* ── Time (UAE) ───────────────────────────────────────────────────────────── */

export function dubaiParts(now: Date): { date: string; hour: number; minute: number } {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: REPORT_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now);
	const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
	return { date: `${g("year")}-${g("month")}-${g("day")}`, hour: Number(g("hour")), minute: Number(g("minute")) };
}

/* ── Store ────────────────────────────────────────────────────────────────── */

const MAX_VISITORS = 200_000;
const MAX_CHATS = 3_000;
const BOT_RE = /bot|crawl|spider|slurp|preview|monitor|lighthouse|pingdom|uptime|headless|curl|wget|python-requests|facebookexternalhit|bingpreview/i;

const clip = (s: unknown, n: number): string | undefined => {
	if (typeof s !== "string") return undefined;
	const t = s.replace(/\s+/g, " ").trim().slice(0, n);
	return t || undefined;
};
const clipList = (v: unknown, n: number, each: number): string[] =>
	Array.isArray(v) ? v.map((x) => clip(x, each)).filter((x): x is string => Boolean(x)).slice(0, n) : [];

export class StatsStore {
	private days = new Map<string, DayStats>();
	private dirty = new Set<string>();
	private salt = "";

	constructor(readonly dir: string) {
		mkdirSync(dir, { recursive: true });
		const saltFile = join(dir, ".salt");
		try {
			this.salt = readFileSync(saltFile, "utf-8").trim();
		} catch {
			/* first run */
		}
		if (!this.salt) {
			this.salt = randomBytes(16).toString("hex");
			try {
				writeFileSync(saltFile, this.salt, { mode: 0o600 });
			} catch {
				/* keep in memory */
			}
		}
	}

	private file(date: string) {
		return join(this.dir, `day-${date}.json`);
	}

	get(date: string): DayStats {
		let d = this.days.get(date);
		if (!d) {
			try {
				d = JSON.parse(readFileSync(this.file(date), "utf-8")) as DayStats;
			} catch {
				d = { date, visitors: [], pageviews: 0, pages: {}, langs: {}, chats: {} };
			}
			this.days.set(date, d);
		}
		return d;
	}

	private visitorSets = new Map<string, Set<string>>();

	/** Last day whose report has been sent. Later activity for that day is ignored and erased. */
	lastSent(): string {
		try {
			return readFileSync(join(this.dir, ".last-sent"), "utf-8").trim();
		} catch {
			return "";
		}
	}

	markSent(date: string): void {
		try {
			writeFileSync(join(this.dir, ".last-sent"), date, { mode: 0o600 });
		} catch {
			/* best effort */
		}
	}

	recordVisit(date: string, ip: string, ua: string, lang: string, page: string): void {
		if (date <= this.lastSent()) return;
		const d = this.get(date);
		let set = this.visitorSets.get(date);
		if (!set) {
			set = new Set(d.visitors);
			this.visitorSets.set(date, set);
		}
		const h = createHash("sha256").update(`${this.salt}|${date}|${ip}|${ua}`).digest("hex").slice(0, 16);
		d.pageviews++;
		const key = page.slice(0, 80);
		if (key in d.pages || Object.keys(d.pages).length < 60) d.pages[key] = (d.pages[key] ?? 0) + 1;
		if (!set.has(h) && set.size < MAX_VISITORS) {
			set.add(h);
			d.visitors.push(h);
			d.langs[lang] = (d.langs[lang] ?? 0) + 1;
		}
		this.dirty.add(date);
	}

	/** Upsert a conversation summary. Only whitelisted, size-limited fields are kept. */
	recordChat(date: string, raw: Record<string, unknown>, origin?: string, now = Date.now()): boolean {
		const sid = typeof raw.sid === "string" && /^[A-Za-z0-9-]{8,64}$/.test(raw.sid) ? raw.sid : null;
		if (!sid || date <= this.lastSent()) return false;
		const d = this.get(date);
		if (!(sid in d.chats) && Object.keys(d.chats).length >= MAX_CHATS) return false;
		const phoneOk = (v: unknown) => (typeof v === "string" && /^[+\d\s()\-.]{7,24}$/.test(v) ? v.trim() : undefined);
		const details = raw.details && typeof raw.details === "object" ? Object.values(raw.details as Record<string, unknown>) : [];
		d.chats[sid] = {
			sid,
			lang: raw.lang === "ar" ? "ar" : "en",
			name: clip(raw.name, 60),
			mobile: phoneOk(raw.mobile),
			phone: phoneOk(raw.phone),
			field: clip(raw.field, 80),
			services: clipList(raw.services, 12, 80),
			platforms: clipList(raw.platforms, 8, 30),
			location: clip(raw.location, 40),
			approach: clip(raw.approach, 20),
			details: clipList(details, 6, 160),
			questions: clipList(raw.questions, 8, 140),
			voiceUrls: clipList(raw.voiceUrls, 3, 120).filter((u) => /^\/api\/chat\/voice\/[0-9a-f-]{36}\.(webm|ogg|m4a|mp3|wav)$/.test(u)),
			turns: Math.min(Number(raw.turns) || 0, 500),
			hasLead: Boolean(raw.hasLead),
			origin: origin?.slice(0, 120),
			updatedAt: now,
		};
		this.dirty.add(date);
		return true;
	}

	flush(): void {
		for (const date of this.dirty) {
			try {
				writeFileSync(this.file(date), JSON.stringify(this.get(date)), { mode: 0o600 });
			} catch (err) {
				console.error("[stats] could not save", date, err instanceof Error ? err.message : err);
			}
		}
		this.dirty.clear();
	}

	dates(): string[] {
		const found = new Set(this.days.keys());
		try {
			for (const f of readdirSync(this.dir)) {
				const m = /^day-(\d{4}-\d{2}-\d{2})\.json$/.exec(f);
				if (m) found.add(m[1]!);
			}
		} catch {
			/* ignore */
		}
		return [...found].sort();
	}

	/** Delete everything held for a day (after its report was sent). */
	remove(date: string): void {
		this.days.delete(date);
		this.visitorSets.delete(date);
		this.dirty.delete(date);
		try {
			unlinkSync(this.file(date));
		} catch {
			/* already gone */
		}
	}
}

/* ── Visit counting middleware ────────────────────────────────────────────── */

const LANG_RE = /^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/;

function clientIp(req: Request): string {
	const cf = req.headers["cf-connecting-ip"];
	if (typeof cf === "string" && cf.trim()) return cf.trim();
	const xff = req.headers["x-forwarded-for"];
	if (typeof xff === "string" && xff.trim()) return xff.split(",")[0]?.trim() ?? "";
	return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

export function visitCounter(store: StatsStore, now: () => Date = () => new Date()) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const path = req.path;
			const ua = String(req.headers["user-agent"] ?? "");
			if (
				req.method === "GET" &&
				!path.startsWith("/api") &&
				!path.startsWith("/assets") &&
				!path.startsWith("/airo-assets") &&
				!/\.[a-z0-9]{2,5}$/i.test(path) &&
				String(req.headers.accept ?? "").includes("text/html") &&
				!BOT_RE.test(ua) &&
				!/prefetch|prerender/i.test(String(req.headers.purpose ?? req.headers["sec-purpose"] ?? ""))
			) {
				const m = LANG_RE.exec(path);
				const lang = m ? m[1]! : "—";
				const page = (m ? path.slice(m[0].length) : path) || "/";
				store.recordVisit(dubaiParts(now()).date, clientIp(req), ua, lang, page);
			}
		} catch {
			/* statistics must never break the site */
		}
		next();
	};
}

/* ── Chat summary endpoint (write-only) ───────────────────────────────────── */

const eventBuckets = new Map<string, { n: number; reset: number }>();
export function chatEventHandler(store: StatsStore, now: () => Date = () => new Date()) {
	return (req: Request, res: Response) => {
		const ip = clientIp(req);
		const t = Date.now();
		const b = eventBuckets.get(ip);
		if (!b || t > b.reset) eventBuckets.set(ip, { n: 1, reset: t + 60_000 });
		else if (++b.n > 40) {
			res.status(429).json({ ok: false });
			return;
		}
		const ok = req.body && typeof req.body === "object" ? store.recordChat(dubaiParts(now()).date, req.body as Record<string, unknown>, `${req.protocol}://${req.hostname}`) : false;
		res.status(ok ? 202 : 400).json({ ok });
	};
}

/* ── Report ───────────────────────────────────────────────────────────────── */

const cell = (v: string | undefined | null, empty = "—") => (v && v.trim() ? v.replace(/\|/g, "/").replace(/\s+/g, " ").trim() : empty);
const APPROACH: Record<string, string> = { ai: "AI visuals", real: "Real filming", mix: "AI + real filming" };

function table(headers: string[], rows: string[][]): string {
	return [`| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

export function formatDateLong(date: string): string {
	return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));
}

export function buildDailyReport(day: DayStats, generatedAt: Date): { title: string; body: string } {
	const chats = Object.values(day.chats).sort((a, b) => a.updatedAt - b.updatedAt);
	const leads = chats.filter((c) => c.mobile || c.phone);
	const anon = chats.filter((c) => !(c.mobile || c.phone));
	const voice = chats.flatMap((c) => c.voiceUrls.map((u) => ({ who: c.name ?? "Visitor", mobile: c.mobile, url: `${c.origin ?? ""}${u}` })));
	const topPages = Object.entries(day.pages).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p, n]) => `${p} (${n})`).join(" · ");
	const langs = Object.entries(day.langs).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(" · ");
	const hhmm = (() => {
		const p = dubaiParts(generatedAt);
		return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
	})();
	const interestOf = (c: ChatSnapshot) => cell([...c.services, ...c.details].join("; "));
	const askedOf = (c: ChatSnapshot) => cell(c.questions.map((q) => `“${q}”`).join(" · "));

	const lines: string[] = [
		`# DAILY REPORT — ${formatDateLong(day.date)}`,
		`Metropolitan Digital Marketing · generated ${hhmm} UAE time`,
		"",
		"## Overview",
		table(["Metric", "Today"], [
			["Website visitors (unique)", String(day.visitors.length)],
			["Page views", String(day.pageviews)],
			["Visitors by language", cell(langs)],
			["Most viewed pages", cell(topPages)],
			["Chatbot conversations", String(chats.length)],
			["Left their contact details", String(leads.length)],
			["Conversations without contact details", String(anon.length)],
			["Voice messages", String(voice.length)],
		]),
		"",
		"## People who left their details",
	];
	if (leads.length) {
		lines.push(
			table(
				["#", "Name", "Mobile", "Phone", "Business field", "Interested in", "Platforms", "Location", "Approach", "Asked about", "Lang"],
				leads.map((c, i) => [
					String(i + 1),
					cell(c.name),
					cell(c.mobile),
					cell(c.phone),
					cell(c.field),
					interestOf(c),
					cell(c.platforms.join(", ")),
					cell(c.location),
					cell(c.approach ? (APPROACH[c.approach] ?? c.approach) : undefined),
					askedOf(c),
					c.lang.toUpperCase(),
				]),
			),
		);
	} else lines.push("No one left their contact details today.");

	lines.push("", "## Other chatbot conversations (no contact details — anonymous)");
	if (anon.length) {
		lines.push(
			table(
				["#", "Lang", "Business field", "Interested in", "Location", "Asked about", "Messages"],
				anon.map((c, i) => [String(i + 1), c.lang.toUpperCase(), cell(c.field), interestOf(c), cell(c.location), askedOf(c), String(c.turns)]),
			),
		);
	} else lines.push("None.");

	if (voice.length) {
		lines.push("", "## Voice messages", ...voice.map((v) => `- ${cell(v.who)}${v.mobile ? ` (${v.mobile})` : ""}: ${v.url}`));
	}
	lines.push("", "—", "This report contains no chat transcripts. All conversations and the data behind this report are permanently deleted from the server once it has been sent.");

	return { title: `DAILY REPORT — ${day.date} — ${day.visitors.length} visitors, ${chats.length} chats, ${leads.length} leads`, body: lines.join("\n") };
}

/* ── Sending (same inbox route as the contact form) ───────────────────────── */

interface FormEntry {
	brandId: string;
	categoryId: number | string;
	overrideEmail?: string;
}

function inboxHost(): string {
	const apiBase = process.env.GODADDY_API_BASE_URL || "";
	if (apiBase.includes("dev-godaddy.com")) return "reamaze.dev-godaddy.com";
	if (apiBase.includes("test-godaddy.com")) return "reamaze.test-godaddy.com";
	return "reamaze.godaddy.com";
}

export function loadContactEntry(): FormEntry | null {
	for (const p of [join(process.cwd(), "contact-form.config.json"), join(process.cwd(), "src/lib/contact-form.config.json")]) {
		try {
			const cfg = JSON.parse(readFileSync(p, "utf-8")) as { forms?: Record<string, FormEntry> };
			if (cfg.forms?.["contact-us"]) return cfg.forms["contact-us"];
		} catch {
			/* try next */
		}
	}
	return null;
}

export type ReportSender = (r: { title: string; body: string }) => Promise<void>;

export function inboxSender(fetchImpl: typeof fetch = fetch): ReportSender {
	return async ({ title, body }) => {
		const entry = loadContactEntry();
		if (!entry) throw new Error("contact-form.config.json not found");
		const res = await fetchImpl(`https://${entry.brandId}.${inboxHost()}/api/v2/contact`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Airo-Contact-Form": "true" },
			body: JSON.stringify({
				conversation: {
					message: { body },
					category_id: entry.categoryId,
					user: { name: "Metropolitan Website Reports", email: entry.overrideEmail ?? "reports@metropolitandigitalmarketing.com" },
					data: {
						__gd_contact_form_title: title,
						__gd_type: "contact",
						...(entry.overrideEmail && { __gd_override_email: entry.overrideEmail }),
					},
				},
			}),
		});
		if (!res.ok) throw new Error(`inbox responded ${res.status}`);
	};
}

/* ── Scheduler ────────────────────────────────────────────────────────────── */

/**
 * Sends every finished day's report: today's from 23:30 UAE time, and any earlier day that is still
 * unsent (for example after the server was down at 23:30). A report is deleted only after it was sent.
 */
export async function runReportTick(store: StatsStore, send: ReportSender, now: Date, sending = new Set<string>()): Promise<string[]> {
	const t = dubaiParts(now);
	const due = t.hour > REPORT_HOUR || (t.hour === REPORT_HOUR && t.minute >= REPORT_MINUTE);
	const sent: string[] = [];
	store.get(t.date); // today always exists, so a quiet day still gets its (zero) report
	const last = store.lastSent();
	for (const date of store.dates()) {
		if (date <= last) {
			store.remove(date); // activity after the report was sent is discarded
			continue;
		}
		if (!(date < t.date || (date === t.date && due))) continue;
		if (sending.has(date)) continue;
		sending.add(date);
		try {
			store.flush();
			await send(buildDailyReport(store.get(date), now));
			store.markSent(date);
			store.remove(date);
			sent.push(date);
		} catch (err) {
			console.error("[stats] daily report failed, will retry:", err instanceof Error ? err.message : err);
		} finally {
			sending.delete(date);
		}
	}
	// A quiet day with no visits still produces a (zero) report the first time the server runs that evening.
	return sent;
}

export function startStatsService(store: StatsStore, send: ReportSender = inboxSender()): () => void {
	const sending = new Set<string>();
	const flushTimer = setInterval(() => store.flush(), 20_000);
	const tick = () => void runReportTick(store, send, new Date(), sending).catch(() => undefined);
	const reportTimer = setInterval(tick, 60_000);
	setTimeout(tick, 15_000);
	flushTimer.unref?.();
	reportTimer.unref?.();
	return () => {
		clearInterval(flushTimer);
		clearInterval(reportTimer);
		store.flush();
	};
}

export function defaultStatsDir(): string {
	return process.env.STATS_DIR || join(tmpdir(), "mdm-site-stats");
}

export const statsDirExists = (dir: string) => existsSync(dir);
