import Icon from './Icon'

export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-24 h-24 rounded-full bg-cotton-warm flex items-center justify-center text-warm-gray mb-4">
        <Icon name="search" size={40} />
      </div>
      <h3 className="font-semibold text-xl text-noir mb-2">{title || 'Tidak ada hasil'}</h3>
      <p className="text-base text-cool-gray max-w-md">{description || 'Coba ubah kata kunci atau filter Anda.'}</p>
    </div>
  )
}