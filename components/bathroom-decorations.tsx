import { Bath, Droplets, ShowerHeadIcon as Shower, Waves } from "lucide-react"

export function BathroomDecorations() {
  return (
    <>
      {/* Decorative bathroom elements */}
      <div className="absolute top-10 left-10 animate-float hidden md:block">
        <Shower className="h-16 w-16 text-blue-400" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float-delay hidden md:block">
        <Bath className="h-16 w-16 text-pink-400" />
      </div>
      <div className="absolute top-40 right-20 animate-spin-slow hidden md:block">
        <Droplets className="h-12 w-12 text-blue-300" />
      </div>
      <div className="absolute bottom-40 left-20 animate-bounce hidden md:block">
        <Waves className="h-12 w-12 text-blue-300" />
      </div>

      {/* Rubber ducks */}
      <div className="rubber-duck duck-1"></div>
      <div className="rubber-duck duck-2"></div>
      <div className="rubber-duck duck-3"></div>

      {/* Water droplets */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className={`water-drop drop-${i + 1}`}></div>
      ))}
    </>
  )
}
