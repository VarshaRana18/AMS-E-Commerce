import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import DefaultLayout from "@/layouts/default";

const OrderDetails = () => {
  const taxRate = 0.025; // 2.5% for both CGST and SGST
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]: any = useState(null);
  const [cgst, setCgst]: any = useState(0);
  const [sgst, setSgst]: any = useState(0);
  const [totalPrice, setTotalPrice]: any = useState(null);
  // const cgst = order.total_price * taxRate;
  // const sgst = order.total_price * taxRate;
  // const totalPrice = order.total_price + cgst + sgst;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts]: any = useState({});
  const [cancelId, setCancelId] = useState(null);
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onOpenChange: onConfirmModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isConfirmDeleteModalOpen,
    onOpenChange: onConfirmDeleteModalOpenChange,
  } = useDisclosure();

  const handleOpenConfirmModal = (customPC) => {
    setSelectedProducts({
      type: customPC.type, // Store type for checking
      components: customPC.components.reduce((acc, component) => {
        acc[component.type] = {
          _id: component._id,
          price: component.price || 0,
        };

        return acc;
      }, {}),
    });

    onOpenConfirmModal(); // Open modal
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/auth/cancelOrder/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      addToast({
        title: "Success!",
        description: "Your order has been cancelled.",
        timeout: 2000,

        color: "success",
      });
      setTimeout(() => {
        navigate("/orders");
      }, 2500);

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description:
          "There was an error cancelling your order. Please try again later.",
        timeout: 2000,

        color: "danger",
      });
    }
  };

  useEffect(() => {
    document.title = "AMS || Order Details";

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/auth/ordersFetch/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();

        setOrder(data);
        const calculatedCgst = data.total_price * taxRate;
        const calculatedSgst = data.total_price * taxRate;
        const calculatedTotal =
          data.total_price + calculatedCgst + calculatedSgst;

        setOrder(data);
        setCgst(calculatedCgst);
        setSgst(calculatedSgst);
        setTotalPrice(calculatedTotal);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <DefaultLayout>
        <section className="py-24 text-center">
          <h2 className="text-3xl font-bold">Loading Order Details...</h2>
        </section>
      </DefaultLayout>
    );
  }

  if (error || !order) {
    return (
      <DefaultLayout>
        <section className="py-24 text-center">
          <h2 className="text-3xl font-bold text-red-600">Order Not Found</h2>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="py-5 relative">
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] px-4 md:px-5 lg:px-5 mx-auto">
          <div className="w-full flex-col justify-start items-start lg:gap-6 gap-8 inline-flex">
            <button
              className="text-blue-600 hover:underline"
              type="button"
              onClick={() => navigate(-1)}
            >
              &larr; Back to orders page
            </button>
            <h2 className="text-center text-black text-3xl font-bold font-manrope leading-normal">
              Order Tracking
            </h2>
            <div className="w-full flex-col justify-start items-start gap-3 flex">
              <h3 className="text-gray-900 text-2xl font-semibold font-manrope leading-9">
                Order Details: <span className="font-medium">#{order._id}</span>
              </h3>
              <h4 className="text-gray-600 text-xl font-medium leading-loose">
                Date: {order.order_date.split("T")[0]}
              </h4>
              <div className="w-full flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-900 text-lg font-semibold">
                    Delivering to:
                  </h4>
                  {order.address_details ? (
                    <p className="text-gray-600">
                      {order.address_details.flat}, {order.address_details.area}
                      <br />
                      {order.address_details.landmark &&
                        `${order.address_details.landmark}, `}
                      {order.address_details.city},{" "}
                      {order.address_details.state} -{" "}
                      {order.address_details.pincode}
                    </p>
                  ) : (
                    <p className="text-gray-400">
                      No address information available
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-900 text-lg font-semibold">
                    Tracking Number:
                  </h4>
                  <p className="text-gray-600">
                    {order.tracking_number || "Not available yet"}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-900 text-lg font-semibold">
                    Shipped by:
                  </h4>
                  <p className="text-gray-600">
                    {order.courier || "Not shipped yet"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end w-full">
                {/* <Button className="w-auto " color="primary" size="lg" radius="full">
                  Print Invoice
                </Button> */}
              </div>
            </div>

            <div className="w-full flex flex-col gap-7">
              <h3 className="text-indigo-600 text-2xl font-semibold font-manrope leading-9">
                Item Ordered
              </h3>

              <div className="w-full flex flex-col">
                {/* Table Header */}
                <div className="w-full hidden lg:grid grid-cols-3 p-4 bg-gray-50 text-center">
                  <span className="text-gray-500 text-base font-normal leading-relaxed text-left">
                    Product
                  </span>
                  <span className="text-gray-500 text-base font-normal leading-relaxed">
                    Price
                  </span>
                  <span className="text-gray-500 text-base font-normal leading-relaxed">
                    Quantity
                  </span>
                </div>

                {/* Loop through component_details */}
                {order.component_details.map((component, index) => {
                  const type = order.components[index]?.component_type; // Get type from components
                  const productId = order.components[index]?.component_id; // Get _id from components

                  // Determine link based on type
                  let productLink = "";

                  if (type === "prebuiltpcs") {
                    productLink = `/custom-pc/pre-built-pcs/${productId}`;
                  } else if (type !== "owncustompcs") {
                    productLink = `/components/${type}/${productId}`;
                  }

                  return (
                    <div
                      key={index}
                      className="w-full grid grid-cols-1 lg:grid-cols-3 py-3 border-b border-gray-200 items-center text-center"
                    >
                      {/* Product Info */}
                      <div className="flex items-center gap-4 text-left">
                        <img
                          alt={component.title}
                          className="w-[120px] rounded-xl object-cover"
                          src={component.coverImage}
                        />
                        {type === "owncustompcs" ? (
                          <button
                            className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                            onClick={() => handleOpenConfirmModal(component)}
                          >
                            {component.title || component.name}
                          </button>
                        ) : productLink ? (
                          <a
                            className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                            href={productLink}
                          >
                            {component.title || component.name}
                          </a>
                        ) : (
                          <h4 className="text-black text-lg font-medium leading-relaxed">
                            {component.title || component.name}
                          </h4>
                        )}
                      </div>

                      {/* Price */}
                      <h4 className="text-black text-lg font-medium leading-relaxed">
                        ₹{component.price}
                      </h4>

                      {/* Quantity */}
                      <h4 className="text-black text-lg font-medium leading-relaxed">
                        {order.components[index]?.quantity}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full rounded-xl flex-col justify-start items-start gap-6 flex">
              <div className="w-full pb-6 border-b border-gray-200 flex-col justify-start items-start gap-6 flex">
                <div className="w-full justify-between items-start gap-6 inline-flex">
                  <h4 className="text-gray-500 text-xl font-normal leading-8">
                    Subtotal
                  </h4>
                  <h4 className="text-right text-gray-900 text-xl font-semibold leading-8">
                    ₹{order.total_price.toFixed(2)}
                  </h4>
                </div>
                <div className="w-full justify-between items-start gap-6 inline-flex">
                  <h4 className="text-gray-500 text-xl font-normal leading-8">
                    CGST (2.5%)
                  </h4>
                  <h4 className="text-right text-gray-900 text-xl font-semibold leading-8">
                    ₹{cgst.toFixed(2)}
                  </h4>
                </div>
                <div className="w-full justify-between items-start gap-6 inline-flex">
                  <h4 className="text-gray-500 text-xl font-normal leading-8">
                    SGST (2.5%)
                  </h4>
                  <h4 className="text-right text-gray-900 text-xl font-semibold leading-8">
                    ₹{sgst.toFixed(2)}
                  </h4>
                </div>
              </div>
              <div className="w-full pb-6 border-b border-gray-200 justify-between items-start gap-6 inline-flex">
                <h3 className="text-gray-900 text-2xl font-semibold font-manrope leading-9">
                  Total
                </h3>
                <h3 className="text-right text-indigo-600 text-2xl font-bold font-manrope leading-9">
                  ₹{totalPrice.toFixed(2)}
                </h3>
              </div>
            </div>
            <div className="w-full flex justify-end">
              {order.status === "In transit" && ( // ✅ Show button if status is "In transit "
                <Button
                  className="w-auto"
                  color="danger"
                  radius="full"
                  size="lg"
                  variant="ghost"
                  onPress={() => {
                    setCancelId(order._id); // Store the order ID in state
                    onConfirmDeleteModalOpenChange(); // Open the modal
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal to show owncustompcs */}
      <Modal
        isOpen={isConfirmModalOpen}
        size="2xl"
        onOpenChange={onConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Selected Components
              </ModalHeader>
              <ModalBody>
                {selectedProducts &&
                selectedProducts.type === "owncustompcs" ? (
                  Object.keys(selectedProducts.components).length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700">
                      {Object.entries(selectedProducts.components).map(
                        ([type, component]: any) => (
                          <li key={type} className="mb-2">
                            <span className="font-semibold">{type}:</span>{" "}
                            {component._id} - ₹
                            {component.price?.toLocaleString() || 0}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>No components found.</p>
                  )
                ) : (
                  <p>Loading components...</p>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="primary"
                  radius="full"
                  variant="ghost"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete  Confirmation Modal */}
      <Modal
        isOpen={isConfirmDeleteModalOpen}
        onOpenChange={onConfirmDeleteModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete from Cart?
              </ModalHeader>
              <ModalBody>Are you sure you want to cancel this order?</ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    // Use the selected item
                    await handleCancelOrder(cancelId);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default OrderDetails;
