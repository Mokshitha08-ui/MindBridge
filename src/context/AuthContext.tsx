'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    username: string
    displayName?: string
    avatarUrl?: string
    bio?: string
    tags?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (data: Record<string, unknown>) => Promise<void>
    register: (data: Record<string, unknown>) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const refreshUser = async () => {
        try {
            const res = await fetch('/api/auth/me')
            const data = await res.json()
            setUser(data.user)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    const login = async (data: Record<string, unknown>) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw await res.json()
        const json = await res.json()
        setUser(json.user)
        router.push('/dashboard')
        router.refresh()
    }

    const register = async (data: Record<string, unknown>) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw await res.json()
        const json = await res.json()
        setUser(json.user)
        router.push('/dashboard')
        router.refresh()
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setUser(null)
        router.push('/login')
        router.refresh()
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
