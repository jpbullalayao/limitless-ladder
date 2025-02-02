import type { Tournament, TournamentMatch, TournamentStanding } from './types'

const API_BASE = 'https://play.limitlesstcg.com/api'

export const fetchTournaments = async ({ game, startDate }: { game: string, startDate: string }): Promise<Tournament[]> => {
  const response = await fetch(`${API_BASE}/tournaments?game=${game}&startDate=${startDate}`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentDetails = async (id: string): Promise<Tournament> => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/details`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentStandings = async (id: string): Promise<TournamentStanding[]> => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/standings`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentPairings = async (id: string): Promise<TournamentMatch[]> => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/pairings`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
} 