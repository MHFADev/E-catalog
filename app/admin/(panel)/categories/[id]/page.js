import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CategoryForm from "../CategoryForm";

export default async function AdminEditCategoryPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-xs md:text-sm text-warm-gray hover:text-forest mb-4 inline-block"
      >
        â† Kembali ke daftar kategori
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Kategori: {category.name}
      </h2>
      <div className="bg-white rounded-2xl border border-cream-warm p-4 md:p-5 max-w-xl">
        <CategoryForm initial={category} />
      </div>
    </div>
  );
}
