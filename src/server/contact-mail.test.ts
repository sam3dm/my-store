import { describe, expect, it, vi } from "vitest";
import { contactMailHandler } from "./contact-mail";

function run(sender: any, body: unknown, ip = "5.5.5.5") {
	return new Promise<{ status?: number; json?: any; nexted: boolean }>((resolve) => {
		const req: any = { body, headers: { "cf-connecting-ip": ip }, socket: { remoteAddress: ip } };
		const res: any = { code: 200, setHeader() {}, status(c: number) { this.code = c; return this; }, json(j: unknown) { resolve({ status: this.code, json: j, nexted: false }); } };
		void contactMailHandler(() => sender)(req, res, () => resolve({ nexted: true }));
	});
}
const good = { user: { email: "a@b.com", name: "Ali" }, conversation: { messages_attributes: [{ body: "Hello" }], data: { __gd_contact_form_title: "NEW PROJECT INQUIRY" } } };

describe("contact form → Gmail", () => {
	it("passes through when SMTP is not configured", async () => {
		expect((await run(null, good)).nexted).toBe(true);
	});
	it("sends the message by SMTP with a safe subject", async () => {
		const send = vi.fn().mockResolvedValue(undefined);
		const r = await run(send, good);
		expect(r.status).toBe(200);
		expect(send.mock.calls[0][0].title).toContain("NEW PROJECT INQUIRY");
		expect(send.mock.calls[0][0].body).toContain("Hello");
	});
	it("validates input, neutralises markup and rate limits", async () => {
		const send = vi.fn().mockResolvedValue(undefined);
		expect((await run(send, {})).status).toBe(400);
		expect((await run(send, { ...good, user: { email: "not-an-email" } })).status).toBe(400);
		const r = await run(send, { ...good, conversation: { messages_attributes: [{ body: "<script>x</script>" }], data: {} } }, "6.6.6.6");
		expect(r.status).toBe(200);
		expect(send.mock.calls.at(-1)![0].body).not.toContain("<script>");
		let last = 200;
		for (let i = 0; i < 6; i++) last = (await run(send, good, "7.7.7.7")).status!;
		expect(last).toBe(429);
	});
	it("answers 502 when delivery fails and never reports success", async () => {
		expect((await run(vi.fn().mockRejectedValue(new Error("x")), good, "8.8.8.8")).status).toBe(502);
	});
});
