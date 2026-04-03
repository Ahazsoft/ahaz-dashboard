'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type User = {
  username?: string
  email?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:3001/api/auth/me', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to load user')
        const data = await res.json()
        setUser({ username: data.username, email: data.email })
      } catch (err) {
        console.error(err)
        toast({ title: 'Unable to load profile.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const initials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow px-6 py-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>

        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="text-sm">{initials(user.username)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <div className="ml-auto">
              <Link href="/admin/profile/settings">
                <Button>Profile Settings</Button>
              </Link>
            </div>
          </div>
        ) : (
          <p>No profile data.</p>
        )}
      </div>
    </div>
  )
}
