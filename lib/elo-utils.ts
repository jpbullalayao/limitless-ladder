import type { Tournament, TournamentMatch } from './types'
import { calculateElo } from './elo'

export interface PlayerStats {
  username: string
  elo: number
  wins: number
  losses: number
  ties: number
}

export interface ProcessedMatch {
  tournament: Tournament
  player1: string
  player2: string | null
  winner: string | 0
  player1Elo: number
  player2Elo: number | null
  round?: number
  isBye?: boolean
}

export const calculatePlayerStats = (matches: ProcessedMatch[], username: string): PlayerStats => {
  let elo = 1000
  let wins = 0
  let losses = 0
  let ties = 0

  for (const match of matches) {
    const isPlayer1 = match.player1 === username
    const opponent = isPlayer1 ? match.player2 : match.player1
    
    // Count BYEs as wins but don't affect ELO
    if (match.isBye) {
      wins++
      continue
    }

    if (match.winner === username) {
      wins++
    } else if (match.winner === opponent) {
      losses++
    } else {
      ties++
    }

    // Only update ELO for non-BYE matches
    if (!match.isBye) {
      const score = match.winner === username ? 1 : match.winner === opponent ? 0 : 0.5
      const [newElo] = calculateElo(
        isPlayer1 ? match.player1Elo : match.player2Elo!,
        isPlayer1 ? match.player2Elo! : match.player1Elo,
        score
      )
      elo = newElo
    }
  }

  return {
    username,
    elo: Math.floor(elo),
    wins,
    losses,
    ties
  }
}

export const processMatches = (
  tournaments: Tournament[],
  pairings: Map<string, TournamentMatch[]>
): ProcessedMatch[] => {
  const processedMatches: ProcessedMatch[] = []
  const playerElos = new Map<string, number>()

  // Sort tournaments chronologically
  const sortedTournaments = [...tournaments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const tournament of sortedTournaments) {
    const tournamentPairings = pairings.get(tournament.id) || []
    
    // Sort matches by round
    const sortedPairings = [...tournamentPairings].sort(
      (a, b) => (a.round || 0) - (b.round || 0)
    )

    for (const match of sortedPairings) {
      // Handle BYE matches
      if (!match.player2) {
        processedMatches.push({
          tournament,
          player1: match.player1,
          player2: null,
          winner: match.player1, // BYE is always a win for player1
          player1Elo: playerElos.get(match.player1) || 1000,
          player2Elo: null,
          round: match.round,
          isBye: true
        })
        continue
      }

      // Get or initialize Elos
      const player1Elo = playerElos.get(match.player1) || 1000
      const player2Elo = playerElos.get(match.player2) || 1000

      // Calculate score
      const score = match.winner === match.player1 ? 1 : match.winner === match.player2 ? 0 : 0.5

      // Calculate new Elos
      const [newElo1, newElo2] = calculateElo(player1Elo, player2Elo, score)

      // Store match with Elos after the calculation
      processedMatches.push({
        tournament,
        player1: match.player1,
        player2: match.player2,
        winner: match.winner,
        player1Elo: newElo1,
        player2Elo: newElo2,
        round: match.round,
        isBye: false
      })

      // Update stored Elos only for non-BYE matches
      playerElos.set(match.player1, newElo1)
      playerElos.set(match.player2, newElo2)
    }
  }

  return processedMatches
}

export const formatElo = (elo: number): string => {
  return Math.floor(elo).toString()
} 