/**
 * Host-header protection. Every URL the server writes into a page, sitemap or report (canonical links,
 * robots.txt, llms.txt, report origins) is derived from the request's Host. A forged Host would make the
 * site publish attacker-chosen addresses, so any host that is not ours is replaced by the real domain.
 */
import type { NextFunction, Request, Response } from "express";
import { isSystemHost } from "./seo-host";

export const PRIMARY_HOST = "metropolitandigitalmarketing.com";

export function allowedHosts(env: NodeJS.ProcessEnv = process.env): Set<string> {
	const extra = (env.ALLOWED_HOSTS ?? "").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
	return new Set([PRIMARY_HOST, `www.${PRIMARY_HOST}`, ...extra]);
}

export function hostGuard(env: NodeJS.ProcessEnv = process.env) {
	const allowed = allowedHosts(env);
	return (req: Request, _res: Response, next: NextFunction) => {
		const host = (req.hostname || "").toLowerCase();
		if (!host || allowed.has(host) || isSystemHost({ hostname: host })) {
			next();
			return;
		}
		req.headers.host = PRIMARY_HOST;
		delete req.headers["x-forwarded-host"];
		next();
	};
}
