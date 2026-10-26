import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import SearchBar from "../components/search-bar";
import EditCategoryModal from "@/components/updateComponentCategoryImage";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  CircularProgress,
  Alert,
} from "@heroui/react";
import AddComponentCategory from "@/components/newComponentCategory";
import { useEffect, useState } from "react";
import "@/styles/fontStyles.css";

interface Product {
  title: string;
  img: string;
  href: string;
}

export default function DocsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [currentCategory, setCurrentCategory] = useState<Product | null>(null);

  const handleSearch = (query: string) => setSearchQuery(query);

  const filteredProducts = productList.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchComponents = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/components/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProductList(data);
        }
      } catch (err) {
        setError(err.message);
        console.error("Network error:", error);
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  const handleCategoryUpdate = (updatedCategories: any[]) => {
    setProductList(updatedCategories);
  };

  const handleCardClick = (link: string = "", title: string = "") => {
    if (isSelectionMode) {
      handleCheckboxChange(title);
    } else if (link) {
      navigate(link);
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    if (!isSelectionMode) setSelectedItems([]);
  };

  const handleCheckboxChange = (title: string) => {
    setSelectedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleDeleteCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:5170/api/components/categories/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titles: selectedItems }),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("Selected component categories deleted successfully.");
        const fetchUpdatedCategories = async () => {
          try {
            const response = await fetch(
              "http://localhost:5170/api/components/categories",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );
            if (response.ok) {
              const data = await response.json();
              setProductList(data);
            }
          } catch (err) {
            console.error("Error fetching updated categories:", err);
          }
        };
        setSelectedItems([]);
        setIsSelectionMode(false);
        await fetchUpdatedCategories();
      } else {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 10000);
      }
    } catch (err) {
      alert(err.message || "Error deleting categories");
      console.error("Error deleting categories:", err);
    }
  };

  if (loading) return <CircularProgress aria-label="Loading..." size="lg" />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4">
        {showAlert && (
          <div className="relative z-50 w-full max-w-2xl">
            <Alert
              color="danger"
              title="Cannot delete categories whose component already exists"
              onClose={() => setShowAlert(false)}
              className="transition-all duration-300 ease-in-out"
            />
          </div>
        )}
        <div className="flex justify-center items-center gap-5 w-full">
          <div className="flex justify-center items-center w-full max-w-xl flex gap-1">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex items-center gap-4">
            <EditCategoryModal />

            <AddComponentCategory />
            <Button
              color="primary"
              className="px-7"
              onPress={handleToggleSelectionMode}
            >
              {isSelectionMode ? "Cancel Selection" : "Select Categories"}
            </Button>
          </div>

          {isSelectionMode && (
            <Button
              color="danger"
              className="px-7"
              onPress={handleDeleteCategories}
            >
              Delete Categories
            </Button>
          )}
        </div>

        <div className="gap-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.map((item, index) => (
            <Card
              key={index}
              isPressable
              shadow="sm"
              className="relative"
              onPress={() => handleCardClick(item.href, item.title)}
            >
              {isSelectionMode && (
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.title)}
                    onChange={() => handleCheckboxChange(item.title)}
                    className="absolute left-2 top-1 cursor-pointer z-20 w-6 h-6"
                  />
                </div>
              )}
              <CardBody className="overflow-visible p-0">
                <Image
                  alt={item.title}
                  className="w-full object-cover h-[200px]"
                  radius="lg"
                  shadow="sm"
                  src={item.img}
                  width="100%"
                />
              </CardBody>
              <CardFooter className="text-small justify-center montserrat font-semibold">
                {item.title}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
