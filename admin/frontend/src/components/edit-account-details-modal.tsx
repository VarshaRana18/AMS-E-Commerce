import React from 'react';

const EditAccountDetailsModal = ({ onClose }) => {
  return (
    <div id="accountInformationModal2" tabIndex="-1" aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 flex h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden antialiased backdrop-blur-sm bg-black bg-opacity-50 md:inset-0">
      <div className="relative max-h-full w-full max-w-lg p-4">
        {/* Modal content */}
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
          {/* Modal header */}
          <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
            <button type="button" onClick={onClose} className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* Modal body */}
          <form className="p-4 md:p-5">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="full_name_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Your Full Name*</label>
                <input type="text" id="full_name_info_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter your full name" required />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="email_info_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Your Email*</label>
                <input type="email" id="email_info_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter your email here" required />
              </div>

              <div className="col-span-2">
                <label htmlFor="phone-input_billing_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Phone Number*</label>
                <input type="tel" id="phone-input_billing_modal" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="123-456-7890" required />
              </div>

              <div className="col-span-2">
                <label htmlFor="address_billing_modal" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Delivery Address*</label>
                <textarea id="address_billing_modal" rows="4" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Enter your address"></textarea>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
              <button type="submit" className="me-2 inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Save information</button>
              <button type="button" onClick={onClose} className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAccountDetailsModal;