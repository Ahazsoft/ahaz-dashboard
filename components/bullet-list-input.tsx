'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulletListInputProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function BulletListInput({
  items,
  onItemsChange,
  placeholder = 'Enter a bullet point...',
  label = 'Items',
}: BulletListInputProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddItem = () => {
    onItemsChange([...items, '']);
  };

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const handleSaveEdit = (index: number) => {
    handleUpdateItem(index, editValue);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <Button
          type="button"
          onClick={handleAddItem}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Bullet Point
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-2 p-3 rounded-lg border transition-colors',
              editingIndex === index
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <span className="text-gray-400 font-medium mt-2">•</span>
            {editingIndex === index ? (
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder}
                  className="resize-none"
                  rows={2}
                />
                <div className="flex gap-1 flex-col">
                  <Button
                    type="button"
                    onClick={() => handleSaveEdit(index)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p
                  onClick={() => handleStartEdit(index)}
                  className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                >
                  {item || <span className="text-gray-400">Empty bullet point</span>}
                </p>
                <Button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500">No items added yet</p>
        </div>
      )}
    </div>
  );
}
