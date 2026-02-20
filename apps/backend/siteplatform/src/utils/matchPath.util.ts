import { match, type MatchResult } from "path-to-regexp";

// CompiledRoute wraps a matcher for dynamic route matching
export type CompiledRoute = {
    matcher: (path: string) => MatchResult<Record<string, string>> | false;
};

// compilePath supports dynamic route registration (e.g. /api/:id)
export function compilePath(path: string): CompiledRoute {
    const matcher = match<Record<string, string>>(path, { decode: decodeURIComponent });
    return { matcher };
}

// extractParams returns params if the path matches, else null
export function extractParams(
    compiled: CompiledRoute,
    actualPath: string
): Record<string, string> | null {
    const result = compiled.matcher(actualPath);
    if (!result) return null;
    return result.params;
}
