
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Pagination, Autoplay } from 'swiper/modules';
import GradientDiv from './GradientDiv';

const gradients = [
  { gradient: 'bg-gradient-to-br from-sky-200 to-sky-400', text: 'Your Dream PC, Your Way!', color: 'text-sky-500' },
  { gradient: 'bg-gradient-to-br from-icy-light to-icy-dark', text: 'Build It. Customize It. Own It!', color: 'text-icy-dark' },
  { gradient: 'bg-gradient-to-br from-gray-100 to-gray-300', text: 'Upgrade Your PC, Elevate Your Experience!', color: 'text-gray-400' },
  { gradient: 'bg-gradient-to-br from-greenish-light to-greenish-dark', text: 'Fast Fixes, Reliable Results!', color: 'text-greenish-dark' },
  { gradient: 'bg-gradient-to-br from-cyan-400 to-teal-600', text: 'Bringing Your Tech Back to Life!', color: 'text-cyan-600' },
  { gradient: 'bg-gradient-to-br from-blue-300 to-blue-500', text: 'Exclusive Components for Peak Performance!', color: 'text-blue-500' },
];

const Slider = () => {
  return (
    <div className="w-full relative py-7 my-20">
      <Swiper
        modules={[Pagination, Autoplay]}
        centeredSlides={true}
        loop={true} // Enables Infinite Loop
        autoplay={{ delay: 5000, disableOnInteraction: false }} // Auto-slide every 5 sec
        spaceBetween={30}
        pagination={{ clickable: true, el: '.swiper-pagination' }} // Keep pagination functional
        breakpoints={{
          1920: { slidesPerView: 4, spaceBetween: 30 },
          1200: { slidesPerView: 3, spaceBetween: 20 },
          700: { slidesPerView: 2, spaceBetween: 10 },
        }}
        className="swiper-container"
      >
        {gradients.map((item, index) => (
          <SwiperSlide key={index}>
            <GradientDiv gradient={item.gradient} text={item.text} color={item.color} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Hidden Pagination Dots */}
      <div className="swiper-pagination hidden"></div>
    </div>
  );
};

export default Slider;
