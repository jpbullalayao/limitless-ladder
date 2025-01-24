import Link from 'next/link'

interface Player {
  username: string
  elo: number
  wins: number
  losses: number
  ties: number
}

interface LeaderboardTableProps {
  players: Player[]
}

const LeaderboardTable = ({ players }: LeaderboardTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {players.map((player, index) => (
            <tr key={player.username}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/player/${encodeURIComponent(player.username)}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {player.username}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {Math.round(player.elo)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {player.wins}-{player.losses}{player.ties > 0 ? `-${player.ties}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeaderboardTable 