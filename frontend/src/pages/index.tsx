import { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@heroui/react";

import { HeartIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import "../styles/index.css";
import Carousel from "@/components/carousel";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollObserver } from "@/hooks/useScrollObserver";

// Wishlist Section with dynamic count
const WishlistSection = () => {
  const { currentUser }: any = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "AMS || Home";
    if (!currentUser) {
      setIsLoading(false);

      return;
    }

    const fetchWishlistCount = async () => {
      try {
        const response = await fetch(`/api/auth/user/${currentUser.email}`);

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist data");
        }

        const userData = await response.json();
        const count = userData.wishlist ? userData.wishlist.length : 0;

        setWishlistCount(count);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchWishlistCount();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation direction="down">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Personalized Wishlist
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2} direction="up">
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Sign in to save your favorite components and track your wishlist
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <ScrollAnimation direction="down">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Wishlist Awaits
            </h2>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2} direction="up">
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {isLoading
                ? "Checking your saved items..."
                : error
                  ? "We couldn't load your wishlist right now"
                  : `You have ${wishlistCount} item${wishlistCount !== 1 ? "s" : ""} waiting for you`}
            </p>
          </ScrollAnimation>
        </div>

        <div className="flex justify-center">
          <ScrollAnimation delay={0.3} direction="up">
            <div className="relative">
              {/* Animated counter */}
              <motion.div
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-64 h-64 rounded-full border-4 border-primary-500/30 flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border-4 border-primary-500/50 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-4 border-primary-500 flex items-center justify-center">
                      {isLoading ? (
                        <div className="text-4xl font-bold animate-pulse">
                          ...
                        </div>
                      ) : error ? (
                        <div className="text-2xl text-red-400">!</div>
                      ) : (
                        <>
                          <motion.p
                            key={wishlistCount}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
                            initial={{ y: -20, opacity: 0 }}
                          >
                            {wishlistCount}
                          </motion.p>
                          <motion.div
                            animate={{ scale: 1 }}
                            className="absolute -bottom-4 right-8"
                            initial={{ scale: 0 }}
                            transition={{ delay: 0.7 }}
                          >
                            <HeartIcon
                              className="text-primary-400"
                              filled={true}
                              size={48}
                            />
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="mt-12 text-center"
                initial={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link href="/wishlist">
                  <Button
                    className="text-md"
                    color="primary"
                    endContent={
                      <HeartIcon
                        className="text-white"
                        filled={true}
                        size={24}
                      />
                    }
                    isDisabled={isLoading || Boolean(error)}
                    size="lg"
                    variant="shadow"
                  >
                    {error ? "Try Again" : "View Your Wishlist"}
                  </Button>
                </Link>
                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>

        {/* Empty state encouragement */}
        {wishlistCount === 0 && !isLoading && !error && (
          <ScrollAnimation delay={0.4} direction="up">
            <div className="mt-16 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">
                Your wishlist is empty
              </h3>
              <p className="text-gray-400 mb-6">
                Start building your dream setup by browsing our premium
                components and adding your favorites!
              </p>
              <Link href="/components">
                <Button
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  variant="flat"
                >
                  Browse Components
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        )}
      </div>
    </section>
  );
}; // Animation component
const ScrollAnimation = ({
  children,
  direction = "left",
  delay = 0,
  className = "",
}) => {
  const controls = useAnimation();
  const [ref, inView] = useScrollObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px", // Triggers when 100px from bottom of viewport
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={controls}
      className={className}
      initial="hidden"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

const ServiceSection = ({
  title,
  subtitle,
  description,
  imageUrl,
  buttonText,
  buttonLink,
  reverse = false,
  delay = 0,
}) => {
  return (
    <section className={`py-16 md:py-24 ${reverse ? "bg-gray-50" : ""}`}>
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12`}
        >
          {/* Image Column */}
          <ScrollAnimation
            className={`w-full md:w-1/2 ${reverse ? "md:pl-12" : "md:pr-12"}`}
            delay={delay}
            direction={reverse ? "left" : "right"}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-96 w-full group">
              <motion.img
                alt={title}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                src={imageUrl}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </ScrollAnimation>

          {/* Content Column */}
          <ScrollAnimation
            className="w-full md:w-1/2"
            delay={delay + 0.2}
            direction={reverse ? "right" : "left"}
          >
            <div className={`${reverse ? "md:pr-12" : "md:pl-12"}`}>
              {subtitle && (
                <p className="text-sm text-primary-600 uppercase font-bold tracking-widest mb-3">
                  {subtitle}
                </p>
              )}
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
              <p className="text-lg text-gray-600 mb-8">{description}</p>
              <Link href={buttonLink}>
                <Button
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg transition-all"
                  radius="full"
                  size="lg"
                >
                  {buttonText}
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

export default function IndexPage() {
  const services = [
    {
      title: "Expert PC Repairs",
      subtitle: "Fast & Reliable",
      description:
        "Our certified technicians provide quick diagnostics and quality repairs for all your computer issues. From hardware replacements to software troubleshooting, we've got you covered with same-day service options.",
      imageUrl:
        "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29tcHV0ZXIlMjByZXBhaXJ8ZW58MHx8MHx8fDA%3D",
      buttonText: "Get Repairs",
      buttonLink: "/repairs",
    },
    {
      title: "Premium Components",
      subtitle: "Build With The Best",
      description:
        "Shop our curated selection of high-performance PC components from top brands. Whether you're upgrading or building from scratch, we have the latest processors, GPUs, RAM, and storage solutions.",
      imageUrl:
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      buttonText: "Browse Parts",
      buttonLink: "/components",
      reverse: true,
    },
    {
      title: "Custom PC Building",
      subtitle: "Your Dream Machine",
      description:
        "Our custom PC builder lets you create the perfect system tailored to your needs. Get expert advice, premium assembly, and cable management for a showroom-quality build delivered to your door.",
      imageUrl:
        "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBjJTIwYnVpbGR8ZW58MHx8MHx8fDA%3D",
      buttonText: "Start Building",
      buttonLink: "/custom-pc",
    },
  ];

  const brands = [
    {
      name: "Dell",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Dell_logo.svg/600px-Dell_logo.svg.png",
    },
    {
      name: "Aorus",
      logo: "https://cdn.worldvectorlogo.com/logos/aorus-1.svg",
    },
    {
      name: "Gigabyte",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Gigabyte_Technology_logo_20080107.svg/470px-Gigabyte_Technology_logo_20080107.svg.png",
    },
    {
      name: "Intel",
      logo: "https://cdn.worldvectorlogo.com/logos/intel-6.svg",
    },
    {
      name: "Logitech",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Logitech_logo.svg/1200px-Logitech_logo.svg.png",
    },
    {
      name: "Nvidia",
      logo: "https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/527px-Nvidia_logo.svg.png?20150924223142",
    },
    {
      name: "Zebronics",
      logo: "https://cdn.brandfetch.io/id9TIFKqa2/w/500/h/69/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
    },
    {
      name: "Zotac",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Logo_of_Zotac_International.svg/267px-Logo_of_Zotac_International.svg.png?20160901231349",
    },
    {
      name: "Intex",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Intex_Technologies_logo.svg/1280px-Intex_Technologies_logo.svg.png",
    },
  ];

  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const handleResize = () => setWindowWidth(window.innerWidth);

      setWindowWidth(window.innerWidth); // Set initial width
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <DefaultLayout>
      <Carousel />

      {/* Services Header - Now properly animated */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <ScrollAnimation direction="down">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Our Services
            </h2>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2} direction="up">
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your computing needs
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Alternating Services Sections - Now properly animated */}
      {services.map((service, index) => (
        <ServiceSection key={index} {...service} delay={index * 0.15} />
      ))}

      {/* Stats Counter Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <ScrollAnimation direction="up">
              <div>
                <p className="text-4xl font-bold mb-2">500+</p>
                <p>PCs Repaired</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1} direction="up">
              <div>
                <p className="text-4xl font-bold mb-2">1K+</p>
                <p>Components Sold</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2} direction="up">
              <div>
                <p className="text-4xl font-bold mb-2">200+</p>
                <p>Custom Builds</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.3} direction="up">
              <div>
                <p className="text-4xl font-bold mb-2">99%</p>
                <p>Satisfaction Rate</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Brand Partnerships Marquee */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation direction="down">
            <h3 className="text-center text-lg text-gray-500 mb-8">
              Trusted by leading brands
            </h3>
          </ScrollAnimation>

          <div className="relative overflow-hidden py-4">
            <motion.div
              animate={{
                x: ["0%", `-${50 * (brands.length / 8)}%`], // Adjust based on number of brands
              }}
              className="flex"
              transition={{
                duration: isMobile ? 15 : 30,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Double the brands array for seamless looping */}
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 px-4 md:px-8"
                >
                  <img
                    alt={brand.name}
                    className="h-8 md:h-10 object-contain max-w-[80px] md:max-w-[120px] hover:scale-110 transition-transform"
                    src={brand.logo}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wishlist Section */}
      {/* <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <ScrollAnimation direction="down">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Empty Your Wishlist. Fill Your Cart
              </h2>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.2}>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Handpicked components loved by our community
              </p>
            </ScrollAnimation>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "ASUS ROG Strix GeForce RTX 4090",
                price: "₹1,85,999",
                badge: "BESTSELLER",
              },
              {
                imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f1723e1b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "AMD Ryzen 9 7950X Processor",
                price: "₹58,500",
                badge: "NEW",
              },
              {
                imageUrl: "https://images.unsplash.com/photo-1542978709-19c95dc3bc7e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                title: "G.Skill Trident Z RGB 32GB DDR5",
                price: "₹22,999",
                badge: "POPULAR",
              },
            ].map((item, index) => (
              <ScrollAnimation 
                key={index} 
                direction={index % 2 === 0 ? "up" : "down"}
                delay={index * 0.1}
              >
                <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary-500 text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="flex justify-between items-center">
                      <p className="text-primary-400 font-bold text-lg">{item.price}</p>
                      <button className="text-gray-400 hover:text-red-400 transition-colors">
                        <HeartIcon filled={false} size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <div className="text-center mt-16">
            <ScrollAnimation direction="up" delay={0.3}>
              <Link href="/wishlist">
                <Button
                  className="text-md"
                  color="primary"
                  variant="shadow"
                  endContent={
                    <HeartIcon filled={true} size={24} className="text-white" />
                  }
                >
                  View Full Wishlist
                </Button>
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section> */}
      <WishlistSection />
    </DefaultLayout>
  );
}
