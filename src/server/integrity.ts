/**
 * File-integrity guard: the published site must never change while the server runs.
 *
 * At start-up every file the site serves (the built client, the media folder and the media manifest) is
 * fingerprinted and kept in memory. Every minute the files are checked again; anything
 *  - modified  → restored from the original copy
 *  - deleted   → restored
 *  - added     → deleted (an uploaded image, script, web shell, page…)
 * and an e-mail alert is sent to the owner. Legitimate updates are deployments, which restart the server
 * and therefore take a fresh snapshot.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { defang } from "./sanitize";
import { dubaiParts, type ReportSender } from "./stats";

interface Entry {
	hash: string;
	size: number;
	mtimeMs: number;
	data: Buffer | null;
}

export interface IntegrityChange {
	kind: "modified" | "deleted" | "added";
	file: string;
	restored: boolean;
}

const MAX_KEEP_BYTES = 120 * 1024 * 1024;
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

function walk(root: string, out: string[] = []): string[] {
	let items;
	try {
		items = readdirSync(root, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const it of items) {
		if (it.name === "node_modules") continue;
		const full = join(root, it.name);
		if (it.isDirectory()) walk(full, out);
		else if (it.isFile()) out.push(full);
	}
	return out;
}

export class IntegrityGuard {
	private files = new Map<string, Entry>();
	private dirsToWatch: string[];
	private singleFiles: string[];

	constructor(dirs: string[], files: string[] = []) {
		this.dirsToWatch = dirs.filter((d) => existsSync(d));
		this.singleFiles = files;
		this.snapshot();
	}

	get size() {
		return this.files.size;
	}

	private listCurrent(): string[] {
		const all: string[] = [];
		for (const d of this.dirsToWatch) walk(d, all);
		for (const f of this.singleFiles) if (existsSync(f)) all.push(f);
		return [...new Set(all)];
	}

	private snapshot() {
		let kept = 0;
		for (const f of this.listCurrent()) {
			try {
				const st = statSync(f);
				const data = readFileSync(f);
				const keep = kept + data.length <= MAX_KEEP_BYTES;
				if (keep) kept += data.length;
				this.files.set(f, { hash: sha(data), size: st.size, mtimeMs: st.mtimeMs, data: keep ? data : null });
			} catch {
				/* unreadable → ignored */
			}
		}
	}

	/** Compare with the snapshot, repair what changed, and report it. */
	check(enforce = true): IntegrityChange[] {
		const changes: IntegrityChange[] = [];
		const current = new Set(this.listCurrent());

		for (const [file, ref] of this.files) {
			if (!current.has(file)) {
				changes.push({ kind: "deleted", file, restored: enforce && this.restore(file, ref) });
				continue;
			}
			try {
				const st = statSync(file);
				if (st.size === ref.size && st.mtimeMs === ref.mtimeMs) continue; // untouched
				if (sha(readFileSync(file)) !== ref.hash) changes.push({ kind: "modified", file, restored: enforce && this.restore(file, ref) });
				else ref.mtimeMs = st.mtimeMs;
			} catch {
				changes.push({ kind: "modified", file, restored: enforce && this.restore(file, ref) });
			}
		}
		for (const file of current) {
			if (this.files.has(file)) continue;
			let removed = false;
			if (enforce) {
				try {
					unlinkSync(file);
					removed = true;
				} catch {
					/* cannot delete */
				}
			}
			changes.push({ kind: "added", file, restored: removed });
		}
		return changes;
	}

	private restore(file: string, ref: Entry): boolean {
		if (!ref.data) return false;
		try {
			mkdirSync(dirname(file), { recursive: true });
			writeFileSync(file, ref.data);
			ref.mtimeMs = statSync(file).mtimeMs;
			return true;
		} catch {
			return false;
		}
	}

	rel(file: string): string {
		return relative(process.cwd(), file).split(sep).join("/");
	}
}

export function buildIntegrityReport(changes: IntegrityChange[], rel: (f: string) => string, now: Date): { title: string; body: string } {
	const t = dubaiParts(now);
	const verbs = { modified: "A site file was MODIFIED", deleted: "A site file was DELETED", added: "An UNKNOWN file appeared (upload / web shell)" } as const;
	const fixes = { modified: "original restored", deleted: "original restored", added: "unknown file deleted" } as const;
	const rows = changes.slice(0, 50).map((c, i) => `| ${i + 1} | ${verbs[c.kind]} | ${defang(rel(c.file))} | ${c.restored ? fixes[c.kind] : "COULD NOT BE REPAIRED — check the server"} |`);
	return {
		title: `SECURITY ALERT — website files were tampered with (${changes.length})`,
		body: [
			"# SECURITY ALERT — website file tampering detected",
			`Detected at ${t.date} ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")} UAE time. The integrity guard compared the live site with its original fingerprint.`,
			"",
			"| # | What happened | File | Result |",
			"|---|---|---|---|",
			...rows,
			"",
			"Nobody is allowed to change the published site: modified or deleted files are restored automatically and unknown files are deleted immediately.",
			"If you did NOT upload or change anything yourself, someone has write access to the server — change the hosting and GitHub passwords and review the access list. Check the recent security alert e-mails for the IP addresses that probed the site.",
			"If you deployed an update yourself, ignore this message: restart the server and a new snapshot is taken.",
		].join("\n"),
	};
}

export type IntegrityMode = "off" | "monitor" | "enforce";

/** Production servers enforce by default; local/dev runs are left alone so updating files by hand is never undone. */
export function integrityMode(env: NodeJS.ProcessEnv = process.env): IntegrityMode {
	const v = (env.INTEGRITY_GUARD ?? "").toLowerCase();
	if (v === "off" || v === "monitor" || v === "enforce") return v;
	return env.NODE_ENV === "production" ? "enforce" : "off";
}

export function startIntegrityGuard(guard: IntegrityGuard, send: ReportSender, mode: IntegrityMode = "enforce", intervalMs = 60_000): () => void {
	let lastAlert = 0;
	const timer = setInterval(() => {
		const changes = guard.check(mode === "enforce");
		if (!changes.length) return;
		console.error("[integrity] tampering detected:", changes.map((c) => `${c.kind}:${guard.rel(c.file)}`).join(", "));
		const now = Date.now();
		if (now - lastAlert < 5 * 60_000) return; // at most one e-mail per 5 minutes
		lastAlert = now;
		void send(buildIntegrityReport(changes, (f) => guard.rel(f), new Date(now))).catch((e) => console.error("[integrity] alert failed:", e instanceof Error ? e.message : e));
	}, intervalMs);
	timer.unref?.();
	return () => clearInterval(timer);
}
