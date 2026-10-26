import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Tooltip } from "@heroui/react";
import { addToast } from "@heroui/toast";

import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";

const ProductDetails = () => {
  const { currentUser }: any = useAuth();
  const { type, id }: any = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct]: any = useState(null);
  const [selectedImage, setSelectedImage]: any = useState(null); // For selected image
  const [cart, setCart]: any = useState([]);

  const isCustomPCBuilder = location.pathname.includes("custom-pc-builder");

  const handleBackNavigation = () => {
    navigate(-1);
  };

  useEffect(() => {
    document.title = "AMS || Product Details";
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/components/${type}/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();

        setProduct(data);
        setSelectedImage(data.img[0]); // Set the first image as default
      } catch (error) {
        setProduct(null);
      }
    };

    fetchProduct();
  }, [type, id]);

  useEffect(() => {
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

  const renderActionButtons = () => {
    if (isCustomPCBuilder) {
      return (
        <div />
        // <Button
        //   className="w-full px-4 py-2.5 outline-none border text-sm font-semibold"
        //   color="primary"
        //   size="lg"
        //   radius="full"
        // >
        //   Add to Build
        // </Button>
      );
    }

    return (
      // <div className="flex gap-4">
      //   <Button
      //     className="w-full px-4 py-2.5 outline-none border text-sm font-semibold"
      //     color="primary"
      //     size="lg"
      //     radius="full"
      //   >
      //     Buy now
      //   </Button>
      //   <Button
      //     className="w-full px-4 py-2.5 outline-none border border-blue-600 bg-transparent hover:bg-gray-50 text-gray-800 text-sm font-semibold"
      //     size="lg"
      //     radius="full"
      //   >
      //     Add to Cart
      //   </Button>
      // </div>
      currentUser ? (
        <Button
          className={`w-full px-4 py-2.5 outline-none border text-sm font-semibold ${
            cart.some((item) => item._id === product._id)
              ? "bg-green-600 hover:bg-green-700" // Green when in cart
              : "bg-blue-600 hover:bg-blue-700" // Blue when not in cart
          }`}
          color="primary"
          radius="full"
          size="lg"
          onPress={async () => {
            // Check if item is already in the cart
            const isInCart = cart.some((item) => item._id === product._id);

            // Update UI immediately
            setCart(
              (prevCart) =>
                isInCart
                  ? prevCart.filter((item) => item._id !== product._id) // Remove item
                  : [...prevCart, { ...product, quantity: 1 }] // Add item with quantity
            );

            // Call backend to update the cart
            await toggleCart(product._id);
          }}
        >
          {cart.some((item) => item._id === product._id)
            ? "Added to Cart ✅"
            : "Add to Cart"}
        </Button>
      ) : (
        <Tooltip
          className="bg-gray-200 "
          closeDelay={150}
          content="Login to add items to your cart"
        >
          <div className="relative w-full cursor-not-allowed">
            <Button
              isDisabled
              className="w-full px-4 py-2.5 outline-none border text-sm font-semibold bg-gray-400 hover:bg-gray-400"
              color="default"
              radius="full"
              size="lg"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="opacity-70">Add to Cart</span>
                <svg
                  className="w-4 h-4 text-gray-600"
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
              </div>
            </Button>
          </div>
        </Tooltip>
      )
    );
  };

  const toggleCart = async (productId) => {
    try {
      // Check if the item is already in the cart
      const isInCart = cart.some((item) => item._id === productId);

      const response = await fetch(`/api/auth/cart/${currentUser.email}`, {
        method: isInCart ? "DELETE" : "POST", // Use DELETE to remove, POST to add
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: productId,
          type: type,
          quantity: 1, // Default quantity to 1 when adding
        }),
      });

      if (!response.ok) throw new Error("Failed to update cart");

      // Update UI immediately
      setCart(
        (prevCart) =>
          isInCart
            ? prevCart.filter((item) => item._id !== productId) // Remove from cart
            : [...prevCart, { _id: productId, type: type, quantity: 1 }] // Add to cart
      );

      addToast({
        title: "Success!",
        description: isInCart ? "Removed from cart" : "Added to cart",
        timeout: 2000,

        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update cart",
        timeout: 2000,

        color: "danger",
      });
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  const { title, price, specifications, img } = product;

  return (
    <DefaultLayout>
      <div className="font-sans bg-white">
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4">
          <button
            className="mb-4 text-blue-600 hover:underline"
            type="button"
            onClick={handleBackNavigation}
          >
            &larr; Back to previous page
          </button>
          <div className="grid items-start grid-cols-1 lg:grid-cols-5 gap-12 shadow-[0_2px_10px_-3px_rgba(169,170,172,0.8)] p-6 rounded">
            {/* Main Image */}
            <div className="lg:col-span-3 w-full lg:sticky top-0 text-center">
              <div className="px-4 py-10 rounded shadow-md relative">
                <img
                  alt="Product"
                  className="w-4/5 aspect-[251/171] rounded object-cover mx-auto"
                  src={selectedImage}
                />
              </div>

              {/* Image Thumbnails */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 mx-auto">
                {img.map((image, index) => (
                  <button
                    key={index}
                    className={`w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer ${
                      selectedImage === image ? "ring-2 ring-blue-500" : ""
                    }`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedImage(image);
                      }
                    }}
                  >
                    <img
                      alt="Product Thumbnail"
                      className="w-full object-cover object-top"
                      src={image}
                    />
                  </button>
                ))}{" "}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <div className="flex flex-wrap gap-4 mt-2 mb-10">
                <p className="text-gray-800 text-2xl font-bold">₹{price}</p>
              </div>

              <h4 className="text-xl font-bold text-gray-800">
                Product information
              </h4>
              <ul className="mt-4 space-y-2 text-gray-800">
                {specifications.map(({ title, value }) => (
                  <li
                    key={title}
                    className="text-sm flex flex-col sm:flex-row sm:gap-2"
                  >
                    <span className="text-gray-600">{title}:</span>
                    <span className="text-gray-800">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-4 mt-12 max-w-md">
                {renderActionButtons()}
              </div>
            </div>
          </div>

          {/* Product Information */}
          {/* <div className="mt-12 shadow-[0_2px_10px_-3px_rgba(169,170,172,0.8)] p-6">
            <h3 className="text-xl font-bold text-gray-800">
              Product information
            </h3>
            <ul className="mt-4 space-y-2 text-gray-800">
              {specifications.map(({ title, value }) => (
                <li
                  className="text-sm flex flex-col sm:flex-row sm:gap-2"
                  key={title}
                >
                  <span className="text-gray-600">{title}:</span>
                  <span className="text-gray-800">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </span>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductDetails;
