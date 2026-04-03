'use client'

import { useGameStore } from '@/store/gameStore'

const LOCATION_POSITIONS = {
  leek: { x: 340, y: 40 },
  stokeOnTrent: { x: 260, y: 100 },
  stone: { x: 200, y: 160 },
  uttoxeter: { x: 350, y: 150 },
  stafford: { x: 160, y: 230 },
  burtonOnTrent: { x: 380, y: 230 },
  cannock: { x: 220, y: 310 },
  tamworth: { x: 410, y: 310 },
  wolverhampton: { x: 140, y: 380 },
  walsall: { x: 250, y: 380 },
  coalbrookdale: { x: 60, y: 380 },
  dudley: { x: 140, y: 450 },
  birmingham: { x: 280, y: 460 },
  nuneaton: { x: 430, y: 390 },
  coventry: { x: 480, y: 460 },
  kidderminster: { x: 80, y: 530 },
  redditch: { x: 230, y: 540 },
  worcester: { x: 120, y: 600 },

  farmBrewery1: { x: 160, y: 300 },
  farmBrewery2: { x: 60, y: 570 },

  derby: { x: 460, y: 150 },
  belper: { x: 430, y: 80 },
  nottingham: { x: 540, y: 180 },

  shrewsbury: { x: 10, y: 320 },
  gloucester: { x: 80, y: 670 },
  oxford: { x: 400, y: 570 },
  warrington: { x: 180, y: 10 },
  merchantNottingham: { x: 600, y: 140 },
}

const CONNECTION_LINES = [
  ['shrewsbury', 'coalbrookdale'],
  ['coalbrookdale', 'wolverhampton'],
  ['coalbrookdale', 'kidderminster'],
  ['wolverhampton', 'walsall'],
  ['wolverhampton', 'dudley'],
  ['wolverhampton', 'cannock'],
  ['dudley', 'birmingham'],
  ['dudley', 'kidderminster'],
  ['dudley', 'wolverhampton'],
  ['kidderminster', 'worcester'],
  ['kidderminster', 'farmBrewery2'],
  ['worcester', 'gloucester'],
  ['worcester', 'birmingham'],
  ['worcester', 'farmBrewery2'],
  ['birmingham', 'walsall'],
  ['birmingham', 'tamworth'],
  ['birmingham', 'coventry'],
  ['birmingham', 'redditch'],
  ['birmingham', 'nuneaton'],
  ['birmingham', 'oxford'],
  ['walsall', 'cannock'],
  ['cannock', 'stafford'],
  ['cannock', 'farmBrewery1'],
  ['cannock', 'warrington'],
  ['stafford', 'stone'],
  ['stafford', 'burtonOnTrent'],
  ['stone', 'stokeOnTrent'],
  ['stone', 'uttoxeter'],
  ['stokeOnTrent', 'leek'],
  ['stokeOnTrent', 'warrington'],
  ['leek', 'uttoxeter'],
  ['uttoxeter', 'burtonOnTrent'],
  ['burtonOnTrent', 'tamworth'],
  ['burtonOnTrent', 'derby'],
  ['tamworth', 'nuneaton'],
  ['nuneaton', 'coventry'],
  ['coventry', 'oxford'],
  ['redditch', 'gloucester'],
  ['redditch', 'oxford'],
  ['derby', 'belper'],
  ['derby', 'nottingham'],
  ['belper', 'leek'],
  ['nottingham', 'merchantNottingham'],
]

const PLAYER_COLORS = {
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a855f7',
  white: '#e7e5e4',
}

const INDUSTRY_COLORS = {
  cottonMill: '#3b82f6',
  manufacturer: '#8b5cf6',
  coalMine: '#71717a',
  ironWorks: '#f97316',
  brewery: '#a16207',
  pottery: '#14b8a6',
}

export function Board ({ gameState, playerId }) {
  const { selectedAction, targetingMode, addTarget } = useGameStore()

  const handleLocationClick = (locationId) => {
    if (targetingMode === 'location') {
      addTarget({ type: 'location', id: locationId })
    }
  }

  const handleConnectionClick = (from, to) => {
    if (targetingMode === 'connection') {
      const connId = findConnectionId(from, to, gameState)
      if (connId) addTarget({ type: 'connection', id: connId, from, to })
    }
  }

  return (
    <svg viewBox="-20 -20 660 720" className="w-full h-full max-h-[calc(100vh-180px)]">
      <rect x="-20" y="-20" width="660" height="720" fill="#1c1917" rx="8" />

      {CONNECTION_LINES.map(([from, to], i) => {
        const fromPos = LOCATION_POSITIONS[from]
        const toPos = LOCATION_POSITIONS[to]
        if (!fromPos || !toPos) return null

        const connId = findConnectionId(from, to, gameState)
        const link = connId ? gameState.board.links[connId] : null
        const isBuilt = link && link.ownerId !== null
        const ownerColor = isBuilt
          ? PLAYER_COLORS[gameState.players.find(p => p.id === link.ownerId)?.color] || '#555'
          : '#44403c'

        return (
          <line
            key={`conn-${i}`}
            x1={fromPos.x} y1={fromPos.y}
            x2={toPos.x} y2={toPos.y}
            stroke={ownerColor}
            strokeWidth={isBuilt ? 4 : 2}
            strokeDasharray={isBuilt ? 'none' : '4 4'}
            className={targetingMode === 'connection' ? 'cursor-pointer hover:stroke-amber-400' : ''}
            onClick={() => handleConnectionClick(from, to)}
          />
        )
      })}

      {Object.entries(LOCATION_POSITIONS).map(([locId, pos]) => {
        const isMerchant = ['shrewsbury', 'gloucester', 'oxford', 'warrington', 'merchantNottingham'].includes(locId)
        const isFarm = locId.startsWith('farmBrewery')
        const boardLoc = gameState.board.locations[locId]

        const tilesHere = gameState.industryTilesOnBoard.filter(t => t.locationId === locId)

        return (
          <g key={locId}
            onClick={() => handleLocationClick(locId)}
            className={targetingMode === 'location' ? 'cursor-pointer' : ''}
          >
            <circle
              cx={pos.x} cy={pos.y}
              r={isMerchant ? 14 : isFarm ? 12 : 18}
              fill={isMerchant ? '#78350f' : isFarm ? '#365314' : '#292524'}
              stroke={isMerchant ? '#d97706' : isFarm ? '#65a30d' : '#57534e'}
              strokeWidth={1.5}
            />

            {tilesHere.map((tile, idx) => {
              const angle = (idx * 2 * Math.PI) / Math.max(tilesHere.length, 1) - Math.PI / 2
              const radius = tilesHere.length > 1 ? 10 : 0
              const tx = pos.x + Math.cos(angle) * radius
              const ty = pos.y + Math.sin(angle) * radius

              const ownerPlayer = gameState.players.find(p => p.id === tile.ownerId)
              const outlineColor = ownerPlayer ? PLAYER_COLORS[ownerPlayer.color] : '#555'

              return (
                <g key={tile.id}>
                  <rect
                    x={tx - 7} y={ty - 7}
                    width={14} height={14}
                    rx={2}
                    fill={tile.isFlipped ? '#1a1a1a' : INDUSTRY_COLORS[tile.industry] || '#555'}
                    stroke={outlineColor}
                    strokeWidth={1.5}
                  />
                  <text
                    x={tx} y={ty + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="7" fontWeight="bold"
                  >
                    {tile.level}
                  </text>
                  {tile.resourcesRemaining > 0 && (
                    <text
                      x={tx + 6} y={ty - 6}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="#fbbf24" fontSize="6" fontWeight="bold"
                    >
                      {tile.resourcesRemaining}
                    </text>
                  )}
                </g>
              )
            })}

            <text
              x={pos.x} y={pos.y + (isMerchant ? 22 : 28)}
              textAnchor="middle" fill="#a8a29e" fontSize="8"
            >
              {formatLocationName(locId)}
            </text>
          </g>
        )
      })}

      {Object.entries(gameState.board.merchants || {}).map(([locId, merchant]) => {
        const pos = LOCATION_POSITIONS[locId]
        if (!pos) return null

        return (
          <g key={`merchant-${locId}`}>
            {merchant.beerAvailable && (
              <circle
                cx={pos.x + 16} cy={pos.y - 10}
                r={4} fill="#ca8a04" stroke="#fbbf24" strokeWidth={1}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function formatLocationName (id) {
  const names = {
    stokeOnTrent: 'Stoke',
    burtonOnTrent: 'Burton',
    coalbrookdale: 'C.dale',
    wolverhampton: 'Wolves',
    kidderminster: 'Kidder.',
    farmBrewery1: 'Farm',
    farmBrewery2: 'Farm',
    merchantNottingham: 'Nott. M',
    shrewsbury: 'Shrews.',
    gloucester: 'Glouc.',
    warrington: 'Warr.',
  }
  return names[id] || id.charAt(0).toUpperCase() + id.slice(1)
}

function findConnectionId (from, to, gameState) {
  for (const [connId, link] of Object.entries(gameState.board.links)) {
    if (
      (connId.includes(from) && connId.includes(to)) ||
      connId === `${from}-${to}` ||
      connId === `${to}-${from}`
    ) {
      return connId
    }
  }
  return null
}
