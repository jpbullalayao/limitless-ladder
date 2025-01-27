export interface Tournament {
  id: string
  name: string
  date: string
  game: string
}

export interface TournamentStanding {
  player: string
  decklist: MatchPokemon[]
}

export interface TournamentMatch {
  player1: string
  player2: string
  winner: string | 0
  round?: number
}

export interface MatchPokemon {
  ability: string
  attacks: string[]
  id: string
  item: string
  name: string
  tera: string
}
