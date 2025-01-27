import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-gray-900 text-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl font-bold hover:text-gray-200"
        >
          VGC Leaderboard
        </Link>
        <Link 
          href="/" 
          className="text-sm font-medium hover:text-gray-200"
        >
          Home
        </Link>
      </nav>
    </header>
  )
}

export default Header 