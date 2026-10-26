import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Tooltip,
} from "@heroui/react";

interface OrderComponent {
  component_id: string;
  component_type: string;
  component_name: string;
  component_price: number;
  component_brand?: string;
  quantity: number;
  component_details?: {
    // Common fields
    title?: string;
    name?: string;
    company?: string;
    price?: number;
    coverImage?: string;
    img?: string[];
    type?: string;

    // Prebuilt PC fields
    motherboard?: { name: string };
    processor?: { name: string };
    graphicsCard?: { name: string };
    ram?: { name: string };
    storageDevice?: { name: string };
    powerSupply?: { name: string };
    coolingSystem?: { name: string };
    cabinet?: { name: string };

    // Custom PC fields
    components?: {
      motherboard?: { _id: string; type: string; price: number };
      processor?: { _id: string; type: string; price: number };
      "graphics-card"?: { _id: string; type: string; price: number };
      ram?: { _id: string; type: string; price: number };
      storage?: { _id: string; type: string; price: number };
      "power-supply"?: { _id: string; type: string; price: number };
      cooling?: { _id: string; type: string; price: number };
      cabinet?: { _id: string; type: string; price: number };
    };
  };
}

interface Order {
  id: string;
  _id: string;
  user_id: string;
  username: string;
  components: OrderComponent[];
  order_date: string;
  total_price: number;
  status: string;
  tracking_number: string;
  courier: string;
}

interface OrderItemProps {
  order: Order;
  statusClasses: Record<string, string>;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  statusOptions: string[];
}

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  statusClasses,
  statusOptions,
  onStatusUpdate,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number);
  const [courier, setCourier] = useState(order.courier);
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [isEditingCourier, setIsEditingCourier] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "error" | "">("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleViewDetails = () => {
    onOpen();
    fetchOrderDetails(order._id);
  };

  const fetchOrderDetails = async (orderId: string) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5170/api/orders/${orderId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const detailedOrder = await response.json();
        setSelectedOrder(detailedOrder);
        console.log("Detailed Order:", detailedOrder);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTracking = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5170/api/orders/${order._id}/tracking_number`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tracking_number: trackingNumber }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tracking number");
      }

      setAlertType("success");
      setAlertMessage("Tracking number updated successfully");
      setShowAlert(true);
      setIsEditingTracking(false);

      fetchOrderDetails(order._id);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating tracking number:", error);

      setAlertType("error");
      setAlertMessage(
        error instanceof Error
          ? error.message
          : "Failed to update tracking number"
      );
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleSaveCourier = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5170/api/orders/${order._id}/courier`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courier: courier }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update courier");
      }

      setAlertType("success");
      setAlertMessage("Courier updated successfully");
      setShowAlert(true);
      setIsEditingCourier(false);

      fetchOrderDetails(order._id);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating courier:", error);
      setAlertType("error");
      setAlertMessage(
        error instanceof Error ? error.message : "Failed to update courier"
      );
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-y-4 py-6">
        {/* Order ID */}
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

        {/* Customer Name */}
        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
          <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
            Customer Name:
          </dt>
          <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
            {order.username}
          </dd>
        </dl>

        {/* Date Ordered */}
        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
          <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
            Date Ordered:
          </dt>
          <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
            {new Date(order.order_date)
              .toLocaleDateString("en-GB")
              .replace(/\//g, " / ")}
          </dd>
        </dl>

        {/* Price */}
        <dl className="w-1/4 lg:flex-1">
          <dt className="text-base font-medium text-gray-500">Price:</dt>
          <dd className="mt-1.5 text-base font-semibold text-gray-900">
            ₹ {order.total_price.toFixed(2)}
          </dd>
        </dl>

        {/* Status */}
        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1 align-center">
          <dt className="text-base font-medium text-gray-500">Status:</dt>
          <dd className="mt-1.5 flex items-center gap-2">
            {isEditingStatus ? (
              <div className="flex items-center gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`rounded px-2.5 py-0.5 font-medium ${
                    statusClasses[newStatus]
                  } appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      className={statusClasses[status]}
                    >
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    onStatusUpdate(order._id, newStatus);
                    setIsEditingStatus(false);
                  }}
                  className="bg-green-600 text-white px-2 py-0.5 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingStatus(false)}
                  className="bg-gray-600 text-white px-2 py-0.5 rounded text-xs  hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded px-2.5 py-0.5 font-medium ${
                    statusClasses[order.status]
                  }`}
                >
                  <svg
                    className="me-1 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {order.status === "Pre-order" && (
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18.5 4h-13m13 16h-13M8 20v-3.333a2 2 0 0 1 .4-1.2L10 12.6a1 1 0 0 0 0-1.2L8.4 8.533a2 2 0 0 1-.4-1.2V4h8v3.333a2 2 0 0 1-.4 1.2L13.957 11.4a1 1 0 0 0 0 1.2l1.643 2.867a2 2 0 0 1 .4 1.2V20H8Z"
                      />
                    )}
                    {order.status === "In transit" && (
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                      />
                    )}
                    {order.status === "Delivered" && (
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 11.917 9.724 16.5 19 7.5"
                      />
                    )}
                    {order.status === "Cancelled" && (
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18 17.94 6M18 18 6.06 6"
                      />
                    )}
                  </svg>
                  {order.status}
                </span>
                <button
                  onClick={() => {
                    setIsEditingStatus(true);
                    setNewStatus(order.status);
                  }}
                  className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </dd>
        </dl>

        {/* View Details */}
        <dl className="w-full sm:w-auto px-2">
          <dd>
            <button
              type="button"
              onClick={handleViewDetails}
              className="w-full inline-flex justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 lg:w-auto"
            >
              View details
            </button>
          </dd>
        </dl>
      </div>

      {/* Order Details Modal */}
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-3xl"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-gray-800 montserrat">
                Order Details
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <Alert
                    onClose={() => setShowAlert(false)}
                    className={`fixed bottom-4 right-4 z-50 max-w-md ${
                      alertType === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <strong>
                      {alertType === "success" ? "Success" : "Error"}
                    </strong>
                    <div>{alertMessage}</div>
                  </Alert>
                )}
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-6">
                    {/* Customer Details */}
                    <div className="p-4 bg-gray-100 rounded-lg gap-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 montserrat">
                          Customer:{" "}
                          <span className="text-blue-600 montserrat">
                            {selectedOrder?.username || order.username}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600 montserrat">
                          Ordered on:{" "}
                          <span className="font-medium text-gray-700 montserrat">
                            {new Date(
                              selectedOrder?.order_date || order.order_date
                            )
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, " / ")}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col mr-10 pr-10">
                        <div className="flex items-center mb-2">
                          <h4 className="text-md font-medium text-gray-900 montserrat">
                            Tracking Id:{" "}
                          </h4>
                          {isEditingTracking ? (
                            <div className="flex ml-2">
                              <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) =>
                                  setTrackingNumber(e.target.value)
                                }
                                className="border rounded px-2 py-1 text-gray-600 montserrat"
                                placeholder="Enter tracking number"
                              />
                              <button
                                onClick={handleSaveTracking}
                                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingTracking(false);
                                  setTrackingNumber(order.tracking_number);
                                }}
                                className="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-600 montserrat ml-2">
                                {selectedOrder?.tracking_number ||
                                  order.tracking_number}
                              </span>
                              {(selectedOrder?.tracking_number ===
                                "Not Shipped Yet" ||
                                order.tracking_number ===
                                  "Not Shipped Yet") && (
                                <button
                                  onClick={() => setIsEditingTracking(true)}
                                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center">
                          <h4 className="text-md font-medium text-gray-900 montserrat">
                            Courier:{" "}
                          </h4>
                          {isEditingCourier ? (
                            <div className="flex ml-2">
                              <input
                                type="text"
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                                className="border rounded px-2 py-1 text-gray-600 montserrat"
                                placeholder="Enter courier name"
                              />
                              <button
                                onClick={handleSaveCourier}
                                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingCourier(false);
                                  setCourier(order.courier);
                                }}
                                className="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-600 montserrat ml-2">
                                {selectedOrder?.courier || order.courier}
                              </span>
                              {(selectedOrder?.courier === "Not Shipped Yet" ||
                                order.courier === "Not Shipped Yet") && (
                                <button
                                  onClick={() => setIsEditingCourier(true)}
                                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Components List */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2 text-gray-900 montserrat">
                        Components
                      </h4>
                      <div className="border rounded-lg divide-y bg-gray-50 montserrat">
                        {(selectedOrder?.components || order.components).map(
                          (component, index) => (
                            <div key={index} className="p-4">
                              {component.component_type === "prebuiltpcs" ? (
                                <Tooltip
                                  content={
                                    <div className="py-6 px-4 space-y-1">
                                      <h3 className="font-bold mb-2 text-lg montserrat">
                                        Pre Built PC Specifications
                                      </h3>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold montserrat">
                                          Motherboard
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.motherboard?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Processor
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.processor?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Graphics Card
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.graphicsCard?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          RAM
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details?.ram
                                            ?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Storage
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.storageDevice?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Power Supply
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.powerSupply?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Cooling
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.coolingSystem?.name || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Cabinet
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details?.cabinet
                                            ?.name || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  }
                                  placement="top"
                                  trigger="hover"
                                  offset={-30}
                                >
                                  <div className="grid grid-cols-10 gap-5 items-center px-3 cursor-pointer">
                                    {/* Image - 2 columns */}
                                    <div className="col-span-2">
                                      {component.component_details
                                        ?.coverImage ? (
                                        <img
                                          src={
                                            component.component_details
                                              .coverImage
                                          }
                                          alt={component.component_name}
                                          className="w-17 h-17 object-contain rounded-md"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 montserrat">
                                          No Image
                                        </div>
                                      )}
                                    </div>

                                    {/* Name - 3 columns */}
                                    <div className="col-span-3 space-y-1 flex flex-col">
                                      <p className="text-gray-900 font-medium montserrat px-3 text-center">
                                        {component.component_name}
                                      </p>
                                      <p className="text-xs text-green-500 capitalize montserrat text-center">
                                        {component.component_type}
                                      </p>
                                    </div>

                                    {/* Price - 2 columns */}
                                    <div className="col-span-2 space-y-1 text-right flex flex-col items-center">
                                      <p className="text-sm font-medium text-gray-500 montserrat items-center">
                                        Price
                                      </p>
                                      <p className="text-gray-900 montserrat">
                                        ₹{component.component_price.toFixed(2)}
                                      </p>
                                    </div>

                                    {/* Quantity - 1 column */}
                                    <div className="col-span-1 space-y-1 flex flex-col items-center">
                                      <p className="text-sm font-medium text-gray-500 montserrat">
                                        Qty
                                      </p>
                                      <p className="text-blue-600 font-medium montserrat">
                                        {component.quantity}
                                      </p>
                                    </div>

                                    {/* Total - 2 columns */}
                                    <div className="col-span-2 space-y-1 text-right">
                                      <p className="text-sm font-medium text-gray-500 montserrat">
                                        Total
                                      </p>
                                      <p className="text-gray-900 font-medium montserrat">
                                        ₹
                                        {(
                                          component.component_price *
                                          component.quantity
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </Tooltip>
                              ) : component.component_type ===
                                "owncustompcs" ? (
                                <Tooltip
                                  content={
                                    <div className="py-6 px-4 space-y-1">
                                      <h3 className="font-bold mb-2 text-lg montserrat">
                                        Custom PC Specifications
                                      </h3>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold montserrat">
                                          Motherboard
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.motherboard?._id ||
                                            "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Processor
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.processor?._id ||
                                            "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Graphics Card
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.["graphics-card"]
                                            ?._id || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          RAM
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.ram?._id || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Storage
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.storage?._id || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Power Supply
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.["power-supply"]
                                            ?._id || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Cooling
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.cooling?._id || "N/A"}
                                        </div>
                                        <div className="font-semibold montserrat">
                                          Cabinet
                                        </div>
                                        <div className="font-medium montserrat">
                                          {component.component_details
                                            ?.components?.cabinet?._id || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  }
                                  placement="top"
                                  trigger="hover"
                                  offset={-30}
                                >
                                  {/* Component display content */}
                                  <div className="grid grid-cols-10 gap-5 items-center px-3 cursor-pointer">
                                    {/* Image - 2 columns */}
                                    <div className="col-span-2">
                                      {component.component_details
                                        ?.coverImage ? (
                                        <img
                                          src={
                                            component.component_details
                                              .coverImage
                                          }
                                          alt={component.component_name}
                                          className="w-17 h-17 object-contain rounded-md"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 montserrat">
                                          No Image
                                        </div>
                                      )}
                                    </div>

                                    {/* Name - 3 columns */}
                                    <div className="col-span-3 space-y-1 flex flex-col">
                                      <p className="text-gray-900 font-medium montserrat px-3 text-center">
                                        {component.component_name}
                                      </p>
                                      <p className="text-xs text-blue-500 capitalize montserrat text-center">
                                        Custom PC
                                      </p>
                                    </div>

                                    {/* Price - 2 columns */}
                                    <div className="col-span-2 space-y-1 text-right flex flex-col items-center">
                                      <p className="text-sm font-medium text-gray-500 montserrat items-center">
                                        Price
                                      </p>
                                      <p className="text-gray-900 montserrat">
                                        ₹{component.component_price.toFixed(2)}
                                      </p>
                                    </div>

                                    {/* Quantity - 1 column */}
                                    <div className="col-span-1 space-y-1 flex flex-col items-center">
                                      <p className="text-sm font-medium text-gray-500 montserrat">
                                        Qty
                                      </p>
                                      <p className="text-blue-600 font-medium montserrat">
                                        {component.quantity}
                                      </p>
                                    </div>

                                    {/* Total - 2 columns */}
                                    <div className="col-span-2 space-y-1 text-right">
                                      <p className="text-sm font-medium text-gray-500 montserrat">
                                        Total
                                      </p>
                                      <p className="text-gray-900 font-medium montserrat">
                                        ₹
                                        {(
                                          component.component_price *
                                          component.quantity
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </Tooltip>
                              ) : (
                                <div className="grid grid-cols-10 gap-5 items-center px-3">
                                  {/* Regular component display */}
                                  {/* Image - 2 columns */}
                                  <div className="col-span-2">
                                    {component.component_details?.coverImage ? (
                                      <img
                                        src={
                                          component.component_details.coverImage
                                        }
                                        alt={component.component_name}
                                        className="w-17 h-17 object-contain rounded-md"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 montserrat">
                                        No Image
                                      </div>
                                    )}
                                  </div>

                                  {/* Name - 3 columns */}
                                  <div className="col-span-3 space-y-1 flex flex-col">
                                    <p className="text-gray-900 font-medium montserrat px-3 text-center">
                                      {component.component_name}
                                    </p>
                                    <p className="text-xs text-green-500 capitalize montserrat text-center">
                                      {component.component_type}
                                    </p>
                                  </div>

                                  {/* Price - 2 columns */}
                                  <div className="col-span-2 space-y-1 text-right flex flex-col items-center">
                                    <p className="text-sm font-medium text-gray-500 montserrat items-center">
                                      Price
                                    </p>
                                    <p className="text-gray-900 montserrat">
                                      ₹{component.component_price.toFixed(2)}
                                    </p>
                                  </div>

                                  {/* Quantity - 1 column */}
                                  <div className="col-span-1 space-y-1 flex flex-col items-center">
                                    <p className="text-sm font-medium text-gray-500 montserrat">
                                      Qty
                                    </p>
                                    <p className="text-blue-600 font-medium montserrat">
                                      {component.quantity}
                                    </p>
                                  </div>

                                  {/* Total - 2 columns */}
                                  <div className="col-span-2 space-y-1 text-right">
                                    <p className="text-sm font-medium text-gray-500 montserrat">
                                      Total
                                    </p>
                                    <p className="text-gray-900 font-medium montserrat">
                                      ₹
                                      {(
                                        component.component_price *
                                        component.quantity
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 montserrat">
                        Total:{" "}
                        <span className="text-green-600 montserrat">
                          ₹{" "}
                          {(
                            selectedOrder?.total_price || order.total_price
                          ).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderItem;
