"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneIdentifier, phoneAliasEmail } from "@/lib/authIdentifier";

function safeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 100);
}

export async function createPhoneAccount({ phone, password, fullName = "" }) {
  const normalizedPhone = normalizePhoneIdentifier(phone);
  if (!normalizedPhone) {
    throw new Error("Masukkan nomor telepon Indonesia yang valid.");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Kata sandi harus berisi minimal 8 karakter.");
  }

  const aliasEmail = phoneAliasEmail(normalizedPhone);
  const admin = await createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: aliasEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: safeName(fullName) || null,
      phone_number: normalizedPhone,
      login_identifier: "phone",
    },
  });

  if (error) {
    if (/already been registered|already exists|duplicate/i.test(error.message || "")) {
      throw new Error("Nomor telepon ini sudah terdaftar. Silakan masuk.");
    }
    throw new Error("Pendaftaran nomor telepon belum berhasil. Coba beberapa saat lagi.");
  }

  if (!data.user?.id) {
    throw new Error("Akun belum dapat dibuat. Coba beberapa saat lagi.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      phone_number: normalizedPhone,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error("Profil akun belum dapat disiapkan. Silakan coba kembali.");
  }

  return { aliasEmail, phone: normalizedPhone };
}
