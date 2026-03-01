import { logger } from "./logger.js";
import type { RedditClient } from "./reddit-client.js";
import type { ChannelCommand, ChannelMessageParser, ChannelProvider } from "./types.js";

let client: RedditClient | null = null;
let botUsername = "unknown";
let defaultSubject: string | undefined;

export function setRedditClient(c: RedditClient | null): void {
  client = c;
}

export function setBotUsername(username: string): void {
  botUsername = username;
}

export function setDefaultSubject(subject: string | undefined): void {
  defaultSubject = subject;
}

function deriveSubject(content: string): string {
  if (defaultSubject) return defaultSubject;
  const trimmed = content.trim();
  return trimmed.length > 50 ? trimmed.slice(0, 50) : trimmed;
}

const registeredCommands: Map<string, ChannelCommand> = new Map();
const registeredParsers: Map<string, ChannelMessageParser> = new Map();

export const redditChannelProvider: ChannelProvider = {
  id: "reddit",

  registerCommand(cmd: ChannelCommand): void {
    registeredCommands.set(cmd.name, cmd);
    logger.info({ msg: "Channel command registered", name: cmd.name });
  },

  unregisterCommand(name: string): void {
    registeredCommands.delete(name);
  },

  getCommands(): ChannelCommand[] {
    return Array.from(registeredCommands.values());
  },

  addMessageParser(parser: ChannelMessageParser): void {
    registeredParsers.set(parser.id, parser);
    logger.info({ msg: "Message parser registered", id: parser.id });
  },

  removeMessageParser(id: string): void {
    registeredParsers.delete(id);
  },

  getMessageParsers(): ChannelMessageParser[] {
    return Array.from(registeredParsers.values());
  },

  async send(channelId: string, content: string): Promise<void> {
    if (!client) throw new Error("Reddit client not initialized");
    // channelId is treated as a Reddit username for DMs, or "subreddit:name" for posts
    if (channelId.startsWith("subreddit:")) {
      const sub = channelId.slice("subreddit:".length);
      await client.submitSelfPost(sub, deriveSubject(content), content);
    } else {
      await client.sendDirectMessage(channelId, deriveSubject(content), content);
    }
  },

  getBotUsername(): string {
    return botUsername;
  },
};
