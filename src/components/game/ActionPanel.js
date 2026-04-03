'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useGameActions } from '@/hooks/useGameActions'

const ACTIONS = [
  { type: 'build', label: 'Build', desc: 'Place an industry tile' },
  { type: 'network', label: 'Network', desc: 'Place a canal/rail link' },
  { type: 'develop', label: 'Develop', desc: 'Remove tiles from mat' },
  { type: 'sell', label: 'Sell', desc: 'Flip industry tiles' },
  { type: 'loan', label: 'Loan', desc: 'Take £30, lose 3 income levels' },
  { type: 'scout', label: 'Scout', desc: 'Discard 3 cards, get wilds' },
  { type: 'pass', label: 'Pass', desc: 'Skip this action' },
]

export function ActionPanel ({ gameState, playerId }) {
  const {
    selectedAction, setSelectedAction, selectedCard,
    setTargetingMode, selectedTargets, actionError, resetAction,
  } = useGameStore()
  const { build, network, develop, sell, loan, scout, pass } = useGameActions()
  const [buildIndustry, setBuildIndustry] = useState(null)
  const [developIndustries, setDevelopIndustries] = useState([])
  const [sellTiles, setSellTiles] = useState([])

  const myPlayer = gameState.players.find(p => p.id === playerId)

  const handleActionSelect = (actionType) => {
    resetAction()
    setSelectedAction(actionType)

    switch (actionType) {
      case 'build':
        setTargetingMode('location')
        break
      case 'network':
        setTargetingMode('connection')
        break
      default:
        setTargetingMode(null)
    }
  }

  const handleConfirm = () => {
    if (!selectedCard) return

    switch (selectedAction) {
      case 'build': {
        const target = selectedTargets.find(t => t.type === 'location')
        if (target && buildIndustry) {
          build(selectedCard, target.id, buildIndustry)
        }
        break
      }
      case 'network': {
        const conns = selectedTargets.filter(t => t.type === 'connection').map(t => t.id)
        if (conns.length > 0) {
          network(selectedCard, conns)
        }
        break
      }
      case 'develop':
        if (developIndustries.length > 0) {
          develop(selectedCard, developIndustries)
        }
        break
      case 'sell':
        if (sellTiles.length > 0) {
          sell(selectedCard, sellTiles)
        }
        break
      case 'loan':
        loan(selectedCard)
        break
      case 'scout': {
        const hand = myPlayer?.hand || []
        const otherCards = hand.filter(c => c.id !== selectedCard).slice(0, 2)
        if (otherCards.length === 2) {
          scout(selectedCard, otherCards.map(c => c.id))
        }
        break
      }
      case 'pass':
        pass(selectedCard)
        break
    }
  }

  return (
    <div className="px-4 py-2 space-y-2">
      {actionError && (
        <div className="text-xs text-red-400 bg-red-900/30 px-3 py-1.5 rounded">
          {actionError}
        </div>
      )}

      {!selectedAction && (
        <div className="flex gap-1.5 flex-wrap">
          {ACTIONS.map(a => (
            <button
              key={a.type}
              onClick={() => handleActionSelect(a.type)}
              className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-xs font-medium transition-colors"
              title={a.desc}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {selectedAction && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-400 font-medium capitalize">
            {selectedAction}
          </span>

          {selectedAction === 'build' && (
            <div className="flex gap-1">
              {['cottonMill', 'manufacturer', 'coalMine', 'ironWorks', 'brewery', 'pottery'].map(ind => (
                <button
                  key={ind}
                  onClick={() => setBuildIndustry(ind)}
                  className={`px-2 py-1 rounded text-xs ${
                    buildIndustry === ind ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-400'
                  }`}
                >
                  {ind.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {selectedAction === 'develop' && (
            <div className="flex gap-1">
              {Object.entries(myPlayer?.playerMat || {}).map(([ind, tiles]) => {
                if (tiles.length === 0) return null
                const isSelected = developIndustries.includes(ind)
                return (
                  <button
                    key={ind}
                    onClick={() => {
                      if (isSelected) {
                        setDevelopIndustries(developIndustries.filter(i => i !== ind))
                      } else if (developIndustries.length < 2) {
                        setDevelopIndustries([...developIndustries, ind])
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-400'
                    }`}
                  >
                    {ind.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                  </button>
                )
              })}
            </div>
          )}

          {selectedAction === 'sell' && (
            <div className="flex gap-1 flex-wrap">
              {gameState.industryTilesOnBoard
                .filter(t => t.ownerId === playerId && !t.isFlipped && t.flipsOnSell)
                .map(tile => {
                  const isSel = sellTiles.some(s => s.tileId === tile.id)
                  return (
                    <button
                      key={tile.id}
                      onClick={() => {
                        if (isSel) {
                          setSellTiles(sellTiles.filter(s => s.tileId !== tile.id))
                        } else {
                          const merchants = Object.keys(gameState.board.merchants)
                          setSellTiles([...sellTiles, {
                            tileId: tile.id,
                            merchantLocationId: merchants[0],
                            useMerchantBeer: true,
                          }])
                        }
                      }}
                      className={`px-2 py-1 rounded text-xs ${
                        isSel ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-400'
                      }`}
                    >
                      L{tile.level} {tile.industry.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                    </button>
                  )
                })}
            </div>
          )}

          {selectedTargets.length > 0 && (
            <span className="text-xs text-stone-400">
              {selectedTargets.length} target{selectedTargets.length !== 1 ? 's' : ''}
            </span>
          )}

          {!selectedCard && (
            <span className="text-xs text-red-400">Select a card first</span>
          )}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => {
                resetAction()
                setBuildIndustry(null)
                setDevelopIndustries([])
                setSellTiles([])
              }}
              className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded text-xs font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
