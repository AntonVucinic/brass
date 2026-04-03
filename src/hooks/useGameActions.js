'use client'

import { useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { useGameStore } from '@/store/gameStore'

export function useGameActions () {
  const { setActionError, resetAction } = useGameStore()

  const sendAction = useCallback((actionType, payload) => {
    const socket = getSocket()
    socket.emit('game:action', { actionType, payload }, (response) => {
      if (response.success) {
        resetAction()
      } else {
        setActionError(response.error)
      }
    })
  }, [setActionError, resetAction])

  const build = useCallback((cardId, locationId, industry) => {
    sendAction('build', { cardId, locationId, industry })
  }, [sendAction])

  const network = useCallback((cardId, connectionIds) => {
    sendAction('network', { cardId, connectionIds })
  }, [sendAction])

  const develop = useCallback((cardId, industries) => {
    sendAction('develop', { cardId, industries })
  }, [sendAction])

  const sell = useCallback((cardId, tileSells) => {
    sendAction('sell', { cardId, tileSells })
  }, [sendAction])

  const loan = useCallback((cardId) => {
    sendAction('loan', { cardId })
  }, [sendAction])

  const scout = useCallback((cardId, discardCardIds) => {
    sendAction('scout', { cardId, discardCardIds })
  }, [sendAction])

  const pass = useCallback((cardId) => {
    sendAction('pass', { cardId })
  }, [sendAction])

  return { build, network, develop, sell, loan, scout, pass, sendAction }
}
