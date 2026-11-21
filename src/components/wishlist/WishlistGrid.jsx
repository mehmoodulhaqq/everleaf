import WishlistCard from './WishlistCard'

function WishlistGrid({ items = [], onEdit, onMoveToLibrary, onRemove }) {
  if (!items.length) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onMoveToLibrary={onMoveToLibrary}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default WishlistGrid
