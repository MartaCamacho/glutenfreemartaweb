import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  loadMediaKitStats,
  loadPostMetrics,
  readBreakdown,
  readPostMetrics,
  readTotals,
  selectTopPosts,
  statsWindow,
  summariseAudience,
} from "./instagram-stats-api.ts";

/** Shaped like the real `/me/insights` reply, trimmed to what we read. */
function totalsBody(values: Record<string, number>) {
  return {
    data: Object.entries(values).map(([name, value]) => ({
      name,
      period: "day",
      total_value: { value },
    })),
  };
}

function breakdownBody(keys: string[], results: [string[], number][]) {
  return {
    data: [
      {
        name: "follower_demographics",
        total_value: {
          breakdowns: [
            {
              dimension_keys: keys,
              results: results.map(([dimension_values, value]) => ({
                dimension_values,
                value,
              })),
            },
          ],
        },
      },
    ],
  };
}

const AGE_GENDER = breakdownBody(
  ["age", "gender"],
  [
    [["35-44", "F"], 40],
    [["45-54", "F"], 20],
    [["35-44", "M"], 10],
    [["25-34", "U"], 30],
  ],
);

const COUNTRIES = breakdownBody(
  ["country"],
  [
    [["ES"], 77],
    [["AR"], 9],
    [["CL"], 3],
    [["VE"], 2],
    [["IT"], 1],
  ],
);

describe("statsWindow", () => {
  it("spans the requested days back from now, in unix seconds", () => {
    const { since, until } = statsWindow(new Date("2026-08-20T00:00:00Z"), 90);

    assert.equal(until, 1787184000);
    assert.equal(until - since, 90 * 86400);
  });
});

describe("readTotals", () => {
  it("renames Meta's metrics to the ones the page uses", () => {
    const totals = readTotals(
      totalsBody({
        reach: 61714,
        views: 137306,
        total_interactions: 5044,
        shares: 253,
        saves: 184,
        profile_views: 445,
      }),
    );

    assert.deepEqual(totals, {
      reach: 61714,
      views: 137306,
      interactions: 5044,
      shares: 253,
      saves: 184,
      profileViews: 445,
    });
  });

  it("defaults a missing metric to zero rather than dropping the section", () => {
    assert.deepEqual(readTotals(totalsBody({ reach: 10 })), {
      reach: 10,
      views: 0,
      interactions: 0,
      shares: 0,
      saves: 0,
      profileViews: 0,
    });
  });

  it("gives up without reach, the one number that has to be there", () => {
    assert.equal(readTotals(totalsBody({ views: 10 })), null);
    assert.equal(readTotals({ data: [] }), null);
    assert.equal(readTotals({}), null);
  });
});

describe("readBreakdown", () => {
  it("flattens the nested reply into rows plus their dimension names", () => {
    const breakdown = readBreakdown(COUNTRIES);

    assert.deepEqual(breakdown?.keys, ["country"]);
    assert.equal(breakdown?.rows.length, 5);
    assert.deepEqual(breakdown?.rows[0], { values: ["ES"], value: 77 });
  });

  it("skips rows with no value instead of counting them as zero", () => {
    const body = breakdownBody(["country"], [[["ES"], 5]]);
    body.data[0].total_value.breakdowns[0].results.push({
      dimension_values: ["AR"],
      value: undefined as unknown as number,
    });

    assert.equal(readBreakdown(body)?.rows.length, 1);
  });

  it("returns null when there is nothing to read", () => {
    assert.equal(readBreakdown({ data: [] }), null);
    assert.equal(readBreakdown(breakdownBody(["country"], [])), null);
  });
});

describe("summariseAudience", () => {
  const age = readBreakdown(AGE_GENDER);
  const country = readBreakdown(COUNTRIES);

  it("counts women against every follower, not only the gendered ones", () => {
    // 60 of 100 are F; over the 70 Instagram could gender it would be 86%.
    assert.equal(summariseAudience(age, country, 4)?.womenShare, 60);
  });

  it("picks the leading age range across genders", () => {
    // 35-44 totals 50 once F and M are added up; 45-54 only reaches 20.
    assert.deepEqual(summariseAudience(age, country, 4)?.topAge, {
      range: "35-44",
      share: 50,
    });
  });

  it("finds its dimensions by name, whatever order they arrive in", () => {
    const swapped = readBreakdown(
      breakdownBody(
        ["gender", "age"],
        [
          [["F", "35-44"], 60],
          [["M", "25-34"], 40],
        ],
      ),
    );

    const summary = summariseAudience(swapped, null, 4);
    assert.equal(summary?.womenShare, 60);
    assert.equal(summary?.topAge?.range, "35-44");
  });

  it("ranks countries by share and keeps only the top few", () => {
    assert.deepEqual(summariseAudience(age, country, 3)?.countries, [
      { code: "ES", share: 84 },
      { code: "AR", share: 10 },
      { code: "CL", share: 3 },
    ]);
  });

  it("survives half the demographics being missing", () => {
    assert.deepEqual(summariseAudience(null, country, 1), {
      womenShare: 0,
      topAge: null,
      countries: [{ code: "ES", share: 84 }],
    });
    assert.deepEqual(summariseAudience(age, null, 4)?.countries, []);
    assert.equal(summariseAudience(null, null, 4), null);
  });
});

describe("readPostMetrics", () => {
  it("keys metrics by media id and maps `saved` to saves", () => {
    const metrics = readPostMetrics({
      data: [
        {
          id: "1",
          insights: {
            data: [
              { name: "reach", values: [{ value: 3625 }] },
              { name: "likes", values: [{ value: 64 }] },
              { name: "comments", values: [{ value: 19 }] },
              { name: "shares", values: [{ value: 38 }] },
              { name: "saved", values: [{ value: 27 }] },
            ],
          },
        },
      ],
    });

    assert.deepEqual(metrics.get("1"), {
      reach: 3625,
      likes: 64,
      comments: 19,
      shares: 38,
      saves: 27,
    });
  });

  it("skips posts Insights returned nothing for", () => {
    const metrics = readPostMetrics({
      data: [{ id: "1" }, { id: "2", insights: { data: [] } }, { insights: {} }],
    });

    assert.equal(metrics.size, 0);
  });
});

describe("selectTopPosts", () => {
  const posts = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const metrics = new Map([
    ["a", { reach: 400, likes: 0, comments: 0, shares: 0, saves: 0 }],
    ["b", { reach: 7593, likes: 0, comments: 0, shares: 0, saves: 0 }],
    ["c", { reach: 3625, likes: 0, comments: 0, shares: 0, saves: 0 }],
  ]);

  it("ranks by reach rather than keeping Instagram's order", () => {
    assert.deepEqual(
      selectTopPosts(posts, metrics, 3).map((ranked) => ranked.post.id),
      ["b", "c", "a"],
    );
  });

  it("keeps only the requested number", () => {
    assert.equal(selectTopPosts(posts, metrics, 2).length, 2);
  });

  it("drops posts with no metrics instead of ranking them as zero", () => {
    const partial = new Map([metrics.entries().next().value!]);
    const top = selectTopPosts(posts, partial, 3);

    assert.deepEqual(
      top.map((ranked) => ranked.post.id),
      ["a"],
    );
  });
});

describe("loadMediaKitStats", () => {
  const OPTIONS = {
    apiBase: "https://graph.instagram.com/v23.0",
    windowDays: 90,
    countryCount: 4,
    revalidateSeconds: 21600,
    now: new Date("2026-08-20T00:00:00Z"),
  };

  const realWarn = console.warn;
  before(() => {
    console.warn = () => {};
  });
  after(() => {
    console.warn = realWarn;
  });

  /** Routes each of the four calls by what the URL asks for. */
  function respond(
    handler: (url: string) => { ok?: boolean; body: unknown },
  ) {
    const calls: string[] = [];
    const fetchImpl = (async (url: string) => {
      calls.push(String(url));
      const { ok = true, body } = handler(String(url));
      return {
        ok,
        status: ok ? 200 : 400,
        statusText: ok ? "OK" : "Bad Request",
        json: async () => body,
      };
    }) as unknown as typeof fetch;

    return { fetchImpl, calls };
  }

  function everything(url: string) {
    if (url.includes("/me?")) {
      return { body: { followers_count: 1078, media_count: 102 } };
    }
    if (url.includes("breakdown=age,gender")) return { body: AGE_GENDER };
    if (url.includes("breakdown=country")) return { body: COUNTRIES };
    return { body: totalsBody({ reach: 61714, views: 137306 }) };
  }

  it("puts the profile, the totals and both breakdowns together", async () => {
    const { fetchImpl } = respond(everything);
    const stats = await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl });

    assert.equal(stats?.followers, 1078);
    assert.equal(stats?.posts, 102);
    assert.equal(stats?.totals.views, 137306);
    assert.equal(stats?.audience?.womenShare, 60);
    assert.equal(stats?.audience?.countries[0].code, "ES");
  });

  it("asks for the window Meta still has, in unix seconds", async () => {
    const { fetchImpl, calls } = respond(everything);
    await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl });

    const insights = calls.find((url) => url.includes("metric=reach"))!;
    assert.match(insights, /since=1779408000&until=1787184000/);
    assert.match(insights, /metric_type=total_value/);
  });

  it("still publishes the numbers when demographics fail", async () => {
    const { fetchImpl } = respond((url) =>
      url.includes("follower_demographics")
        ? { ok: false, body: { error: {} } }
        : everything(url),
    );
    const stats = await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl });

    assert.equal(stats?.followers, 1078);
    assert.equal(stats?.audience, null);
  });

  it("gives up when the totals or the follower count are missing", async () => {
    const noTotals = respond((url) =>
      url.includes("metric=reach") ? { ok: false, body: {} } : everything(url),
    );
    assert.equal(
      await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl: noTotals.fetchImpl }),
      null,
    );

    const noProfile = respond((url) =>
      url.includes("/me?") ? { body: {} } : everything(url),
    );
    assert.equal(
      await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl: noProfile.fetchImpl }),
      null,
    );
  });

  it("never calls the API without a token", async () => {
    const { fetchImpl, calls } = respond(everything);
    const stats = await loadMediaKitStats({
      ...OPTIONS,
      token: undefined,
      fetchImpl,
    });

    assert.equal(stats, null);
    assert.equal(calls.length, 0);
  });

  it("swallows a network error instead of taking the page down", async () => {
    const fetchImpl = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;

    assert.equal(
      await loadMediaKitStats({ ...OPTIONS, token: "tok", fetchImpl }),
      null,
    );
  });
});

describe("loadPostMetrics", () => {
  const OPTIONS = {
    apiBase: "https://graph.instagram.com/v23.0",
    limit: 12,
    revalidateSeconds: 21600,
  };

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
        status: ok ? 200 : 400,
        statusText: ok ? "OK" : "Bad Request",
        json: async () => body,
      };
    }) as unknown as typeof fetch;

    return { fetchImpl, calls };
  }

  const BODY = {
    data: [
      { id: "1", insights: { data: [{ name: "reach", values: [{ value: 400 }] }] } },
    ],
  };

  it("asks the media edge for nested insights, on its own request", async () => {
    const { fetchImpl, calls } = respondWith(BODY);
    await loadPostMetrics({ ...OPTIONS, token: "tok", fetchImpl });

    // Separate from the feed loader on purpose: a nested insights error fails
    // the whole media call, and the home page must not go down with it.
    assert.equal(calls.length, 1);
    assert.match(calls[0], /insights\.metric\(reach,likes,comments,shares,saved\)/);
    assert.match(calls[0], /limit=12/);
  });

  it("returns null when Insights refuses the nested field", async () => {
    const { fetchImpl } = respondWith({ error: {} }, false);
    assert.equal(
      await loadPostMetrics({ ...OPTIONS, token: "tok", fetchImpl }),
      null,
    );
  });

  it("returns null rather than an empty map", async () => {
    const { fetchImpl } = respondWith({ data: [{ id: "1" }] });
    assert.equal(
      await loadPostMetrics({ ...OPTIONS, token: "tok", fetchImpl }),
      null,
    );
  });
});
