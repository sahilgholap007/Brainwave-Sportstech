import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageSlider({
  images = [],
  altText = "Product image",
  className = "",
  aspectRatio = "square",
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [validImages, setValidImages] = useState([])

  // Filter valid images (using HEAD requests isn't feasible here, so we fallback to load errors)
  useEffect(() => {
    setValidImages(images)
  }, [images])

  const handleImageError = (brokenUrl) => {
    setValidImages((prev) => prev.filter((url) => url !== brokenUrl))
    setCurrentIndex(0)
  }

  if (!validImages || validImages.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-md bg-gray-100 ${className}`}>
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? validImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === validImages.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  let aspectRatioClass = "aspect-square"
  if (aspectRatio === "video") aspectRatioClass = "aspect-video"
  if (aspectRatio === "portrait") aspectRatioClass = "aspect-[3/4]"

  return (
    <div className={`relative overflow-hidden rounded-md ${aspectRatioClass} ${className}`}>
      <div className="relative h-full w-full">
        <img
          src={validImages[currentIndex]}
          alt={`${altText} ${currentIndex + 1}`}
          className="object-cover h-full w-full absolute top-0 left-0"
          onError={() => handleImageError(validImages[currentIndex])}
        />
      </div>

      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {validImages.length > 1 && (
        <div className="absolute right-2 top-2 rounded-md bg-black/30 px-2 py-1 text-xs text-white">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  )
}
