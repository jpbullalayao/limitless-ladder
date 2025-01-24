import { fetchTournaments, fetchTournamentPairings } from '@/lib/api'
import { calculateElo } from '@/lib/elo'
import { formatDate } from '@/lib/utils'

interface PlayerPageProps {
  params: {
    username: string
  }
}

const getPlayerData = async (username: string) => {
  // Similar tournament fetching logic as leaderboard
  const startDate = new Date('2024-01-21')
  const tournaments = await fetchTournaments({
    game: 'VGC',
    startDate: startDate.toISOString()
  })

  let elo = 1000
  let wins = 0
  let losses = 0
  let ties = 0
  const recentMatches = []

  for (const tournament of tournaments) {
    const pairings = await fetchTournamentPairings(tournament.id)
    
    const playerMatches = pairings.filter(
      match => match.player1 === username || match.player2 === username
    )

    for (const match of playerMatches) {
      const isPlayer1 = match.player1 === username
      const opponent = isPlayer1 ? match.player2 : match.player1

      if (match.winner === username) {
        wins++
      } else if (match.winner === opponent) {
        losses++
      } else if (match.winner === 0) {
        ties++
      }

      // Add to recent matches if within last 10
      if (recentMatches.length < 10) {
        recentMatches.push({
          tournament: tournament.name,
          date: tournament.date,
          opponent,
          result: match.winner === username ? 'Win' : match.winner === opponent ? 'Loss' : 'Tie'
        })
      }
    }
  }

  return {
    username,
    elo,
    wins,
    losses,
    ties,
    recentMatches
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const playerData = await getPlayerData(decodeURIComponent(params.username))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{playerData.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stats</h2>
          <p className="mb-2">Elo: {Math.round(playerData.elo)}</p>
          <p>Record: {playerData.wins}-{playerData.losses}{playerData.ties > 0 ? `-${playerData.ties}` : ''}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {playerData.recentMatches.map((match, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(match.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.tournament}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.opponent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 