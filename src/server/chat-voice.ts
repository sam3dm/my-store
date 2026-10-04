/**
 * Voice messages from the website chatbot.
 *
 * POST /api/chat/voice  (raw audio body)  -> { id, url }
 * GET  /api/chat/voice/:id                -> the audio file
 *
 * Files are stored with an unguessable random id, size-limited, type-checked and rate-limited.
 * The URL is included in the message the visitor's details are forwarded with, so the team can
 * listen to it. Storage is the server's temp directory: it is kept for 14 days on a normal
 * server but may be cleared if the hosting platform restarts with a fresh disk.
 */
import express, { type Express, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const MAX_VOICE_BYTES = 3 * 1024 * 1024;
const RETENTION_MS = 14 * 24 * 60 * 60 * 1000;
const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 60_000;

const EXT_BY_TYPE: Record<string, string> = {
	"audio/webm": "webm",
	"video/webm": "webm",
	"audio/ogg": "ogg",
	"audio/mp4": "m4a",
	"audio/x-m4a": "m4a",
	"audio/mpeg": "mp3",
	"audio/wav": "wav",
	"audio/x-wav": "wav",
};
const TYPE_BY_EXT: Record<string, string> = {
	webm: "audio/webm",
	ogg: "audio/ogg",
	m4a: "audio/mp4",
	mp3: "audio/mpeg",
	wav: "audio/wav",
};

/** The file's real type from its first bytes — the Content-Type header alone is not trusted. */
export function sniffAudio(b: Buffer): "webm" | "ogg" | "m4a" | "mp3" | "wav" | null {
	if (b.length < 12) return null;
	if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm";
	if (b.toString("latin1", 0, 4) === "OggS") return "ogg";
	if (b.toString("latin1", 4, 8) === "ftyp") return "m4a";
	if (b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WAVE") return "wav";
	if (b.toString("latin1", 0, 3) === "ID3" || (b[0] === 0xff && (b[1]! & 0xe0) === 0xe0)) return "mp3";
	return null;
}

const MAX_FILES = 600;
const MAX_TOTAL_BYTES = 400 * 1024 * 1024;
const DAILY_PER_IP = 20;
const daily = new Map<string, { day: string; n: number }>();

async function quotaOk(dir: string): Promise<boolean> {
	try {
		const files = await readdir(dir);
		if (files.length >= MAX_FILES) return false;
		let total = 0;
		for (const f of files) total += (await stat(join(dir, f))).size;
		return total < MAX_TOTAL_BYTES;
	} catch {
		return true;
	}
}

function dailyOk(ip: string): boolean {
	const day = new Date().toISOString().slice(0, 10);
	const d = daily.get(ip);
	if (!d || d.day !== day) {
		daily.set(ip, { day, n: 1 });
		return true;
	}
	return ++d.n <= DAILY_PER_IP;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string): boolean {
	const now = Date.now();
	const b = buckets.get(ip);
	if (!b || now > b.resetAt) {
		buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return false;
	}
	if (b.count >= RATE_LIMIT) return true;
	b.count++;
	return false;
}

function voiceDir(): string {
	return process.env.CHAT_VOICE_DIR || join(tmpdir(), "mdm-chat-voice");
}

async function pruneOld(dir: string) {
	try {
		const now = Date.now();
		for (const f of await readdir(dir)) {
			const p = join(dir, f);
			const st = await stat(p);
			if (now - st.mtimeMs > RETENTION_MS) await unlink(p);
		}
	} catch {
		/* best effort */
	}
}

function visitorIp(req: Request): string {
	const cf = req.headers["cf-connecting-ip"];
	if (typeof cf === "string" && cf.trim()) return cf.trim();
	const xff = req.headers["x-forwarded-for"];
	if (typeof xff === "string" && xff.trim()) return xff.split(",")[0]?.trim() ?? "";
	return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

export async function uploadVoice(req: Request, res: Response): Promise<void> {
	if (limited(visitorIp(req))) {
		res.status(429).json({ success: false, error: "Too many requests" });
		return;
	}
	const baseType = String(req.headers["content-type"] ?? "").split(";")[0]?.trim().toLowerCase();
	const body = req.body as unknown;
	const ext = Buffer.isBuffer(body) && EXT_BY_TYPE[baseType] ? sniffAudio(body) : null;
	if (!ext || !Buffer.isBuffer(body) || body.length < 200) {
		res.status(400).json({ success: false, error: "A short audio recording is required" });
		return;
	}
	if (!dailyOk(visitorIp(req))) {
		res.status(429).json({ success: false, error: "Too many recordings today" });
		return;
	}
	const dir = voiceDir();
	await mkdir(dir, { recursive: true, mode: 0o700 });
	if (!(await quotaOk(dir))) {
		res.status(507).json({ success: false, error: "Voice storage is full" });
		return;
	}
	const id = `${randomUUID()}.${ext}`;
	await writeFile(join(dir, id), body, { mode: 0o600 });
	void pruneOld(dir);
	res.status(201).json({ success: true, id, url: `/api/chat/voice/${id}` });
}

export async function downloadVoice(req: Request, res: Response): Promise<void> {
	const id = String(req.params.id ?? "");
	const m = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|ogg|m4a|mp3|wav)$/.exec(id);
	if (!m) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	try {
		const data = await readFile(join(voiceDir(), id));
		res
			.status(200)
			.set({
				"Content-Type": TYPE_BY_EXT[m[1]!]!,
				"Content-Length": String(data.length),
				"Cache-Control": "private, max-age=3600",
				"X-Content-Type-Options": "nosniff",
				"Content-Disposition": `inline; filename="voice-message.${m[1]}"`,
			})
			.send(data);
	} catch {
		res.status(404).json({ error: "Not found" });
	}
}

export function registerChatVoiceRoutes(app: Express): void {
	app.post(
		"/api/chat/voice",
		express.raw({ type: () => true, limit: MAX_VOICE_BYTES }),
		(req, res, next) => {
			uploadVoice(req, res).catch(next);
		},
	);
	app.use("/api/chat/voice", (err: unknown, _req: Request, res: Response, next: (e?: unknown) => void) => {
		if ((err as { type?: string })?.type === "entity.too.large") {
			res.status(413).json({ success: false, error: "Recording is too long" });
			return;
		}
		next(err);
	});
	app.get("/api/chat/voice/:id", (req, res, next) => {
		downloadVoice(req, res).catch(next);
	});
}
