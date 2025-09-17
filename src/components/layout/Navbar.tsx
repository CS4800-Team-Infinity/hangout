import Link from 'next/link'

export function Navbar() {
    return (
        <nav className="w-full mx-auto h-16 border-b border-border border-neutral-800 fixed top-0 left-0 right-0 backdrop-blur">
            <div className="flex items-center max-w-6xl mx-auto h-full px-8 flex justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-white"
                >
                    hangout
                </Link>
                <div className="gap-4 flex items-center">
                    <Link
                        href="/"
                        className="text-sm text-zinc-400 hover:text-white transition-all duration-200"
                    >
                        login
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-black bg-white border border-none px-4 py-2 rounded-3xl hover:scale-105 transition-all duration-200"
                        style={{ boxShadow: '0 0 16px rgba(226, 205, 205, 0.8)' }}
                    >
                        sign up
                    </Link>
                </div>
            </div>
        </nav>
    )
}