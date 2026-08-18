import { getInstagramImageUrl } from "@/lib/instagram";

/**
 * Instagram's CDN URLs are signed and expire, so they can't go into cached HTML.
 * The media id is stable and its image never changes, which makes this a URL
 * `next/image` can cache properly.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const imageUrl = await getInstagramImageUrl(id);

  if (!imageUrl) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(imageUrl);

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream image unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
