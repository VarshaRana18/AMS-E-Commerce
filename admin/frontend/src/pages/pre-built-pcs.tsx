import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import SearchBar from "@/components/search-bar";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import AddPreBuiltCustomPC from "@/components/newPreBuiltCustomPC";

export default function DocsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // State to track selected items
  const [isSelectionMode, setIsSelectionMode] = useState(false); // State for toggle
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  interface Product {
    _id: string;
    coverImage: string;
    name: string;
    price: number;
    motherboard: { name: string };
    processor: { name: string };
    graphicsCard: { name: string };
    ram: { name: string };
    storageDevice: { name: string };
    powerSupply: { name: string };
    coolingSystem: { name: string };
    cabinet: { name: string };
  }

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Filter products based on search query (name or component names)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.motherboard.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.processor.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.graphicsCard.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.ram.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.storageDevice.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.powerSupply.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.coolingSystem.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.cabinet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5170/api/customs/pre-built-pcs",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching pre-built PCs:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const isSwiperEnabled = filteredProducts.length >= 4;

  const handleAddPreBuiltPC = () => {
    navigate("/customs/pre-built-pcs/add");
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    if (!isSelectionMode) {
      setSelectedItems([]); // Clear selections when exiting selection mode
    }
  };

  const handleDeleteCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:5170/api/customs/pre-built-pcs/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedItems }), // Send the selected IDs
          credentials: "include",
        }
      );

      if (response.ok) {
        // Refresh the product list after deletion
        const updatedProducts = products.filter(
          (product) => !selectedItems.includes(product._id)
        );
        setProducts(updatedProducts);
        setSelectedItems([]); // Clear selected items
        setIsSelectionMode(false); // Exit selection mode
      } else {
        console.error("Failed to delete pre-built PCs");
      }
    } catch (err) {
      alert(err.message || "Error deleting pre-built PCs.");
      console.error("Error deleting pre-built PCs:", err);
    }
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedItems(
      (prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // Remove if already selected
          : [...prev, productId] // Add if not selected
    );
  };

  const handleCardClick = (productId: string, event: React.MouseEvent) => {
    if (isSelectionMode) {
      event.preventDefault(); // Prevent navigation if selection mode is active
      handleCheckboxChange(productId); // Toggle the checkbox state
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center px-6 w-full max-w-6xl mx-auto">
        {/* SearchBar and Buttons Container */}
        <div className="w-full max-w-6xl mx-auto mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-grow max-w-3xl justify-center items-center">
            <SearchBar onSearch={(query) => setSearchQuery(query)} />
          </div>
          <div className="flex gap-4 justify-center items-center">
            <AddPreBuiltCustomPC />
            <Button
              color="primary"
              className="px-5"
              onPress={handleToggleSelectionMode}
            >
              {isSelectionMode ? "Cancel Selection" : "Select Pre Built PCs"}
            </Button>
            {isSelectionMode && (
              <Button
                color="danger"
                className="px-7"
                onPress={handleDeleteCategories}
              >
                Delete Pre Built PCs
              </Button>
            )}
          </div>
        </div>

        {isSwiperEnabled ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={20}
            pagination={{ clickable: true, el: ".swiper-pagination" }}
            breakpoints={{
              1920: { slidesPerView: 4, spaceBetween: 30 },
              1200: { slidesPerView: 3, spaceBetween: 20 },
              700: { slidesPerView: 2, spaceBetween: 10 },
            }}
            className="w-full mb-12 h-auto"
          >
            {filteredProducts.map((product) => (
              <SwiperSlide
                key={product._id}
                className="flex justify-center h-auto"
              >
                <div
                  className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all px-4 py-3 cursor-pointer flex flex-col max-w-sm border border-gray-200 h-full"
                  onClick={(event) => handleCardClick(product._id, event)}
                >
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => handleCheckboxChange(product._id)}
                      className="absolute left-5 top-4 cursor-pointer z-20 w-6 h-6"
                    />
                  )}
                  <Link
                    to={`/customs/pre-built-pcs/${product._id}`}
                    className={isSelectionMode ? "pointer-events-none" : ""}
                  >
                    <div className="mb-3 rounded-lg overflow-hidden h-64">
                      <img
                        src={product.coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-lg font-semibold text-gray-800">
                          {product.name}
                        </h5>
                        <h6 className="text-lg font-bold text-indigo-600">
                          ₹{product.price}
                        </h6>
                      </div>
                      <p className="text-gray-600 text-sm leading-6">
                        <span className="font-medium text-gray-700">
                          Motherboard:
                        </span>{" "}
                        {product.motherboard.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Processor:
                        </span>{" "}
                        {product.processor.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Graphics Card:
                        </span>{" "}
                        {product.graphicsCard.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          RAM:
                        </span>{" "}
                        {product.ram.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Storage:
                        </span>{" "}
                        {product.storageDevice.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Power Supply:
                        </span>{" "}
                        {product.powerSupply.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Cooling System:
                        </span>{" "}
                        {product.coolingSystem.name}
                        <br />
                        <span className="font-medium text-gray-700">
                          Cabinet:
                        </span>{" "}
                        {product.cabinet.name}
                      </p>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all px-4 py-3 cursor-pointer flex flex-col max-w-sm border border-gray-200 h-full"
                onClick={(event) => handleCardClick(product._id, event)}
              >
                {isSelectionMode && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(product._id)}
                    onChange={() => handleCheckboxChange(product._id)}
                    className="absolute left-2 top-1 cursor-pointer z-20 w-6 h-6"
                  />
                )}
                <Link
                  to={`/customs/pre-built-pcs/${product._id}`}
                  className={isSelectionMode ? "pointer-events-none" : ""}
                >
                  <div className="mb-3 rounded-lg overflow-hidden h-64">
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-lg font-semibold text-gray-800">
                        {product.name}
                      </h5>
                      <h6 className="text-lg font-bold text-indigo-600">
                        ₹{product.price}
                      </h6>
                    </div>
                    <p className="text-gray-600 text-sm leading-6">
                      <span className="font-medium text-gray-700">
                        Motherboard:
                      </span>{" "}
                      {product.motherboard.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Processor:
                      </span>{" "}
                      {product.processor.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Graphics Card:
                      </span>{" "}
                      {product.graphicsCard.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        RAM:
                      </span>{" "}
                      {product.ram.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Storage:
                      </span>{" "}
                      {product.storageDevice.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Power Supply:
                      </span>{" "}
                      {product.powerSupply.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Cooling System:
                      </span>{" "}
                      {product.coolingSystem.name}
                      <br />
                      <span className="font-medium text-gray-700">
                        Cabinet:
                      </span>{" "}
                      {product.cabinet.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}
