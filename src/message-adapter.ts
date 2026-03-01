import { logger } from "./logger.js";
import type { ChannelRef, RedditInboundEvent, WOPRPluginContext } from "./types.js";

export async function handleRedditEvent(
  event: RedditInboundEvent,
  ctx: WOPRPluginContext,
  session: string,
  botUsername?: string,
): Promise<void> {
  // Skip own messages
  if (botUsername && event.author.toLowerCase() === botUsername.toLowerCase()) {
    return;
  }

  let channel: ChannelRef;
  if (event.type === "dm") {
    channel = { id: `reddit:dm:${event.author}`, type: "reddit", name: `DM from ${event.author}` };
  } else {
    const sub = event.subreddit ?? "unknown";
    channel = { id: `reddit:${sub}`, type: "reddit", name: `r/${sub}` };
  }

  logger.info({ msg: "Reddit event -> inject", type: event.type, author: event.author, id: event.id });

  try {
    await ctx.inject(session, event.body, {
      from: event.author,
      channel,
    });
  } catch (err) {
    logger.error({ msg: "Failed to inject Reddit event", error: String(err), eventId: event.id });
  }
}
