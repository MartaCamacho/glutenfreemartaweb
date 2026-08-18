import { cache } from "react";
import {
  INSTAGRAM_API_BASE,
  INSTAGRAM_FEED_COUNT,
  INSTAGRAM_REVALIDATE_SECONDS,
} from "./site";

export type InstagramMediaType = "image" | "video" | "carousel";

export type InstagramPost = {
  id: string;
  permalink: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  timestamp: string;
};

/** Same shape plus the CDN URL, which never leaves this module. */
type ResolvedPost = InstagramPost & { imageUrl: string };

type ApiMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data?: { media_url?: string; media_type?: string }[] };
};

const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "children{media_url,media_type}",
].join(",");

/** Over-fetch so posts without a usable image don't shrink the grid. */
const FETCH_LIMIT = 12;

const MEDIA_TYPES: Record<string, InstagramMediaType> = {
  IMAGE: "image",
  VIDEO: "video",
  CAROUSEL_ALBUM: "carousel",
};

/**
 * Videos and reels put the playable file in `media_url`; the still lives in
 * `thumbnail_url`. Albums carry no image of their own, only children.
 */
function pickImageUrl(media: ApiMedia): string | undefined {
  if (media.media_type === "VIDEO") return media.thumbnail_url;
  if (media.media_type === "CAROUSEL_ALBUM") {
    const child = media.children?.data?.find((c) => c.media_url);
    return child?.media_url;
  }
  return media.media_url;
}

function normalise(media: ApiMedia): ResolvedPost | null {
  const mediaType = MEDIA_TYPES[media.media_type ?? ""];
  const imageUrl = pickImageUrl(media);

  if (!media.id || !media.permalink || !media.timestamp) return null;
  if (!mediaType || !imageUrl) return null;

  return {
    id: media.id,
    permalink: media.permalink,
    caption: media.caption?.trim() || null,
    mediaType,
    timestamp: media.timestamp,
    imageUrl,
  };
}

/**
 * A missing token or a bad response is never fatal: the feed section falls back
 * to the sample posts in the dictionary rather than taking the home page down.
 */
const getResolvedPosts = cache(async (): Promise<ResolvedPost[] | null> => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  const url = `${INSTAGRAM_API_BASE}/me/media?fields=${FIELDS}&limit=${FETCH_LIMIT}&access_token=${token}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: INSTAGRAM_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.warn(
        `Instagram feed unavailable: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const body: { data?: ApiMedia[] } = await response.json();
    const posts = (body.data ?? [])
      .map(normalise)
      .filter((post): post is ResolvedPost => post !== null)
      .slice(0, INSTAGRAM_FEED_COUNT);

    return posts.length > 0 ? posts : null;
  } catch (error) {
    console.warn("Instagram feed unavailable:", error);
    return null;
  }
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
