'use client'

import { useGameStore } from '@/store/gameStore'

const INDUSTRY_LABELS = {
  cottonMill: 'Cotton',
  manufacturer: 'Manuf.',
  coalMine: 'Coal',
  ironWorks: 'Iron',
  brewery: 'Brew.',
  pottery: 'Pottery',
}

export function Hand ({ cards, playerId }) {
  const { selectedCard, setSelectedCard } = useGameStore()

  if (!cards || cards.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-stone-500">
        No cards in hand
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {cards.map(card => {
          const isSelected = selectedCard === card.id
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCard(isSelected ? null : card.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400 -translate-y-1'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {card.type === 'location' && (
                <span>{card.locationName}</span>
              )}
              {card.type === 'industry' && (
                <span>{INDUSTRY_LABELS[card.industry] || card.industry}</span>
              )}
              {card.type === 'wildLocation' && (
                <span className="text-amber-300">Wild Loc</span>
              )}
              {card.type === 'wildIndustry' && (
                <span className="text-amber-300">Wild Ind</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
