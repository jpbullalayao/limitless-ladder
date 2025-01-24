import Image from 'next/image'

import { cn } from "@/lib/utils";

interface PokemonSpriteProps {
  id: string
  className?: string
}

const PokemonSprite = ({ id, className }: PokemonSpriteProps) => {
  return (
    <div className={cn("relative flex h-[30px] w-full", className)}>
      <Image
        src={`https://r2.limitlesstcg.net/pokemon/gen9/${id}.png`}
        alt={id}
        fill
        className="inline-block"
      />
    </div>
  )
}

export default PokemonSprite