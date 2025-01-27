export const calculateElo = (rating1: number, rating2: number, score: number) => {
  const K = (rating: number) => {
    if (rating >= 1600) return 32
    if (rating >= 1300) return 40
    if (rating >= 1100) return 50
    if (rating === 1000) return score === 1 ? 80 : 20
    // Linear scaling between 1001-1099
    return score === 1 
      ? 80 - (30 * ((rating - 1000) / 100))
      : 20 + (30 * ((rating - 1000) / 100))
  }

  const expectedScore = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400))
  
  const newRating1 = Math.max(1000, rating1 + K(rating1) * (score - expectedScore))
  const newRating2 = Math.max(1000, rating2 + K(rating2) * ((1 - score) - (1 - expectedScore)))

  return [newRating1, newRating2]
} 