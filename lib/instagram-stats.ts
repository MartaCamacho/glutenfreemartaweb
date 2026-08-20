import { cache } from "react";
import { FETCH_LIMIT } from "./instagram-api";
import {
  loadMediaKitStats,
  loadPostMetrics,
  type MediaKitStats,
  type PostMetrics,
} from "./instagram-stats-api";
import {
  INSTAGRAM_API_BASE,
  INSTAGRAM_STATS_REVALIDATE_SECONDS,
  INSTAGRAM_STATS_WINDOW_DAYS,
  MEDIA_KIT_COUNTRY_COUNT,
} from "./site";

export type {
  AudienceSummary,
  MediaKitStats,
  PostMetrics,
} from "./instagram-stats-api";

export const getMediaKitStats = cache(
  async (): Promise<MediaKitStats | null> => {
    return loadMediaKitStats({
      token: process.env.INSTAGRAM_ACCESS_TOKEN,
      apiBase: INSTAGRAM_API_BASE,
      windowDays: INSTAGRAM_STATS_WINDOW_DAYS,
      countryCount: MEDIA_KIT_COUNTRY_COUNT,
      revalidateSeconds: INSTAGRAM_STATS_REVALIDATE_SECONDS,
    });
  },
);

/** Keyed by media id, over the same window the feed loader fetches. */
export const getPostMetrics = cache(
  async (): Promise<Map<string, PostMetrics> | null> => {
    return loadPostMetrics({
      token: process.env.INSTAGRAM_ACCESS_TOKEN,
      apiBase: INSTAGRAM_API_BASE,
      limit: FETCH_LIMIT,
      revalidateSeconds: INSTAGRAM_STATS_REVALIDATE_SECONDS,
    });
  },
);
