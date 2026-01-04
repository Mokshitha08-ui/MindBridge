'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import styles from './profile.module.css'

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        tags: '',
        avatarUrl: ''
    })
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            })
            if (res.ok) {
                const data = await res.json()
                setFormData(prev => ({ ...prev, avatarUrl: data.url }))
            } else {
                alert('Failed to upload image')
            }
        } catch (err) {
            console.error('Upload error:', err)
            alert('An error occurred during upload')
        } finally {
            setUploading(false)
        }
    }

    // Load user data when available. 
    // Ideally, useAuth should expose a way to refresh user data, or we fetch fresh here.
    // Since we need bio/tags which might not be in initial auth context if not updated, let's fetch 'me' again or rely on specialized endpoint.
    // For simplicity, we'll assume auth context has mostly what we need, but we did add bio/tags to /me endpoint.
    // Let's fetch fresh data to be sure.
    // Sync form data with user context
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                tags: user.tags || '',
                avatarUrl: user.avatarUrl || ''
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                setSuccess(true)
                await refreshUser()
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatar} style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : undefined }} />
                    <div>
                        <h1 className={styles.title}>{user.username}</h1>
                        <p className={styles.email}>{user.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.uploadSection}>
                        <div className={styles.avatarPreview}>
                            <div
                                className={styles.avatar}
                                style={{ backgroundImage: formData.avatarUrl ? `url(${formData.avatarUrl})` : undefined }}
                            />
                            <label className={styles.uploadBtn}>
                                Change Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        {uploading && <p className={styles.uploadingText}>Uploading picture...</p>}
                    </div>

                    <div>
                        <label className={styles.label}>Display Name</label>
                        <input
                            className={styles.input}
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="How should we call you?"
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Bio</label>
                        <textarea
                            className={styles.textarea}
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us a bit about yourself..."
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Interests / Tags (comma separated)</label>
                        <input
                            className={styles.input}
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="e.g., mindfulness, art, coding"
                        />
                    </div>

                    <div className={styles.formFooter}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 3rem', fontSize: '1rem' }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {success && <div className={styles.success}>Profile updated successfully!</div>}
                </form>
            </div>
        </div>
    )
}
