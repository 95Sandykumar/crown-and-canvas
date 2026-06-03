import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows the major AI crawlers", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.flatMap((r) =>
      Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]
    );
    for (const bot of ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
  });

  it("keeps private routes disallowed for the wildcard agent", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard?.disallow).toContain("/api/");
  });
});
