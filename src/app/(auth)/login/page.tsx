'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login({ email, password })
        } catch (err: unknown) {
            setError((err as { error?: string })?.error || 'Login failed')
            setLoading(false)
        }
    }

    return (
        <div className={styles.formCard}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Enter your sanctuary</p>

            <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Entering...' : 'Sign In'}
                </button>

                {error && <div className={styles.error}>{error}</div>}
            </form>

            <div className={styles.footer}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className={styles.link}>
                    Join Circle
                </Link>
            </div>
        </div>
    )
}
