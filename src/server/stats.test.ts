import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatsStore, buildDailyReport, chatEventHandler, dubaiParts, runReportTick, visitCounter } from "./stats";

let dir: string;
beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "mdm-stats-test-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const req = (over: Partial<Request> & { ua?: string; ip?: string }): Request =>
	({
		method: "GET",
		path: "/en/services",
		headers: { accept: "text/html,application/xhtml+xml", "user-agent": over.ua ?? "Mozilla/5.0 (iPhone)", "x-forwarded-for": over.ip ?? "1.1.1.1" },
		socket: { remoteAddress: "9.9.9.9" },
		protocol: "https",
		hostname: "example.com",
		...over,
	}) as unknown as Request;

describe("UAE time", () => {
	it("maps UTC to Dubai (UTC+4)", () => {
		expect(dubaiParts(new Date("2026-10-04T19:30:00Z"))).toEqual({ date: "2026-10-04", hour: 23, minute: 30 });
		expect(dubaiParts(new Date("2026-10-04T20:05:00Z"))).toEqual({ date: "2026-10-05", hour: 0, minute: 5 });
	});
});

describe("visit counting", () => {
	it("counts unique visitors and page views, ignoring bots, assets and the API", () => {
		const store = new StatsStore(dir);
		const count = visitCounter(store, () => new Date("2026-10-04T10:00:00Z"));
		const next = vi.fn();
		count(req({ path: "/en" }), {} as Response, next);
		count(req({ path: "/en/about" }), {} as Response, next); // same visitor
		count(req({ path: "/ar/contact", ip: "2.2.2.2" }), {} as Response, next);
		count(req({ path: "/en", ua: "Googlebot/2.1" }), {} as Response, next);
		count(req({ path: "/assets/app.js" }), {} as Response, next);
		count(req({ path: "/api/health" }), {} as Response, next);
		count(req({ path: "/en/logo.png" }), {} as Response, next);
		expect(next).toHaveBeenCalledTimes(7);
		const d = store.get("2026-10-04");
		expect(d.visitors).toHaveLength(2);
		expect(d.pageviews).toBe(3);
		expect(d.langs).toEqual({ en: 1, ar: 1 });
		expect(JSON.stringify(d)).not.toMatch(/1\.1\.1\.1|2\.2\.2\.2|iPhone/); // no IPs or user agents are kept
	});
});

describe("chat summaries", () => {
	it("keeps only whitelisted, sanitised fields and rejects bad session ids", () => {
		const store = new StatsStore(dir);
		const ok = store.recordChat("2026-10-04", {
			sid: "abcd1234-ef56",
			lang: "ar",
			name: "سام",
			mobile: "+971501112233",
			phone: "<script>alert(1)</script>",
			services: ["Podcast Production"],
			questions: ["هل لديكم بودكاست؟"],
			voiceUrls: ["/api/chat/voice/00000000-0000-0000-0000-000000000000.webm", "https://evil.example/x"],
			transcript: "SHOULD NOT BE STORED",
		});
		expect(ok).toBe(true);
		expect(store.recordChat("2026-10-04", { sid: "../etc" })).toBe(false);
		const c = store.get("2026-10-04").chats["abcd1234-ef56"]!;
		expect(c.phone).toBeUndefined();
		expect(c.voiceUrls).toEqual(["/api/chat/voice/00000000-0000-0000-0000-000000000000.webm"]);
		expect(JSON.stringify(c)).not.toContain("SHOULD NOT BE STORED");
	});

	it("the event endpoint only acknowledges — it never returns stored data", () => {
		const store = new StatsStore(dir);
		const handler = chatEventHandler(store, () => new Date("2026-10-04T10:00:00Z"));
		const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
		handler(req({ body: { sid: "abcd1234-ef56", name: "Layla", mobile: "0501234567" } }), res);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});
});

describe("daily report", () => {
	function seed(store: StatsStore, date = "2026-10-04") {
		store.recordVisit(date, "1.1.1.1", "ua", "en", "/");
		store.recordVisit(date, "2.2.2.2", "ua", "ar", "/services");
		store.recordChat(date, { sid: "lead-000001", lang: "en", name: "Layla", mobile: "+971501112233", field: "Restaurants & Fine Dining", services: ["Social Media Management"], platforms: ["Instagram"], location: "Dubai", approach: "real", questions: ["do you manage instagram?"], hasLead: true, turns: 6 });
		store.recordChat(date, { sid: "anon-000002", lang: "ar", services: ["Podcast Production"], questions: ["هل لديكم بودكاست؟"], turns: 3 });
	}

	it("lays out counts, a table of leads and anonymous chats — without any transcript", () => {
		const store = new StatsStore(dir);
		seed(store);
		const { title, body } = buildDailyReport(store.get("2026-10-04"), new Date("2026-10-04T19:30:00Z"));
		expect(title).toMatch(/2 visitors, 2 chats, 1 leads/);
		expect(body).toMatch(/\| Website visitors \(unique\) \| 2 \|/);
		expect(body).toMatch(/\| Chatbot conversations \| 2 \|/);
		expect(body).toContain("| Layla | +971501112233 |");
		expect(body).toContain("Restaurants & Fine Dining");
		expect(body).toContain("Real filming");
		expect(body).toContain("Other chatbot conversations");
		expect(body).toContain("Podcast Production");
		expect(body).toContain("23:30 UAE time");
	});

	it("is sent once at 23:30 UAE time, then everything is erased", async () => {
		const store = new StatsStore(dir);
		seed(store);
		store.flush();
		const send = vi.fn().mockResolvedValue(undefined);
		expect(await runReportTick(store, send, new Date("2026-10-04T19:29:00Z"))).toEqual([]); // 23:29
		expect(send).not.toHaveBeenCalled();
		expect(await runReportTick(store, send, new Date("2026-10-04T19:30:00Z"))).toEqual(["2026-10-04"]);
		expect(send).toHaveBeenCalledTimes(1);
		expect(readdirSync(dir).filter((f) => f.startsWith("day-"))).toEqual([]); // data deleted
		await runReportTick(store, send, new Date("2026-10-04T19:40:00Z"));
		expect(send).toHaveBeenCalledTimes(1); // not sent twice
		// Activity after the report is discarded rather than kept.
		store.recordVisit("2026-10-04", "3.3.3.3", "ua", "en", "/");
		await runReportTick(store, send, new Date("2026-10-04T19:50:00Z"));
		expect(readdirSync(dir).filter((f) => f.startsWith("day-"))).toEqual([]);
	});

	it("still reports a quiet day (zero visitors)", async () => {
		const store = new StatsStore(dir);
		const send = vi.fn().mockResolvedValue(undefined);
		await runReportTick(store, send, new Date("2026-10-04T19:31:00Z"));
		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0]![0].body).toMatch(/\| Website visitors \(unique\) \| 0 \|/);
	});

	it("keeps the data and retries when sending fails; catches up on a missed day", async () => {
		const store = new StatsStore(dir);
		seed(store);
		store.flush();
		const send = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
		expect(await runReportTick(store, send, new Date("2026-10-04T19:30:00Z"))).toEqual([]);
		expect(readdirSync(dir).filter((f) => f.startsWith("day-"))).toHaveLength(1);
		// Server was down until after midnight: yesterday's report goes out late.
		expect(await runReportTick(store, send, new Date("2026-10-04T21:00:00Z"))).toEqual(["2026-10-04"]);
	});
});
