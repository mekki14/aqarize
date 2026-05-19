'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ArrowRight, ZoomIn } from 'lucide-react'

interface ImageViewerProps {
  images: string[]
  captions?: string[]
  initialIndex?: number
}

export default function ImageViewer({ images, captions = [], initialIndex = 0 }: ImageViewerProps) {
  const [mode, setMode] = useState<'gallery' | 'carousel'>(initialIndex !== undefined && initialIndex > 0 ? 'carousel' : 'gallery')
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex, loop: true, dragFree: false })
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = useCallback((index: number) => {
    if (mode === 'carousel') {
      emblaApi?.scrollTo(index)
    } else {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsTransitioning(false)
      }, 150)
    }
  }, [mode, emblaApi])

  const openCarousel = (index: number) => {
    setCurrentIndex(index)
    setSelectedIndex(index)
    setMode('carousel')
    setTimeout(() => emblaApi?.scrollTo(index), 50)
  }

  const closeCarousel = () => {
    setMode('gallery')
    setIsZoomed(false)
  }

  const toggleZoom = () => {
    setIsZoomed(prev => !prev)
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await imageContainerRef.current?.requestFullscreen()
        setIsFullscreen(true)
      } catch {
        console.error('Fullscreen not supported')
      }
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    setIsZoomed(false)
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    setIsZoomed(false)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'carousel') return
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          scrollPrev()
          break
        case 'ArrowLeft':
          e.preventDefault()
          scrollNext()
          break
        case 'Escape':
          e.preventDefault()
          if (isZoomed) {
            setIsZoomed(false)
          } else if (isFullscreen) {
            document.exitFullscreen()
          } else {
            closeCarousel()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, isZoomed, isFullscreen, scrollPrev, scrollNext])

  const preloadAdjacentImages = useCallback((index: number) => {
    const prevIndex = (index - 1 + images.length) % images.length
    const nextIndex = (index + 1) % images.length
    
    ;[prevIndex, nextIndex].forEach(idx => {
      const img = new Image()
      img.src = images[idx]
    })
  }, [images])

  useEffect(() => {
    preloadAdjacentImages(selectedIndex)
  }, [selectedIndex, preloadAdjacentImages])

  if (images.length === 0) return null

  if (mode === 'carousel') {
    return (
      <div ref={imageContainerRef} className="relative h-72 bg-black group" role="region" aria-label="معرض الصور">
        <div className="overflow-hidden h-full cursor-zoom-in" ref={emblaRef} onClick={toggleZoom}>
          <div className="flex h-full">
            {images.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 relative">
                <img
                  src={img}
                  alt={captions[idx] || `صورة ${idx + 1}`}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                {captions[idx] && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
                    <span className="text-sm text-white/90">{captions[idx]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <button
            onClick={(e) => { e.stopPropagation(); scrollPrev() }}
            className="absolute end-3 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors pointer-events-auto opacity-0 group-hover:opacity-100"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); scrollNext() }}
            className="absolute start-3 top-1/2 -translate-y-1/2 size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors pointer-events-auto opacity-0 group-hover:opacity-100"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>

        <div className="absolute top-3 start-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); closeCarousel() }}
            className="size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            aria-label="العودة إلى المعرض"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>

        <div className="absolute top-3 end-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleZoom() }}
            className="size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            aria-label={isZoomed ? 'تصغير' : 'تكبير'}
          >
            {isZoomed ? <Minimize2 className="size-5" /> : <ZoomIn className="size-5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
            className="size-11 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>

        <div className="absolute bottom-3 start-1/2 -translate-x-1/2 flex items-center gap-3">
          {images.length <= 8 ? (
            <div className="flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); scrollToIndex(idx) }}
                  className={`size-2.5 rounded-full transition-all ${
                    idx === selectedIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`انتقال إلى الصورة ${idx + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => openCarousel(currentIndex)}>
        <img
          src={images[currentIndex]}
          alt={captions[currentIndex] || `صورة ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-150"
          style={{ opacity: isTransitioning ? 0 : 1 }}
          loading="eager"
        />
        {captions[currentIndex] && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
            <span className="text-sm text-white/90">{captions[currentIndex]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
            عرض الكل ({images.length})
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 p-3 pt-2 overflow-x-auto scrollbar-thin">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
              idx === currentIndex
                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                : 'opacity-70 hover:opacity-100'
            }`}
            aria-label={`عرض الصورة ${idx + 1}`}
          >
            <img
              src={img}
              alt={captions[idx] || `صورة ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {idx === 0 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">الرئيسية</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
