import ProductCard from './ProductCard'

export default function ProductGrid({ products, categories }) {
  const getCat = id => categories.find(c => c.id === id)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} category={getCat(p.categoryId)} />)}
    </div>
  )
}