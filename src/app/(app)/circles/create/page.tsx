'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './create.module.css'

export default function CreateCirclePage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        isPrivate: false
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/circles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (data.circle) {
                router.push(`/circles/${data.circle.id}`)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create a New Circle</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label className={styles.label}>Circle Title</label>
                    <input
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="e.g., Anxiety Support Group"
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="What is this circle about?"
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Tags (comma separated)</label>
                    <input
                        className="input"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g., anxiety, mental health, talk"
                    />
                </div>

                <div className={styles.group}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.isPrivate}
                            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                        />
                        Private Circle (Requests required to join)
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Circle'}
                    </button>
                </div>
            </form>
        </div>
    )
}
