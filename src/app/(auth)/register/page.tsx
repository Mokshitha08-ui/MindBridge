'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import styles from '../auth.module.css'

export default function RegisterPage() {
    const { register } = useAuth()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(formData)
        } catch (err: unknown) {
            setError((err as { error?: string })?.error || 'Registration failed')
            setLoading(false)
        }
    }

    return (
        <div className={styles.formCard}>
            <h1 className={styles.title}>Begin Your Journey</h1>
            <p className={styles.subtitle}>Join the Circle of Support</p>

            <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>Username</label>
                    <input
                        name="username"
                        type="text"
                        className="input"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="seeker123"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Display Name (Optional)</label>
                    <input
                        name="displayName"
                        type="text"
                        className="input"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Your Name"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                        name="email"
                        type="email"
                        className="input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Password</label>
                    <input
                        name="password"
                        type="password"
                        className="input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Join Now'}
                </button>

                {error && <div className={styles.error}>{error}</div>}
            </form>

            <div className={styles.footer}>
                Already have an account?{' '}
                <Link href="/login" className={styles.link}>
                    Sign In
                </Link>
            </div>
        </div>
    )
}
