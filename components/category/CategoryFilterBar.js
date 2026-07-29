import CategoryChip from './CategoryChip'

export default function CategoryFilterBar({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map(cat => (
        <CategoryChip key={cat.id} category={cat} active={selected === cat.id} onClick={onSelect} />
      ))}
    </div>
  )
}