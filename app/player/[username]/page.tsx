import { fetchTournaments, fetchTournamentPairings, fetchTournamentStandings } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { processMatches, calculatePlayerStats, formatElo } from '@/lib/elo-utils'
import PokemonSprite from '@/components/PokemonSprite'
import Link from 'next/link'

interface PlayerPageProps {
  params: {
    username: string
  }
}

const getPlayerData = async (username: string) => {
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
  const playerMatches = processedMatches.filter(
    match => match.player1 === username || match.player2 === username
  )
  const playerStats = calculatePlayerStats(playerMatches, username)

  // Get team information for each match
  const matchesWithTeams = await Promise.all(
    playerMatches.map(async (match) => {
      const standings = await fetchTournamentStandings(match.tournament.id)
      const playerStanding = standings.find(s => s.player === username)
      
      // Handle BYE matches
      if (match.isBye) {
        return {
          tournament: match.tournament.name,
          date: match.tournament.date,
          opponent: 'BYE',
          result: 'Win',
          playerTeam: playerStanding?.decklist || [],
          opponentTeam: [],
          playerElo: formatElo(match.player1Elo),
          opponentElo: '-'
        }
      }

      const opponentName = match.player1 === username ? match.player2! : match.player1
      const opponentStanding = standings.find(s => s.player === opponentName)

      return {
        tournament: match.tournament.name,
        date: match.tournament.date,
        opponent: opponentName,
        result: match.winner === username ? 'Win' : match.winner === opponentName ? 'Loss' : 'Tie',
        playerTeam: playerStanding?.decklist || [],
        opponentTeam: opponentStanding?.decklist || [],
        playerElo: formatElo(match.player1 === username ? match.player1Elo : match.player2Elo!),
        opponentElo: formatElo(match.player1 === username ? match.player2Elo! : match.player1Elo)
      }
    })
  )

  return {
    username,
    elo: formatElo(playerStats.elo),
    wins: playerStats.wins,
    losses: playerStats.losses,
    ties: playerStats.ties,
    matches: matchesWithTeams.reverse() // Most recent first
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { username } = params
  const playerData = await getPlayerData(decodeURIComponent(username))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{playerData.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stats</h2>
          <p className="mb-2">Elo: {playerData.elo}</p>
          <p>Record: {playerData.wins}-{playerData.losses}{playerData.ties > 0 ? `-${playerData.ties}` : ''}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Match History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player Elo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {playerData.matches.map((match, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(match.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.tournament}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.opponent === 'BYE' ? (
                      match.opponent
                    ) : (
                      <Link 
                        href={`/player/${encodeURIComponent(match.opponent)}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {match.opponent}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.result}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.playerElo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-1 w-[200px]">
                      {match.playerTeam.map((pokemon, i) => (
                        <PokemonSprite key={i} id={pokemon.id} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-1 w-[200px]">
                      {match.opponentTeam.map((pokemon, i) => (
                        <PokemonSprite key={i} id={pokemon.id} />
                      ))}
                    </div>
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