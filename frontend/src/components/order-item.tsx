import { useNavigate } from "react-router-dom";

const OrderItem = ({ order, statusClasses }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/orders/${order._id}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-y-4 py-6">
      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Order ID:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          <button
            className="hover:underline"
            type="button"
            onClick={handleViewDetails}
          >
            {order._id}
          </button>
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Date:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {new Date(order.order_date).toLocaleDateString("en-GB")}
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Price:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          ₹{order.total_price.toFixed(2)}
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Status:
        </dt>
        <dd
          className={`me-2 mt-1.5 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${statusClasses[order.status]}`}
        >
          <svg
            aria-hidden="true"
            className="me-1 h-3 w-3"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {order.status === "Pending" && (
              <path
                d="M18.5 4h-13m13 16h-13M8 20v-3.333a2 2 0 0 1 .4-1.2L10 12.6a1 1 0 0 0 0-1.2L8.4 8.533a2 2 0 0 1-.4-1.2V4h8v3.333a2 2 0 0 1-.4 1.2L13.957 11.4a1 1 0 0 0 0 1.2l1.643 2.867a2 2 0 0 1 .4 1.2V20H8Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            )}
            {order.status === "In transit" && (
              <path
                d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            )}
            {order.status === "Delivered" && (
              <path
                d="M5 11.917 9.724 16.5 19 7.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            )}
            {order.status === "Cancelled" && (
              <path
                d="M6 18 17.94 6M18 18 6.06 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            )}
          </svg>
          {order.status}
        </dd>
      </dl>

      <button
        className="w-full inline-flex justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 lg:w-auto"
        type="button"
        onClick={handleViewDetails}
      >
        View details
      </button>
    </div>
  );
};

export default OrderItem;
