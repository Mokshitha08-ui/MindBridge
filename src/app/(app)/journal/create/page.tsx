'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './create.module.css'

export default function CreateJournalPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPrivate: true
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
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
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>New Journal Entry</h1>

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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </form>
        </div>
    )
}
