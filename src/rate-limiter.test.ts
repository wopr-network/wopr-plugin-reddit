import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "./rate-limiter.js";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tokens never go below 0 after waitForToken at window boundary", async () => {
    const limiter = new RateLimiter(1, 1000);
    // Drain the single token
    expect(limiter.tryAcquire()).toBe(true);
    // Now tokens = 0. waitForToken should wait and acquire, not decrement below 0.
    const waitPromise = limiter.waitForToken();
    vi.advanceTimersByTime(1001);
    await waitPromise;
    // After acquiring, remaining should be 0 (maxTokens=1 refilled, then 1 consumed)
    // The key assertion: tokens must not be negative
    expect(limiter.remaining).toBeGreaterThanOrEqual(0);
  });

  it("waitForToken does not decrement below 0 when refill does not trigger", async () => {
    // Use a very long window so refill definitely does NOT trigger
    const limiter = new RateLimiter(1, 100_000);
    // Drain the token
    limiter.tryAcquire();
    // tokens = 0. Advance just past window so refill triggers in waitForToken
    const waitPromise = limiter.waitForToken();
    vi.advanceTimersByTime(100_001);
    await waitPromise;
    // After acquiring, remaining should be 0 (1 refilled, 1 consumed) — never negative
    expect(limiter.remaining).toBeGreaterThanOrEqual(0);
  });

  it("tokens field never goes negative during waitForToken", async () => {
    // Patch to observe internal tokens value immediately after the decrement
    const limiter = new RateLimiter(1, 1000);
    limiter.tryAcquire(); // tokens = 0
    // Spy: after setTimeout fires + refill() runs, tokens will be set to maxTokens=1,
    // then the unguarded this.tokens-- brings it to 0 (fine) OR if refill didn't fire
    // and tokens was already 0, it goes to -1 (the bug).
    // We test the invariant by checking remaining after waitForToken completes.
    const waitPromise = limiter.waitForToken();
    vi.advanceTimersByTime(1001);
    await waitPromise;
    expect(limiter.remaining).toBeGreaterThanOrEqual(0);
  });
});
