/**
 * Reading the Amazon recommendations out of a published Google Sheet.
 *
 * Kept free of React and Next imports so it can be exercised by `npm test`
 * under plain node. `lib/amazon.ts` wraps this with request-level caching and
 * the fallback list.
 */

export type AmazonPick = {
  url: string;
  title: string;
  /** Optional pill on the card. Empty means no pill. */
  tag: string;
  /** Blank translations already resolved to Spanish by the parser. */
  description: { es: string; en: string; ca: string };
};

export type LoadOptions = {
  sheetUrl: string | undefined;
  revalidateSeconds: number;
  fetchImpl?: typeof fetch;
};

/** Without these the file is not the picks sheet, whatever else it contains. */
const REQUIRED_COLUMNS = ["url", "title"];

/** Short domains Amazon hands out that carry no "amazon" label at all. */
const SHORT_DOMAINS = ["amzn.to", "amzn.eu", "a.co"];

/**
 * A spreadsheet anyone can edit on a phone is not a trusted source: this is
 * what stops a mistyped or mis-pasted URL from shipping under a button that
 * says "see it on Amazon". A rejected row drops out; the section survives.
 */
export function isAmazonUrl(value: string): boolean {
  let host: string;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    host = url.hostname.toLowerCase();
  } catch {
    return false;
  }

  if (SHORT_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
    return true;
  }

  // Amazon has to own the registrable domain, so `amazon.evil.com` fails:
  // the `.amazon` gTLD (link.amazon), then amazon.es, then amazon.co.uk.
  const labels = host.split(".");
  return (
    labels.at(-1) === "amazon" ||
    labels.at(-2) === "amazon" ||
    (labels.at(-3) === "amazon" && (labels.at(-2)?.length ?? 0) <= 3)
  );
}

/**
 * Google quotes any cell holding a comma, and these cells hold sentences, so
 * splitting on commas would shred half the descriptions.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = true;
      i += 1;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** Anything but an explicit no is visible — an empty cell is the normal case. */
function isVisible(value: string): boolean {
  return !["false", "no", "0"].includes(value.toLowerCase());
}

/**
 * `null` means "this is not the picks sheet" — a login page, the wrong tab, a
 * publish that broke. An empty array means the sheet is fine and holds nothing
 * to show, which is a real thing to want. Both hide the section; the two stay
 * distinct so the caller can log one and not the other.
 */
export function parsePicksCsv(text: string): AmazonPick[] | null {
  const [header, ...rows] = parseCsv(text);
  if (!header) return null;

  // By name, not position, so reordering the columns in the sheet is harmless.
  const columns = new Map(
    header.map((name, index) => [name.trim().toLowerCase(), index]),
  );
  if (!REQUIRED_COLUMNS.every((name) => columns.has(name))) return null;

  const cell = (row: string[], name: string) => {
    const index = columns.get(name);
    return index === undefined ? "" : (row[index] ?? "").trim();
  };

  const picks: AmazonPick[] = [];

  for (const row of rows) {
    const url = cell(row, "url");
    const title = cell(row, "title");
    if (!title || !isAmazonUrl(url)) continue;
    if (!isVisible(cell(row, "active"))) continue;

    const es = cell(row, "description_es");

    picks.push({
      url,
      title,
      tag: cell(row, "tag"),
      description: {
        es,
        en: cell(row, "description_en") || es,
        ca: cell(row, "description_ca") || es,
      },
    });
  }

  return picks;
}

/**
 * Never throws. No sheet configured, a Google outage, an unpublished sheet or
 * a file that parses into something else all return null, which the section
 * reads as "render nothing" rather than taking /links down.
 */
export async function loadAmazonPicks({
  sheetUrl,
  revalidateSeconds,
  fetchImpl = fetch,
}: LoadOptions): Promise<AmazonPick[] | null> {
  if (!sheetUrl) return null;

  try {
    const response = await fetchImpl(sheetUrl, {
      next: { revalidate: revalidateSeconds },
    } as RequestInit);

    if (!response.ok) {
      console.warn(
        `Amazon picks unavailable: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    return parsePicksCsv(await response.text());
  } catch (error) {
    console.warn("Amazon picks unavailable:", error);
    return null;
  }
}
