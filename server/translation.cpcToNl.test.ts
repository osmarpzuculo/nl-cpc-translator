import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("translation.cpcToNl", () => {
  it("should translate simple implication formula", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.cpcToNl({
      formula: "P → Q",
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(0);
  }, 30000);

  it("should translate formula with user-provided propositions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.cpcToNl({
      formula: "P → Q",
      propositions: {
        P: "chover",
        Q: "a grama ficará molhada",
      },
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(result.propositions.P).toBe("chover");
    expect(result.propositions.Q).toBe("a grama ficará molhada");
  }, 30000);

  it("should translate conjunction formula", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.cpcToNl({
      formula: "P ∧ Q",
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.propositions).toBeDefined();
  }, 30000);

  it("should translate negation formula", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.cpcToNl({
      formula: "¬P",
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.propositions).toBeDefined();
  }, 30000);

  it("should translate complex formula with parentheses", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.cpcToNl({
      formula: "(P ∧ Q) → R",
    });

    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(Object.keys(result.propositions).length).toBeGreaterThanOrEqual(3);
  }, 30000);

  it("should reject empty formula", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.translation.cpcToNl({ formula: "" })
    ).rejects.toThrow();
  });
});
