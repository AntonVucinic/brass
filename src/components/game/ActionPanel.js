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

const INDUSTRY_LABELS = {
  cottonMill: 'Cotton',
  manufacturer: 'Manuf.',
  coalMine: 'Coal',
  ironWorks: 'Iron',
  brewery: 'Brewery',
  pottery: 'Pottery',
}

function formatLocName (id) {
  if (!id) return ''
  const names = {
    stokeOnTrent: 'Stoke-on-Trent', burtonOnTrent: 'Burton-on-Trent',
    coalbrookdale: 'Coalbrookdale', wolverhampton: 'Wolverhampton',
    kidderminster: 'Kidderminster', farmBrewery1: 'Farm Brewery',
    farmBrewery2: 'Farm Brewery', merchantNottingham: 'Nottingham Merchant',
  }
  return names[id] || id.charAt(0).toUpperCase() + id.slice(1)
}

export function ActionPanel ({ gameState, playerId }) {
  const {
    selectedAction, setSelectedAction, selectedCard,
    setTargetingMode, selectedTargets, actionError,
    resetAction, setActionError, clearActionError,
  } = useGameStore()
  const { build, network, develop, sell, loan, scout, pass } = useGameActions()
  const [buildIndustry, setBuildIndustry] = useState(null)
  const [developIndustries, setDevelopIndustries] = useState([])
  const [sellTiles, setSellTiles] = useState([])

  const myPlayer = gameState.players.find(p => p.id === playerId)

  const handleActionSelect = (actionType) => {
    clearActionError()
    setSelectedAction(actionType)
    setBuildIndustry(null)
    setDevelopIndustries([])
    setSellTiles([])

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

  const handleCancel = () => {
    resetAction()
    setBuildIndustry(null)
    setDevelopIndustries([])
    setSellTiles([])
  }

  const getMissingSteps = () => {
    const missing = []
    if (!selectedCard) missing.push('select a card')

    switch (selectedAction) {
      case 'build': {
        if (!buildIndustry) missing.push('pick an industry')
        const locTarget = selectedTargets.find(t => t.type === 'location')
        if (!locTarget) missing.push('click a location on the map')
        break
      }
      case 'network': {
        const conns = selectedTargets.filter(t => t.type === 'connection')
        if (conns.length === 0) missing.push('click a connection on the map')
        break
      }
      case 'develop':
        if (developIndustries.length === 0) missing.push('pick industry to develop')
        break
      case 'sell':
        if (sellTiles.length === 0) missing.push('select tiles to sell')
        break
      case 'scout':
        if ((myPlayer?.hand || []).length < 3) missing.push('need at least 3 cards')
        break
    }
    return missing
  }

  const handleConfirm = () => {
    const missing = getMissingSteps()
    if (missing.length > 0) {
      setActionError(`Still need to: ${missing.join(', ')}`)
      return
    }

    switch (selectedAction) {
      case 'build': {
        const target = selectedTargets.find(t => t.type === 'location')
        build(selectedCard, target.id, buildIndustry)
        break
      }
      case 'network': {
        const conns = selectedTargets.filter(t => t.type === 'connection').map(t => t.id)
        network(selectedCard, conns)
        break
      }
      case 'develop':
        develop(selectedCard, developIndustries)
        break
      case 'sell':
        sell(selectedCard, sellTiles)
        break
      case 'loan':
        loan(selectedCard)
        break
      case 'scout': {
        const hand = myPlayer?.hand || []
        const otherCards = hand.filter(c => c.id !== selectedCard).slice(0, 2)
        scout(selectedCard, otherCards.map(c => c.id))
        break
      }
      case 'pass':
        pass(selectedCard)
        break
    }
  }

  const locationTarget = selectedTargets.find(t => t.type === 'location')
  const connectionTargets = selectedTargets.filter(t => t.type === 'connection')
  const isReady = getMissingSteps().length === 0

  return (
    <div className="px-4 py-2 space-y-2">
      {actionError && (
        <div className="text-xs text-red-400 bg-red-900/30 px-3 py-1.5 rounded">
          {actionError}
        </div>
      )}

      {!selectedAction ? (
        <div className="space-y-1">
          <p className="text-xs text-stone-400">Choose an action:</p>
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
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-amber-400 font-medium capitalize">
              {selectedAction}
            </span>

            <span className="text-stone-600">|</span>

            {selectedCard ? (
              <span className="text-xs text-green-400">Card selected</span>
            ) : (
              <span className="text-xs text-yellow-500 animate-pulse">Click a card below</span>
            )}

            {selectedAction === 'build' && (
              <>
                <span className="text-stone-600">|</span>
                {locationTarget ? (
                  <span className="text-xs text-green-400">
                    {formatLocName(locationTarget.id)}
                  </span>
                ) : (
                  <span className="text-xs text-yellow-500">Click a location on map</span>
                )}
              </>
            )}

            {selectedAction === 'network' && (
              <>
                <span className="text-stone-600">|</span>
                {connectionTargets.length > 0 ? (
                  <span className="text-xs text-green-400">
                    {connectionTargets.length} link{connectionTargets.length !== 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span className="text-xs text-yellow-500">Click a route on map</span>
                )}
              </>
            )}
          </div>

          {selectedAction === 'build' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 mr-1">Industry:</span>
              {Object.entries(INDUSTRY_LABELS).map(([ind, label]) => {
                const tiles = myPlayer?.playerMat?.[ind]
                const hasAvailable = tiles && tiles.length > 0
                return (
                  <button
                    key={ind}
                    onClick={() => setBuildIndustry(ind)}
                    disabled={!hasAvailable}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      buildIndustry === ind
                        ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                        : hasAvailable
                          ? 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                          : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {selectedAction === 'develop' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 mr-1">Remove (1-2):</span>
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
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }`}
                  >
                    {INDUSTRY_LABELS[ind] || ind} (L{tiles[0].level})
                  </button>
                )
              })}
              {developIndustries.length > 0 && (
                <span className="text-xs text-green-400">{developIndustries.length} selected</span>
              )}
            </div>
          )}

          {selectedAction === 'sell' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-stone-400 mr-1">Tiles:</span>
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
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        isSel
                          ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                          : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                      }`}
                    >
                      L{tile.level} {INDUSTRY_LABELS[tile.industry] || tile.industry}
                    </button>
                  )
                })}
              {gameState.industryTilesOnBoard.filter(
                t => t.ownerId === playerId && !t.isFlipped && t.flipsOnSell
              ).length === 0 && (
                <span className="text-xs text-stone-500">No tiles to sell</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
                isReady
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-1 ring-amber-400'
                  : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
              }`}
            >
              Confirm
            </button>
            {!isReady && (
              <span className="text-xs text-stone-500 italic">
                {getMissingSteps().join(' · ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
