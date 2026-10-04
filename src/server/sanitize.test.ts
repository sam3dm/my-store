import { describe, expect, it } from "vitest";
import { buildDailyReport, StatsStore } from "./stats";
import { buildSecurityReport, SecurityMonitor } from "./security";
import { cleanName, defang, neutralize, sanitizeJson } from "./sanitize";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("sanitising outside text", () => {
	it("turns HTML into inert text", () => {
		expect(neutralize("<img src=x onerror=alert(1)>")).toBe("‹img src=x onerror=alert(1)›");
		expect(neutralize("a\u0000b‮c")).toBe("abc");
	});
	it("defangs links and script schemes", () => {
		expect(defang("see http://evil.example/x and https://evil.example")).not.toMatch(/https?:\/\//);
		expect(defang("javascript:alert(1)")).toBe("javascript[:]alert(1)");
		expect(defang("www.evil.example")).toContain("www[.]");
	});
	it("keeps only real name characters", () => {
		expect(cleanName("<b>Layla</b> Al-Hashimi")).not.toMatch(/[<>\/]/);
		expect(cleanName("سامر بن خضراء")).toBe("سامر بن خضراء");
		expect(cleanName("12345")).toBeUndefined();
	});
	it("removes prototype-pollution keys and bounds the structure", () => {
		const evil = JSON.parse('{"__proto__":{"admin":true},"constructor":{"x":1},"ok":"<b>hi</b>","deep":{"a":{"b":{"c":{"d":{"e":{"f":1}}}}}}}');
		const clean = sanitizeJson(evil) as Record<string, unknown>;
		expect(Object.keys(clean)).toEqual(["ok", "deep"]);
		expect(clean.ok).toBe("‹b›hi‹/b›");
		expect(({} as { admin?: boolean }).admin).toBeUndefined();
		expect(JSON.stringify(clean.deep)).not.toContain('"f"');
	});
});

describe("reports never carry live markup or links", () => {
	it("daily report", () => {
		const dir = mkdtempSync(join(tmpdir(), "mdm-san-"));
		try {
			const store = new StatsStore(dir);
			store.recordChat("2026-10-04", { sid: "abcdef12-3456", name: "<script>alert(1)</script>", mobile: "0501234567", questions: ["visit http://evil.example/<script>x</script>"], services: ["<b>Podcast</b>"] });
			const { body } = buildDailyReport(store.get("2026-10-04"), new Date());
			expect(body).not.toMatch(/<\s*\/?\s*(script|b|img)/i);
			expect(body).not.toMatch(/https?:\/\/evil/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("security alert", () => {
		const mon = new SecurityMonitor();
		const req = { method: "GET", path: "/en?x=<script>alert(1)</script>", url: "", originalUrl: "/en?x=<script>alert(1)</script>", headers: { "user-agent": "Mozilla <script> http://evil.example/pwn", "x-forwarded-for": "203.0.113.5" }, socket: { remoteAddress: "10.0.0.1" } };
		mon.guard()(req as never, { status() { return this; }, type() { return this; }, send() { return this; }, set() { return this; }, json() { return this; } } as never, () => undefined);
		const { body } = buildSecurityReport(mon.takePending(), new Date());
		expect(body).toContain("203.0.113.5");
		expect(body).not.toMatch(/<\s*script/i);
		expect(body).not.toMatch(/https?:\/\/evil/);
	});
});
