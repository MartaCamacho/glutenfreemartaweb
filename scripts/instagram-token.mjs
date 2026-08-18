/**
 * Instagram token maintenance. No dependencies: run it with plain node.
 *
 *   npm run instagram:check     verify the token and print the posts the site would render
 *   npm run instagram:refresh   extend the token for another 60 days
 *
 * Reads INSTAGRAM_ACCESS_TOKEN from the environment or from .env.local.
 *
 * A third command, `rotate`, is for CI only: it reads the live token from
 * Vercel, refreshes it and writes it back, so nothing has to store a copy.
 * It needs VERCEL_TOKEN and VERCEL_PROJECT_ID (plus VERCEL_TEAM_ID on a team).
 */

import { readFileSync } from "node:fs";

const API_BASE = "https://graph.instagram.com/v23.0";

function readToken() {
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    return process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const match = env.match(/^INSTAGRAM_ACCESS_TOKEN=(.*)$/m);
    return match?.[1].trim().replace(/^["']|["']$/g, "") || undefined;
  } catch {
    return undefined;
  }
}

async function getJson(url) {
  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
  }

  return body;
}

async function check(token) {
  const me = await getJson(
    `${API_BASE}/me?fields=username,account_type,media_count&access_token=${token}`,
  );
  console.log(`Connected as @${me.username} (${me.account_type})\n`);

  const fields = "id,caption,media_type,permalink,timestamp";
  const { data } = await getJson(
    `${API_BASE}/me/media?fields=${fields}&limit=4&access_token=${token}`,
  );

  for (const post of data ?? []) {
    const date = new Date(post.timestamp).toISOString().slice(0, 10);
    const caption = (post.caption ?? "").split("\n")[0].slice(0, 70);
    console.log(`${date}  ${post.media_type.padEnd(15)}  ${caption}`);
    console.log(`            ${post.permalink}\n`);
  }
}

async function refresh(token) {
  const result = await getJson(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
  );

  const expires = new Date(Date.now() + result.expires_in * 1000);
  console.log(`New token (valid until ${expires.toDateString()}):\n`);
  console.log(result.access_token);
  console.log(
    "\nUpdate it in .env.local and in Vercel > Settings > Environment Variables.",
  );
}

const VERCEL_API = "https://api.vercel.com";

function vercelUrl(path, params = {}) {
  const url = new URL(path, VERCEL_API);
  if (process.env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function vercelFetch(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Vercel HTTP ${response.status}`);
  }

  return body;
}

/**
 * Vercel holds the only copy of the token, so CI reads it, refreshes it and
 * puts it back. Nothing else has to store a secret that expires.
 */
async function rotate() {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!process.env.VERCEL_TOKEN || !projectId) {
    throw new Error("VERCEL_TOKEN and VERCEL_PROJECT_ID are required");
  }

  const { envs } = await vercelFetch(
    vercelUrl(`/v10/projects/${projectId}/env`, { decrypt: "true" }),
  );
  const variable = envs.find((env) => env.key === "INSTAGRAM_ACCESS_TOKEN");

  if (!variable) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN is not set on the Vercel project");
  }

  const result = await getJson(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${variable.value}`,
  );

  await vercelFetch(vercelUrl(`/v9/projects/${projectId}/env/${variable.id}`), {
    method: "PATCH",
    body: JSON.stringify({ value: result.access_token }),
  });

  const expires = new Date(Date.now() + result.expires_in * 1000);
  console.log(`Token rotated on Vercel, valid until ${expires.toDateString()}.`);
}

const command = process.argv[2];

const COMMANDS = {
  check: (token) => check(token),
  refresh: (token) => refresh(token),
};

try {
  if (command === "rotate") {
    await rotate();
  } else if (COMMANDS[command]) {
    const token = readToken();
    if (!token) {
      console.error("INSTAGRAM_ACCESS_TOKEN is not set. See .env.example.");
      process.exit(1);
    }
    await COMMANDS[command](token);
  } else {
    console.error(
      "Usage: node scripts/instagram-token.mjs <check|refresh|rotate>",
    );
    process.exit(1);
  }
} catch (error) {
  console.error(`Failed: ${error.message}`);
  process.exit(1);
}
