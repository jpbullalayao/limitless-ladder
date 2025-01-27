import { fetchTournaments, fetchTournamentPairings, fetchTournamentStandings } from '@/lib/api'
import { calculateElo } from '@/lib/elo'
import { formatDate } from '@/lib/utils'
import PokemonSprite from '@/components/PokemonSprite'
import { MatchPokemon } from '@/lib/types'
import Link from 'next/link'

interface PlayerPageProps {
  params: Promise<{
    username: string
  }>
}

interface Match {
  tournament: string
  date: string
  opponent: string
  result: 'Win' | 'Loss' | 'Tie'
  playerTeam: MatchPokemon[]
  opponentTeam: MatchPokemon[]
  playerElo: number
  opponentElo: number
}

const getPlayerData = async (username: string) => {
  const startDate = new Date('2024-01-21')
  const tournaments = await fetchTournaments({
    game: 'VGC',
    startDate: startDate.toISOString()
  })

  let elo = 1000
  let wins = 0
  let losses = 0
  let ties = 0
  const allMatches: Match[] = []

  // Process tournaments chronologically
  const sortedTournaments = tournaments.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const tournament of sortedTournaments) {
    const [pairings, standings] = await Promise.all([
      fetchTournamentPairings(tournament.id),
      fetchTournamentStandings(tournament.id)
    ])
    
    const playerStanding = standings.find(s => s.player === username)
    const playerMatches = pairings.filter(
      match => match.player1 === username || match.player2 === username
    )

    // Sort matches by round to process them in order
    const sortedMatches = playerMatches.sort((a, b) => 
      (a.round || 0) - (b.round || 0)
    )

    for (const match of sortedMatches) {
      const isPlayer1 = match.player1 === username
      const opponent = isPlayer1 ? match.player2 : match.player1
      const opponentStanding = standings.find(s => s.player === opponent)

      let matchResult: 'Win' | 'Loss' | 'Tie'
      let score = 0.5 // Default for tie

      if (match.winner === username) {
        wins++
        matchResult = 'Win'
        score = 1
      } else if (match.winner === opponent) {
        losses++
        matchResult = 'Loss'
        score = 0
      } else {
        ties++
        matchResult = 'Tie'
      }

      // Find opponent's current Elo in our processed matches
      const opponentPreviousMatches = allMatches.filter(m => 
        m.opponent === opponent
      )
      const opponentElo = opponentPreviousMatches.length > 0
        ? opponentPreviousMatches[opponentPreviousMatches.length - 1].opponentElo
        : 1000

      // Calculate new Elos
      const [newPlayerElo, newOpponentElo] = calculateElo(elo, opponentElo, score)
      elo = newPlayerElo

      allMatches.push({
        tournament: tournament.name,
        date: tournament.date,
        opponent,
        result: matchResult,
        playerTeam: playerStanding?.decklist || [],
        opponentTeam: opponentStanding?.decklist || [],
        playerElo: Math.round(newPlayerElo),
        opponentElo: Math.round(opponentElo)
      })
    }
  }

  return {
    username,
    elo: Math.round(elo),
    wins,
    losses,
    ties,
    matches: allMatches.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { username } = await params
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
                    <Link 
                      href={`/player/${encodeURIComponent(match.opponent)}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {match.opponent}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.result}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.playerElo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-1">
                      {match.playerTeam.map((pokemon, i) => (
                        <PokemonSprite key={i} id={pokemon.id} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-1">
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