import { cache } from "react";
import {
  loadInstagramPosts,
  type InstagramPost,
  type ResolvedPost,
} from "./instagram-api";
import {
  INSTAGRAM_API_BASE,
  INSTAGRAM_FEED_COUNT,
  INSTAGRAM_REVALIDATE_SECONDS,
} from "./site";

export type { InstagramMediaType, InstagramPost } from "./instagram-api";

/** Deduped per request: the page and the image proxy both read the feed. */
const getResolvedPosts = cache(async (): Promise<ResolvedPost[] | null> => {
  return loadInstagramPosts({
    token: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiBase: INSTAGRAM_API_BASE,
    count: INSTAGRAM_FEED_COUNT,
    revalidateSeconds: INSTAGRAM_REVALIDATE_SECONDS,
  });
});

export async function getInstagramPosts(): Promise<InstagramPost[] | null> {
  const posts = await getResolvedPosts();
  if (!posts) return null;

  return posts.map(({ id, permalink, caption, mediaType, timestamp }) => ({
    id,
    permalink,
    caption,
    mediaType,
    timestamp,
  }));
}

/** Only ids in the current feed resolve, so the proxy can't serve arbitrary media. */
export async function getInstagramImageUrl(id: string): Promise<string | null> {
  const posts = await getResolvedPosts();
  return posts?.find((post) => post.id === id)?.imageUrl ?? null;
}
