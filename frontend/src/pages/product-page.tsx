import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Tooltip } from "@heroui/react";
import { addToast } from "@heroui/toast";

import DefaultLayout from "@/layouts/default";
import SearchBar from "@/components/search-bar";
import { useAuth } from "@/contexts/AuthContext";

const ProductPage = () => {
  const { type } = useParams();
  const { currentUser }: any = useAuth();
  const navigate = useNavigate();
  const [products, setProducts]: any = useState([]);
  const [loading, setLoading]: any = useState(true);
  const [allowedTypes, setAllowedTypes]: any = useState([]);
  const [searchQuery, setSearchQuery]: any = useState("");
  const [selectedCompanies, setSelectedCompanies]: any = useState([]);
  const [priceRange, setPriceRange]: any = useState([0, 10000]);
  const [wishlist, setWishlist]: any = useState([]);
  const [cart, setCart]: any = useState([]);

  useEffect(() => {
    document.title = "AMS || Product Page";
    const fetchAllowedTypes = async () => {
      try {
        const response = await fetch("/api/components/categories");

        if (!response.ok) throw new Error("Failed to fetch categories");

        const categories = await response.json();
        const types = categories.map((category) =>
          category.title.toLowerCase().replace(/\s+/g, "-")
        );

        setAllowedTypes(types);
      } catch (error) {}
    };

    fetchAllowedTypes();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return; // Ensure user is logged in

      try {
        const response = await fetch(`/api/auth/wishlist/${currentUser.email}`);

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

  useEffect(() => {
    if (allowedTypes.length > 0 && !allowedTypes.includes(type)) {
      navigate("/components");

      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/components/${type}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products, status: ${response.status}`
          );
        }

        const data = await response.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (allowedTypes.includes(type)) {
      fetchProducts();
    }
  }, [type, navigate, allowedTypes]);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCompanies.length === 0 ||
        selectedCompanies.includes(product.company)) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
  );

  const toggleWishlist = async (productId) => {
    try {
      // Check if the item is already in the wishlist
      const isInWishlist = wishlist.some((item) => item._id === productId);

      const response = await fetch(`/api/auth/wishlist/${currentUser.email}`, {
        method: isInWishlist ? "DELETE" : "POST", // Use DELETE to remove, POST to add
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: productId,
          type: type,
        }),
      });

      if (!response.ok) throw new Error("Failed to update wishlist");

      // Update UI immediately
      setWishlist(
        (prevWishlist) =>
          isInWishlist
            ? prevWishlist.filter((item) => item._id !== productId) // Remove from wishlist
            : [...prevWishlist, { _id: productId, type: type }] // Add to wishlist
      );

      addToast({
        title: "Success!",
        description: isInWishlist
          ? "Removed from wishlist"
          : "Added to wishlist",
        timeout: 2000,

        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update wishlist",
        timeout: 2000,

        color: "danger",
      });
    }
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

  return (
    <DefaultLayout>
      <div className="sticky top-[64px] z-10 bg-white pb-4">
        <button
          className="mb-4 text-blue-600 hover:underline"
          type="button"
          onClick={() => navigate(-1)}
        >
          &larr; Back to previous page
        </button>
        <SearchBar
          priceRange={priceRange}
          selectedCompanies={selectedCompanies}
          selectedComponent={type}
          setPriceRange={setPriceRange}
          setSearchQuery={setSearchQuery}
          setSelectedCompanies={setSelectedCompanies}
        />
      </div>

      <div className="font-[sans-serif] bg-gray-100">
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4">
          {loading ? (
            <div className="text-center text-gray-600 text-lg py-10">
              Loading Products...
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-xl:gap-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  className="bg-white rounded p-4 cursor-pointer hover:-translate-y-1 transition-all relative flex flex-col"
                  to={`/components/${type}/${product._id}`}
                >
                  <div className="mb-4 bg-gray-100 rounded p-2">
                    <img
                      alt={product.title}
                      className="aspect-[33/35] w-full object-contain"
                      src={product.coverImage}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex gap-2">
                      <h5 className="text-base font-bold text-gray-800">
                        {product.title}
                      </h5>
                      <h6 className="text-base text-gray-800 font-bold ml-auto">
                        ₹{product.price}
                      </h6>
                    </div>
                    <p className="text-gray-500 text-[13px] mt-2 whitespace-pre-line">
                      {product.specifications
                        .filter((spec) => spec.isBasicInfo)
                        .map((spec) => `${spec.title}: ${spec.value}`)
                        .join("\n")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {currentUser ? (
                      <>
                        <Tooltip
                          className="bg-pink-200"
                          closeDelay={150}
                          content={
                            wishlist.some((item) => item._id === product._id)
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                        >
                          <button
                            className="bg-pink-100 hover:bg-pink-200 w-12 h-9 flex items-center justify-center rounded cursor-pointer"
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              const isInWishlist = wishlist.some(
                                (item) => item._id === product._id
                              );

                              setWishlist((prevWishlist) =>
                                isInWishlist
                                  ? prevWishlist.filter(
                                      (item) => item._id !== product._id
                                    )
                                  : [...prevWishlist, product]
                              );
                              await toggleWishlist(product._id);
                            }}
                          >
                            {wishlist.some(
                              (item) => item._id === product._id
                            ) ? (
                              <svg
                                fill="#db2777"
                                stroke="#db2777"
                                viewBox="0 0 24 24"
                                width="16px"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z" />
                              </svg>
                            ) : (
                              <svg
                                className="fill-pink-600 inline-block"
                                viewBox="0 0 64 64"
                                width="16px"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        <Tooltip
                          className="bg-blue-200"
                          closeDelay={150}
                          content={
                            cart.some((item) => item._id === product._id)
                              ? "Remove from Cart"
                              : "Add to Cart"
                          }
                        >
                          <button
                            className={`text-sm px-2 h-9 font-semibold w-full text-white tracking-wide ml-auto outline-none border-none rounded transition-colors ${
                              cart.some((item) => item._id === product._id)
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              const isInCart = cart.some(
                                (item) => item._id === product._id
                              );

                              setCart((prevCart) =>
                                isInCart
                                  ? prevCart.filter(
                                      (item) => item._id !== product._id
                                    )
                                  : [...prevCart, { ...product, quantity: 1 }]
                              );
                              await toggleCart(product._id);
                            }}
                          >
                            {cart.some((item) => item._id === product._id)
                              ? "Added to Cart ✅"
                              : "Add to Cart"}
                          </button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip
                          className="bg-gray-200"
                          closeDelay={150}
                          content="Login to add to wishlist"
                        >
                          <button
                            disabled
                            className="bg-gray-100 w-12 h-9 flex items-center justify-center rounded cursor-not-allowed relative"
                            type="button"
                          >
                            <div className="absolute inset-0 bg-gray-300 bg-opacity-50 rounded flex items-center justify-center">
                              <svg
                                className="fill-gray-600 inline-block"
                                viewBox="0 0 64 64"
                                width="16px"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z" />
                              </svg>
                              <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-gray-600"
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
                            </div>
                          </button>
                        </Tooltip>

                        <Tooltip
                          className="bg-gray-200"
                          closeDelay={150}
                          content="Login to add to cart"
                        >
                          <button
                            disabled
                            className="text-sm px-2 h-9 font-semibold w-full text-white tracking-wide ml-auto outline-none border-none rounded bg-gray-400 cursor-not-allowed relative"
                            type="button"
                          >
                            <span className="opacity-70">Add to Cart</span>
                            <div className="absolute top-0 right-1 w-4 h-4 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-gray-600"
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
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </Link>
              ))}{" "}
            </div>
          ) : (
            <div className="text-center text-gray-600 text-lg py-10">
              No Products Available
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
