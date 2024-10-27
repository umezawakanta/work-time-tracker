import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/useAuth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'

export default function UserProfile() {
  const { user, fetchUser, updateProfile } = useAuth()
  const [formName, setFormName] = useState(user?.name || '')
  const [formEmail, setFormEmail] = useState(user?.email || '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        await fetchUser()
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('ユーザー情報の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (!user) {
      loadUserData()
    }
  }, [fetchUser, user])

  useEffect(() => {
    if (user) {
      setFormName(user.name || '')
      setFormEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateProfile({ name: formName, email: formEmail })
      toast.success('プロフィールが更新されました')
      await fetchUser() // プロフィール更新後に最新のユーザー情報を取得
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>ユーザープロフィール</CardTitle>
          <CardDescription>あなたの情報を表示・更新します</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="名前を入力してください"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                placeholder="メールアドレスを入力してください"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '更新中...' : '更新'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}