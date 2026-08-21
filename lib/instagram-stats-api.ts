/**
 * Instagram Insights: the audience numbers behind the media kit.
 *
 * Kept free of React and Next imports so it can be exercised by `npm test`
 * under plain node. `lib/instagram-stats.ts` wraps this with request caching.
 *
 * Two traps this module works around, both found against the live API:
 * asking for per-post metrics as a nested `insights` field fails the *whole*
 * media request when Insights hiccups, so it is a separate call from the one
 * the home feed depends on; and the metric is `saved` on a post but `saves` on
 * the account.
 */

export type AccountTotals = {
  reach: number;
  views: number;
  interactions: number;
  shares: number;
  saves: number;
  profileViews: number;
};

export type CountryShare = { code: string; share: number };

export type AudienceSummary = {
  womenShare: number;
  topAge: { range: string; share: number } | null;
  countries: CountryShare[];
};

export type MediaKitStats = {
  followers: number;
  posts: number;
  totals: AccountTotals;
  audience: AudienceSummary | null;
};

export type PostMetrics = {
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

const ACCOUNT_METRICS = [
  "reach",
  "views",
  "total_interactions",
  "shares",
  "saves",
  "profile_views",
].join(",");

const POST_METRICS = ["reach", "likes", "comments", "shares", "saved"].join(",");

const PROFILE_FIELDS = ["followers_count", "media_count"].join(",");

const DAY_SECONDS = 86400;

type InsightsBody = {
  data?: {
    name?: string;
    total_value?: {
      value?: number;
      breakdowns?: {
        dimension_keys?: string[];
        results?: { dimension_values?: string[]; value?: number }[];
      }[];
    };
  }[];
};

type MediaInsightsBody = {
  data?: {
    id?: string;
    insights?: { data?: { name?: string; values?: { value?: number }[] }[] };
  }[];
};

/** Unix seconds, which is what the `since`/`until` parameters expect. */
export function statsWindow(now: Date, days: number) {
  const until = Math.floor(now.getTime() / 1000);
  return { since: until - days * DAY_SECONDS, until };
}

function readValues(body: InsightsBody): Map<string, number> {
  const values = new Map<string, number>();

  for (const metric of body.data ?? []) {
    const value = metric.total_value?.value;
    if (metric.name && typeof value === "number") values.set(metric.name, value);
  }

  return values;
}

/**
 * Reach is the number a media kit cannot be published without; the rest degrade
 * to zero rather than blanking the whole section.
 */
export function readTotals(body: InsightsBody): AccountTotals | null {
  const values = readValues(body);
  const reach = values.get("reach");
  if (typeof reach !== "number") return null;

  return {
    reach,
    views: values.get("views") ?? 0,
    interactions: values.get("total_interactions") ?? 0,
    shares: values.get("shares") ?? 0,
    saves: values.get("saves") ?? 0,
    profileViews: values.get("profile_views") ?? 0,
  };
}

export type BreakdownRow = { values: string[]; value: number };

export type Breakdown = { keys: string[]; rows: BreakdownRow[] };

/** The dimension order is not promised, so callers look their key up by name. */
export function readBreakdown(body: InsightsBody): Breakdown | null {
  const breakdown = body.data?.[0]?.total_value?.breakdowns?.[0];
  if (!breakdown?.results?.length) return null;

  const rows = breakdown.results.flatMap((result) =>
    result.dimension_values && typeof result.value === "number"
      ? [{ values: result.dimension_values, value: result.value }]
      : [],
  );

  return rows.length > 0 ? { keys: breakdown.dimension_keys ?? [], rows } : null;
}

function totalBy(rows: BreakdownRow[], index: number): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const key = row.values[index];
    if (key !== undefined) totals.set(key, (totals.get(key) ?? 0) + row.value);
  }

  return totals;
}

function sum(values: Iterable<number>): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Percentages are over every follower, including the ones Instagram cannot
 * assign a gender to. Counting only the known ones would take "62% women" to
 * "89%" — flattering, and not a number to hand a brand.
 */
export function summariseAudience(
  ageGender: Breakdown | null,
  country: Breakdown | null,
  countryCount: number,
): AudienceSummary | null {
  if (!ageGender && !country) return null;

  let womenShare = 0;
  let topAge: AudienceSummary["topAge"] = null;

  if (ageGender) {
    const followers = sum(ageGender.rows.map((row) => row.value));
    const genderIndex = ageGender.keys.indexOf("gender");
    const ageIndex = ageGender.keys.indexOf("age");

    if (genderIndex >= 0) {
      womenShare = share(totalBy(ageGender.rows, genderIndex).get("F") ?? 0, followers);
    }

    if (ageIndex >= 0) {
      const ranges = [...totalBy(ageGender.rows, ageIndex)].sort(
        (a, b) => b[1] - a[1],
      );
      if (ranges[0]) {
        topAge = { range: ranges[0][0], share: share(ranges[0][1], followers) };
      }
    }
  }

  const countries: CountryShare[] = [];

  if (country) {
    const followers = sum(country.rows.map((row) => row.value));
    countries.push(
      ...[...totalBy(country.rows, 0)]
        .sort((a, b) => b[1] - a[1])
        .slice(0, countryCount)
        .map(([code, value]) => ({ code, share: share(value, followers) })),
    );
  }

  return { womenShare, topAge, countries };
}

export function readPostMetrics(
  body: MediaInsightsBody,
): Map<string, PostMetrics> {
  const metrics = new Map<string, PostMetrics>();

  for (const media of body.data ?? []) {
    if (!media.id) continue;

    const values = new Map<string, number>();
    for (const metric of media.insights?.data ?? []) {
      const value = metric.values?.[0]?.value;
      if (metric.name && typeof value === "number") values.set(metric.name, value);
    }

    if (values.size === 0) continue;

    metrics.set(media.id, {
      reach: values.get("reach") ?? 0,
      likes: values.get("likes") ?? 0,
      comments: values.get("comments") ?? 0,
      shares: values.get("shares") ?? 0,
      saves: values.get("saved") ?? 0,
    });
  }

  return metrics;
}

export type RankedPost<T> = { post: T; metrics: PostMetrics };

/**
 * Best by reach, not most recent: a media kit is an argument, and the argument
 * is what the account can do on a good day. Posts Insights knows nothing about
 * are left out rather than ranked as zeroes.
 */
export function selectTopPosts<T extends { id: string }>(
  posts: T[],
  metrics: Map<string, PostMetrics>,
  count: number,
): RankedPost<T>[] {
  return posts
    .flatMap((post) => {
      const found = metrics.get(post.id);
      return found ? [{ post, metrics: found }] : [];
    })
    .sort((a, b) => b.metrics.reach - a.metrics.reach)
    .slice(0, count);
}

export type StatsOptions = {
  token: string | undefined;
  apiBase: string;
  windowDays: number;
  countryCount: number;
  revalidateSeconds: number;
  now?: Date;
  fetchImpl?: typeof fetch;
};

/**
 * Never throws, like the feed loader. The difference is what the page does with
 * a null: the feed has sample posts to fall back on, a media kit has nothing
 * honest to show, so the numbers are omitted rather than invented.
 */
async function getJson<T>(
  url: string,
  revalidateSeconds: number,
  fetchImpl: typeof fetch,
): Promise<T | null> {
  try {
    const response = await fetchImpl(url, {
      next: { revalidate: revalidateSeconds },
    } as RequestInit);

    if (!response.ok) {
      console.warn(
        `Instagram insights unavailable: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn("Instagram insights unavailable:", error);
    return null;
  }
}

export async function loadMediaKitStats({
  token,
  apiBase,
  windowDays,
  countryCount,
  revalidateSeconds,
  now = new Date(),
  fetchImpl = fetch,
}: StatsOptions): Promise<MediaKitStats | null> {
  if (!token) return null;

  const { since, until } = statsWindow(now, windowDays);
  const insights = (metric: string, extra = "") =>
    `${apiBase}/me/insights?metric=${metric}&metric_type=total_value${extra}&access_token=${token}`;

  // Each call stands alone: demographics failing must not cost us the totals.
  const [profile, totals, ageGender, country] = await Promise.all([
    getJson<{ followers_count?: number; media_count?: number }>(
      `${apiBase}/me?fields=${PROFILE_FIELDS}&access_token=${token}`,
      revalidateSeconds,
      fetchImpl,
    ),
    getJson<InsightsBody>(
      insights(ACCOUNT_METRICS, `&period=day&since=${since}&until=${until}`),
      revalidateSeconds,
      fetchImpl,
    ),
    getJson<InsightsBody>(
      insights("follower_demographics", "&period=lifetime&breakdown=age,gender"),
      revalidateSeconds,
      fetchImpl,
    ),
    getJson<InsightsBody>(
      insights("follower_demographics", "&period=lifetime&breakdown=country"),
      revalidateSeconds,
      fetchImpl,
    ),
  ]);

  const followers = profile?.followers_count;
  const accountTotals = totals && readTotals(totals);

  if (typeof followers !== "number" || !accountTotals) return null;

  return {
    followers,
    posts: profile?.media_count ?? 0,
    totals: accountTotals,
    audience: summariseAudience(
      ageGender && readBreakdown(ageGender),
      country && readBreakdown(country),
      countryCount,
    ),
  };
}

export type PostMetricsOptions = {
  token: string | undefined;
  apiBase: string;
  limit: number;
  revalidateSeconds: number;
  fetchImpl?: typeof fetch;
};

export async function loadPostMetrics({
  token,
  apiBase,
  limit,
  revalidateSeconds,
  fetchImpl = fetch,
}: PostMetricsOptions): Promise<Map<string, PostMetrics> | null> {
  if (!token) return null;

  const fields = `id,insights.metric(${POST_METRICS})`;
  const body = await getJson<MediaInsightsBody>(
    `${apiBase}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
    revalidateSeconds,
    fetchImpl,
  );

  if (!body) return null;

  const metrics = readPostMetrics(body);
  return metrics.size > 0 ? metrics : null;
}
