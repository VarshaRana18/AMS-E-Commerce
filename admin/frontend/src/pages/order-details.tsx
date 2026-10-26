import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import { orders } from '@/data/ordersData';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const order = orders.find((order) => order.id === orderId);

  if (!order) {
    return (
      <DefaultLayout>
        <section className="py-24 relative">
          <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
            <h2 className="text-center text-black text-3xl font-bold font-manrope leading-normal">Order Not Found</h2>
          </div>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="py-5 relative">
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
          <div className="w-full flex-col justify-center items-start lg:gap-6 gap-8 inline-flex">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className=" text-blue-600 hover:underline"
          >
            &larr; Back to orders page
          </button>
            <div className="w-full justify-between items-start gap-3 flex flex-row">
              <h3 className="text-gray-900 text-xl font-semibold font-manrope leading-9">
                Order Details: <span className="font-medium">#{order.id}</span>
              </h3>
              <h4 className="text-gray-600 text-xl font-medium leading-loose">Date: {order.date}</h4>
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  className="w-full lg:w-auto rounded-lg bg-primary-700 px-4 py-3 text-base font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Print Invoice
                </button>
              </div>
            </div>
            <div className="w-full flex-col justify-center sm:items-center items-start gap-8 flex">
              <ol className="flex sm:items-center items-start w-full sm:gap-0 gap-3">
                <li className="flex w-full relative justify-center text-indigo-600 text-base font-semibold after:content-['']  after:w-full after:h-0.5 after:border after:border-dashed after:bg-indigo-600 after:inline-block after:absolute lg:after:top-5 after:top-3 xl:after:left-52 lg:after:left-48 md:after:left-36 sm:after:left-28 after:left-20">
                  <div className="block sm:whitespace-nowrap z-10 flex flex-col items-center">
                    <span className="w-6 h-6 bg-indigo-600 text-center border-2 border-transparent rounded-full flex justify-center items-center mx-auto mb-1 text-base font-bold text-white lg:w-10 lg:h-10">
                      1
                    </span>
                    Order Confirmed <br />
                    <span className="text-indigo-600 text-base font-normal text-center">8:00 AM, Feb 8,2024</span>
                  </div>
                </li>
                <li className="flex w-full relative justify-center text-black text-base font-semibold after:content-['']  after:w-full after:h-0.5 after:border after:border-dashed after:bg-indigo-200 after:inline-block after:absolute lg:after:top-5 after:top-3 xl:after:left-52 lg:after:left-48 md:after:left-36 sm:after:left-28 after:left-20">
                  <div className="block sm:whitespace-nowrap z-10 flex flex-col items-center">
                    <span className="w-6 h-6 bg-indigo-600 rounded-full flex justify-center items-center mx-auto mb-1 text-white text-base font-bold lg:w-10 lg:h-10">
                      2
                    </span>
                    Shipping
                    <span className="text-gray-500 text-base font-normal text-center">Shipped with FedEX</span>
                  </div>
                </li>
                <li className="flex w-full relative justify-center text-gray-500 text-base font-semibold">
                  <div className="block sm:whitespace-nowrap z-10 flex flex-col items-center">
                    <span className="w-6 h-6 text-indigo-600 border-2 bg-transparent border-indigo-600 rounded-full flex justify-center items-center mx-auto mb-1 text-sm lg:w-10 lg:h-10">
                      3
                    </span>
                    To Deliver
                    <span className="text-gray-500 text-base font-normal text-center">Estimated date: Feb 15,</span>
                  </div>
                </li>
              </ol>
            </div>
            <div className="w-full flex-col justify-center items-center gap-8 flex">
              <div className="w-full justify-center items-center lg:gap-8 gap-4 flex sm:flex-row flex-col">
                <div className="w-full flex-col justify-center items-center flex gap-1.5">
                  <label className="text-gray-600 text-base font-medium leading-relaxed">Tracking Number</label>
                  <p className="w-full px-5 py-3 h-14 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] border border-gray-200 text-gray-900 text-lg font-normal leading-relaxed">
                    #125410215452
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex-col justify-center items-start gap-7 flex">
              <h3 className="text-indigo-600 text-2xl font-semibold font-manrope leading-9  px-10 mx-10">Item Ordered</h3>
              <div className="w-full justify-between items-start flex flex-col px-10">
                <div className="w-full hidden lg:grid grid-cols-2 p-4 bg-gray-50 ">
                  <span className="text-gray-500 text-base font-normal leading-relaxed">Product</span>
                  <p className="text-gray-500 text-base font-normal leading-relaxed flex items-center justify-center">
                    <span className="w-full max-w-[300px] text-center pl-5">Price</span>
                  </p>
                </div>
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-[550px]:gap-6 py-3 border-b border-gray-200 max-lg:max-w-xl max-xl:mx-auto">
                  <div className="flex items-center flex-col min-[550px]:flex-row gap-3 min-[550px]:gap-4 w-full max-xl:justify-center max-xl:max-w-xl max-xl:mx-auto">
                    <img src="https://pagedone.io/asset/uploads/1712126548.png" alt="Homiboss Chair image" className="w-[120px] rounded-xl object-cover" />
                    <div className="pro-data w-full max-w-sm flex-col justify-between items-start gap-2 inline-flex">
                      <h4 className="w-full text-black text-lg font-medium leading-relaxed max-[550px]:text-center">Homiboss Chair</h4>
                      <h5 className="w-full text-gray-500 text-base font-normal leading-relaxed min-[550px]:my-0 my-2 max-[550px]:text-center">Product ID: 4553458120</h5>
                    </div>
                  </div>
                  <div className="flex items-center justify-center flex-col min-[550px]:flex-row w-full max-xl:max-w-xl max-xl:mx-auto gap-2">
                    <h4 className="max-w-[300px] w-full text-center text-black text-lg font-medium leading-relaxed pl-5">$50.00</h4>
                  </div>
                </div>
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-[550px]:gap-6 py-3 border-b border-gray-200 max-lg:max-w-xl max-xl:mx-auto">
                  <div className="flex items-center flex-col min-[550px]:flex-row gap-3 min-[550px]:gap-4 w-full max-xl:justify-center max-xl:max-w-xl max-xl:mx-auto">
                    <img src="https://pagedone.io/asset/uploads/1712126556.png" alt="Maharaja Chair image" className="w-[120px] rounded-xl object-cover" />
                    <div className="pro-data w-full max-w-sm flex-col justify-center items-start gap-2 inline-flex">
                      <h4 className="w-full text-black text-lg font-medium leading-relaxed max-[550px]:text-center">Maharaja Chair</h4>
                      <h5 className="w-full text-gray-500 text-base font-normal leading-relaxed min-[550px]:my-0 my-2 max-[550px]:text-center">Product ID: 8953458747</h5>
                    </div>
                  </div>
                  <div className="flex items-center justify-center flex-col min-[550px]:flex-row w-full max-xl:max-w-xl max-xl:mx-auto gap-2">
                    <h4 className="max-w-[300px] w-full text-center text-black text-lg font-medium leading-relaxed pl-5">$100.00</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full rounded-xl flex-col justify-center items-start gap-6 flex px-10">
              <div className="w-full pb-6 border-b border-gray-200 flex-col justify-center items-start gap-6 flex">
                <div className="w-full justify-between items-start gap-6 inline-flex">
                  <h4 className="text-gray-500 text-xl font-normal leading-8">Subtotal</h4>
                  <h4 className="text-gray-900 text-xl font-semibold leading-8">$250.00</h4>
                </div>
                <div className="w-full justify-between items-start gap-6 inline-flex">
                  <h4 className="text-gray-500 text-xl font-normal leading-8">Shipping Charge</h4>
                  <h4 className="text-gray-900 text-xl font-semibold leading-8">$30.00</h4>
                </div>
              </div>
              <div className="w-full pb-6 border-b border-gray-200 justify-between items-start gap-6 inline-flex">
                <h3 className="text-gray-900 text-2xl font-semibold font-manrope leading-9">Total</h3>
                <h3 className="text-indigo-600 text-2xl font-bold font-manrope leading-9">$280.00</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default OrderDetails;