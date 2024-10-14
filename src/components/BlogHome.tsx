import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Share2 } from 'lucide-react'

// 仮のブログ投稿データ
const blogPosts = [
  {
    id: 1,
    title: "作業時間管理のコツ",
    author: "生産性マスター",
    image: "/placeholder.svg?height=200&width=300",
    likes: 38,
    comments: 12,
    category: "生産性"
  },
  {
    id: 2,
    title: "リモートワークでの時間管理",
    author: "在宅ワーカー",
    image: "/placeholder.svg?height=200&width=300",
    likes: 52,
    comments: 8,
    category: "リモートワーク"
  },
  // 他の投稿をここに追加
]

const categories = ["すべて", "生産性", "リモートワーク", "ワークライフバランス", "タイムマネジメント"]

export default function BlogHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ブログ</h1>
      
      <div className="flex justify-between items-center mb-6">
        <Input 
          type="search" 
          placeholder="ブログ記事を検索..." 
          className="max-w-sm"
        />
        <Button>新規投稿</Button>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category} value={category.toLowerCase()}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts
                .filter(post => category === "すべて" || post.category === category)
                .map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <img src={post.image} alt={post.title} className="w-full h-40 object-cover rounded-t-lg" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="mb-2">
                        <Link to={`/blog/${post.id}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-gray-500">著者: {post.author}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}