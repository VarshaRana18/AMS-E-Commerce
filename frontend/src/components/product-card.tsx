import React from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  title: string;
  img: string;
  href: string;
}

interface ProductCardProps {
  list: Product[];
}

const ProductCard: React.FC<ProductCardProps> = ({ list }) => {
  const navigate = useNavigate();

  const handleCardClick = (href: string) => {
    navigate(href); // Navigate to the product page
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 xl:max-w-full 2xl:max-w-full">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item, index) => (
            <button
              key={index}
              className="group relative cursor-pointer w-full text-left bg-transparent border-0 p-0"
              onClick={() => handleCardClick(item.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(item.href);
                }
              }}
            >
              <img
                alt={item.title}
                className="w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 aspect-[16/9] lg:aspect-[16/10] xl:aspect-[16/11]"
                src={item.img}
              />
              <div className="mt-4 flex justify-center">
                <div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl text-gray-700 text-center">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {item.title}
                  </h3>
                </div>
              </div>
            </button>
          ))}{" "}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
