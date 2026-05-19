// Shared Property type used by both API responses and UI components
export interface Property {
    id: number
    dbId?: string
    title: string
    type: string
    wilayaId: number
    wilayaName: string
    price: number
    area: number
    bedrooms?: number
    bathrooms?: number
    description: string
    image: string
    images?: string[]
    center: [number, number]
    polygon: [number, number][]
    address?: string
    status?: string
}

export interface SearchResponse {
    properties: Property[]
    total: number
    page: number
    limit: number
    wilayaCounts: Record<number, number>
    typeCounts: Record<string, number>
}
