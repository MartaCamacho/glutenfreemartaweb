import { getInstagramVideoUrl } from "@/lib/instagram";

/**
 * Redirects instead of proxying: piping whole reels through a function would
 * hit Vercel's response limits, and Meta's CDN already handles the range
 * requests seeking needs. The page only ever holds this stable URL; the signed
 * one it points to expires within days.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const videoUrl = await getInstagramVideoUrl(id);

  if (!videoUrl) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: videoUrl,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
