'use client'

import dynamic from 'next/dynamic'
import { useSession } from '@/lib/auth-client'
import { useMediaQuery } from '@/hooks/use-media-query'
import PropertySidebar from './property-sidebar'
import { HeroContent } from './hero/hero-content'
import { HeroSearchBar } from './hero/hero-search-bar'
import { HeroFloatingButtons } from './hero/hero-floating-buttons'
import { HeroProvider, useHero } from './hero/hero-context'

const HeroMap = dynamic(() => import('./hero-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/20 animate-pulse" />
  ),
})

function HeroInner() {
  const { data: session } = useSession()
  const isMobile = useMediaQuery("max-sm")

  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isDetailOpen,
    setIsDetailOpen,
    selectedPropertyId,
    setSelectedPropertyId,
    isContentHidden,
    mapFocus,
    mapProperties,
    fetchProperties,
    clearFilters,
  } = useHero()

  const handleSearchClick = () => {
    setIsDrawerOpen(true)
    fetchProperties()
  }

  const handleClearFilters = () => {
    clearFilters()
    if (isDrawerOpen) {
      setTimeout(() => {
        fetchProperties()
      }, 0)
    }
  }

  return (
    <section className="relative w-full min-h-dvh lg:min-h-[900px] flex flex-col overflow-hidden bg-background">
      <HeroFloatingButtons
        isDrawerOpen={isDrawerOpen}
        onGoBack={() => setIsDrawerOpen(false)}
        session={session}
      />

      <div className={`absolute inset-0 z-0 overflow-hidden flex items-center justify-center ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none sm:pointer-events-auto'}`}>
        <div
          className="w-[120%] h-[120%] lg:w-[150%] lg:h-[150%] max-w-none opacity-85 transition-all duration-700"
          style={{
            transform: isDrawerOpen
              ? (isDetailOpen
                ? 'perspective(1200px) rotateX(15deg) scale(1.05) translateY(5%)'
                : 'perspective(800px) rotateX(0deg) scale(1) translateY(0)')
              : 'perspective(800px) rotateX(25deg) scale(1.1) translateY(10%)',
          }}
        >
          <HeroMap
            center={mapFocus?.center}
            zoom={mapFocus?.zoom}
            selectedPropertyId={selectedPropertyId}
            onPropertyClick={(id) => {
              setSelectedPropertyId(id)
              setIsDrawerOpen(true)
              setIsDetailOpen(true)
            }}
            properties={mapProperties}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className={`absolute inset-0 z-0 pointer-events-none bg-linear-to-b from-background via-background/95 via-60% to-background/40 w-full transition-all duration-700 ease-out ${isDrawerOpen ? 'hidden' : 'flex opacity-100'}`} />

      <div
        className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none z-0 animate-hero-drift"
        aria-hidden
      />
      <div
        className="absolute bottom-0 -left-20 w-[450px] h-[450px] rounded-full bg-foreground/[0.015] blur-[90px] pointer-events-none z-0 animate-hero-drift-reverse"
        aria-hidden
      />

      <div
        className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-20 py-24 max-w-7xl mx-auto w-full transition-all duration-500 ease-out ${isDrawerOpen
          ? 'hidden opacity-0 scale-[0.97] translate-y-4 pointer-events-none'
          : 'flex opacity-100 scale-100 translate-y-0 pointer-events-auto'
          } ${isContentHidden ? 'hidden' : ''}`}
      >
        <HeroContent />

        <div
          className="mt-12 w-full max-w-4xl mx-auto animate-hero-scale-in"
          style={{ animationDelay: '400ms' }}
        >
          <HeroSearchBar onSearch={handleSearchClick} />
        </div>
      </div>


      <PropertySidebar
        isDrawerOpen={isDrawerOpen}
        onDrawerOpenChange={setIsDrawerOpen}
        onDetailOpenChange={setIsDetailOpen}
        onPropertySelect={setSelectedPropertyId}
        forceOpenPropertyId={selectedPropertyId}
        onClearAll={handleClearFilters}
      />
    </section>
  )
}

export default function Hero() {
  return (
    <HeroProvider>
      <HeroInner />
    </HeroProvider>
  )
}
