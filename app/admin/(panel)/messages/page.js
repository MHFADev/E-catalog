import { createClient } from "@/lib/supabase/server";
import { toggleMessageRead, deleteMessage } from "../actions";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kotak Pesan ({messages?.length ?? 0})
      </h2>

      <div className="space-y-3">
        {messages?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cotton-warm p-6 text-center">
            Belum ada pesan masuk.
          </p>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-2xl p-4 border transition-colors ${
              m.is_read ? "border-cotton-warm" : "border-cherry/40"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <span className="text-sm font-semibold text-noir">{m.name}</span>
              <a
                href={`mailto:${m.email}`}
                className="text-xs text-cherry hover:underline"
              >
                {m.email}
              </a>
              <span className="text-[10px] md:text-xs text-warm-gray">
                {new Date(m.created_at).toLocaleString("id-ID")}
              </span>
              {!m.is_read && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cherry text-white">
                  Baru
                </span>
              )}
            </div>
            <div className="text-xs text-noir-soft font-medium mb-1">
              {m.subject}
            </div>
            <p className="text-xs md:text-sm text-cool-gray leading-relaxed mb-2">
              {m.message}
            </p>

            <div className="flex flex-wrap gap-2">
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="value" value={String(!m.is_read)} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all">
                  {m.is_read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cherry/10 text-cherry hover:bg-cherry/20 transition-all">
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
