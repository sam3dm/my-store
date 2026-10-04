/**
 * Website hardening: security headers, request screening, rate limiting, temporary bans and
 * e-mail alerts when somebody probes or attacks the site.
 *
 * Design notes
 *  - Ordinary visitors are never affected: limits are far above human use, signatures only look at the
 *    URL (not form text), and loopback / unidentifiable client addresses are never limited or banned.
 *  - Attackers get an uninformative 404/403/429 and are recorded; a digest e-mail (with their IP, user agent
 *    and what they tried) goes to the owner's inbox through the same route the contact form uses.
 */
import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { defang } from "./sanitize";
import { dubaiParts, type ReportSender } from "./stats";

/* ── Client address ───────────────────────────────────────────────────────── */

export interface ClientInfo {
	ip: string;
	/** True when the address came from a proxy header or is a public socket address (safe to rate-limit). */
	identifiable: boolean;
	chain: string;
	socket: string;
}

const PRIVATE_RE = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fc|fd|fe80|::ffff:(127\.|10\.|192\.168\.))/i;

export function clientInfo(req: Request): ClientInfo {
	const h = req.headers;
	const one = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
	const socket = req.socket?.remoteAddress ?? "";
	const xff = one(h["x-forwarded-for"]);
	const fromHeader = one(h["cf-connecting-ip"]) || one(h["true-client-ip"]) || one(h["x-real-ip"]) || xff.split(",")[0]?.trim() || "";
	const ip = (fromHeader || socket || "unknown").slice(0, 64);
	const identifiable = Boolean(fromHeader) ? !PRIVATE_RE.test(ip) : Boolean(socket) && !PRIVATE_RE.test(socket);
	return { ip, identifiable, chain: xff.slice(0, 200), socket };
}

/* ── Headers ──────────────────────────────────────────────────────────────── */

const FRAME_ANCESTORS = process.env.CSP_FRAME_ANCESTORS ?? "'self' https://*.godaddy.com https://*.godaddysites.com https://*.dev-godaddy.com https://*.test-godaddy.com";

export function buildCsp(inlineScriptHashes: string[], adsense: boolean, secure: boolean): string {
	const script = ["'self'", ...inlineScriptHashes.map((h) => `'sha256-${h}'`), "https://img1.wsimg.com", "https://img1.dev-wsimg.com", "https://img1.test-wsimg.com"];
	if (adsense) script.push("'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://*.googlesyndication.com", "https://*.doubleclick.net", "https://*.google.com");
	return [
		"default-src 'self'",
		`script-src ${script.join(" ")}`,
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"img-src 'self' data: blob: https:",
		"media-src 'self' blob: data: https://*.wsimg.com",
		"connect-src 'self' https://*.wsimg.com https://*.godaddy.com https://*.secureserver.net" + (adsense ? " https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net" : ""),
		adsense ? "frame-src https://*.googlesyndication.com https://*.doubleclick.net" : "frame-src 'none'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		`frame-ancestors ${FRAME_ANCESTORS}`,
		...(secure ? ["upgrade-insecure-requests"] : []),
	].join("; ");
}

/** Hashes of the page's own inline <script> blocks, so scripts can be allowed without 'unsafe-inline'. */
export function inlineScriptHashes(html: string): string[] {
	const out: string[] = [];
	for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type=["']application\/(?:ld\+)?json["'])[^>]*>([\s\S]*?)<\/script>/gi)) {
		if (m[1]!.trim()) out.push(createHash("sha256").update(m[1]!).digest("base64"));
	}
	return out;
}

/** The page-specific policy: also allows this response's own inline scripts (e.g. the hydration data) by hash. */
export function cspForDocument(req: Request, html: string, adsense: boolean): string {
	const secure = req.secure || String(req.headers["x-forwarded-proto"] ?? "").split(",")[0]?.trim() === "https";
	return buildCsp(inlineScriptHashes(html), adsense, secure);
}

export function securityHeaders(getTemplate: () => string, adsense: () => boolean) {
	return (req: Request, res: Response, next: NextFunction) => {
		const secure = req.secure || String(req.headers["x-forwarded-proto"] ?? "").split(",")[0]?.trim() === "https";
		res.removeHeader("X-Powered-By");
		res.setHeader("Content-Security-Policy", buildCsp(inlineScriptHashes(getTemplate()), adsense(), secure));
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		res.setHeader("Permissions-Policy", "microphone=(self), camera=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
		res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		res.setHeader("X-DNS-Prefetch-Control", "off");
		res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
		if (secure) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		if (req.path.startsWith("/api")) res.setHeader("Cache-Control", "no-store");
		next();
	};
}

/* ── Attack signatures (URL + query only; never form text) ────────────────── */

const SIGNATURES: [string, RegExp][] = [
	["path-traversal", /(\.\.[\\/])|([\\/]\.\.)|(%2e%2e)|(\.\.%2f)|(\.\.%5c)/i],
	["sensitive-file", /(\/etc\/(passwd|shadow|hosts)|\/proc\/self|boot\.ini|win\.ini|\/\.env|\/\.git(\/|$)|\/\.svn|\/\.hg|\/\.ds_store|\/\.aws|\/\.ssh|id_rsa|\.htpasswd|\.htaccess|web\.config|wp-config|composer\.(json|lock)|\.bash_history|\/\.npmrc|docker-compose|\/dump\.sql|\.sql\.gz|\.bak$|\.backup$)/i],
	["cms-probe", /(wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|\/administrator\/|joomla|drupal|\/phpmyadmin|\/pma\/|\/myadmin|\/adminer|\/cgi-bin\/|\/vendor\/phpunit|\/actuator|\/server-status|\/jenkins|\/solr\/|\/console\/|\/manager\/html|\/boaform|\/owa\/|\/autodiscover|\/hudson|\/jmx-console|\.php\b|\.asp\b|\.aspx\b|\.jsp\b|\.cgi\b)/i],
	["sql-injection", /(union(\s|\+|%20)+(all(\s|\+|%20)+)?select|select(\s|\+|%20)+.+(\s|\+|%20)from|(\bor\b|\band\b)(\s|\+|%20)+\d+(\s|\+|%20)*=(\s|\+|%20)*\d+|information_schema|sleep\s*\(|benchmark\s*\(|waitfor(\s|\+|%20)+delay|'\s*(or|and)\s*'|;\s*--|\/\*.*\*\/|xp_cmdshell|load_file\s*\()/i],
	["xss", /(<\s*script|<\s*\/\s*script|javascript\s*:|vbscript\s*:|on(error|load|click|mouseover|focus)\s*=|<\s*iframe|<\s*img[^>]+src|<\s*svg|document\.cookie|alert\s*\()/i],
	["command-injection", /(;|\||&&|`|\$\()\s*(cat|ls|id|whoami|wget|curl|bash|sh|nc|netcat|powershell|cmd|python|perl|php|rm|chmod|uname|ping)\b/i],
	["template-or-log4j", /(\$\{jndi:|\$\{[a-z]+:|\{\{.*\}\}|<%.*%>|#\{.*\})/i],
	["shellshock", /\(\)\s*\{/],
	["null-byte", /(%00|\\x00|\u0000)/],
];

const BAD_AGENTS = /(sqlmap|nikto|nmap|masscan|acunetix|nessus|openvas|wpscan|dirbuster|gobuster|ffuf|feroxbuster|wfuzz|zgrab|havij|netsparker|burpcollaborator|metasploit|hydra|nuclei|arachni|w3af|skipfish|jaeles|xsstrike|commix|paros|appscan|webinspect|zmeu|libwww-perl)/i;

export function inspectRequest(method: string, rawUrl: string, userAgent: string): string | null {
	if (!["GET", "HEAD", "POST", "OPTIONS"].includes(method)) return `method-${method.toLowerCase()}`;
	if (rawUrl.length > 2000) return "oversized-url";
	if (BAD_AGENTS.test(userAgent)) return "scanner-user-agent";
	let decoded = rawUrl;
	for (let i = 0; i < 2; i++) {
		try {
			const next = decodeURIComponent(decoded);
			if (next === decoded) break;
			decoded = next;
		} catch {
			return "malformed-encoding";
		}
	}
	for (const [name, re] of SIGNATURES) if (re.test(rawUrl) || re.test(decoded)) return name;
	return null;
}

/* ── Monitor (incidents, strikes, bans, rate limits) ──────────────────────── */

export interface Incident {
	ip: string;
	first: number;
	last: number;
	count: number;
	reasons: Record<string, number>;
	samples: { method: string; path: string; ua: string }[];
	chain: string;
	socket: string;
	banned: boolean;
}

interface Window {
	n: number;
	reset: number;
}

export interface MonitorOptions {
	pageLimitPerMin?: number;
	apiLimitPerMin?: number;
	contactPerHour?: number;
	banStrikes?: number;
	banMs?: number;
}

export class SecurityMonitor {
	private incidents = new Map<string, Incident>();
	private pending = new Set<string>();
	private bans = new Map<string, number>();
	private strikes = new Map<string, Window>();
	private pageWin = new Map<string, Window>();
	private apiWin = new Map<string, Window>();
	private contactWin: Window = { n: 0, reset: 0 };
	private cleanedAt = 0;
	readonly opt: Required<MonitorOptions>;

	constructor(opt: MonitorOptions = {}, private now: () => number = Date.now) {
		this.opt = { pageLimitPerMin: 900, apiLimitPerMin: 90, contactPerHour: 120, banStrikes: 3, banMs: 60 * 60_000, ...opt };
	}

	private hit(map: Map<string, Window>, key: string, windowMs: number): number {
		const t = this.now();
		const w = map.get(key);
		if (!w || t > w.reset) {
			map.set(key, { n: 1, reset: t + windowMs });
			return 1;
		}
		return ++w.n;
	}

	private sweep() {
		const t = this.now();
		if (t - this.cleanedAt < 60_000) return;
		this.cleanedAt = t;
		for (const m of [this.pageWin, this.apiWin, this.strikes]) for (const [k, w] of m) if (t > w.reset) m.delete(k);
		for (const [k, until] of this.bans) if (t > until) this.bans.delete(k);
		if (this.incidents.size > 500) {
			const old = [...this.incidents.entries()].sort((a, b) => a[1].last - b[1].last).slice(0, this.incidents.size - 400);
			for (const [k] of old) this.incidents.delete(k);
		}
	}

	isBanned(ip: string): boolean {
		const until = this.bans.get(ip);
		return Boolean(until && this.now() < until);
	}

	record(c: ClientInfo, reason: string, req: { method: string; path: string; ua: string }, strike = true): void {
		const t = this.now();
		let inc = this.incidents.get(c.ip);
		if (!inc) {
			inc = { ip: c.ip, first: t, last: t, count: 0, reasons: {}, samples: [], chain: c.chain, socket: c.socket, banned: false };
			this.incidents.set(c.ip, inc);
		}
		inc.last = t;
		inc.count++;
		inc.reasons[reason] = (inc.reasons[reason] ?? 0) + 1;
		if (inc.samples.length < 4) inc.samples.push({ method: req.method, path: req.path.slice(0, 160), ua: req.ua.slice(0, 120) });
		this.pending.add(c.ip);
		if (strike && c.identifiable) {
			const s = this.hit(this.strikes, c.ip, 10 * 60_000);
			if (s >= this.opt.banStrikes && !this.isBanned(c.ip)) {
				this.bans.set(c.ip, t + this.opt.banMs);
				inc.banned = true;
			}
		}
	}

	takePending(): Incident[] {
		const out = [...this.pending].map((ip) => this.incidents.get(ip)).filter((i): i is Incident => Boolean(i));
		this.pending.clear();
		return out.map((i) => ({ ...i, reasons: { ...i.reasons }, samples: [...i.samples] }));
	}

	restore(items: Incident[]) {
		for (const i of items) this.pending.add(i.ip);
	}

	hasPending(): boolean {
		return this.pending.size > 0;
	}

	/** Express middleware: ban check, screening, rate limits. */
	guard() {
		return (req: Request, res: Response, next: NextFunction) => {
			this.sweep();
			const c = clientInfo(req);
			const ua = String(req.headers["user-agent"] ?? "");
			const meta = { method: req.method, path: req.originalUrl || req.url, ua };

			if (c.identifiable && this.isBanned(c.ip)) {
				res.status(403).type("text/plain").send("Forbidden");
				return;
			}
			const verdict = inspectRequest(req.method, req.originalUrl || req.url, ua);
			if (verdict) {
				this.record(c, verdict, meta);
				// Uninformative answer: scanners learn nothing about what exists.
				res.status(verdict.startsWith("method-") ? 405 : 404).type("text/plain").send(verdict.startsWith("method-") ? "Method Not Allowed" : "Not Found");
				return;
			}
			if (!c.identifiable) return next();

			if (req.path.startsWith("/api")) {
				if (this.hit(this.apiWin, c.ip, 60_000) > this.opt.apiLimitPerMin) {
					this.record(c, "api-flood", meta);
					res.status(429).set("Retry-After", "60").json({ error: "Too many requests" });
					return;
				}
				if (req.method === "POST" && /^\/api\/contact\//.test(req.path)) {
					const t = this.now();
					if (t > this.contactWin.reset) this.contactWin = { n: 0, reset: t + 3_600_000 };
					if (++this.contactWin.n > this.opt.contactPerHour) {
						this.record(c, "contact-flood", meta, false);
						res.status(429).set("Retry-After", "3600").json({ success: false, error: "Too many requests" });
						return;
					}
				}
			} else if (this.hit(this.pageWin, c.ip, 60_000) > this.opt.pageLimitPerMin) {
				this.record(c, "request-flood", meta);
				res.status(429).set("Retry-After", "60").type("text/plain").send("Too many requests");
				return;
			}
			next();
		};
	}
}

/* ── Alert e-mail ─────────────────────────────────────────────────────────── */

const esc = (s: string) => defang(s).replace(/\|/g, "/").replace(/[\r\n]+/g, " ").trim() || "—";

export function buildSecurityReport(items: Incident[], now: Date): { title: string; body: string } {
	const total = items.reduce((n, i) => n + i.count, 0);
	const banned = items.filter((i) => i.banned).length;
	const t = dubaiParts(now);
	const stamp = (ms: number) => {
		const p = dubaiParts(new Date(ms));
		return `${p.date} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
	};
	const rows = items
		.sort((a, b) => b.count - a.count)
		.slice(0, 40)
		.map((i, n) => `| ${n + 1} | ${esc(i.ip)} | ${i.count} | ${esc(Object.entries(i.reasons).map(([r, c]) => `${r}×${c}`).join(", "))} | ${esc(i.samples.map((s) => `${s.method} ${s.path}`).join("  ·  "))} | ${esc(i.samples[0]?.ua ?? "")} | ${i.banned ? "BLOCKED 60 min" : "blocked request"} | ${stamp(i.first)} → ${stamp(i.last)} |`);
	const body = [
		"# SECURITY ALERT — Metropolitan Digital Marketing website",
		`Detected ${total} suspicious request${total === 1 ? "" : "s"} from ${items.length} address${items.length === 1 ? "" : "es"} · ${t.date} ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")} UAE time`,
		"",
		"| # | IP address | Requests | What they tried | Samples | User agent | Action | UAE time (first → last) |",
		"|---|---|---|---|---|---|---|---|",
		...rows,
		"",
		"All of these requests were refused automatically; nothing was served and no data was exposed.",
		"Repeat offenders are blocked for 60 minutes. Where the site sits behind a proxy, the address shown is the one reported by that proxy.",
		items.some((i) => i.chain) ? `\nForwarded-for chains seen: ${items.filter((i) => i.chain).slice(0, 6).map((i) => `${esc(i.ip)} ⇐ ${esc(i.chain)}`).join(" · ")}` : "",
	].join("\n");
	return { title: `SECURITY ALERT — ${total} suspicious requests from ${items.length} IPs${banned ? ` (${banned} blocked)` : ""}`, body };
}

/**
 * Sends one digest at most every `minGapMs` (and at most `maxPerHour` per hour), so a long attack
 * produces a handful of e-mails, not thousands. Items stay queued if sending fails.
 */
export class AlertSender {
	private lastSent = 0;
	private sentTimes: number[] = [];
	constructor(
		private monitor: SecurityMonitor,
		private send: ReportSender,
		private minGapMs = 10 * 60_000,
		private maxPerHour = 6,
		private now: () => number = Date.now,
	) {}

	async tick(): Promise<boolean> {
		if (!this.monitor.hasPending()) return false;
		const t = this.now();
		this.sentTimes = this.sentTimes.filter((x) => t - x < 3_600_000);
		if (this.lastSent && t - this.lastSent < this.minGapMs) return false;
		if (this.sentTimes.length >= this.maxPerHour) return false;
		const items = this.monitor.takePending();
		try {
			await this.send(buildSecurityReport(items, new Date(t)));
			this.lastSent = t;
			this.sentTimes.push(t);
			return true;
		} catch (err) {
			this.monitor.restore(items);
			console.error("[security] alert e-mail failed, will retry:", err instanceof Error ? err.message : err);
			return false;
		}
	}
}

export function startSecurityAlerts(monitor: SecurityMonitor, send: ReportSender): () => void {
	const alerts = new AlertSender(monitor, send);
	const timer = setInterval(() => void alerts.tick().catch(() => undefined), 60_000);
	timer.unref?.();
	return () => clearInterval(timer);
}
