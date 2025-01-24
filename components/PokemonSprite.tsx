import Image from 'next/image'

interface PokemonSpriteProps {
  id: string
  size?: number
}

const PokemonSprite = ({ id, size = 40 }: PokemonSpriteProps) => {
  return (
    <div className="relative flex ">
      <Image
        src={`https://r2.limitlesstcg.net/pokemon/gen9/${id}.png`}
        alt={id}
        // fill
        // width={size}
        width={30}
        height={30}
        // height={size}
        className="inline-block"
      />
    </div>
  )
}

export default PokemonSprite