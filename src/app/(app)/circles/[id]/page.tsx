'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Users, Send, MessageSquare, Lock } from 'lucide-react'
import styles from './circle.module.css'
import { formatDistanceToNow } from 'date-fns'

export default function CirclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [circle, setCircle] = useState<{ id: string; title: string; description: string; isPrivate: boolean; _count: { members: number } } | null>(null)
    const [membership, setMembership] = useState<{ id: string; role: string } | null>(null)
    const [posts, setPosts] = useState<{ id: string; title: string; content: string; createdAt: string; author: { username: string; displayName: string; avatarUrl: string }; _count: { comments: number } }[]>([])
    const [requests, setRequests] = useState<{ id: string; user: { username: string; displayName: string; avatarUrl: string } }[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'posts' | 'requests'>('posts')

    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchCircle = async () => {
        const res = await fetch(`/api/circles/${id}`)
        if (res.ok) {
            const data = await res.json()
            setCircle(data.circle)
            setMembership(data.membership)
        }
    }

    const fetchPosts = async () => {
        const res = await fetch(`/api/circles/${id}/posts`)
        if (res.ok) {
            const data = await res.json()
            setPosts(data.posts || [])
        }
    }

    const fetchRequests = async () => {
        const res = await fetch(`/api/circles/${id}/requests`)
        if (res.ok) {
            const data = await res.json()
            setRequests(data.requests || [])
        }
    }

    useEffect(() => {
        setLoading(true)
        Promise.all([fetchCircle(), fetchPosts()]).then(() => setLoading(false))
    }, [id])

    useEffect(() => {
        if (membership?.role === 'ADMIN') {
            fetchRequests()
        }
    }, [membership])

    const handleJoin = async () => {
        try {
            const res = await fetch(`/api/circles/${id}/join`, { method: 'POST' })
            const contentType = res.headers.get('content-type')

            if (contentType && contentType.includes('application/json')) {
                const data = await res.json()
                if (res.ok) {
                    if (data.member) {
                        setMembership(data.member)
                        fetchPosts()
                    }
                } else {
                    console.error('Join failed:', data.error || 'Unknown error')
                    alert(data.error || 'Failed to join circle')
                }
            } else {
                const text = await res.text()
                console.error('Non-JSON response received:', text)
                alert('Server error. Please try again later.')
            }
        } catch (err) {
            console.error('Error joining circle:', err)
            alert('A network error occurred.')
        }
    }

    const handleApprove = async (memberId: string) => {
        const res = await fetch(`/api/circles/${id}/requests/${memberId}/approve`, { method: 'POST' })
        if (res.ok) {
            fetchRequests()
            fetchCircle() // Update member count
        }
    }

    const handleReject = async (memberId: string) => {
        const res = await fetch(`/api/circles/${id}/requests/${memberId}/reject`, { method: 'POST' })
        if (res.ok) {
            fetchRequests()
        }
    }

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch(`/api/circles/${id}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: postTitle, content: postContent })
            })
            const data = await res.json()
            if (data.post) {
                setPostTitle('')
                setPostContent('')
                fetchPosts()
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!circle) return <div className="p-8">Circle not found</div>

    const isMember = membership?.role === 'MEMBER' || membership?.role === 'ADMIN'
    const isAdmin = membership?.role === 'ADMIN'
    const isPending = membership?.role === 'PENDING'

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{circle.title}</h1>
                    <p className={styles.desc}>{circle.description}</p>
                    <div className={styles.meta}>
                        <span className={styles.badge}>{circle.isPrivate ? 'Private' : 'Public'}</span>
                        <span className={styles.memberCount}><Users size={16} /> {circle._count.members} Members</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    {!membership && (
                        <button onClick={handleJoin} className="btn btn-primary">Join Circle</button>
                    )}
                    {isPending && (
                        <button disabled className="btn btn-ghost">Request Pending</button>
                    )}
                    {isMember && (
                        <button disabled className="btn btn-ghost">Member</button>
                    )}
                </div>
            </header>

            {isMember ? (
                <div className={styles.content}>
                    {isAdmin && (
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                Posts
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'requests' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                Requests {requests.length > 0 && `(${requests.length})`}
                            </button>
                        </div>
                    )}

                    {activeTab === 'posts' ? (
                        <div className={styles.feed}>
                            <form onSubmit={handleCreatePost} className={styles.postForm}>
                                <input
                                    className={styles.postInputTitle}
                                    placeholder="Post Title"
                                    value={postTitle}
                                    onChange={e => setPostTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    className={styles.postInput}
                                    placeholder="Share your thoughts..."
                                    value={postContent}
                                    onChange={e => setPostContent(e.target.value)}
                                    required
                                />
                                <div className={styles.formFooter}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        <Send size={16} style={{ marginRight: '0.5rem' }} /> Post
                                    </button>
                                </div>
                            </form>

                            <div className={styles.posts}>
                                {posts.map(post => (
                                    <div key={post.id} className={styles.postCard}>
                                        <div className={styles.postHeader}>
                                            <div className={styles.author}>
                                                <div className={styles.avatar} style={{ backgroundImage: post.author.avatarUrl ? `url(${post.author.avatarUrl})` : undefined }} />
                                                <span className={styles.authorName}>{post.author.displayName || post.author.username}</span>
                                            </div>
                                            <span className={styles.postDate}>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                                        </div>
                                        <h3 className={styles.postTitle}>{post.title}</h3>
                                        <p className={styles.postBody}>{post.content}</p>
                                        <div className={styles.postFooter}>
                                            <button className={styles.actionBtn}>
                                                <MessageSquare size={16} /> {post._count.comments} Comments
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {posts.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                                        No posts yet. Be the first to share!
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.requests}>
                            <div className={styles.requestsList}>
                                {requests.map(req => (
                                    <div key={req.id} className={styles.requestCard}>
                                        <div className={styles.requestInfo}>
                                            <div className={styles.avatar} style={{ backgroundImage: req.user.avatarUrl ? `url(${req.user.avatarUrl})` : undefined }} />
                                            <div>
                                                <div className={styles.authorName}>{req.user.displayName || req.user.username}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>wants to join</div>
                                            </div>
                                        </div>
                                        <div className={styles.requestActions}>
                                            <button onClick={() => handleApprove(req.id)} className="btn btn-primary">Approve</button>
                                            <button onClick={() => handleReject(req.id)} className="btn btn-ghost">Reject</button>
                                        </div>
                                    </div>
                                ))}
                                {requests.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                                        No pending requests.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.locked}>
                    <Lock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Join this circle to view and share posts.</p>
                </div>
            )}
        </div>
    )
}
