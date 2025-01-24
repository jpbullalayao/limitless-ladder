import { fetchTournaments, fetchTournamentStandings } from '@/lib/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()

  if (!query) {
    return Response.json({ players: [] })
  }

  // Fetch tournaments from the last month to get recent players
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 1)
  
  const tournaments = await fetchTournaments({
    game: 'VGC',
    startDate: startDate.toISOString()
  })

  // Get unique players from tournament standings
  const uniquePlayers = new Set<string>()
  
  for (const tournament of tournaments) {
    const standings = await fetchTournamentStandings(tournament.id)
    standings.forEach(standing => {
      if (standing.player.toLowerCase().includes(query)) {
        uniquePlayers.add(standing.player)
      }
    })
  }

  return Response.json({
    players: Array.from(uniquePlayers).slice(0, 10) // Limit to 10 results
  })
} 