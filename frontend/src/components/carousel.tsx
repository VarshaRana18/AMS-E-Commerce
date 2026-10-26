import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { Image } from "@heroui/image";
import "../styles/carousel.css";
import { useState, useEffect } from "react";
import { Swiper as SwiperType } from "swiper";

interface CarouselImage {
  _id: string;
  order: number;
  imageLink: string;
  imageName: string;
}

const Carousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/carousel", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: CarouselImage[] = await response.json();

        setImages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (swiperInstance && images.length > 0) {
      swiperInstance.update();
      swiperInstance.autoplay.start();
    }
  }, [images, swiperInstance]);

  return (
    <div className="w-full relative pb-4 md:pb-6 lg:pb-10">
      <Swiper
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          waitForTransition: true,
          pauseOnMouseEnter: false,
        }}
        className="swiper-container custom-swiper-container"
        loop={true}
        modules={[Pagination, Autoplay, Navigation]}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          renderBullet: (className) => {
            return `<span class="${className} custom-bullet"></span>`;
          },
        }}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
      >
        {isLoading ? (
          <SwiperSlide>
            <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[75vh] w-screen bg-gray-200 flex items-center justify-center">
              <p className="text-center">Loading images...</p>
            </div>
          </SwiperSlide>
        ) : images.length > 0 ? (
          images.map((image) => (
            <SwiperSlide key={image._id}>
              <Image
                alt={`Carousel Image ${image.order}`}
                className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[75vh] w-screen object-cover"
                src={`${image.imageLink}?t=${new Date().getTime()}`}
              />
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[75vh] w-screen bg-gray-200 flex items-center justify-center">
              <p className="text-center">No images available</p>
            </div>
          </SwiperSlide>
        )}

        <div className="swiper-pagination" />
        <div className="swiper-button-next text-white" />
        <div className="swiper-button-prev text-white" />
      </Swiper>
    </div>
  );
};

export default Carousel;
