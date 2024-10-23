'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import { twMerge } from 'tailwind-merge';

const getMarginClass = (depth: number) => {
  const margin = depth * 5;
  return `ml-${margin}`;
};

interface WBSItem {
  id: string
  name: string
  children: WBSItem[]
}

export default function WBSCreator() {
  const [wbs, setWbs] = useState<WBSItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const addItem = (parentId: string | null = null) => {
    const newItem: WBSItem = { id: uuidv4(), name: newItemName, children: [] }
    if (parentId === null) {
      setWbs([...wbs, newItem])
    } else {
      setWbs(updateWbsItem(wbs, parentId, (item) => ({
        ...item,
        children: [...item.children, newItem],
      })))
    }
    setNewItemName('')
  }

  const updateWbsItem = (items: WBSItem[], id: string, updateFn: (item: WBSItem) => WBSItem): WBSItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return updateFn(item)
      }
      if (item.children.length > 0) {
        return { ...item, children: updateWbsItem(item.children, id, updateFn) }
      }
      return item
    })
  }

  const deleteItem = (id: string) => {
    const deleteWbsItem = (items: WBSItem[]): WBSItem[] => {
      return items.filter((item) => item.id !== id).map((item) => ({
        ...item,
        children: deleteWbsItem(item.children),
      }))
    }
    setWbs(deleteWbsItem(wbs))
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderWbsItem = (item: WBSItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const marginClass = getMarginClass(depth);
    return (
      <div key={item.id} className="mb-2">
        <div className="flex items-center space-x-2">
          {item.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          <div className={twMerge("flex-grow", marginClass)}>
            {item.name}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {isExpanded && item.children.map((child) => renderWbsItem(child, depth + 1))}
        {isExpanded && (
          <div className="mt-2 ml-6">
            <Input
              placeholder="新しいサブタスク"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-64 mr-2"
            />
            <Button onClick={() => addItem(item.id)}>
              <Plus className="h-4 w-4 mr-2" /> サブタスク追加
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WBS作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="新しいタスク"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-64 mr-2"
          />
          <Button onClick={() => addItem()}>
            <Plus className="h-4 w-4 mr-2" /> タスク追加
          </Button>
        </div>
        <div>
          {wbs.map((item) => renderWbsItem(item))}
        </div>
      </CardContent>
    </Card>
  )
}