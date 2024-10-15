import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchUserProfile, updateProfile } from '@/store/userSlice'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'

export default function UserProfile() {
  const dispatch = useDispatch<AppDispatch>()
  const { name, email, isLoading, error } = useSelector((state: RootState) => state.user)
  const [formName, setFormName] = useState(name || '')
  const [formEmail, setFormEmail] = useState(email || '')

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  useEffect(() => {
    if (name !== undefined) setFormName(name)
    if (email !== undefined) setFormEmail(email)
  }, [name, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updateProfile({ name: formName, email: formEmail })).unwrap()
      toast.success('プロフィールが更新されました')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('プロフィールの更新に失敗しました')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
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