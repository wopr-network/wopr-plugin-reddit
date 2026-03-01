import { beforeEach, describe, expect, it, vi } from "vitest";
import { redditChannelProvider, setRedditClient } from "../src/channel-provider.js";
import { createMockSnoowrap } from "../src/__test-utils__/mocks.js";
import { RedditClient } from "../src/reddit-client.js";

vi.mock("snoowrap", () => ({ default: vi.fn() }));

describe("redditChannelProvider", () => {
  let mockSnoowrap: ReturnType<typeof createMockSnoowrap>;
  let client: RedditClient;

  beforeEach(() => {
    mockSnoowrap = createMockSnoowrap();
    client = new RedditClient(mockSnoowrap);
    setRedditClient(client);
    // Clear registered commands/parsers
    for (const cmd of redditChannelProvider.getCommands()) {
      redditChannelProvider.unregisterCommand(cmd.name);
    }
    for (const parser of redditChannelProvider.getMessageParsers()) {
      redditChannelProvider.removeMessageParser(parser.id);
    }
  });

  it("has id 'reddit'", () => {
    expect(redditChannelProvider.id).toBe("reddit");
  });

  it("registers and retrieves commands", () => {
    const cmd = { name: "test", description: "test cmd", handler: vi.fn() };
    redditChannelProvider.registerCommand(cmd);
    expect(redditChannelProvider.getCommands()).toContainEqual(cmd);
    redditChannelProvider.unregisterCommand("test");
    expect(redditChannelProvider.getCommands()).toHaveLength(0);
  });

  it("registers and retrieves message parsers", () => {
    const parser = { id: "p1", pattern: /test/, handler: vi.fn() };
    redditChannelProvider.addMessageParser(parser);
    expect(redditChannelProvider.getMessageParsers()).toContainEqual(parser);
    redditChannelProvider.removeMessageParser("p1");
    expect(redditChannelProvider.getMessageParsers()).toHaveLength(0);
  });

  it("sends a DM via RedditClient", async () => {
    const spy = vi.spyOn(client, "sendDirectMessage").mockResolvedValue(undefined);
    // channel provider send() sends a DM to channelId (treated as username)
    await redditChannelProvider.send("targetUser", "Hello from WOPR");
    expect(spy).toHaveBeenCalledWith("targetUser", "WOPR Message", "Hello from WOPR");
  });

  it("returns bot username", () => {
    expect(redditChannelProvider.getBotUsername()).toBeDefined();
  });
});
