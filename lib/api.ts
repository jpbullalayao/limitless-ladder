const API_BASE = 'https://play.limitlesstcg.com/api'

export const fetchTournaments = async ({ game, startDate }: { game: string, startDate: string }) => {
  const response = await fetch(`${API_BASE}/tournaments?game=${game}&startDate=${startDate}`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentDetails = async (id: string) => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/details`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentStandings = async (id: string) => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/standings`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
}

export const fetchTournamentPairings = async (id: string) => {
  const response = await fetch(`${API_BASE}/tournaments/${id}/pairings`, {
    headers: {
      'X-Access-Key': process.env.LIMITLESS_API_KEY!
    }
  })
  return response.json()
} 