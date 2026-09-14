const AUTO_USERNAME_RE = /^user\d{3,}$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function isAutoUsername(username) {
  return typeof username === "string" && AUTO_USERNAME_RE.test(username);
}

export function slugifyUsername(value) {
  const ascii = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  let slug = ascii.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (slug.length < 3) slug = `${slug || "umkm"}_store`;
  return slug.slice(0, 20).replace(/_+$/g, "") || "umkm_store";
}

export function allocateUsername(usedUsernames, seed) {
  const used = new Set(
    [...(usedUsernames || [])]
      .map((value) => String(value || "").toLowerCase())
      .filter(Boolean),
  );
  const base = slugifyUsername(seed);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    const suffixText = `_${suffix}`;
    candidate = `${base.slice(0, 20 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }
  return USERNAME_RE.test(candidate) ? candidate : "umkm_store";
}

export async function ensureUsername(admin, userId, seed) {
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, username")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;

  if (profile?.username && !isAutoUsername(profile.username)) {
    return profile.username;
  }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, username")
    .limit(10000);
  if (profilesError) throw profilesError;

  const used = (profiles || [])
    .filter((item) => item.id !== userId)
    .map((item) => item.username);
  const username = allocateUsername(used, seed);
  const { error: updateError } = await admin
    .from("profiles")
    .update({ username, username_updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (updateError) throw updateError;
  return username;
}
