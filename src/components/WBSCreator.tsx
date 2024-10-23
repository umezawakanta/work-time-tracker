'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus, ChevronRight, ChevronDown, Edit2, Save } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import './WBSCreator.css'

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
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const addItem = (parentId: string | null = null) => {
    const newItem: WBSItem = {
      id: uuidv4(),
      wbsNumber: `${wbs.length + 1}`,
      name: newItemName,
      assignee: '',
      startDate: undefined,
      endDate: undefined,
      duration: 0,
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

  const renderWbsItem = (item: WBSItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const isEditing = editingItem === item.id

    return (
      <Draggable key={item.id} draggableId={item.id} index={depth}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <TableRow>
              <TableCell>
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
              <TableCell className="font-medium">
                {isEditing ? (
                  <Input
                    value={item.name}
                    onChange={(e) => setWbs(updateWbsItem(wbs, item.id, (i) => ({ ...i, name: e.target.value })))}
                  />
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={item.assignee}
                    onChange={(e) => setWbs(updateWbsItem(wbs, item.id, (i) => ({ ...i, assignee: e.target.value })))}
                  />
                ) : (
                  item.assignee
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <DatePicker
                    date={item.startDate}
                    setDate={(date) => setWbs(updateWbsItem(wbs, item.id, (i) => ({ ...i, startDate: date })))}
                  />
                ) : (
                  item.startDate?.toLocaleDateString()
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <DatePicker
                    date={item.endDate}
                    setDate={(date) => setWbs(updateWbsItem(wbs, item.id, (i) => ({ ...i, endDate: date })))}
                  />
                ) : (
                  item.endDate?.toLocaleDateString()
                )}
              </TableCell>
              <TableCell>{item.duration}</TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    value={item.progress}
                    onChange={(e) => setWbs(updateWbsItem(wbs, item.id, (i) => ({ ...i, progress: Number(e.target.value) })))}
                    min={0}
                    max={100}
                  />
                ) : (
                  <Progress value={item.progress} className="w-[60px]" />
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Button onClick={() => setEditingItem(null)}>
                    <Save className="h-4 w-4 mr-2" /> 保存
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditingItem(item.id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
      <div className="gantt-chart">
        <h3 className="gantt-chart-title">ガントチャート</h3>
        <div className="gantt-chart-container" data-height={wbs.length * 30}>
          {wbs.map((item, index) => {
            if (!item.startDate || !item.endDate) return null

            const left = Math.round(((item.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100)
            const width = Math.round(((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100)
            const hue = Math.round(item.progress * 3.6) // 0-100 progress maps to 0-360 hue

            return (
              <div
                key={item.id}
                className={`gantt-chart-bar gantt-top-${index} gantt-left-${left} gantt-width-${width} gantt-hue-${hue}`}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WBS番号</TableHead>
                <TableHead>タスク名</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>期間</TableHead>
                <TableHead>進捗</TableHead>
                <TableHead>アクション</TableHead>
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