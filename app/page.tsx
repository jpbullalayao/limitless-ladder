import { fetchTournaments, fetchTournamentPairings } from '@/lib/api'
import LeaderboardTable from '@/components/LeaderboardTable'
import PlayerSearch from '@/components/PlayerSearch'
import { processMatches, calculatePlayerStats, formatElo } from '@/lib/elo-utils'

const getLeaderboardData = async () => {
  const startDate = new Date('2025-01-05')
  const tournaments = await fetchTournaments({
    game: 'VGC',
    startDate: startDate.toISOString()
  })

  // Fetch all pairings
  const pairingsMap = new Map()
  for (const tournament of tournaments) {
    pairingsMap.set(tournament.id, await fetchTournamentPairings(tournament.id))
  }

  const processedMatches = processMatches(tournaments, pairingsMap)
  
  // Get unique players
  const players = new Set<string>()
  processedMatches.forEach(match => {
    players.add(match.player1)
    players.add(match.player2)
  })

  // Calculate stats for each player
  const playerStats = Array.from(players).map(username => 
    calculatePlayerStats(
      processedMatches.filter(m => m.player1 === username || m.player2 === username),
      username
    )
  )

  return playerStats
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 100)
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboardData()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">VGC Leaderboard</h1>
        <div className="w-96">
          <PlayerSearch />
        </div>
      </div>
      <LeaderboardTable players={leaderboardData} />
    </div>
  )
} 