import { useMemo, useState } from 'react';
import type { Category } from '@/types';

const DEFAULT_COLOR = '#2563EB';
const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6})$/;

const normalizeHexColor = (value: string): string => {
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed.toUpperCase() : DEFAULT_COLOR;
};

export const useCategoryManagerState = () => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState(DEFAULT_COLOR);

  const canCreate = useMemo(() => newName.trim().length > 0, [newName]);

  const beginEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setEditingColor(normalizeHexColor(category.color));
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName('');
    setEditingColor(DEFAULT_COLOR);
  };

  return {
    newName,
    newColor,
    editingCategoryId,
    editingName,
    editingColor,
    canCreate,
    setNewName,
    setNewColor,
    setEditingName,
    setEditingColor,
    beginEdit,
    cancelEdit,
    normalizeHexColor,
  };
};
