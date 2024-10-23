'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus, ChevronRight, ChevronDown, Edit2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface WBSItem {
  id: string
  wbsNumber: string
  name: string
  assignee: string
  startDate: Date | undefined
  endDate: Date | undefined
  duration: number
  progress: number
  children: WBSItem[]
}

export default function WBSCreator() {
  const [wbs, setWbs] = useState<WBSItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingItem, setEditingItem] = useState<WBSItem | null>(null)

  useEffect(() => {
    // Add some sample data for demonstration
    if (wbs.length === 0) {
      setWbs([
        {
          id: uuidv4(),
          wbsNumber: '1',
          name: 'シェルスクリプト作成',
          assignee: '山田太郎',
          startDate: new Date(2024, 9, 23),
          endDate: new Date(2024, 9, 24),
          duration: 1,
          progress: 50,
          children: []
        },
        {
          id: uuidv4(),
          wbsNumber: '2',
          name: 'WBS作成',
          assignee: '鈴木花子',
          startDate: new Date(2024, 9, 24),
          endDate: new Date(2024, 9, 25),
          duration: 1,
          progress: 25,
          children: []
        }
      ])
    }
  }, [])

  const addItem = (parentId: string | null = null) => {
    const newItem: WBSItem = {
      id: uuidv4(),
      wbsNumber: `${wbs.length + 1}`,
      name: newItemName,
      assignee: '',
      startDate: new Date(),
      endDate: new Date(),
      duration: 1,
      progress: 0,
      children: [],
    }
    if (parentId === null) {
      setWbs([...wbs, newItem])
    } else {
      setWbs(updateWbsItem(wbs, parentId, (item) => ({
        ...item,
        children: [...item.children, { ...newItem, wbsNumber: `${item.wbsNumber}.${item.children.length + 1}` }],
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

  const handleEditSave = (editedItem: WBSItem) => {
    setWbs(updateWbsItem(wbs, editedItem.id, () => editedItem))
    setEditingItem(null)
  }

  const renderWbsItem = (item: WBSItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id)

    return (
      <Draggable key={item.id} draggableId={item.id} index={depth}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <TableRow className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {item.children.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6 mr-2"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
                {item.wbsNumber}
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.assignee}</TableCell>
              <TableCell>{item.startDate?.toLocaleDateString()}</TableCell>
              <TableCell>{item.endDate?.toLocaleDateString()}</TableCell>
              <TableCell>{item.duration}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Progress value={item.progress} className="w-[60px] mr-2" />
                  <span className="text-sm text-gray-500">{item.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>タスク編集</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            タスク名
                          </Label>
                          <Input
                            id="name"
                            value={editingItem?.name}
                            onChange={(e) => setEditingItem(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="assignee" className="text-right">
                            担当者
                          </Label>
                          <Input
                            id="assignee"
                            value={editingItem?.assignee}
                            onChange={(e) => setEditingItem(prev => prev ? {...prev, assignee: e.target.value} : null)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="startDate" className="text-right">
                            開始日
                          </Label>
                          <DatePicker
                            date={editingItem?.startDate}
                            setDate={(date) => setEditingItem(prev => prev ? {...prev, startDate: date} : null)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="endDate" className="text-right">
                            終了日
                          </Label>
                          <DatePicker
                            date={editingItem?.endDate}
                            setDate={(date) => setEditingItem(prev => prev ? {...prev, endDate: date} : null)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="progress" className="text-right">
                            進捗
                          </Label>
                          <Input
                            id="progress"
                            type="number"
                            value={editingItem?.progress}
                            onChange={(e) => setEditingItem(prev => prev ? {...prev, progress: Number(e.target.value)} : null)}
                            className="col-span-3"
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>
                      <DialogTrigger asChild>
                        <Button onClick={() => editingItem && handleEditSave(editingItem)}>保存</Button>
                      </DialogTrigger>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            {isExpanded && (
              <Droppable droppableId={item.id}>
                {(provided) => (
                  <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                    {item.children.map((child) => renderWbsItem(child, depth + 1))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>
    )
  }

  const renderGanttChart = () => {
    const allDates = wbs.flatMap(item => [
      item.startDate,
      item.endDate,
      ...item.children.flatMap(child => [child.startDate, child.endDate])
    ]).filter((date): date is Date => date !== undefined)

    if (allDates.length === 0) {
      return null
    }

    const startDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const endDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">ガントチャート</h3>
        <div className="relative" style={{ height: `${wbs.length * 40 + 40}px` }}>
          {/* Time scale */}
          <div className="absolute top-0 left-0 right-0 h-8 flex">
            {Array.from({ length: totalDays + 1 }).map((_, index) => {
              const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000)
              return (
                <div
                  key={index}
                  className="flex-1 border-r border-gray-200 text-xs text-gray-500 flex items-end justify-center pb-1"
                >
                  {date.getDate()}
                </div>
              )
            })}
          </div>
          {/* Gantt bars */}
          {wbs.map((item, index) => {
            if (!item.startDate || !item.endDate) return null

            const left = ((item.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
            const width = ((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100

            return (
              <div
                key={item.id}
                className="absolute h-8 bg-blue-500 rounded-md flex items-center px-2 text-white text-sm"
                style={{
                  top: `${index * 40 + 40}px`,
                  left: `${left}%`,
                  width: `${width}%`,
                }}
              >
                {item.name}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WBS作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <Input
            placeholder="新しいタスク"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={() => addItem()}>
            <Plus className="h-4 w-4 mr-2" /> タスク追加
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead  className="w-[100px]">WBS番号</TableHead>
                <TableHead>タスク名</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead className="w-[80px]">期間</TableHead>
                <TableHead className="w-[120px]">進捗</TableHead>
                <TableHead className="w-[100px]">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="root">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {wbs.map((item) => renderWbsItem(item))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
        {renderGanttChart()}
      </CardContent>
    </Card>
  )
}