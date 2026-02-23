import { useMemo, useState } from 'react';
import type { ReadingCollection } from '@/types';

const DEFAULT_COLOR = '#2563EB';
const DEFAULT_ICON = 'books';
const DEFAULT_TEMPLATE_ID = 'classic';
const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6})$/;

const normalizeHexColor = (value: string): string => {
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed.toUpperCase() : DEFAULT_COLOR;
};

const normalizeIcon = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : DEFAULT_ICON;
};

const normalizeTemplateId = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : DEFAULT_TEMPLATE_ID;
};

export const useReadingCollectionManagerState = () => {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON);
  const [newTemplateId, setNewTemplateId] = useState(DEFAULT_TEMPLATE_ID);

  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingColor, setEditingColor] = useState(DEFAULT_COLOR);
  const [editingIcon, setEditingIcon] = useState(DEFAULT_ICON);
  const [editingTemplateId, setEditingTemplateId] = useState(DEFAULT_TEMPLATE_ID);

  const canCreate = useMemo(() => newName.trim().length > 0, [newName]);

  const beginEdit = (collection: ReadingCollection) => {
    setEditingCollectionId(collection.id);
    setEditingName(collection.name);
    setEditingDescription(collection.description ?? '');
    setEditingColor(normalizeHexColor(collection.color));
    setEditingIcon(normalizeIcon(collection.icon));
    setEditingTemplateId(normalizeTemplateId(collection.templateId));
  };

  const cancelEdit = () => {
    setEditingCollectionId(null);
    setEditingName('');
    setEditingDescription('');
    setEditingColor(DEFAULT_COLOR);
    setEditingIcon(DEFAULT_ICON);
    setEditingTemplateId(DEFAULT_TEMPLATE_ID);
  };

  const clearCreate = () => {
    setNewName('');
    setNewDescription('');
    setNewColor(DEFAULT_COLOR);
    setNewIcon(DEFAULT_ICON);
    setNewTemplateId(DEFAULT_TEMPLATE_ID);
  };

  return {
    newName,
    newDescription,
    newColor,
    newIcon,
    newTemplateId,
    editingCollectionId,
    editingName,
    editingDescription,
    editingColor,
    editingIcon,
    editingTemplateId,
    canCreate,
    setNewName,
    setNewDescription,
    setNewColor,
    setNewIcon,
    setNewTemplateId,
    setEditingName,
    setEditingDescription,
    setEditingColor,
    setEditingIcon,
    setEditingTemplateId,
    beginEdit,
    cancelEdit,
    clearCreate,
    normalizeHexColor,
    normalizeIcon,
    normalizeTemplateId,
  };
};
