export interface PropertyType {
  id: string
  name: string
  color: string
}

export const propertyTypeColors: Record<string, string> = {
  apartment: '#3B82F6',
  villa: '#10B981',
  land: '#F59E0B',
  shop: '#EF4444',
  office: '#8B5CF6',
  house: '#EC4899',
  farm: '#84CC16',
  building: '#6366F1',
  studio: '#14B8A6',
  warehouse: '#F97316',
}

export const propertyTypes: PropertyType[] = [
  { id: 'apartment', name: 'شقة', color: '#3B82F6' },
  { id: 'villa', name: 'فيلا', color: '#10B981' },
  { id: 'land', name: 'أرض', color: '#F59E0B' },
  { id: 'shop', name: 'محل تجاري', color: '#EF4444' },
  { id: 'office', name: 'مكتب', color: '#8B5CF6' },
  { id: 'house', name: 'منزل', color: '#EC4899' },
  { id: 'farm', name: 'مزرعة', color: '#84CC16' },
  { id: 'building', name: 'عمارة', color: '#6366F1' },
  { id: 'studio', name: 'استوديو', color: '#14B8A6' },
  { id: 'warehouse', name: 'مستودع', color: '#F97316' },
]

export const getPropertyColor = (typeId: string): string => {
  const type = propertyTypes.find(t => t.id === typeId)
  return type?.color ?? '#F97316'
}
