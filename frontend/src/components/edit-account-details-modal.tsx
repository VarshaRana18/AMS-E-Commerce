const EditAccountDetailsModal = ({ onClose }: any) => {
  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-50 flex h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden antialiased backdrop-blur-sm bg-black bg-opacity-50 md:inset-0"
      id="accountInformationModal2"
      tabIndex={-1}
    >
      <div className="relative max-h-full w-full max-w-lg p-4">
        {/* Modal content */}
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
          {/* Modal header */}
          <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h3>
            <button
              className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              type="button"
              onClick={onClose}
            >
              <svg
                aria-hidden="true"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* Modal body */}
          <form className="p-4 md:p-5">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="full_name_info_modal"
                >
                  Your Full Name*
                </label>
                <input
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  id="full_name_info_modal"
                  placeholder="Enter your full name"
                  type="text"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="email_info_modal"
                >
                  Your Email*
                </label>
                <input
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  id="email_info_modal"
                  placeholder="Enter your email here"
                  type="email"
                />
              </div>

              <div className="col-span-2">
                <label
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="phone-input_billing_modal"
                >
                  Phone Number*
                </label>
                <input
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  id="phone-input_billing_modal"
                  placeholder="123-456-7890"
                  type="tel"
                />
              </div>

              <div className="col-span-2">
                <label
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="address_billing_modal"
                >
                  Delivery Address*
                </label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  id="address_billing_modal"
                  placeholder="Enter your address"
                  rows={4}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
              <button
                className="me-2 inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                type="submit"
              >
                Save information
              </button>
              <button
                className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAccountDetailsModal;
