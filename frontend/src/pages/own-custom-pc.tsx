import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import Sidebar from "@/components/sidebar";
import DefaultLayout from "@/layouts/default";
import SearchBar from "@/components/search-bar";
import { useAuth } from "@/contexts/AuthContext";

const OwnCustomPC = () => {
  const { currentUser }: any = useAuth();
  const navigate = useNavigate();
  const [isFetchingProducts, setIsFetchingProducts]: any = useState(false);
  const [selectedComponent, setSelectedComponent]: any =
    useState("Motherboard");
  const [products, setProducts]: any = useState([]);
  const [isLoading, setIsLoading]: any = useState(true);
  const [searchQuery, setSearchQuery]: any = useState("");
  const [selectedCompanies, setSelectedCompanies]: any = useState([]);
  const [priceRange, setPriceRange]: any = useState([0, 10000]);
  const [wishlist, setWishlist]: any = useState([]);
  const [selectedProducts, setSelectedProducts]: any = useState(() => {
    const savedProducts = localStorage.getItem("selectedProducts");

    return savedProducts
      ? JSON.parse(savedProducts)
      : {
          Motherboard: null,
          Processor: null,
          "Graphics Card": null,
          RAM: null,
          "Storage Device": null,
          "Power Supply": null,
          "Cooling System": null,
          Cabinet: null,
        };
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    document.title = "AMS || Own Custom PC";
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsFetchingProducts(true);
        setIsLoading(true);

        const response = await fetch(
          `/api/components/${selectedComponent.toLowerCase().replace(/\s+/g, "-")}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setProducts(data);
      } catch (error) {
      } finally {
        setIsFetchingProducts(false);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedComponent]);

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

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    setSelectedCompanies([]);
    setSearchQuery("");
  };

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev, [selectedComponent]: product };

      return updated;
    });
  };

  const handleClearComponent = (component) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [component]: null,
    }));
  };

  const handleClearAll = () => {
    setSelectedProducts({
      Motherboard: null,
      Processor: null,
      "Graphics Card": null,
      RAM: null,
      "Storage Device": null,
      "Power Supply": null,
      "Cooling System": null,
      Cabinet: null,
    });
  };

  const BackButton = () => (
    <div className="mb-4 flex justify-between items-center fixed top-14 left-0 right-0 z-20 bg-white p-4">
      <button
        className="text-blue-600 hover:underline"
        type="button"
        onClick={() => navigate(-1)}
      >
        &larr; Back to previous page
      </button>
      <button className="sm:hidden text-blue-600" onClick={onOpen}>
        Components
      </button>
    </div>
  );
  const filteredProducts = products.filter(
    (product: any) =>
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
      const compnentType = selectedComponent.toLowerCase().replace(/\s+/g, "-");
      const response = await fetch(`/api/auth/wishlist/${currentUser.email}`, {
        method: isInWishlist ? "DELETE" : "POST", // Use DELETE to remove, POST to add
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: productId,
          type: compnentType,
        }),
      });

      if (!response.ok) throw new Error("Failed to update wishlist");

      // Update UI immediately
      setWishlist(
        (prevWishlist) =>
          isInWishlist
            ? prevWishlist.filter((item) => item._id !== productId) // Remove from wishlist
            : [...prevWishlist, { _id: productId, type: { selectedComponent } }] // Add to wishlist
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DefaultLayout>
      <div className="flex min-h-screen">
        <div className="hidden sm:block w-fit sticky top-16 self-start bg-white">
          <BackButton />
          <Sidebar
            isMobile={false}
            selectedProducts={selectedProducts}
            onClearAll={handleClearAll}
            onClearComponent={handleClearComponent}
            onComponentClick={handleComponentClick}
            onConfirm={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader className="flex flex-col gap-1">
              Components Selected
            </DrawerHeader>
            <DrawerBody>
              <Sidebar
                isMobile={true}
                selectedProducts={selectedProducts}
                onClearAll={handleClearAll}
                onClearComponent={handleClearComponent}
                onComponentClick={(component) => {
                  handleComponentClick(component);
                  onOpenChange();
                }}
                onConfirm={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        <div className="flex-1 p-4 md:pl-8">
          <div className="sm:hidden">
            <BackButton />
          </div>
          <div className="sticky top-28 sm:top-14 bg-white z-20 pb-2">
            <h1 className="text-3xl font-bold mb-4 text-center">
              Select {selectedComponent}
            </h1>
            <SearchBar
              priceRange={priceRange}
              selectedCompanies={selectedCompanies}
              selectedComponent={selectedComponent}
              setPriceRange={setPriceRange}
              setSearchQuery={setSearchQuery}
              setSelectedCompanies={setSelectedCompanies}
            />
          </div>
          <div className="p-4 mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isFetchingProducts ? (
                // Show loading state while fetching products
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded p-4 animate-pulse"
                  >
                    <div className="mb-4 bg-gray-200 rounded p-2 h-48" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-full" />
                  </div>
                ))
              ) : filteredProducts.length > 0 ? (
                // Show products when loaded and available
                filteredProducts.map((product: any) => (
                  <Link
                    key={product._id}
                    className="bg-white rounded p-4 cursor-pointer hover:-translate-y-1 transition-all relative flex flex-col"
                    to={`/custom-pc/custom-pc-builder/${selectedComponent.toLowerCase().replace(/\s+/g, "-")}/${product._id}`}
                  >
                    <div className="mb-4 bg-gray-100 rounded p-2">
                      <img
                        alt={product.title}
                        className="aspect-[33/35] w-full object-contain"
                        src={product.coverImage}
                      />
                    </div>
                    <div className="flex-grow">
                      <h5 className="text-base font-bold text-gray-800">
                        {product.title}
                      </h5>
                      <h6 className="text-base text-gray-800 font-bold ml-auto">
                        ₹{product.price}
                      </h6>
                      <p className="text-gray-500 text-[13px] mt-2 whitespace-pre-line">
                        {product.specifications
                          .filter((spec) => spec.isBasicInfo)
                          .map((spec) => `${spec.title}: ${spec.value}`)
                          .join("\n")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {/* Wishlist Button */}
                      {currentUser ? (
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
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
                                toggleWishlist(product._id);
                              }
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
                                <path
                                  d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z"
                                  data-original="#000000"
                                />
                              </svg>
                            )}
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          className="bg-gray-200"
                          closeDelay={150}
                          content="Login to add to wishlist"
                        >
                          <button
                            disabled
                            className="bg-gray-100 hover:bg-gray-200 w-12 h-9 flex items-center justify-center rounded cursor-pointer relative"
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
                      )}

                      {/* Select Button */}
                      {currentUser ? (
                        <button
                          className={`text-sm px-2 h-9 font-semibold w-full ${
                            selectedProducts[selectedComponent]?._id ===
                            product._id
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white tracking-wide ml-auto outline-none border-none rounded`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleProductSelect(product);
                          }}
                        >
                          {selectedProducts[selectedComponent]?._id ===
                          product._id
                            ? "Selected ✅"
                            : "Select"}
                        </button>
                      ) : (
                        <Tooltip
                          className="bg-gray-200"
                          closeDelay={150}
                          content="Login to select products"
                        >
                          <button
                            disabled
                            className="text-sm px-2 h-9 font-semibold w-full bg-gray-400 hover:bg-gray-400 text-white tracking-wide ml-auto outline-none border-none rounded cursor-not-allowed"
                            type="button"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>Select</span>
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
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="mt-5">Loading Products...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default OwnCustomPC;
