import { describe, expect, it, vi } from "vitest";
import { combinedSender, smtpConfigured, smtpSender } from "./mailer";
import { chatLeadHandler } from "./chat-lead";

const r = { title: "NEW CLIENT", body: "| a | b |" };

describe("mail delivery", () => {
	it("is inactive without credentials", () => {
		expect(smtpConfigured({} as any)).toBe(false);
		expect(smtpSender({} as any)).toBeNull();
		expect(smtpConfigured({ SMTP_USER: "a@b.c", SMTP_PASS: "x" } as any)).toBe(true);
	});
	it("uses only SMTP when configured: no GoDaddy Inbox unless explicitly allowed", async () => {
		const smtp = vi.fn().mockResolvedValue(undefined);
		const inbox = vi.fn();
		await combinedSender(inbox, smtp, {} as any)(r);
		expect(inbox).not.toHaveBeenCalled();
		const bad = vi.fn().mockRejectedValue(new Error("smtp down"));
		await expect(combinedSender(inbox, bad, {} as any)(r)).rejects.toThrow("smtp down");
		expect(inbox).not.toHaveBeenCalled();
		await combinedSender(inbox, bad, { MAIL_FALLBACK_INBOX: "1" } as any)(r);
		expect(inbox).toHaveBeenCalledTimes(1);
	});
	it("uses the inbox route only when SMTP is not configured", async () => {
		const inbox = vi.fn().mockResolvedValue(undefined);
		await combinedSender(inbox, null, {} as any)(r);
		expect(inbox).toHaveBeenCalled();
	});
});

function call(h: ReturnType<typeof chatLeadHandler>, body: unknown, ip: string) {
	return new Promise<{ status: number; json: any }>((resolve) => {
		const req: any = { body, headers: { "cf-connecting-ip": ip }, socket: { remoteAddress: ip } };
		const res: any = { code: 200, setHeader() {}, status(c: number) { this.code = c; return this; }, json(j: unknown) { resolve({ status: this.code, json: j }); } };
		void h(req, res);
	});
}

describe("lead endpoint", () => {
	it("validates, neutralises markup and rate-limits", async () => {
		const send = vi.fn().mockResolvedValue(undefined);
		const h = chatLeadHandler(send);
		expect((await call(h, {}, "7.7.7.7")).status).toBe(400);
		const ok = await call(h, { title: "T <script>x</script>", body: "B <img src=x onerror=1>" }, "7.7.7.8");
		expect(ok.status).toBe(200);
		expect(send.mock.calls[0][0].title).not.toContain("<script>");
		expect(send.mock.calls[0][0].body).not.toContain("<img");
		let last = 200;
		for (let i = 0; i < 6; i++) last = (await call(h, { title: "t", body: "b" }, "7.7.7.9")).status;
		expect(last).toBe(429);
	});
	it("reports a delivery failure as 502", async () => {
		const h = chatLeadHandler(vi.fn().mockRejectedValue(new Error("x")));
		expect((await call(h, { title: "t", body: "b" }, "7.7.7.10")).status).toBe(502);
	});
});
