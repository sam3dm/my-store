import { describe, expect, it } from "vitest";
import { hostGuard } from "./host-guard";

function run(host: string, xfh?: string) {
	const req: any = { hostname: host, headers: { host, ...(xfh ? { "x-forwarded-host": xfh } : {}) } };
	hostGuard({} as any)(req, {} as any, () => undefined);
	return req;
}
describe("host guard", () => {
	it("keeps our own and system hosts", () => {
		expect(run("metropolitandigitalmarketing.com").headers.host).toBe("metropolitandigitalmarketing.com");
		expect(run("www.metropolitandigitalmarketing.com").headers.host).toBe("www.metropolitandigitalmarketing.com");
		expect(run("localhost").headers.host).toBe("localhost");
	});
	it("replaces a forged host", () => {
		const r = run("evil.com", "evil.com");
		expect(r.headers.host).toBe("metropolitandigitalmarketing.com");
		expect(r.headers["x-forwarded-host"]).toBeUndefined();
	});
});
