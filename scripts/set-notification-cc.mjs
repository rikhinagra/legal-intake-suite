#!/usr/bin/env node
// Shows or changes the extra addresses that receive every agent notification
// (new-case emails), in addition to whoever currently holds the agent role.
//
// Usage:
//   node scripts/set-notification-cc.mjs                         show the current list
//   node scripts/set-notification-cc.mjs a@x.com,b@y.com         replace the list
//   node scripts/set-notification-cc.mjs none                    empty the list
//
// Runs against .env.local by default. For the live (production) project:
//   ENV_FILE=.env.production.local node scripts/set-notification-cc.mjs ...

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KEY = "agent_notification_cc";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.ENV_FILE
  ? path.resolve(process.env.ENV_FILE)
  : path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envFile, "utf8");
const getEnv = (key) => env.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1].trim();

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabase = createClient(url, getEnv("SUPABASE_SECRET_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: current, error: readError } = await supabase
  .from("app_settings")
  .select("value")
  .eq("key", KEY)
  .maybeSingle();
if (readError) {
  console.error("Could not read the setting:", readError.message);
  process.exit(1);
}
console.log(`Project: ${url}`);
console.log("Current extra recipients:", JSON.stringify(current?.value ?? []));

const arg = process.argv[2];
if (arg === undefined) process.exit(0);

const next =
  arg.toLowerCase() === "none"
    ? []
    : [...new Set(arg.split(",").map((e) => e.trim()).filter(Boolean))];
const bad = next.filter((e) => !EMAIL_PATTERN.test(e));
if (bad.length) {
  console.error("These do not look like email addresses:", bad.join(", "));
  process.exit(1);
}

const { error } = await supabase
  .from("app_settings")
  .upsert({ key: KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
if (error) {
  console.error("Could not save:", error.message);
  process.exit(1);
}
console.log("New extra recipients:    ", JSON.stringify(next));
