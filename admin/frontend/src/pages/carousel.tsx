//Remove the default Carousel Images from database
import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import { Image } from "@heroui/react";
import { useSession } from "@/hooks/useSession";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

interface CarouselImage {
  _id: string;
  order: number;
  imageLink: string;
  imageName: string;
}

export default function DocsPage() {
  const user = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [fileName, setFileName] = useState("No file chosen");
  const [images, setImages] = useState<CarouselImage[]>([]);
  // const [imageName, setImageName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchImages = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5170/api/carousel", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data: CarouselImage[] = await response.json();
        setImages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Network error:", error);
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "No file chosen");
    setSelectedFile(file || null);
  };

  const handleAddImage = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("imageFile", selectedFile);
    formData.append("imageName", fileName);
    formData.append("order", String(images.length + 1));

    try {
      const response = await fetch("http://localhost:5170/api/carousel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        await fetchImages(); // Assuming this function fetches the updated list of images
        setFileName("No file chosen");
        setSelectedFile(null);
        onOpenChange(); // Assuming this function closes the modal or resets the form
      } else {
        console.error("Failed to upload image:", await response.text());
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Update the handleDeleteImages function
  const handleDeleteImages = async () => {
    const token = localStorage.getItem("token");
    const selectedImages = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        "input[type='checkbox']:checked"
      )
    ).map((checkbox) => checkbox.id);

    if (selectedImages.length === 0) return;

    try {
      const response = await fetch(
        "http://localhost:5170/api/carousel/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids: selectedImages }),
        }
      );

      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 md:py-1">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row gap-6 pb-3">
            <div>
              <Button color="secondary" onPress={onOpen} className="montserrat">
                Add Image
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
                        <div className="flex items-center space-x-3">
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
                        <Button color="danger" variant="flat" onPress={onClose}>
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleAddImage}>
                          Save
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
            <div>
              <Button
                color="danger"
                className="montserrat"
                onPress={handleDeleteImages}
              >
                Delete Image
              </Button>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {images.length > 0 ? (
              images.map((image) => (
                <div
                  key={image._id}
                  className="relative rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={image._id}
                    className="absolute left-3 top-3 cursor-pointer z-20 w-6 h-6"
                  />
                  <label htmlFor={image._id} className="block">
                    <Image
                      alt={`Carousel Image ${image.order}`}
                      src={`${image.imageLink}?t=${new Date().getTime()}`}
                      height={265}
                      className="w-full rounded-lg border border-gray-300"
                    />
                  </label>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">No images available</p>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
