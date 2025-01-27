import { fetchTournaments, fetchTournamentDetails, fetchTournamentStandings, fetchTournamentPairings } from '@/lib/api'
import LeaderboardTable from '@/components/LeaderboardTable'
import PlayerSearch from '@/components/PlayerSearch'
import { calculateElo } from '@/lib/elo'
import { formatDate } from '@/lib/utils'

interface Player {
  username: string
  elo: number
  wins: number
  losses: number
  ties: number
}

const getLeaderboardData = async () => {
  // Fetch all VGC tournaments since Jan 5, 2024
  const startDate = new Date('2024-01-05')
  const tournaments = await fetchTournaments({
    game: 'VGC',
    startDate: startDate.toISOString()
  })

  const playerStats: Map<string, Player> = new Map()

  // Process each tournament
  for (const tournament of tournaments) {
    const [details, standings, pairings] = await Promise.all([
      fetchTournamentDetails(tournament.id),
      fetchTournamentStandings(tournament.id),
      fetchTournamentPairings(tournament.id)
    ])

    // Process matches to calculate Elo and record
    pairings.forEach(match => {
      if (!match.player1 || !match.player2) return // Skip byes

      // Initialize players if needed
      if (!playerStats.has(match.player1)) {
        playerStats.set(match.player1, {
          username: match.player1,
          elo: 1000,
          wins: 0,
          losses: 0,
          ties: 0
        })
      }
      if (!playerStats.has(match.player2)) {
        playerStats.set(match.player2, {
          username: match.player2,
          elo: 1000,
          wins: 0,
          losses: 0,
          ties: 0
        })
      }

      const player1 = playerStats.get(match.player1)!
      const player2 = playerStats.get(match.player2)!

      if (match.winner === match.player1) {
        player1.wins++
        player2.losses++
        const [newElo1, newElo2] = calculateElo(player1.elo, player2.elo, 1)
        player1.elo = newElo1
        player2.elo = newElo2
      } else if (match.winner === match.player2) {
        player2.wins++
        player1.losses++
        const [newElo1, newElo2] = calculateElo(player1.elo, player2.elo, 0)
        player1.elo = newElo1
        player2.elo = newElo2
      } else if (match.winner === 0) { // Tie
        player1.ties++
        player2.ties++
        const [newElo1, newElo2] = calculateElo(player1.elo, player2.elo, 0.5)
        player1.elo = newElo1
        player2.elo = newElo2
      }
    })
  }

  return Array.from(playerStats.values())
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 100) // Only return top 100 players
}

export default async function Home() {
  const leaderboardData = await getLeaderboardData()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">VGC Ladder</h1>
      <PlayerSearch />
      <LeaderboardTable players={leaderboardData} />
    </div>
  )
} 