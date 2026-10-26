import React from "react";

interface ProductCardProps {
  imageUrl: string;
  title: string;
  price: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  imageUrl,
  title,
  price,
}) => {
  return (
    <div className="w-full bg-gray-100 border border-black-400 rounded-lg shadow-sm py-5 overflow-hidden flex flex-col justify-between m-2">
      <a href="#">
        <h5 className="px-3 text-md tracking-tight text-gray-900 montserrat">
          {title}
        </h5>
        <img
          alt="product image"
          className="p-4 rounded-lg object-cover h-[40vh] w-full"
          src={imageUrl}
        />
      </a>
      <div className="px-5">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {price}
          </span>
          <a
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            href="/cart"
          >
            Add to cart
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
