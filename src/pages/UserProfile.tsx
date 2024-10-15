import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { updateUser } from '@/store/userSlice'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-hot-toast'

export default function UserProfile() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(updateUser({ name, email }))
    toast.success('プロフィールが更新されました')
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">更新</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}