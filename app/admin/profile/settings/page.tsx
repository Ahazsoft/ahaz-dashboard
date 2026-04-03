'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type User = {
  username?: string
  email?: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User>({ username: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:3001/api/auth/me', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load user')
        const data = await res.json()
        setUser({ username: data.username ?? '', email: data.email ?? '' })
      } catch (err) {
        console.error(err)
        toast({ title: 'Unable to load user data' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('http://localhost:3001/api/auth/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, email: user.email }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast({ title: 'Profile updated' })
      router.push('/admin/profile')
    } catch (err) {
      console.error(err)
      toast({ title: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow px-6 py-6">
        <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <Input
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/profile')}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
