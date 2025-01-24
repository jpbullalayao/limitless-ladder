import Image from 'next/image'

interface PokemonSpriteProps {
  id: string
  size?: number
}

const PokemonSprite = ({ id, size = 40 }: PokemonSpriteProps) => {
  return (
    <Image
      src={`https://r2.limitlesstcg.net/pokemon/gen9/${id}.png`}
      alt={id}
      width={size}
      height={size}
      className="inline-block"
    />
  )
}

export default PokemonSprite