import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  captionHeadline,
  loadInstagramPosts,
  normalisePost,
  pickImageUrl,
  selectPosts,
  type ApiMedia,
} from "./instagram-api.ts";

const IMAGE: ApiMedia = {
  id: "1",
  caption: "Un pan decente, por fin",
  media_type: "IMAGE",
  media_url: "https://cdn/photo.jpg",
  permalink: "https://instagram.com/p/aaa",
  timestamp: "2026-08-17T09:00:00+0000",
};

const REEL: ApiMedia = {
  id: "2",
  media_type: "VIDEO",
  media_url: "https://cdn/reel.mp4",
  thumbnail_url: "https://cdn/reel.jpg",
  permalink: "https://instagram.com/reel/bbb",
  timestamp: "2026-08-15T09:00:00+0000",
};

const ALBUM: ApiMedia = {
  id: "3",
  media_type: "CAROUSEL_ALBUM",
  permalink: "https://instagram.com/p/ccc",
  timestamp: "2026-08-13T09:00:00+0000",
  children: {
    data: [
      { media_url: "https://cdn/slide-1.jpg", media_type: "IMAGE" },
      { media_url: "https://cdn/slide-2.jpg", media_type: "IMAGE" },
    ],
  },
};

describe("pickImageUrl", () => {
  it("uses media_url for a plain photo", () => {
    assert.equal(pickImageUrl(IMAGE), "https://cdn/photo.jpg");
  });

  it("uses the thumbnail for a reel, never the video file", () => {
    assert.equal(pickImageUrl(REEL), "https://cdn/reel.jpg");
  });

  it("uses the first slide of an album", () => {
    assert.equal(pickImageUrl(ALBUM), "https://cdn/slide-1.jpg");
  });

  it("skips album slides that carry no image", () => {
    const album: ApiMedia = {
      ...ALBUM,
      children: {
        data: [{ media_type: "VIDEO" }, { media_url: "https://cdn/slide-2.jpg" }],
      },
    };
    assert.equal(pickImageUrl(album), "https://cdn/slide-2.jpg");
  });

  it("gives up on a reel with no thumbnail", () => {
    assert.equal(pickImageUrl({ ...REEL, thumbnail_url: undefined }), undefined);
  });

  it("gives up on an empty album", () => {
    assert.equal(pickImageUrl({ ...ALBUM, children: undefined }), undefined);
  });
});

describe("normalisePost", () => {
  it("turns an API photo into the shape a card renders", () => {
    assert.deepEqual(normalisePost(IMAGE), {
      id: "1",
      permalink: "https://instagram.com/p/aaa",
      caption: "Un pan decente, por fin",
      mediaType: "image",
      timestamp: "2026-08-17T09:00:00+0000",
      imageUrl: "https://cdn/photo.jpg",
    });
  });

  it("maps Instagram's media types to ours", () => {
    assert.equal(normalisePost(REEL)?.mediaType, "video");
    assert.equal(normalisePost(ALBUM)?.mediaType, "carousel");
  });

  it("trims a caption and treats a blank one as absent", () => {
    assert.equal(normalisePost({ ...IMAGE, caption: "  hola  " })?.caption, "hola");
    assert.equal(normalisePost({ ...IMAGE, caption: "   \n  " })?.caption, null);
    assert.equal(normalisePost({ ...IMAGE, caption: undefined })?.caption, null);
  });

  it("drops a post missing any field the card needs", () => {
    assert.equal(normalisePost({ ...IMAGE, id: undefined }), null);
    assert.equal(normalisePost({ ...IMAGE, permalink: undefined }), null);
    assert.equal(normalisePost({ ...IMAGE, timestamp: undefined }), null);
    assert.equal(normalisePost({ ...IMAGE, media_url: undefined }), null);
  });

  it("drops a media type it does not know how to render", () => {
    assert.equal(normalisePost({ ...IMAGE, media_type: "STORY" }), null);
    assert.equal(normalisePost({ ...IMAGE, media_type: undefined }), null);
  });
});

describe("selectPosts", () => {
  it("fills the grid from further down when a post is unusable", () => {
    const broken = { ...REEL, id: "broken", thumbnail_url: undefined };
    const posts = selectPosts([IMAGE, broken, REEL, ALBUM], 3);

    assert.deepEqual(
      posts.map((post) => post.id),
      ["1", "2", "3"],
    );
  });

  it("preserves the order Instagram sent, newest first", () => {
    const posts = selectPosts([ALBUM, IMAGE, REEL], 3);
    assert.deepEqual(
      posts.map((post) => post.id),
      ["3", "1", "2"],
    );
  });

  it("returns fewer than asked rather than padding", () => {
    assert.equal(selectPosts([IMAGE], 4).length, 1);
    assert.equal(selectPosts([], 4).length, 0);
  });
});

describe("captionHeadline", () => {
  it("keeps only the opening line", () => {
    assert.equal(
      captionHeadline("Primera línea\n\nSegunda línea", "fallback"),
      "Primera línea",
    );
  });

  it("trims what it keeps", () => {
    assert.equal(captionHeadline("  Hola  \nadiós", "fallback"), "Hola");
  });

  it("falls back on an absent or blank caption", () => {
    assert.equal(captionHeadline(null, "fallback"), "fallback");
    assert.equal(captionHeadline("", "fallback"), "fallback");
    assert.equal(captionHeadline("   \nhola", "fallback"), "fallback");
  });
});

describe("loadInstagramPosts", () => {
  const OPTIONS = {
    apiBase: "https://graph.instagram.com/v23.0",
    count: 4,
    revalidateSeconds: 3600,
  };

  // The failure paths all warn; keep the test output readable.
  const realWarn = console.warn;
  before(() => {
    console.warn = () => {};
  });
  after(() => {
    console.warn = realWarn;
  });

  function respondWith(body: unknown, ok = true) {
    const calls: string[] = [];
    const fetchImpl = (async (url: string) => {
      calls.push(String(url));
      return {
        ok,
        status: ok ? 200 : 401,
        statusText: ok ? "OK" : "Unauthorized",
        json: async () => body,
      };
    }) as unknown as typeof fetch;

    return { fetchImpl, calls };
  }

  it("asks for the fields and limit the feed needs", async () => {
    const { fetchImpl, calls } = respondWith({ data: [IMAGE] });
    await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl });

    assert.equal(calls.length, 1);
    assert.match(calls[0], /^https:\/\/graph\.instagram\.com\/v23\.0\/me\/media\?/);
    assert.match(calls[0], /thumbnail_url/);
    assert.match(calls[0], /children%7Bmedia_url,media_type%7D|children\{media_url,media_type\}/);
    assert.match(calls[0], /access_token=tok/);
  });

  it("returns the normalised posts on a good response", async () => {
    const { fetchImpl } = respondWith({ data: [IMAGE, REEL] });
    const posts = await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl });

    assert.deepEqual(posts?.map((post) => post.id), ["1", "2"]);
  });

  it("never calls the API without a token", async () => {
    const { fetchImpl, calls } = respondWith({ data: [IMAGE] });
    const posts = await loadInstagramPosts({
      ...OPTIONS,
      token: undefined,
      fetchImpl,
    });

    assert.equal(posts, null);
    assert.equal(calls.length, 0);
  });

  it("returns null when the token is rejected", async () => {
    const { fetchImpl } = respondWith({ error: {} }, false);
    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "expired", fetchImpl }),
      null,
    );
  });

  it("swallows a network error instead of taking the page down", async () => {
    const fetchImpl = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;

    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl }),
      null,
    );
  });

  it("swallows a malformed body", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    })) as unknown as typeof fetch;

    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl }),
      null,
    );
  });

  it("returns null rather than an empty feed", async () => {
    const empty = respondWith({ data: [] });
    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl: empty.fetchImpl }),
      null,
    );

    const missing = respondWith({});
    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl: missing.fetchImpl }),
      null,
    );

    const unusable = respondWith({ data: [{ ...REEL, thumbnail_url: undefined }] });
    assert.equal(
      await loadInstagramPosts({ ...OPTIONS, token: "tok", fetchImpl: unusable.fetchImpl }),
      null,
    );
  });
});
