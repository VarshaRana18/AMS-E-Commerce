import React from 'react';

interface Product {
  title: string;
  img: string;
  href: string;
}

interface ProductCardProps {
  list: Product[];
}

const ProductCard: React.FC<ProductCardProps> = ({ list }) => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {list.map((item, index) => (
            <div key={index} className="group relative">
              <img
                alt={item.title}
                src={item.img}
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-center">
                <div>
                  <h3 className="text-lg text-gray-700 text-center">
                    <a href={item.href}>
                      <span aria-hidden="true" className="absolute inset-0 "/>
                      {item.title}
                    </a>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;