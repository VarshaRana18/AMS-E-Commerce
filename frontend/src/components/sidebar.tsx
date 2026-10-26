import { Link } from "react-router-dom";
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

import { useAuth } from "@/contexts/AuthContext";

const Sidebar = ({
  onComponentClick,
  selectedProducts,
  onClearComponent,
  onClearAll,
  isMobile,
}: {
  onComponentClick: (component: string) => void;
  selectedProducts: Record<
    string,
    { _id: string; title: string; price: number } | null
  >;
  onClearComponent: (component: string) => void;
  onClearAll: () => void;
  onConfirm: () => void;
  isMobile: boolean;
}) => {
  const {
    isOpen: isClearModalOpen,
    onOpen: onOpenClearModal,
    onOpenChange: onClearModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onOpenConfirmModal,
    onOpenChange: onConfirmModalOpenChange,
  } = useDisclosure();
  const { currentUser }: any = useAuth();

  const handleClearAll = () => {
    onOpenClearModal();
  };

  const handleConfirm = () => {
    onOpenConfirmModal();
  };
  const handleConfirmOrder = async () => {
    try {
      const response = await fetch("/api/custom-pc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
          components: Object.entries(selectedProducts)
            .filter(([_, product]) => product && product.title !== "None")

            .map(([component, product]) => ({
              component_id: product!._id,
              component_type:
                component === "Storage" ? "Storage Device" : component,

              price: product!.price || 0,
            })),
          price: Object.values(selectedProducts)

            .filter(
              (product): product is NonNullable<typeof product> =>
                product !== null
            )
            .reduce((total, product) => total + (product.price || 0), 0),
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");
      onClearAll();
      onConfirmModalOpenChange();
      addToast({
        title: "Success!",
        description: "Added to Cart Successfully!",
        timeout: 2000,

        color: "success",
      });
    } catch (error) {
      onConfirmModalOpenChange();

      addToast({
        title: "Error!",
        description: "Failed to confirm the order. Please try again.",
        timeout: 2000,

        color: "danger",
      });
    }
  };

  return (
    <div
      className={`${isMobile ? "w-full" : "w-54"} pl-4 bg-white h-full flex flex-col justify-between`}
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Components Selected</h2>

        <div className="flex flex-col gap-4">
          {/* Total Price Section */}
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total Price:</span>
            <span className="text-green-600">
              ₹
              {Object.values(selectedProducts).reduce(
                (total, product) => total + (product?.price || 0),
                0
              )}
            </span>
          </div>
          {Object.entries(selectedProducts).map(([component, product]) => (
            <div
              key={component}
              className={`${isMobile ? "w-full" : "max-w-[216px]"}`}
            >
              <div className="flex justify-between items-center">
                <button
                  className={`font-medium ${isMobile ? "truncate" : "break-words"}`}
                  onClick={() =>
                    onComponentClick(
                      component === "Storage" ? "storage-device" : component
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onComponentClick(
                        component === "Storage" ? "storage-device" : component
                      );
                    }
                  }}
                >
                  {component === "Storage" ? "Storage Device" : component}
                </button>
                {product && (
                  <button
                    aria-label={`Clear ${component}`}
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => onClearComponent(component)}
                  >
                    <svg
                      className="bi bi-dash-circle"
                      fill="currentColor"
                      height="16"
                      viewBox="0 0 16 16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
                    </svg>
                  </button>
                )}
              </div>

              {product ? (
                <Link
                  className={`text-sm text-gray-600 pl-4 ${isMobile ? "break-words" : "break-words"}`}
                  to={`/custom-pc/custom-pc-builder/${(component === "Storage" ? "storage-device" : component).toLowerCase().replace(/\s+/g, "-")}/${product._id}`}
                >
                  {product.title}
                </Link>
              ) : (
                <p
                  className={`text-sm text-gray-600 pl-4 ${isMobile ? "truncate" : "break-words"}`}
                >
                  None
                </p>
              )}
            </div>
          ))}{" "}
        </div>
      </div>
      <br />
      <div className="flex gap-2 pb-4 justify-center">
        <Button color="danger" variant="ghost" onPress={handleClearAll}>
          Clear
        </Button>
        <Button
          color="success"
          isDisabled={Object.values(selectedProducts).some(
            (product) => !product
          )}
          isLoading={Object.values(selectedProducts).some(
            (product) => !product
          )}
          variant="ghost"
          onPress={handleConfirm}
        >
          Confirm
        </Button>
      </div>

      {/* Clear Modal */}
      <Modal isOpen={isClearModalOpen} onOpenChange={onClearModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Clear All Items
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to clear all the items?</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  radius="full"
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="success"
                  radius="full"
                  variant="ghost"
                  onPress={() => {
                    onClearAll();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={onConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Selection
              </ModalHeader>
              <ModalBody>
                {Object.values(selectedProducts).every(
                  (product) => !product || product === null
                ) ? (
                  <p>No components selected.</p>
                ) : (
                  <>
                    <ul className="list-disc pl-5 text-gray-700">
                      {Object.entries(selectedProducts).map(
                        ([component, product]) => (
                          <li key={component} className="mb-2">
                            <span className="font-semibold">
                              {component === "Storage"
                                ? "Storage Device"
                                : component}
                              :
                            </span>{" "}
                            {product && typeof product !== "string"
                              ? `${product.title} - ₹${product.price}`
                              : "None"}
                          </li>
                        )
                      )}
                    </ul>

                    {/* Calculate and Display Total Price */}
                    <div className="mt-4 font-semibold text-lg">
                      Total Price: ₹
                      {Object.values(selectedProducts)

                        .filter(
                          (product): product is NonNullable<typeof product> =>
                            product !== null && typeof product === "object"
                        )
                        .reduce(
                          (total, product) => total + (product.price || 0),
                          0
                        )
                        .toFixed(2)}
                    </div>
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  radius="full"
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="success"
                  radius="full"
                  variant="ghost"
                  onPress={handleConfirmOrder}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Sidebar;
