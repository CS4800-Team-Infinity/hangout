'use client';

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    const handleLogout = () => {
        logout();
    };

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
                    {isLoading ? (
                        <div className="text-sm text-zinc-400">loading...</div>
                    ) : isAuthenticated && user ? (
                        <>
                            <div className="text-sm text-zinc-400">
                                welcome, {user.name}!
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="text-sm text-zinc-400 hover:text-white transition-all duration-200 hover:cursor-pointer"
                            >
                                logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-zinc-400 hover:text-white transition-all duration-200"
                            >
                                login
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm text-black bg-white border border-none px-4 py-2 rounded-3xl hover:scale-105 transition-all duration-200"
                                style={{ boxShadow: '0 0 16px rgba(226, 205, 205, 0.8)' }}
                            >
                                sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}