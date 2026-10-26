import OrderItem from "@/components/order-item";
import { useState } from "react";

const statusClasses = {
  "Pre-order":
    "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
  "In transit":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface Order {
  id: string;
  _id: string;
  user_id: string;
  username?: string;
  components: {
    component_id: string;
    component_type: string;
    quantity: number;
  }[];
  order_date: string;
  status: string;
  total_price: number;
  tracking_number: string;
  courier: string;
}

interface OrderListProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  statusOptions: string[];
}

const OrderList = ({
  orders,
  onStatusUpdate,
  statusOptions,
}: OrderListProps) => {
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const handleSave = (orderId: string) => {
    if (selectedStatus) {
      onStatusUpdate(orderId, selectedStatus);
    }
    setEditingOrderId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
        No orders found matching your criteria.
      </div>
    );
  }

  return (
    <div className="mt-3 flow-root">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {orders.map((order) => (
          <div key={order._id} className="py-4">
            <OrderItem
              key={order._id}
              order={order}
              statusClasses={statusClasses}
              statusOptions={statusOptions}
              onStatusUpdate={onStatusUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
