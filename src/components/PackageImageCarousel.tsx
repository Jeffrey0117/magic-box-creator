import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface PackageImageCarouselProps {
  images: string[];
}

export function PackageImageCarousel({ images }: PackageImageCarouselProps) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="bg-white border border-[#dbdbdb] rounded-lg overflow-hidden mb-4">
        <img
          src={images[0]}
          alt="Package"
          className="w-full aspect-square object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/500x500/e0e0e0/666?text=Image+Not+Found";
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dbdbdb] rounded-lg overflow-hidden mb-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <img
                src={img}
                alt={`Package ${index + 1}`}
                className="w-full aspect-square object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/500x500/e0e0e0/666?text=Image+Not+Found";
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <div className="flex justify-center gap-1.5 py-2">
        {images.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#0095f6]"
          />
        ))}
      </div>
    </div>
  );
}