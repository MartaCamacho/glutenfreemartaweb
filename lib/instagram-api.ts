/**
 * Talking to the Instagram API and making sense of what it returns.
 *
 * Kept free of React and Next imports so it can be exercised by `npm test`
 * under plain node. `lib/instagram.ts` wraps this with request-level caching.
 */

export type InstagramMediaType = "image" | "video" | "carousel";

export type InstagramPost = {
  id: string;
  permalink: string;
  caption: string | null;
  mediaType: InstagramMediaType;
  timestamp: string;
};

/** Same shape plus the CDN URL, which never reaches a component. */
export type ResolvedPost = InstagramPost & { imageUrl: string };

export type ApiMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data?: { media_url?: string; media_type?: string }[] };
};

export const MEDIA_FIELDS = [
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
export const FETCH_LIMIT = 12;

const MEDIA_TYPES: Record<string, InstagramMediaType> = {
  IMAGE: "image",
  VIDEO: "video",
  CAROUSEL_ALBUM: "carousel",
};

/**
 * Videos and reels put the playable file in `media_url`; the still lives in
 * `thumbnail_url`. Albums carry no image of their own, only children.
 */
export function pickImageUrl(media: ApiMedia): string | undefined {
  if (media.media_type === "VIDEO") return media.thumbnail_url;
  if (media.media_type === "CAROUSEL_ALBUM") {
    return media.children?.data?.find((child) => child.media_url)?.media_url;
  }
  return media.media_url;
}

export function normalisePost(media: ApiMedia): ResolvedPost | null {
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

export function selectPosts(media: ApiMedia[], count: number): ResolvedPost[] {
  return media
    .map(normalisePost)
    .filter((post): post is ResolvedPost => post !== null)
    .slice(0, count);
}

/** Captions run long and rambling; a card only has room for the opening line. */
export function captionHeadline(
  caption: string | null,
  fallback: string,
): string {
  const firstLine = caption?.split("\n")[0].trim();
  return firstLine || fallback;
}

export type LoadOptions = {
  token: string | undefined;
  apiBase: string;
  count: number;
  revalidateSeconds: number;
  fetchImpl?: typeof fetch;
};

/**
 * Never throws. A missing token, a Meta outage or an expired token all return
 * null, which the feed section reads as "show the sample posts instead" rather
 * than taking the home page down with it.
 */
export async function loadInstagramPosts({
  token,
  apiBase,
  count,
  revalidateSeconds,
  fetchImpl = fetch,
}: LoadOptions): Promise<ResolvedPost[] | null> {
  if (!token) return null;

  const url = `${apiBase}/me/media?fields=${MEDIA_FIELDS}&limit=${FETCH_LIMIT}&access_token=${token}`;

  try {
    const response = await fetchImpl(url, {
      next: { revalidate: revalidateSeconds },
    } as RequestInit);

    if (!response.ok) {
      console.warn(
        `Instagram feed unavailable: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const body: { data?: ApiMedia[] } = await response.json();
    const posts = selectPosts(body.data ?? [], count);

    return posts.length > 0 ? posts : null;
  } catch (error) {
    console.warn("Instagram feed unavailable:", error);
    return null;
  }
}
