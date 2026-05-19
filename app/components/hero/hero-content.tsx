'use client'

export function HeroContent() {
  return (
    <div className="max-w-lg lg:max-w-2xl pb-6 pointer-events-auto text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/40 backdrop-blur-md border border-border/30 text-xs font-medium text-muted-foreground mb-8 animate-hero-fade-up">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        منصتنا العقارية الأولى في الجزائر
      </div>

      <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-black leading-[1.08] tracking-tight animate-hero-fade-up" style={{ animationDelay: '100ms' }}>
        <span className="text-foreground">منصَّـــتك الاولى</span>
        <br />
        <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/85 to-foreground/55">
          للعقار في الجزائر.
        </span>
      </h1>

      <p className="mt-6 text-lg sm:text-xl text-muted-foreground/90 font-medium max-w-lg mx-auto leading-relaxed animate-hero-fade-up" style={{ animationDelay: '250ms' }}>
        اكتشف أفضل العقارات في الجزائر — بيع، شراء، وإيجار بكل سهولة وثقة.
      </p>
    </div>
  )
}
