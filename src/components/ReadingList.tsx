import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ReadingListItem {
  id: string;
  title: string;
  author: string;
  priority: number;
  notes: string;
}

const ReadingList: React.FC = () => {
  const [items, setItems] = useState<ReadingListItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<ReadingListItem, 'id'>>({
    title: '',
    author: '',
    priority: 1,
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setItems((prev) => [...prev, { ...newItem, id }]);
    setNewItem({ title: '', author: '', priority: 1, notes: '' });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>新しい本を追加</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              value={newItem.title}
              onChange={handleInputChange}
              placeholder="本のタイトル"
            />
          </div>
          <div className="space-y-2 mt-2">
            <Label htmlFor="author">著者</Label>
            <Input
              id="author"
              name="author"
              value={newItem.author}
              onChange={handleInputChange}
              placeholder="著者名"
            />
          </div>
          <div className="space-y-2 mt-2">
            <Label htmlFor="priority">優先度 (1-5)</Label>
            <Input
              id="priority"
              name="priority"
              type="number"
              min="1"
              max="5"
              value={newItem.priority}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2 mt-2">
            <Label htmlFor="notes">メモ</Label>
            <Textarea
              id="notes"
              name="notes"
              value={newItem.notes}
              onChange={handleInputChange}
              placeholder="メモを入力"
            />
          </div>
          <Button onClick={handleAddItem} className="mt-4">
            追加
          </Button>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="reading-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-2"
                    >
                      <CardContent className="flex justify-between items-center p-4">
                        <div>
                          <h3 className="font-bold">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.author}</p>
                          <p className="text-sm">優先度: {item.priority}</p>
                          {item.notes && <p className="text-sm mt-2">{item.notes}</p>}
                        </div>
                        <Button variant="outline" size="sm">
                          完了
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ReadingList;
