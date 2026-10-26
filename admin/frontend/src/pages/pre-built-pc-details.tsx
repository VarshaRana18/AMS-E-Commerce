import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import {
  CircularProgress,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

const PreBuiltPCDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectingCover, setIsSelectingCover] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number | null>(
    null
  );
  const [fileName, setFileName] = useState("No file chosen");
  const [file, setFile] = useState<File | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const [editPrice, setEditPrice] = useState<number | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setEditPrice(value); // Update the editPrice state
    }
  };

  const handleSavePrice = async () => {
    if (editPrice === null) {
      alert("Price cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5170/api/customs/pre-built-pcs/${id}/price`,
        {
          method: "PUT",
          body: JSON.stringify({
            price: editPrice,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update the product state with the new price
        if (product) {
          setProduct({
            ...product,
            price: editPrice,
          });
        }
        alert("Price updated successfully");
        setIsEditingPrice(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to update price: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the price");
    }
  };

  const onOpen = () => setIsOpen(true);
  const onOpenChange = (isOpen: boolean) => setIsOpen(isOpen);

  interface Component {
    title: string;
    specifications?: { title: string; value: string }[];
  }

  interface Product {
    name: string;
    price: number;
    coverImage: string;
    img?: string[];
    motherboard?: Component;
    processor?: Component;
    graphicsCard?: Component;
    ram?: Component;
    storageDevice?: Component;
    powerSupply?: Component;
    coolingSystem?: Component;
    cabinet?: Component;
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5170/api/customs/pre-built-pcs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setProduct(data);
        setCurrentImage(data.coverImage);
        console.log(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCoverImageUpdate = async () => {
    if (selectedCoverIndex !== null) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5170/api/customs/pre-built-pcs/${id}/cover`,
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

        const responseData = await response.json();

        if (response.ok) {
          setCurrentImage(allImages[selectedCoverIndex]);
          console.log(allImages[selectedCoverIndex]);
          if (product) {
            setProduct({
              ...product,
              coverImage: allImages[selectedCoverIndex],
            });
          }
          alert("Cover image updated successfully");
          setIsSelectingCover(false);
        } else {
          alert(
            `Failed to update cover image: ${responseData.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while updating the cover image");
      }
    }
  };

  const handleSave = async () => {
    if (!file) return;

    try {
      const base64File = await toBase64(file);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5170/api/customs/pre-built-pcs/${id}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64File,
            filename: file.name,
            filetype: file.type,
          }),
        }
      );

      if (response.ok) {
        alert("Image uploaded successfully");
        navigate(0); // Refresh the page
      } else {
        const errorData = await response.json();
        alert(`Failed to upload image: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while uploading the image");
    } finally {
      setIsOpen(false);
      setFile(null);
      setFileName("");
    }
  };

  const handleDeleteImage = async () => {
    if (imageToDelete !== null && allImages.length > 1) {
      // Prevent deleting the last image
      try {
        const token = localStorage.getItem("token");
        const imageUrl = allImages[imageToDelete];

        const response = await fetch(
          `http://localhost:5170/api/customs/pre-built-pcs/${id}/images`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: imageUrl,
            }),
          }
        );

        if (response.ok) {
          // Update local state to remove the deleted image
          const updatedImages = [...allImages];
          updatedImages.splice(imageToDelete, 1);

          // Update product state
          if (product) {
            setProduct({
              ...product,
              img: updatedImages,
            });

            // If the deleted image was the current image or cover image, reset to the first image
            if (currentImage === imageUrl) {
              setCurrentImage(updatedImages[0]);
            }

            if (product.coverImage === imageUrl) {
              // You might want to update the cover image on the server as well
              setProduct({
                ...product,
                coverImage: updatedImages[0],
              });
            }
          }

          alert("Image deleted successfully");
          setIsDeletingImage(false);
          setImageToDelete(null);
        } else {
          const errorData = await response.json();
          alert(
            `Failed to delete image: ${errorData.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the image");
      }
    } else if (allImages.length <= 1) {
      alert(
        "Cannot delete the last image. A product must have at least one image."
      );
    }
  };

  if (loading) return <CircularProgress aria-label="Loading..." size="lg" />;
  if (!product) return <div>Product not found</div>;

  const {
    name,
    price,
    coverImage,
    img = [],
    motherboard,
    processor,
    graphicsCard,
    ram,
    storageDevice,
    powerSupply,
    coolingSystem,
    cabinet,
  } = product;

  const allImages = [...(img || [])];

  return (
    <DefaultLayout>
      <div className="font-sans bg-white">
        <div className="p-4 w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:underline montserrat"
          >
            &larr; Back to previous page
          </button>
          <div className="grid items-start grid-cols-1 lg:grid-cols-5 gap-8 shadow-[0_2px_10px_-3px_rgba(169,170,172,0.8)] p-4 rounded-lg bg-white">
            {/* Image Section */}
            <div className="lg:col-span-3 w-full lg:sticky top-0 text-center">
              <div className="px-4 py-2 rounded shadow-md relative">
                <img
                  src={currentImage || coverImage}
                  alt={name}
                  className="w-4/5 aspect-[251/171] rounded object-cover mx-auto"
                />

                {/* Image Gallery Thumbnails */}
                {allImages.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(img)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          currentImage === img
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          isSelectingCover && selectedCoverIndex === index
                            ? "ring-2 ring-green-500"
                            : ""
                        } ${
                          isDeletingImage && imageToDelete === index
                            ? "ring-2 ring-red-500"
                            : ""
                        }`}
                        onDoubleClick={() => {
                          if (isSelectingCover) {
                            setSelectedCoverIndex(index);
                          } else if (isDeletingImage) {
                            setImageToDelete(index);
                          }
                        }}
                      >
                        <img
                          src={img}
                          alt={`${name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 justify-center">
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

                  {!isSelectingCover && (
                    <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                      {isDeletingImage ? (
                        <Button
                          className="bg-white font-semibold text-md text-red-600"
                          onPress={() => {
                            if (imageToDelete !== null) {
                              handleDeleteImage();
                            } else {
                              alert("Please select an image to delete first");
                            }
                          }}
                        >
                          Delete
                        </Button>
                      ) : (
                        <Tooltip
                          key={"delete-image"}
                          className="capitalize"
                          color={"danger"}
                          placement={"bottom"}
                          content={"Delete an Image"}
                        >
                          <Button
                            className="bg-white"
                            onPress={() => {
                              setIsDeletingImage(true);
                              setImageToDelete(null);
                            }}
                          >
                            <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/3405/3405244.png"
                                className="w-[75%] h-[75%] object-cover"
                                alt="Delete Icon"
                              />
                            </div>
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  )}

                  {isSelectingCover ? (
                    <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded p-2 shadow-md cursor-pointer bg-white">
                      <Button
                        className="bg-white font-semibold text-md"
                        onPress={handleCoverImageUpdate}
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
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2 space-y-1 px-10">
              <h3 className="text-2xl font-bold text-gray-900 montserrat">
                {name}
              </h3>
              <div className="text-gray-700 text-sm leading-relaxed ">
                {isEditingPrice ? (
                  <div className="flex items-center justify-end gap-2 text-right">
                    <input
                      type="text"
                      value={editPrice !== null ? editPrice.toString() : ""}
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
                  <div className="flex items-center justify-end gap-2 mt-2 pb-4">
                    <p className="text-gray-800 text-2xl font-bold montserrat">
                      ₹ {price !== null ? price : "Loading..."}
                    </p>
                    <Button
                      onPress={() => {
                        setEditPrice(price); // Set edit price to current price when starting to edit
                        setIsEditingPrice(true);
                      }}
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
                  </div>
                )}

                <p className="mb-2">
                  <strong className="font-semibold montserrat">
                    Motherboard:
                  </strong>{" "}
                  {motherboard?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">
                    Processor:
                  </strong>{" "}
                  {processor?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">
                    Graphics Card:
                  </strong>{" "}
                  {graphicsCard?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">RAM:</strong>{" "}
                  {ram?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">Storage:</strong>{" "}
                  {storageDevice?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">
                    Power Supply:
                  </strong>{" "}
                  {powerSupply?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">
                    Cooling System:
                  </strong>{" "}
                  {coolingSystem?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong className="font-semibold montserrat">Cabinet:</strong>{" "}
                  {cabinet?.title || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* 🛠 Product Specifications Section */}
          <div className="mt-6 py-4 px-10 bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 border-b pb-3">
              Product Specifications
            </h3>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
              {[
                { component: motherboard, label: "Motherboard" },
                { component: processor, label: "Processor" },
                { component: graphicsCard, label: "Graphics Card" },
                { component: ram, label: "RAM" },
                { component: storageDevice, label: "Storage Device" },
                { component: powerSupply, label: "Power Supply" },
                { component: coolingSystem, label: "Cooling System" },
                { component: cabinet, label: "Cabinet" },
              ].map(({ component, label }) =>
                component ? (
                  <li key={label} className="text-base">
                    <strong className="text-indigo-700">{label}:</strong>{" "}
                    {component.title}
                    <ul className="mt-2 ml-6 space-y-2 bg-white py-4 px-10 rounded-lg shadow-md">
                      {component.specifications &&
                      component.specifications.length > 0 ? (
                        component.specifications.map((spec, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="font-medium text-gray-700">
                              {spec.title}:
                            </span>{" "}
                            <span className="text-gray-600">{spec.value}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">
                          No specifications available
                        </li>
                      )}
                    </ul>
                    <hr className="mt-4 border-gray-300" />
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PreBuiltPCDetails;
