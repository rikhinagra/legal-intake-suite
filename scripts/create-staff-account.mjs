#!/usr/bin/env node
// Creates a staff (agent/attorney/admin) login directly, bypassing email
// confirmation. There's no public self-serve signup page yet — see
// PLAN.md for why (new accounts default to 'agent' role; promoting to
// attorney/admin is a manual step until an admin invite UI exists).
//
// Usage:
//   node scripts/create-staff-account.mjs <email> <password> "<full name>" <agent|attorney|admin>

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");

function getEnv(key) {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : undefined;
}

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const secretKey = getEnv("SUPABASE_SECRET_KEY");

const [, , email, password, fullName, role] = process.argv;

if (!email || !password || !fullName || !role) {
  console.error(
    'Usage: node scripts/create-staff-account.mjs <email> <password> "<full name>" <agent|attorney|admin>'
  );
  process.exit(1);
}
if (!["agent", "attorney", "admin"].includes(role)) {
  console.error("role must be one of: agent, attorney, admin");
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (error) {
  console.error("Failed to create user:", error.message);
  process.exit(1);
}

const userId = data.user.id;

// The DB trigger already created a profiles row with role='agent' by default.
const { error: updateError } = await supabase
  .from("profiles")
  .update({ role })
  .eq("id", userId);

if (updateError) {
  console.error("User created but failed to set role:", updateError.message);
  process.exit(1);
}

console.log(`Created ${role} account: ${email} (id ${userId})`);
