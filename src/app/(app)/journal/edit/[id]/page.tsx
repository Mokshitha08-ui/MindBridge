'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from '../../create/create.module.css'

export default function EditJournalPage() {
    const router = useRouter()
    const { id } = useParams()
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPrivate: true
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const res = await fetch(`/api/journal/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        title: data.journal.title,
                        content: data.journal.content,
                        isPrivate: data.journal.isPrivate
                    })
                } else {
                    console.error('Failed to fetch journal')
                    router.push('/journal')
                }
            } catch (e) {
                console.error(e)
                router.push('/journal')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchJournal()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch(`/api/journal/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (data.journal) {
                router.push('/journal')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry?')) return

        try {
            const res = await fetch(`/api/journal/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                router.push('/journal')
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return (
        <div className={styles.container}>
            <p>Loading journal entry...</p>
        </div>
    )

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Journal Entry</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label className={styles.label}>Title</label>
                    <input
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Title of your entry..."
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Content</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                        placeholder="Write your thoughts here..."
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.isPrivate}
                            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                        />
                        Keep this entry private
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ color: 'var(--destructive)', borderColor: 'var(--destructive)' }}>
                            Delete
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Update Entry'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
