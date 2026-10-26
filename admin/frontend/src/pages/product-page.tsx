import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import SearchBar from "../components/search-bar";
import { Button } from "@heroui/react";
import "@/styles/fontStyles.css";
import AddComponentForm from "../components/newComponentForm";
import ComponentsFilter from "../components/filter-components";

interface Specification {
  title: string;
  value: string | number;
  isBasicInfo: boolean;
}

interface Product {
  _id: string;
  title: string;
  company: string;
  type: string;
  price: number;
  quantity: number;
  coverImage: string;
  img: string;
  specifications: Specification[];
}

const ProductPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter products based on search query and other filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCompany =
      selectedCompanies.length === 0 ||
      selectedCompanies.includes(product.company);
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesCompany && matchesPrice;
  });

  const handleCardClick = (productId: string, link: string = "") => {
    if (deleteMode) {
      // Toggle checkbox selection when delete mode is active
      setSelectedProducts((prevSelected) =>
        prevSelected.includes(productId)
          ? prevSelected.filter((id) => id !== productId)
          : [...prevSelected, productId]
      );
    } else if (link) {
      // Navigate to the product details page if delete mode is inactive
      navigate(link);
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    if (deleteMode) {
      setSelectedProducts([]); // Clear selection when exiting delete mode
    }
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      alert("No components selected for deletion.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5170/api/components/${type}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedProducts }),
        }
      );

      if (response.ok) {
        // Remove deleted products from the state
        setProducts((prevProducts) =>
          prevProducts.filter(
            (product) => !selectedProducts.includes(product._id)
          )
        );
        setSelectedProducts([]); // Clear selection
        setDeleteMode(false); // Exit delete mode
        alert("Selected components deleted successfully.");
      } else {
        alert("Failed to delete components.");
      }
    } catch (error) {
      console.error("Error deleting components:", error);
      alert("An error occurred while deleting components.");
    }
  };

  useEffect(() => {
    const fetchAllowedTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:5170/api/components/categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const categories = await response.json();
          const types = categories.map((category: { title: string }) =>
            category.title.toLowerCase().replace(/\s+/g, "-")
          );
          setAllowedTypes(types);
        }
      } catch (error) {
        console.error("Error fetching allowed types:", error);
        console.error("Network error:", error);
        setAllowedTypes([]);
      }
    };

    fetchAllowedTypes();
  }, []);

  useEffect(() => {
    if (allowedTypes.length > 0 && type && !allowedTypes.includes(type)) {
      navigate("/components");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5170/api/components/${type}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: Product[] = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Network error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (type && allowedTypes.includes(type)) {
      fetchProducts();
    }
  }, [type, navigate, allowedTypes]);

  return (
    <DefaultLayout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to previous page
      </button>

      <div className="flex justify-center items-center gap-3 mx-10">
        <SearchBar onSearch={handleSearch} />
        <ComponentsFilter
          selectedComponent={type || ""}
          setSearchQuery={setSearchQuery}
          selectedCompanies={selectedCompanies}
          setSelectedCompanies={setSelectedCompanies}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />
        <AddComponentForm />
        <Button color="primary" className="px-7" onClick={toggleDeleteMode}>
          {deleteMode ? "Unselect All" : "Select Components"}
        </Button>
        {deleteMode && (
          <Button
            color="danger"
            className="px-7"
            onClick={handleDeleteSelected}
          >
            Delete Component
          </Button>
        )}
      </div>

      <div className="font-[sans-serif]">
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">No products found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-xl:gap-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded p-4 cursor-pointer hover:-translate-y-1 transition-all relative flex flex-col"
                  onClick={() =>
                    handleCardClick(
                      product._id,
                      `/components/${type}/${product._id}`
                    )
                  }
                >
                  {deleteMode && (
                    <input
                      type="checkbox"
                      className="absolute left-5 top-5 cursor-pointer z-20 w-6 h-6"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(product._id);
                      }}
                    />
                  )}
                  <div className="flex flex-col flex-grow">
                    <div className="mb-4 rounded p-2">
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="aspect-[33/35] w-full object-contain"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex gap-2 items-end">
                        <h5 className="font-semibold text-gray-800 montserrat">
                          {product.title}
                        </h5>
                        <h6 className="text-base text-gray-800 font-bold ml-auto montserrat">
                          ₹{product.price}
                        </h6>
                      </div>
                      <div className="text-gray-500 text-[13px] mt-2 montserrat">
                        {product.specifications
                          .filter((spec) => spec.isBasicInfo)
                          .map((spec, index) => (
                            <p key={index}>
                              {spec.title}: {spec.value}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductPage;
