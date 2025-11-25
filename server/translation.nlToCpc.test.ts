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

describe("translation.nlToCpc", () => {
  it("should translate simple conditional sentence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.nlToCpc({
      text: "Se chover, então a grama ficará molhada.",
    });

    expect(result).toBeDefined();
    expect(result.formula).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(typeof result.formula).toBe("string");
    expect(result.formula).toMatch(/→/); // Should contain implication symbol
  }, 30000);

  it("should translate conjunction sentence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.nlToCpc({
      text: "João vai ao cinema e Maria vai ao teatro.",
    });

    expect(result).toBeDefined();
    expect(result.formula).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(result.formula).toMatch(/∧/); // Should contain conjunction symbol
  }, 30000);

  it("should translate negation sentence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.nlToCpc({
      text: "Não está chovendo.",
    });

    expect(result).toBeDefined();
    expect(result.formula).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(result.formula).toMatch(/¬/); // Should contain negation symbol
  }, 30000);

  it("should translate complex sentence with multiple connectives", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translation.nlToCpc({
      text: "Se chover e fizer frio, então a aula será cancelada.",
    });

    expect(result).toBeDefined();
    expect(result.formula).toBeDefined();
    expect(result.propositions).toBeDefined();
    expect(result.formula).toMatch(/∧/); // Should contain conjunction
    expect(result.formula).toMatch(/→/); // Should contain implication
    expect(Object.keys(result.propositions).length).toBeGreaterThanOrEqual(2);
  }, 30000);

  it("should reject empty input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.translation.nlToCpc({ text: "" })
    ).rejects.toThrow();
  });
});
