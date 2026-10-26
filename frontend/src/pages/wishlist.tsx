import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";

const stockStatusClasses = {
  "In Stock":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Out of Stock": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const Wishlist = () => {
  const { currentUser }: any = useAuth();
  const [wishlist, setWishlist]: any = useState([]);
  const [cart, setCart]: any = useState([]);

  useEffect(() => {
    document.title = "AMS || Wishlist";

    const fetchWishlist = async () => {
      if (!currentUser) return; // Ensure user is logged in

      try {
        const response = await fetch(
          `/api/auth/wishlistItems/${currentUser.email}`
        );

        if (!response.ok) throw new Error("Failed to fetch wishlist");

        const data = await response.json();

        setWishlist(Array.isArray(data) ? data : []);
      } catch (error) {}
    };

    fetchWishlist();
  }, [currentUser]);

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

  const removeFromWishlist = async (productId, productType) => {
    try {
      const componentType = productType.toLowerCase().replace(/\s+/g, "-");
      // Check if the item is in the wishlist
      const isInWishlist = wishlist.some((item) => item._id === productId);

      if (!isInWishlist) return; // If not in wishlist, no need to proceed

      const response = await fetch(`/api/auth/wishlist/${currentUser.email}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: productId, type: componentType }),
      });

      if (!response.ok) throw new Error("Failed to remove item from wishlist");

      // Update UI immediately by removing the item from the wishlist
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item._id !== productId)
      );

      addToast({
        title: "Success!",
        description: "Removed from wishlist",
        timeout: 2000,

        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to remove from wishlist",
        timeout: 2000,

        color: "danger",
      });
    }
  };

  const toggleCart = async (productId, productType) => {
    try {
      const componentType = productType.toLowerCase().replace(/\s+/g, "-");
      // Check if the item is already in the cart
      const isInCart = cart.some((item) => item._id === productId);

      const response = await fetch(`/api/auth/cart/${currentUser.email}`, {
        method: isInCart ? "DELETE" : "POST", // Use DELETE to remove, POST to add
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: productId,
          type: componentType,
          quantity: 1, // Default quantity to 1 when adding
        }),
      });

      if (!response.ok) throw new Error("Failed to update cart");

      // Update UI immediately
      setCart(
        (prevCart) =>
          isInCart
            ? prevCart.filter((item) => item._id !== productId) // Remove from cart
            : [
                ...prevCart,
                { _id: productId, type: componentType, quantity: 1 },
              ] // Add to cart
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

  return (
    <DefaultLayout>
      <section className="bg-white py-4 antialiased dark:bg-gray-900 md:py-8">
        <div className="w-full px-4 2xl:px-0">
          <div className="w-full">
            <div className="gap-4 sm:flex sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                My Wishlist
              </h2>
            </div>

            <div className="mt-6 flow-root sm:mt-8">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {wishlist.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-wrap items-center gap-y-4 py-6"
                  >
                    <dl className="w-full sm:w-1/2 lg:w-3/5 flex items-center">
                      <img
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded mr-4"
                        src={item.coverImage}
                      />
                      <div>
                        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                          Name:
                        </dt>
                        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                          <Link
                            className="hover:underline dark:text-primary-400"
                            to={
                              item.title
                                ? `/components/${item.type.toLowerCase().replace(/\s+/g, "-")}/${item._id}`
                                : `/custom-pc/pre-built-pcs/${item._id}`
                            }
                          >
                            {item.title || item.name}
                          </Link>
                        </dd>
                      </div>
                    </dl>

                    <dl className="w-1/2 sm:w-1/4 lg:w-1/5">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Price:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                        ₹{item.price}
                      </dd>
                    </dl>

                    <dl className="w-1/2 sm:w-1/4 lg:w-1/5">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Status:
                      </dt>
                      <dd
                        className={`me-2 mt-1.5 inline-flex items-center rounded px-3 py-1 text-sm font-medium ${stockStatusClasses[item.quantity > 0 ? "In Stock" : "Out of Stock"]}`}
                      >
                        <svg
                          aria-hidden="true"
                          className="me-1 h-4 w-4"
                          fill="none"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {item.quantity > 0 ? (
                            <path
                              d="M5 11.917 9.724 16.5 19 7.5"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          ) : (
                            <path
                              d="M6 18 17.94 6M18 18 6.06 6"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          )}
                        </svg>
                        {item.quantity > 0 ? "In Stock" : "Out of Stock"}
                      </dd>
                    </dl>

                    <div className="w-full grid sm:grid-cols-2 lg:flex lg:w-auto lg:items-center lg:justify-end gap-4 sm:gap-3">
                      <button
                        className="w-full lg:w-auto rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        type="button"
                        onClick={() => toggleCart(item._id, item.type)} // Call toggleCart when clicked
                      >
                        {cart.some((cartItem) => cartItem._id === item._id)
                          ? "Remove from Cart"
                          : "Add to Cart"}
                      </button>
                      <button
                        className="w-full lg:w-auto rounded-lg border border-red-700 px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                        type="button"
                        onClick={() => removeFromWishlist(item._id, item.type)}
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Wishlist;
