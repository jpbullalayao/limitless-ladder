import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <Link 
          href="/" 
          className="text-xl font-semibold text-blue-600 hover:text-blue-800"
        >
          Home
        </Link>
      </nav>
    </header>
  )
}

export default Header 