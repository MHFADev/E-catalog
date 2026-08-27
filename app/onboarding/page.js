import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import { isAutoUsername } from "@/lib/username";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

export const metadata = { title: "Lengkapi Profil" };

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/onboarding");
  if (profile.is_onboarded) redirect("/");

  const lastChange = profile.username_updated_at
    ? new Date(profile.username_updated_at).getTime()
    : null;
  const notRenamedYet = isAutoUsername(profile.username);
  const canRenameUsername =
    notRenamedYet || !lastChange || Date.now() - lastChange >= TWO_YEARS_MS;

  return (
    <div className="relative min-h-[80vh] bg-cream flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* dekorasi background ala aplikasi mobile */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-forest/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-langit/15 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-noir tracking-tight">
            Lengkapi <span className="text-forest">Profil Kamu</span>
          </h1>
          <p className="text-xs md:text-sm text-warm-gray mt-1">
            Hanya beberapa langkah — usernamemu dipakai untuk komentar, dan
            nomor HP otomatis terisi saat checkout.
          </p>
        </div>
        <OnboardingWizard
          profile={profile}
          canRenameUsername={canRenameUsername}
        />
      </div>
    </div>
  );
}
