import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import ComponentCarousel from "@/components/components-images";
import "@/styles/fontStyles.css";

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
  img: string[];
  specifications: Specification[];
}

const ProductDetails = () => {
  const { type, id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isSelectingCover, setIsSelectingCover] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number | null>(
    null
  );
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalChange,
  } = useDisclosure();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    }
  };

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await fetch(
          `http://localhost:5170/api/components/${type}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setPrice(data.price); // Set the price state when product data is fetched
        }
      } catch (error) {
        console.error("Network error:", error);
        setProduct(null);
        setPrice(null); // Reset price state on error
      }
    };
    fetchComponent();
  }, [type, id]);

  // Create an array of all images including the cover image
  const allImages = product ? [...(product.img || [])] : [];

  const toggleImageSelection = (index: number) => {
    setSelectedImages((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSave = async () => {
    if (!file) {
      alert("Select the Image please");
      return;
    }

    try {
      const base64File = await toBase64(file);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5170/api/components/${type}/${id}/image`,
        {
          method: "POST",
          body: JSON.stringify({
            image: base64File,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Image added successfully");
        onOpenChange();
        // Refresh the page to show the new image
        navigate(0);
      } else {
        const errorData = await response.json();
        alert(`Failed to add image: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding an image");
    }
  };

  const handleDeleteImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const imagesToDelete = selectedImages.map((index) => allImages[index]);

      const response = await fetch(
        `http://localhost:5170/api/components/${type}/${id}/images`,
        {
          method: "DELETE",
          body: JSON.stringify({
            images: imagesToDelete,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Images deleted successfully");
        setSelectedImages([]);
        onDeleteModalChange();
        // Refresh the page to show the updated images
        navigate(0);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete images: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting images");
    }
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setPrice(value); // Update the price state
    }
  };

  const handleSavePrice = async () => {
    if (price === null) {
      alert("Price cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5170/api/components/${type}/${id}/price`,
        {
          method: "PUT",
          body: JSON.stringify({
            price: price,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Price updated successfully");
        setIsEditingPrice(false); // Exit editing mode
      } else {
        const errorData = await response.json();
        alert(`Failed to update price: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the price");
    }
  };

  return (
    <DefaultLayout>
      <div
        className="font-sans bg-white"
        onClick={() => {
          if (isSelectingCover) {
            setIsSelectingCover(false);
          }
        }}
      >
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:underline"
          >
            &larr; Back to previous page
          </button>
          <div className="grid items-start grid-cols-1 lg:grid-cols-5 gap-12 shadow-[0_2px_10px_-3px_rgba(169,170,172,0.8)] p-6 rounded">
            <div className="lg:col-span-3 w-full lg:sticky top-0 text-center">
              {/* Pass the images array to the carousel */}
              <ComponentCarousel images={allImages} />

              <div className="mt-4 flex flex-wrap justify-center gap-4 mx-auto">
                {allImages.map((src, index) => (
                  <div
                    key={index}
                    className={`w-20 h-16 sm:w-24 sm:h-20 relative rounded shadow-md cursor-pointer overflow-hidden ${
                      isSelectingCover
                        ? selectedCoverIndex === index
                          ? ""
                          : "filter blur-sm"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSelectingCover) {
                        setSelectedCoverIndex(index);
                      } else {
                        toggleImageSelection(index);
                      }
                    }}
                  >
                    <img
                      src={src}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Cover selection indicator (radio button) */}
                    {isSelectingCover && selectedCoverIndex === index && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}

                    {/* Delete selection indicator (checkmark) */}
                    {!isSelectingCover && selectedImages.includes(index) && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex gap-2">
                  <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                    <Button className="bg-white" onPress={onOpen}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/7794/7794550.png"
                        className="bg-white"
                        alt="Add Images"
                      />
                    </Button>
                    <Modal
                      isOpen={isOpen}
                      placement="top-center"
                      onOpenChange={onOpenChange}
                    >
                      <ModalContent>
                        {(onClose: () => void) => (
                          <>
                            <ModalHeader className="flex flex-col gap-1">
                              Image
                            </ModalHeader>
                            <ModalBody>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  id="image-upload"
                                  name="image"
                                  accept="image/*"
                                  required
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                                <label
                                  htmlFor="image-upload"
                                  className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-green-600 transition"
                                >
                                  Choose File
                                </label>
                                <span
                                  id="file-name"
                                  className="text-sm text-gray-700 montserrat"
                                >
                                  {fileName}
                                </span>
                              </div>
                            </ModalBody>
                            <ModalFooter>
                              <Button
                                color="danger"
                                variant="flat"
                                onPress={onClose}
                              >
                                Cancel
                              </Button>
                              <Button color="primary" onPress={handleSave}>
                                Save
                              </Button>
                            </ModalFooter>
                          </>
                        )}
                      </ModalContent>
                    </Modal>
                  </div>

                  {isSelectingCover ? (
                    <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                      <Button
                        className="bg-white font-semibold text-md"
                        onPress={async () => {
                          if (selectedCoverIndex !== null) {
                            try {
                              const token = localStorage.getItem("token");
                              const response = await fetch(
                                `http://localhost:5170/api/components/${type}/${id}/cover`,
                                {
                                  method: "PUT",
                                  body: JSON.stringify({
                                    coverImage: allImages[selectedCoverIndex],
                                  }),
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                  },
                                }
                              );

                              if (response.ok) {
                                alert("Cover image updated successfully");
                                navigate(0); // Refresh the page
                              } else {
                                const errorData = await response.json();
                                alert(
                                  `Failed to update cover image: ${errorData.error || "Unknown error"}`
                                );
                              }
                            } catch (error) {
                              console.error("Error:", error);
                              alert(
                                "An error occurred while updating the cover image"
                              );
                            }
                          }
                          setIsSelectingCover(false);
                        }}
                      >
                        Save Cover
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                      <Tooltip
                        key={"foreground"}
                        className="capitalize"
                        color={"foreground"}
                        placement={"bottom"}
                        content={"Choose a Cover Image"}
                      >
                        <Button
                          className="bg-white"
                          onPress={() => {
                            setIsSelectingCover(true);
                            // Set current cover image as selected by default
                            if (product) {
                              const currentCoverIndex = allImages.findIndex(
                                (img) => img === product.coverImage
                              );
                              setSelectedCoverIndex(
                                currentCoverIndex !== -1 ? currentCoverIndex : 0
                              );
                            }
                          }}
                        >
                          <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
                            <img
                              src="https://www.shutterstock.com/image-vector/premium-picture-icon-logo-line-260nw-749843887.jpg"
                              className="w-[200%] h-[200%] object-cover -mt-4 -mb-4"
                              alt="Picture Icon"
                            />
                          </div>
                        </Button>
                      </Tooltip>
                    </div>
                  )}

                  {selectedImages.length > 0 && !isSelectingCover && (
                    <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                      <Button
                        className="bg-white"
                        color="danger"
                        onPress={onDeleteModalOpen}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/3405/3405244.png"
                          className="bg-white w-8 h-8"
                          alt="Delete Images"
                        />
                      </Button>
                      <Modal
                        isOpen={isDeleteModalOpen}
                        placement="top-center"
                        onOpenChange={onDeleteModalChange}
                      >
                        <ModalContent>
                          {(onClose: () => void) => (
                            <>
                              <ModalHeader className="flex flex-col gap-1">
                                Delete Images
                              </ModalHeader>
                              <ModalBody>
                                <p>
                                  Are you sure you want to delete{" "}
                                  {selectedImages.length} selected image(s)?
                                </p>
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="default"
                                  variant="flat"
                                  onPress={onClose}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  color="danger"
                                  onPress={handleDeleteImages}
                                >
                                  Delete
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {product && (
              <div className="lg:col-span-2">
                <h3 className="text-xl text-gray-800 montserrat">
                  {product.title}
                </h3>

                <div className="flex flex-wrap justify-end gap-4 py-1">
                  {isEditingPrice ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={price !== null ? price.toString() : ""}
                        onChange={handlePriceChange}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm text-center"
                      />
                      <Button color="primary" onPress={handleSavePrice}>
                        Save
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        onPress={() => setIsEditingPrice(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        onPress={() => setIsEditingPrice(true)}
                        className="bg-white w-6 h-6 p-0 flex items-center justify-center"
                      >
                        <svg
                          className="h-5 w-5 text-green-500"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <p className="text-gray-800 text-2xl montserrat">
                        ₹ {price !== null ? price : "Loading..."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 shadow-[0_2px_10px_-3px_rgba(169,170,172,0.8)] px-5 py-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Product information
                  </h3>
                  <ul className="mt-4 space-y-6 text-gray-800 px-4">
                    {product.specifications &&
                      product.specifications.map((spec, index) => (
                        <li key={index} className="text-sm">
                          {spec.title}{" "}
                          <span className="ml-4 float-right">{spec.value}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ProductDetails;

// Convert file to base64
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
