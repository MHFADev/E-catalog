export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl overflow-hidden bg-white">
          <div className="w-full h-48 bg-gradient-to-r from-cotton-warm via-cotton to-cotton-warm bg-[length:200%_100%] animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-cotton-warm rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-cotton-warm rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Loader() {
  return (
    <div className="flex flex-col items-center py-16 gap-4">
      <div className="w-10 h-10 border-3 border-cotton border-t-cherry rounded-full animate-spin" />
      <p className="text-xs font-mono uppercase tracking-widest text-warm-gray">Memuat</p>
    </div>
  )
}