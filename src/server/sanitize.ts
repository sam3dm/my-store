/**
 * Text that comes from outside (names, typed questions, URLs, user agents, form fields) ends up in e-mails
 * to the owner. These helpers make sure such text can never act as HTML, a clickable link or markup there.
 */

/** Neutralise HTML tags / angle brackets and control characters; keep the text readable. */
export function neutralize(s: string): string {
	return s
		.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, "") // control + bidi-override characters
		.replace(/</g, "‹")
		.replace(/>/g, "›")
		.replace(/`/g, "ʼ");
}

/** Make URLs and script schemes inert (not clickable) when attacker-controlled text is quoted. */
export function defang(s: string): string {
	return neutralize(s)
		.replace(/\b(https?|ftp):\/\//gi, (_m, p: string) => `${p.replace(/t/gi, "x")}[://]`)
		.replace(/\b(javascript|vbscript|data)\s*:/gi, "$1[:]")
		.replace(/\bwww\./gi, "www[.]");
}

/** A person's name: letters, spaces and . ' - only. */
export function cleanName(s: unknown, max = 60): string | undefined {
	if (typeof s !== "string") return undefined;
	const t = s.replace(/[^\p{L}\p{M}\s.'’-]/gu, "").replace(/\s+/g, " ").trim().slice(0, max);
	return t.length >= 2 ? t : undefined;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Deep-clean a JSON body: drop prototype-pollution keys, cap depth / sizes, neutralise strings.
 * Returns a fresh object, so nothing from the original (possibly hostile) structure is reused.
 */
export function sanitizeJson(value: unknown, depth = 0): unknown {
	if (depth > 5) return undefined;
	if (typeof value === "string") return neutralize(value).slice(0, 5000);
	if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
	if (typeof value === "boolean" || value === null) return value;
	if (Array.isArray(value)) return value.slice(0, 40).map((v) => sanitizeJson(v, depth + 1));
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = Object.create(null);
		for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, 60)) {
			if (FORBIDDEN_KEYS.has(k) || k.length > 80) continue;
			out[k] = sanitizeJson(v, depth + 1);
		}
		return { ...out };
	}
	return undefined;
}
