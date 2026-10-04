import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IntegrityGuard, buildIntegrityReport, integrityMode } from "./integrity";

let dir: string;
beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "mdm-int-"));
	mkdirSync(join(dir, "assets"), { recursive: true });
	writeFileSync(join(dir, "index.html"), "<html>original</html>");
	writeFileSync(join(dir, "assets", "app.js"), "console.log('original')");
	writeFileSync(join(dir, "media.json"), '{"a":1}');
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("integrity guard", () => {
	it("does nothing while the site is untouched", () => {
		const g = new IntegrityGuard([dir]);
		expect(g.size).toBe(3);
		expect(g.check()).toEqual([]);
	});

	it("restores a defaced file", () => {
		const g = new IntegrityGuard([dir]);
		writeFileSync(join(dir, "index.html"), "<html>HACKED</html>");
		const c = g.check();
		expect(c).toEqual([{ kind: "modified", file: join(dir, "index.html"), restored: true }]);
		expect(readFileSync(join(dir, "index.html"), "utf-8")).toBe("<html>original</html>");
		expect(g.check()).toEqual([]);
	});

	it("restores a deleted file and deletes anything that was added (image, script, web shell)", () => {
		const g = new IntegrityGuard([dir]);
		rmSync(join(dir, "assets", "app.js"));
		writeFileSync(join(dir, "evil.png"), "not really an image");
		writeFileSync(join(dir, "assets", "shell.php"), "<?php system($_GET['c']);");
		const c = g.check();
		expect(c.map((x) => x.kind).sort()).toEqual(["added", "added", "deleted"]);
		expect(existsSync(join(dir, "evil.png"))).toBe(false);
		expect(existsSync(join(dir, "assets", "shell.php"))).toBe(false);
		expect(readFileSync(join(dir, "assets", "app.js"), "utf-8")).toBe("console.log('original')");
	});

	it("in monitor mode only reports and leaves files alone", () => {
		const g = new IntegrityGuard([dir]);
		writeFileSync(join(dir, "evil.png"), "x");
		writeFileSync(join(dir, "index.html"), "changed");
		const c = g.check(false);
		expect(c).toHaveLength(2);
		expect(c.every((x) => !x.restored)).toBe(true);
		expect(existsSync(join(dir, "evil.png"))).toBe(true);
	});

	it("watches single files too (the media manifest)", () => {
		const g = new IntegrityGuard([], [join(dir, "media.json")]);
		writeFileSync(join(dir, "media.json"), '{"a":"https://evil.example/x.png"}');
		expect(g.check()[0]).toMatchObject({ kind: "modified", restored: true });
		expect(readFileSync(join(dir, "media.json"), "utf-8")).toBe('{"a":1}');
	});

	it("writes a clear alert without live links", () => {
		const g = new IntegrityGuard([dir]);
		writeFileSync(join(dir, "http-evil.png"), "x");
		const { title, body } = buildIntegrityReport(g.check(), (f) => g.rel(f), new Date("2026-10-04T19:30:00Z"));
		expect(title).toMatch(/tampered/);
		expect(body).toMatch(/UNKNOWN file appeared/);
		expect(body).toMatch(/unknown file deleted/);
	});

	it("is enforced on production servers and off on local runs unless asked", () => {
		expect(integrityMode({ NODE_ENV: "production" } as never)).toBe("enforce");
		expect(integrityMode({} as never)).toBe("off");
		expect(integrityMode({ INTEGRITY_GUARD: "enforce" } as never)).toBe("enforce");
		expect(integrityMode({ NODE_ENV: "production", INTEGRITY_GUARD: "off" } as never)).toBe("off");
	});
});
