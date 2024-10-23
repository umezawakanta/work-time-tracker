'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, ChevronRight, ChevronDown, Edit2, Save } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface WBSItem {
  id: string
  name: string
  children: WBSItem[]
  description?: string
  estimatedHours?: number
}

export default function WBSCreator() {
  const [wbs, setWbs] = useState<WBSItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingHours, setEditingHours] = useState('')

  const addItem = (parentId: string | null = null) => {
    const newItem: WBSItem = { 
      id: uuidv4(), 
      name: newItemName, 
      children: [],
      description: '',
      estimatedHours: 0
    }
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

  const startEditing = (item: WBSItem) => {
    setEditingItem(item.id)
    setEditingName(item.name)
    setEditingDescription(item.description || '')
    setEditingHours(item.estimatedHours?.toString() || '')
  }

  const saveEditing = (id: string) => {
    setWbs(updateWbsItem(wbs, id, (item) => ({
      ...item,
      name: editingName,
      description: editingDescription,
      estimatedHours: parseFloat(editingHours) || 0
    })))
    setEditingItem(null)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const reorder = (list: WBSItem[], startIndex: number, endIndex: number) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    setWbs(reorder(wbs, result.source.index, result.destination.index))
  }

  const renderWbsItem = (item: WBSItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const marginClass = getMarginClass(depth)
    const isEditing = editingItem === item.id

    return (
        <Draggable key={item.id} draggableId={item.id} index={depth}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
          >
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
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="説明"
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={editingHours}
                      onChange={(e) => setEditingHours(e.target.value)}
                      placeholder="見積時間"
                      className="w-full"
                    />
                    <Button onClick={() => saveEditing(item.id)}>
                      <Save className="h-4 w-4 mr-2" /> 保存
                    </Button>
                  </div>
                ) : (
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                    {item.estimatedHours !== undefined && (
                      <span className="text-sm text-gray-500 ml-2">({item.estimatedHours}時間)</span>
                    )}
                  </div>
                )}
              </div>
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {isExpanded && (
              <Droppable droppableId={item.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {item.children.map((child) => renderWbsItem(child, depth + 1))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
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
        )}
      </Draggable>
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="root">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {wbs.map((item) => renderWbsItem(item))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  )
}

const getMarginClass = (depth: number) => {
  const margin = depth * 5;
  return `ml-${margin}`;
};