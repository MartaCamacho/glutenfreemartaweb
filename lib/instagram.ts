import { cache } from "react";
import {
  FETCH_LIMIT,
  PROXY_FETCH_LIMIT,
  loadInstagramMedia,
  loadInstagramPosts,
  type InstagramPost,
  type ResolvedPost,
  type ResolvedVideo,
} from "./instagram-api";
import {
  INSTAGRAM_API_BASE,
  INSTAGRAM_FEED_COUNT,
  INSTAGRAM_REVALIDATE_SECONDS,
  MEDIA_KIT_UGC,
} from "./site";

export type { InstagramMediaType, InstagramPost } from "./instagram-api";

export type UgcVideo = {
  id: string;
  permalink: string;
  caption: string | null;
  brand: string;
  playable: boolean;
};

/** Deduped per request: the page and the image proxy both read the feed. */
const getResolvedPosts = cache(
  async (limit: number): Promise<ResolvedPost[] | null> => {
    return loadInstagramPosts({
      token: process.env.INSTAGRAM_ACCESS_TOKEN,
      apiBase: INSTAGRAM_API_BASE,
      revalidateSeconds: INSTAGRAM_REVALIDATE_SECONDS,
      limit,
    });
  },
);

/** The home feed wants four; the media kit ranks the whole fetched window. */
export async function getInstagramPosts(
  count: number = INSTAGRAM_FEED_COUNT,
): Promise<InstagramPost[] | null> {
  const posts = await getResolvedPosts(FETCH_LIMIT);
  if (!posts) return null;

  return posts.slice(0, count).map(({ id, permalink, caption, mediaType, timestamp }) => ({
    id,
    permalink,
    caption,
    mediaType,
    timestamp,
  }));
}

/** Everything fetched, for callers that rank posts instead of showing the newest. */
export async function getInstagramPostPool(): Promise<InstagramPost[] | null> {
  return getInstagramPosts(FETCH_LIMIT);
}

const getResolvedUgc = cache(async (): Promise<ResolvedVideo[] | null> => {
  return loadInstagramMedia({
    token: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiBase: INSTAGRAM_API_BASE,
    ids: MEDIA_KIT_UGC.map((item) => item.id),
    revalidateSeconds: INSTAGRAM_REVALIDATE_SECONDS,
  });
});

function isUgc(id: string): boolean {
  return MEDIA_KIT_UGC.some((item) => item.id === id);
}

/** Skips the data cache, which can hand back a signed URL that has expired. */
async function loadFreshMedia(id: string): Promise<ResolvedVideo | null> {
  const media = await loadInstagramMedia({
    token: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiBase: INSTAGRAM_API_BASE,
    ids: [id],
    revalidateSeconds: 0,
  });
  return media?.[0] ?? null;
}

export async function getUgcVideos(): Promise<UgcVideo[] | null> {
  const videos = await getResolvedUgc();
  if (!videos) return null;

  return videos.map(({ id, permalink, caption, videoUrl }) => ({
    id,
    permalink,
    caption,
    brand: MEDIA_KIT_UGC.find((item) => item.id === id)?.brand ?? "",
    playable: videoUrl !== null,
  }));
}

/**
 * Only the account's recent posts and the media kit's UGC list resolve, so the
 * proxy can't be used to look up arbitrary media. The wider window costs one
 * cached request, however many unknown ids come in.
 */
export async function getInstagramImageUrl(id: string): Promise<string | null> {
  const feed = await getResolvedPosts(FETCH_LIMIT);
  const fromFeed = feed?.find((post) => post.id === id)?.imageUrl;
  if (fromFeed) return fromFeed;

  if (isUgc(id)) {
    const videos = await getResolvedUgc();
    return videos?.find((video) => video.id === id)?.imageUrl ?? null;
  }

  const wider = await getResolvedPosts(PROXY_FETCH_LIMIT);
  return wider?.find((post) => post.id === id)?.imageUrl ?? null;
}

/** Only for an id `getInstagramImageUrl` has already accepted. */
export async function getFreshInstagramImageUrl(
  id: string,
): Promise<string | null> {
  return (await loadFreshMedia(id))?.imageUrl ?? null;
}

/** Always fresh: the signed file lasts about a day and a half, and the media kit can go longer unvisited. */
export async function getInstagramVideoUrl(id: string): Promise<string | null> {
  if (!isUgc(id)) return null;
  return (await loadFreshMedia(id))?.videoUrl ?? null;
}
