const { LINK_TYPE } = require('../constants')

const connections = [
  // Shrewsbury connections
  { id: 'shrewsbury-coalbrookdale', from: 'shrewsbury', to: 'coalbrookdale', canalRoute: true, railRoute: true },

  // Coalbrookdale connections
  { id: 'coalbrookdale-wolverhampton', from: 'coalbrookdale', to: 'wolverhampton', canalRoute: true, railRoute: true },
  { id: 'coalbrookdale-kidderminster', from: 'coalbrookdale', to: 'kidderminster', canalRoute: false, railRoute: true },

  // Wolverhampton connections
  { id: 'wolverhampton-walsall', from: 'wolverhampton', to: 'walsall', canalRoute: true, railRoute: true },
  { id: 'wolverhampton-dudley', from: 'wolverhampton', to: 'dudley', canalRoute: false, railRoute: true },
  { id: 'wolverhampton-cannock', from: 'wolverhampton', to: 'cannock', canalRoute: true, railRoute: false },

  // Dudley connections
  { id: 'dudley-birmingham', from: 'dudley', to: 'birmingham', canalRoute: true, railRoute: true },
  { id: 'dudley-kidderminster', from: 'dudley', to: 'kidderminster', canalRoute: false, railRoute: true },
  { id: 'dudley-wolverhampton2', from: 'dudley', to: 'wolverhampton', canalRoute: true, railRoute: false },

  // Kidderminster connections
  { id: 'kidderminster-worcester', from: 'kidderminster', to: 'worcester', canalRoute: true, railRoute: true },
  { id: 'kidderminster-farmBrewery2', from: 'kidderminster', to: 'farmBrewery2', canalRoute: true, railRoute: true },

  // Worcester connections
  { id: 'worcester-gloucester', from: 'worcester', to: 'gloucester', canalRoute: true, railRoute: true },
  { id: 'worcester-birmingham', from: 'worcester', to: 'birmingham', canalRoute: false, railRoute: true },

  // Birmingham connections
  { id: 'birmingham-walsall', from: 'birmingham', to: 'walsall', canalRoute: true, railRoute: true },
  { id: 'birmingham-tamworth', from: 'birmingham', to: 'tamworth', canalRoute: true, railRoute: true },
  { id: 'birmingham-coventry', from: 'birmingham', to: 'coventry', canalRoute: false, railRoute: true },
  { id: 'birmingham-redditch', from: 'birmingham', to: 'redditch', canalRoute: true, railRoute: true },
  { id: 'birmingham-nuneaton', from: 'birmingham', to: 'nuneaton', canalRoute: false, railRoute: true },
  { id: 'birmingham-oxford', from: 'birmingham', to: 'oxford', canalRoute: false, railRoute: true },

  // Walsall connections
  { id: 'walsall-cannock', from: 'walsall', to: 'cannock', canalRoute: true, railRoute: true },

  // Cannock connections
  { id: 'cannock-stafford', from: 'cannock', to: 'stafford', canalRoute: false, railRoute: true },
  { id: 'cannock-farmBrewery1', from: 'cannock', to: 'farmBrewery1', canalRoute: true, railRoute: true },
  { id: 'cannock-warrington', from: 'cannock', to: 'warrington', canalRoute: false, railRoute: true },

  // Stafford connections
  { id: 'stafford-stone', from: 'stafford', to: 'stone', canalRoute: true, railRoute: true },
  { id: 'stafford-burtonOnTrent', from: 'stafford', to: 'burtonOnTrent', canalRoute: false, railRoute: true },

  // Stone connections
  { id: 'stone-stokeOnTrent', from: 'stone', to: 'stokeOnTrent', canalRoute: true, railRoute: true },
  { id: 'stone-uttoxeter', from: 'stone', to: 'uttoxeter', canalRoute: false, railRoute: true },

  // Stoke-on-Trent connections
  { id: 'stokeOnTrent-leek', from: 'stokeOnTrent', to: 'leek', canalRoute: true, railRoute: true },
  { id: 'stokeOnTrent-warrington', from: 'stokeOnTrent', to: 'warrington', canalRoute: true, railRoute: false },

  // Leek connections
  { id: 'leek-uttoxeter', from: 'leek', to: 'uttoxeter', canalRoute: false, railRoute: true },

  // Uttoxeter connections
  { id: 'uttoxeter-burtonOnTrent', from: 'uttoxeter', to: 'burtonOnTrent', canalRoute: false, railRoute: true },

  // Burton-on-Trent connections
  { id: 'burtonOnTrent-tamworth', from: 'burtonOnTrent', to: 'tamworth', canalRoute: false, railRoute: true },
  { id: 'burtonOnTrent-derby', from: 'burtonOnTrent', to: 'derby', canalRoute: false, railRoute: true },

  // Tamworth connections
  { id: 'tamworth-nuneaton', from: 'tamworth', to: 'nuneaton', canalRoute: true, railRoute: true },

  // Nuneaton connections
  { id: 'nuneaton-coventry', from: 'nuneaton', to: 'coventry', canalRoute: false, railRoute: true },

  // Coventry connections
  { id: 'coventry-oxford', from: 'coventry', to: 'oxford', canalRoute: true, railRoute: true },

  // Redditch connections
  { id: 'redditch-gloucester', from: 'redditch', to: 'gloucester', canalRoute: false, railRoute: true },
  { id: 'redditch-oxford', from: 'redditch', to: 'oxford', canalRoute: false, railRoute: true },

  // Derby connections
  { id: 'derby-belper', from: 'derby', to: 'belper', canalRoute: true, railRoute: true },
  { id: 'derby-nottingham', from: 'derby', to: 'nottingham', canalRoute: true, railRoute: true },

  // Belper connections
  { id: 'belper-leek', from: 'belper', to: 'leek', canalRoute: false, railRoute: true },

  // Nottingham connections
  { id: 'nottingham-merchantNottingham', from: 'nottingham', to: 'merchantNottingham', canalRoute: true, railRoute: true },

  // Worcester to farm brewery (shared link)
  { id: 'worcester-farmBrewery2', from: 'worcester', to: 'farmBrewery2', canalRoute: true, railRoute: true },
]

function getConnectionsForLocation (locationId) {
  return connections.filter(
    c => c.from === locationId || c.to === locationId
  )
}

function getAdjacentLocations (locationId) {
  const conns = getConnectionsForLocation(locationId)
  return conns.map(c => c.from === locationId ? c.to : c.from)
}

function getConnectionBetween (locA, locB) {
  return connections.find(
    c => (c.from === locA && c.to === locB) || (c.from === locB && c.to === locA)
  ) || null
}

function getConnectionsForEra (era) {
  if (era === 'canal') return connections.filter(c => c.canalRoute)
  return connections.filter(c => c.railRoute)
}

module.exports = {
  connections,
  getConnectionsForLocation,
  getAdjacentLocations,
  getConnectionBetween,
  getConnectionsForEra,
}
