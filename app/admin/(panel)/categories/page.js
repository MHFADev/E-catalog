
import Icon from "@/components/common/Icon";
import { createAdminClient } from "@/lib/supabase/admin";
import CategoryForm from "./CategoryForm";
import CategoryActions from "./CategoryActions";

export default async function AdminCategoriesPage() {
  const supabase = await createAdminClient();
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

      {categories?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl p-4 border border-cream-warm"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-warm mb-2">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-warm-gray">
                    <Icon name={category.icon || "tag"} size={20} />
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-noir">{category.name}</div>
              <div className="text-[11px] text-warm-gray mb-2 truncate">
                {category.description || "Belum ada deskripsi."}
              </div>
              <CategoryActions categoryId={category.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cream-warm bg-white/70 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-noir">Belum ada kategori.</p>
          <p className="mt-1 text-xs text-warm-gray">Gunakan formulir di atas untuk membuat kategori pertama.</p>
        </div>
      )}
    </div>
  );
}
