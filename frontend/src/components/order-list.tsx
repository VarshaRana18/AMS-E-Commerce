import OrderItem from "@/components/order-item";

const statusClasses = {
  Pending:
    "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
  "In transit":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const OrderList = ({ orders = [] }) => {
  if (!orders.length) {
    return (
      <div className="mt-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No orders match your current filters.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Try adjusting your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root sm:mt-8">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {orders.map((order: { _id: any }) => (
          <OrderItem
            key={order._id}
            order={order}
            statusClasses={statusClasses}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderList;
