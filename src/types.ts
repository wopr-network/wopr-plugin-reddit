export type {
  ChannelCommand,
  ChannelMessageContext,
  ChannelMessageParser,
  ChannelProvider,
  ChannelRef,
  ConfigField,
  ConfigSchema,
  PluginCommand,
  PluginInjectOptions,
  PluginLogger,
  StreamMessage,
  WOPRPlugin,
  WOPRPluginContext,
} from "@wopr-network/plugin-types";

/** Reddit OAuth2 script-app credentials */
export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  username: string;
}

/** Plugin config as stored in WOPR config */
export interface RedditPluginConfig {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  username?: string;
  /** Subreddits to monitor (comma-separated) */
  subreddits?: string;
  /** Keywords to watch for (comma-separated) */
  keywords?: string;
  /** Polling interval in seconds (default 30) */
  pollIntervalSeconds?: number;
  /** Whether to monitor inbox (replies, mentions, DMs) */
  monitorInbox?: boolean;
}

/** A watched subreddit subscription */
export interface SubredditWatch {
  subreddit: string;
  keywords: string[];
  lastSeenId: string | null;
}

/** Normalized inbound Reddit event */
export interface RedditInboundEvent {
  type: "comment" | "post" | "mention" | "dm";
  id: string;
  author: string;
  body: string;
  subreddit?: string;
  parentId?: string;
  /** Full Reddit thing name (e.g., t1_abc123) for replying */
  thingName: string;
}
