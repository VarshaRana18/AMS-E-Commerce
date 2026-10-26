import { useEffect } from "react";

import DefaultLayout from "@/layouts/default";

const productList = [
  {
    title: "Check our pre-built Custom PCs",
    img: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/custom-pc/pre-built-pcs",
  },
  {
    title: "Create your own Custom PC",
    img: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/custom-pc/custom-pc-builder",
  },
];

const CustomPCHP = () => {
  useEffect(() => {
    document.title = "AMS || Custom PC Homepage";
  }, []);

  return (
    <DefaultLayout>
      <div className="bg-white">
        <div className="mx-auto w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] px-4 py-8 sm:px-6 sm:py-12 text-center">
          <h1 className="text-4xl text-gray-900 mb-12">
            Your Custom PC Builder
          </h1>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 xl:gap-x-20">
              {productList.map((item, index) => (
                <div key={index} className="group relative">
                  <img
                    alt={item.title}
                    className="w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 aspect-[16/9] lg:aspect-[16/10] xl:aspect-[16/11]"
                    src={item.img}
                  />
                  <div className="mt-4 flex justify-center">
                    <div>
                      <h3 className="text-lg lg:text-xl xl:text-2xl text-gray-700 text-center">
                        <a href={item.href}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
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
      </div>
    </DefaultLayout>
  );
};

export default CustomPCHP;
