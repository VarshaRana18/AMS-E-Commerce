import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addToast } from "@heroui/toast";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  RadioGroup,
  Radio,
} from "@heroui/react";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";

const CartPage = () => {
  const { currentUser }: any = useAuth();
  const [cart, setCart]: any = useState([]);
  const originalPrice: any = cart.reduce(
    (total, item: any) => total + item.price * item.quantity,
    0
  );
  const taxRate = 0.025; // 2.5% for both CGST and SGST
  const cgst = originalPrice * taxRate;
  const sgst = originalPrice * taxRate;
  const totalPrice = originalPrice + cgst + sgst;
  const [selectedItem, setSelectedItem] = useState({ id: null, type: "" });
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onOpenChange: onConfirmModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isConfirmDeleteModalOpen,
    onOpenChange: onConfirmDeleteModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddressSelectionModalOpen,
    onOpenChange: onAddressSelectionModalOpenChange,
  } = useDisclosure();

  const removeFromCart = async (productId, productType, showToast = true) => {
    const componentType = productType.toLowerCase().replace(/\s+/g, "-");

    try {
      const response = await fetch(`/api/auth/cart/${currentUser.email}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: productId, type: componentType }),
      });

      if (!response.ok) throw new Error("Failed to remove from cart");

      // If productType is "owncustompcs", delete from owncustompcs collection
      if (productType === "owncustompcs") {
        const ownCustomPCResponse = await fetch(`/api/custom-pc/${productId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!ownCustomPCResponse.ok)
          throw new Error("Failed to remove from owncustompcs collection");
      }

      // Update UI by filtering out the removed item
      setCart((prevCart) =>
        prevCart.filter((item: any) => item._id !== productId)
      );

      if (showToast) {
        addToast({
          title: "Success!",
          description: "Removed from cart",
          timeout: 2000,

          color: "success",
        });
      }
    } catch (error) {
      if (showToast) {
        addToast({
          title: "Error",
          description: "Failed to remove from cart",
          timeout: 2000,

          color: "danger",
        });
      }
    }
  };

  // const clearCart = async () => {
  //   try {
  //     const response = await fetch(`/api/auth/cart/${currentUser.email}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ clearAll: true }),
  //     });

  //     if (!response.ok) throw new Error("Failed to clear cart");

  //     // Update UI by setting cart to an empty array
  //     setCart([]);
  //   } catch (error) {
  //     console.error("Error clearing cart:", error);
  //   }
  // };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await fetch(`/api/auth/cart/${currentUser.email}`, {
        method: "PUT", // Use PUT to update quantity
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: productId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");

      // Update UI instantly
      setCart((prevCart: any) =>
        prevCart.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update quantity",
        timeout: 2000,

        color: "danger",
      });
    }
  };

  const handleOpenConfirmModal = (customPC) => {
    // Convert components array into an object with type as key and store _id & price
    const formattedComponents = customPC.components.reduce((acc, component) => {
      acc[component.type] = { _id: component._id, price: component.price || 0 };

      return acc;
    }, {});

    setSelectedProducts(formattedComponents); // Set data with price
    onOpenConfirmModal(); // Open modal
  };

  const handleCheckout = async () => {
    if (!currentUser?.email) {
      addToast({
        title: "Error!",
        description: "You must be logged in to proceed.",
        timeout: 2000,

        color: "danger",
      });

      return;
    }

    // Prepare checkout data
    const components = Object.entries(cart)
      .filter(([_, product]: any) => product && product !== "None")
      .map(([_, product]: any) => ({
        component_id: product._id,
        component_type:
          product.type === "Storage"
            ? "storage-device"
            : product.type.toLowerCase().replace(/\s+/g, "-"),
        quantity: product.quantity || 1,
      }));

    if (components.length === 0) {
      addToast({
        title: "Error!",
        description: "No components selected for checkout.",
        timeout: 2000,

        color: "danger",
      });

      return;
    }

    // Store checkout data in session storage
    sessionStorage.setItem(
      "pendingOrder",
      JSON.stringify({
        components,
        total_price: originalPrice.toFixed(2),
        userEmail: currentUser.email,
        address: selectedAddressId,
      })
    );

    // Redirect to payment page
    window.location.href = "/payment";
  };

  useEffect(() => {
    document.title = "AMS || Cart";

    const fetchCart = async () => {
      if (!currentUser) return; // Ensure user is logged in
      try {
        const response = await fetch(
          `/api/auth/cartItems/${currentUser.email}`
        );

        if (!response.ok) throw new Error("Failed to fetch cart");

        const data = await response.json();

        setCart(Array.isArray(data) ? data : []);
      } catch (error) {}
    };

    fetchCart();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!currentUser?.email) return; // Ensure user is logged in and has email

      try {
        const response = await fetch(
          `/api/auth/addresses/${currentUser.email}`
        );

        if (!response.ok) throw new Error("Failed to fetch user addresses");

        const userData = await response.json();

        // Set addresses to empty array if none exist, otherwise set the addresses array
        setUserAddresses(
          Array.isArray(userData.addresses) ? userData.addresses : []
        );
      } catch (error) {
        setUserAddresses([]); // Reset to empty array on error
      }
    };

    fetchUserAddresses();
  }, [currentUser]);

  return (
    <DefaultLayout>
      <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Shopping Cart
          </h2>

          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6"
                  >
                    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                      <img
                        alt={item.title}
                        className="h-19 w-20"
                        src={item.coverImage}
                      />

                      <label
                        className="sr-only"
                        htmlFor={`counter-input-${item._id}`}
                      >
                        Choose quantity:
                      </label>
                      <div className="flex items-center justify-between md:order-3 md:justify-end">
                        <div className="flex items-center">
                          {item.quantity > 1 && (
                            <button
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                              type="button"
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                          )}
                          <input
                            readOnly
                            className="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 dark:text-white"
                            id={`counter-input-${item._id}`}
                            type="text"
                            value={item.quantity}
                          />
                          <button
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                            type="button"
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="text-end md:order-4 md:w-32">
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>

                      <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                        {item.type !== "owncustompcs" ? (
                          <Link
                            className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                            to={
                              item.title
                                ? `/components/${item.type.toLowerCase().replace(/\s+/g, "-")}/${item._id}`
                                : `/custom-pc/pre-built-pcs/${item._id}`
                            }
                          >
                            {item.title || item.name}
                          </Link>
                        ) : (
                          <button
                            className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                            onClick={() => handleOpenConfirmModal(item)}
                          >
                            {item.title || item.name}
                          </button>
                        )}

                        <div className="flex items-center gap-4">
                          {/* <button type="button" className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500" onClick={() => removeFromCart(item._id, item.type)}> */}
                          <button
                            className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                            type="button"
                            onClick={() => {
                              setSelectedItem({
                                id: item._id,
                                type: item.type,
                              }); // Store item details
                              onConfirmDeleteModalOpenChange(); // Open modal
                            }}
                          >
                            <svg
                              aria-hidden="true"
                              className="me-1.5 h-5 w-5"
                              fill="none"
                              height="24"
                              viewBox="0 0 24 24"
                              width="24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 18 17.94 6M18 18 6.06 6"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order summary
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        Original price
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        ₹{originalPrice.toFixed(2)}
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        CGST (2.5%)
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        ₹{cgst.toFixed(2)}
                      </dd>
                    </dl>

                    <dl className="flex items-center justify-between gap-4">
                      <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                        SGST (2.5%)
                      </dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">
                        ₹{sgst.toFixed(2)}
                      </dd>
                    </dl>
                  </div>

                  <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      ₹{totalPrice.toFixed(2)}
                    </dd>
                  </dl>
                </div>

                {/* <button className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Proceed to Checkout</button> */}
                <Tooltip
                  showArrow
                  closeDelay={0}
                  content="Your cart is empty. Add items to proceed to checkout."
                  delay={0}
                  isDisabled={cart.length > 0 || isLoading}
                  placement="top"
                >
                  <div className="relative">
                    <Button
                      className={`w-full px-4 py-2.5 outline-none border text-sm font-semibold ${
                        cart.length === 0 ? "opacity-70" : ""
                      }`}
                      color="primary"
                      isDisabled={isLoading || cart.length === 0}
                      isLoading={isLoading}
                      radius="full"
                      size="lg"
                      onPress={onAddressSelectionModalOpenChange}
                    >
                      {isLoading ? (
                        "Processing..."
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Proceed to Checkout</span>
                          {(isLoading || cart.length === 0) && (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                clipRule="evenodd"
                                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                fillRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                    </Button>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Confirmation Modal for Own Custom PC */}
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
                {Object.keys(selectedProducts).length === 0 ? (
                  <p>Loading components...</p>
                ) : (
                  <ul className="list-disc pl-5 text-gray-700">
                    {Object.entries(selectedProducts).map(
                      ([type, product]: any) => (
                        <li key={type} className="mb-2">
                          <span className="font-semibold">
                            {type === "Storage" ? "Storage Device" : type}:
                          </span>{" "}
                          {product._id} - ₹
                          {product.price?.toLocaleString() || 0}
                        </li>
                      )
                    )}
                  </ul>
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
              <ModalBody>
                Are you sure you want to remove this item from your cart?
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    await removeFromCart(selectedItem.id, selectedItem.type); // Use the selected item
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

      {/*Address Selction Modal */}
      <Modal
        isOpen={isAddressSelectionModalOpen}
        onOpenChange={onAddressSelectionModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Select Delivery Address
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {userAddresses && userAddresses.length > 0 ? (
                    <RadioGroup
                      label="Select delivery address"
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                    >
                      <div className="space-y-3">
                        {userAddresses.map((address: any) => (
                          <div
                            key={address._id}
                            className={`p-4 border rounded-lg transition-colors ${
                              selectedAddressId === address._id
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <Radio
                              classNames={{
                                base: "items-start",
                                wrapper: "mt-1",
                              }}
                              value={address._id}
                            >
                              <div className="ml-2">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {address.name}
                                </div>
                                <div className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
                                  <span>Mobile: {address.phoneNumber}</span>
                                  <span>
                                    {address.flat}, {address.area}
                                  </span>
                                  <span>
                                    {address.landmark &&
                                      `${address.landmark}, `}
                                    {address.city}, {address.state} -{" "}
                                    {address.pincode}
                                  </span>
                                </div>
                              </div>
                            </Radio>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 py-4 text-center">
                      No addresses added yet. Go to{" "}
                      <a
                        className="text-blue-600 underline hover:text-blue-800"
                        href="/profile"
                      >
                        profile
                      </a>{" "}
                      to add one.
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!selectedAddressId}
                  variant="solid"
                  onPress={() => {
                    handleCheckout();
                    onClose();
                  }}
                >
                  Continue to Payment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default CartPage;
