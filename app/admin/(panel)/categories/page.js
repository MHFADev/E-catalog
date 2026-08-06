import Link from "next/link";
import Icon from "@/components/common/Icon";
import { createClient } from "@/lib/supabase/server";
import CategoryForm from "./CategoryForm";
import { deleteCategory } from "../actions";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Kategori ({categories?.length ?? 0})
      </h2>

      <details className="bg-white rounded-2xl border border-cream-warm mb-6 overflow-hidden">
        <summary className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-forest cursor-pointer hover:bg-cream-warm/50 transition-colors">
          <Icon name="plus" size={14} /> Tambah Kategori Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cream-warm">
          <CategoryForm />
        </div>
      </details>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories?.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-warm mb-2">
              {c.image && (
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="text-sm font-semibold text-noir">{c.name}</div>
            <div className="text-[11px] text-warm-gray mb-2 truncate">
              {c.description || "—"}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/categories/${c.id}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cream-warm text-noir-soft hover:bg-cream transition-all"
              >
                Edit
              </Link>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-forest/10 text-forest hover:bg-forest/20 transition-all">
                  Hapus
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
