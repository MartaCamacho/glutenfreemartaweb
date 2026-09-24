import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  isAmazonUrl,
  loadAmazonPicks,
  parseCsv,
  parsePicksCsv,
} from "./amazon-picks.ts";

const HEADER =
  "url,title,tag,description_es,description_en,description_ca,active";
const ROW = "https://link.amazon/B0f44b9Ee,Carmencita Thai Coffee,Especias,Especias que sí,,,TRUE";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/x/pub?output=csv";

function respond(body: string, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: "",
    text: async () => body,
  } as unknown as Response;
}

describe("parseCsv", () => {
  it("keeps commas inside quoted fields", () => {
    assert.deepEqual(parseCsv('a,"b,c",d'), [["a", "b,c", "d"]]);
  });

  it("unescapes doubled quotes", () => {
    assert.deepEqual(parseCsv('"say ""hi""",b'), [['say "hi"', "b"]]);
  });

  it("keeps newlines inside quoted fields", () => {
    assert.deepEqual(parseCsv('"one\ntwo",b'), [["one\ntwo", "b"]]);
  });

  it("handles CRLF rows and a trailing newline", () => {
    assert.deepEqual(parseCsv("a,b\r\nc,d\r\n"), [
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("keeps empty trailing cells", () => {
    assert.deepEqual(parseCsv("a,,"), [["a", "", ""]]);
  });
});

describe("isAmazonUrl", () => {
  it("accepts the shapes Amazon actually hands out", () => {
    for (const url of [
      "https://link.amazon/B0f44b9Ee",
      "https://www.amazon.es/dp/B0F44B9EE",
      "https://amazon.com/dp/x",
      "https://www.amazon.co.uk/dp/x",
      "https://amzn.to/abc",
      "https://a.co/d/abc",
    ]) {
      assert.equal(isAmazonUrl(url), true, url);
    }
  });

  it("rejects lookalikes and anything that is not https", () => {
    for (const url of [
      "https://amazon.evil.com/dp/x",
      "https://notamazon.com",
      "https://amazon.com.attacker.net/dp/x",
      "http://www.amazon.es/dp/x",
      "javascript:alert(1)",
      "not a url",
      "",
    ]) {
      assert.equal(isAmazonUrl(url), false, url);
    }
  });
});

describe("parsePicksCsv", () => {
  it("reads a row", () => {
    const picks = parsePicksCsv(`${HEADER}\n${ROW}`);

    assert.deepEqual(picks, [
      {
        url: "https://link.amazon/B0f44b9Ee",
        title: "Carmencita Thai Coffee",
        tag: "Especias",
        description: {
          es: "Especias que sí",
          en: "Especias que sí",
          ca: "Especias que sí",
        },
      },
    ]);
  });

  it("finds the columns by name, not position", () => {
    const picks = parsePicksCsv(
      "Title,ACTIVE,url\nCarmencita,TRUE,https://link.amazon/B0f44b9Ee",
    );

    assert.equal(picks?.[0]?.title, "Carmencita");
  });

  it("keeps a translation that is filled in", () => {
    const picks = parsePicksCsv(
      `${HEADER}\nhttps://amzn.to/x,Thing,,Español,English,,TRUE`,
    );

    assert.equal(picks?.[0]?.description.en, "English");
    assert.equal(picks?.[0]?.description.ca, "Español");
  });

  it("drops rows switched off, untitled, or not pointing at Amazon", () => {
    const picks = parsePicksCsv(
      [
        HEADER,
        "https://amzn.to/a,Hidden,,x,,,FALSE",
        "https://amzn.to/b,,,x,,,TRUE",
        "https://example.com/c,Elsewhere,,x,,,TRUE",
        "https://amzn.to/d,Kept,,x,,,",
      ].join("\n"),
    );

    assert.deepEqual(picks?.map((pick) => pick.title), ["Kept"]);
  });

  it("returns an empty list for a sheet with no rows, not null", () => {
    assert.deepEqual(parsePicksCsv(HEADER), []);
  });

  it("returns null when the columns are not the picks sheet", () => {
    assert.equal(parsePicksCsv("<!doctype html><html>"), null);
    assert.equal(parsePicksCsv("name,price\nThing,3"), null);
    assert.equal(parsePicksCsv(""), null);
  });
});

describe("loadAmazonPicks", () => {
  const warnings: unknown[][] = [];
  const realWarn = console.warn;

  before(() => {
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };
  });

  after(() => {
    console.warn = realWarn;
  });

  it("asks for the sheet with the revalidate window", async () => {
    let seen: [string, RequestInit] | null = null;

    const picks = await loadAmazonPicks({
      sheetUrl: SHEET_URL,
      revalidateSeconds: 600,
      fetchImpl: (async (url: string, init: RequestInit) => {
        seen = [url, init];
        return respond(`${HEADER}\n${ROW}`);
      }) as unknown as typeof fetch,
    });

    assert.equal(picks?.length, 1);
    assert.equal(seen![0], SHEET_URL);
    assert.deepEqual(seen![1], { next: { revalidate: 600 } });
  });

  it("returns null without a configured sheet", async () => {
    const picks = await loadAmazonPicks({
      sheetUrl: undefined,
      revalidateSeconds: 600,
      fetchImpl: (() => {
        throw new Error("should not be called");
      }) as unknown as typeof fetch,
    });

    assert.equal(picks, null);
  });

  it("returns null when Google says no", async () => {
    const picks = await loadAmazonPicks({
      sheetUrl: SHEET_URL,
      revalidateSeconds: 600,
      fetchImpl: (async () =>
        respond("", { ok: false, status: 404 })) as unknown as typeof fetch,
    });

    assert.equal(picks, null);
  });

  it("returns null when the request throws", async () => {
    const picks = await loadAmazonPicks({
      sheetUrl: SHEET_URL,
      revalidateSeconds: 600,
      fetchImpl: (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch,
    });

    assert.equal(picks, null);
  });
});
