import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import React, { useState } from "react";
import "@/styles/fontStyles.css";
import { Alert } from "@heroui/react";

const AddComponentCategory: React.FC = () => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState({ message: "" });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [fileName, setFileName] = useState("No file chosen");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    coverImage: "",
    motherboard: "",
    processor: "",
    graphicsCard: "",
    ram: "",
    storage: "",
    powerSupply: "",
    coolingSystem: "",
    case: "",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (onClose: () => void) => {
    try {
      const response = await fetch(
        "http://localhost:5170/api/customs/pre-built-pcs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add authentication token if required
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Capture the error message from the backend
        setError({
          message: errorData.message || "Failed to save Pre-built PC",
        }); // Set the error message
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        throw new Error(errorData.message || "Failed to save Pre-built PC"); // Use the error message from the backend
      }

      const data = await response.json();
      console.log("Pre-built PC saved successfully:", data);
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error saving Pre-built PC:", error);
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        color="secondary"
        className="hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-all"
      >
        Add Pre-built PC
      </Button>
      <Modal
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
        className="w-full"
      >
        <ModalContent className="max-w-3xl">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Component
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <div className="relative z-50 w-full max-w-2xl">
                    <Alert
                      color="danger"
                      title="Failed to save Pre-built PC"
                      onClose={() => setShowAlert(false)}
                      className="transition-all duration-300 ease-in-out"
                    >
                      {error.message} {/* Display the error message here */}
                    </Alert>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="flex flex-col gap-4">
                    <label htmlFor="component-name" className="font-semibold">
                      Pre Built Custom PC Name
                    </label>
                    <input
                      type="text"
                      id="component-name"
                      name="name"
                      className="border-b-2 w-full"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="component-price" className="font-semibold">
                      Price
                    </label>
                    <input
                      type="text"
                      id="component-price"
                      name="price"
                      className="border-b-2 w-full"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="image-upload" className="font-semibold">
                      Display Image
                    </label>
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
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="motherboard" className="font-semibold">
                      Motherboard
                    </label>
                    <input
                      type="text"
                      id="motherboard"
                      name="motherboard"
                      className="border-b-2 w-full"
                      required
                      value={formData.motherboard}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="processor" className="font-semibold">
                      Processor
                    </label>
                    <input
                      type="text"
                      id="processor"
                      name="processor"
                      className="border-b-2 w-full"
                      required
                      value={formData.processor}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="graphics-card" className="font-semibold">
                      Graphics Card
                    </label>
                    <input
                      type="text"
                      id="graphics-card"
                      name="graphicsCard"
                      className="border-b-2 w-full"
                      required
                      value={formData.graphicsCard}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="ram" className="font-semibold">
                      RAM
                    </label>
                    <input
                      type="text"
                      id="ram"
                      name="ram"
                      className="border-b-2 w-full"
                      required
                      value={formData.ram}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="storage" className="font-semibold">
                      Storage
                    </label>
                    <input
                      type="text"
                      id="storage"
                      name="storage"
                      className="border-b-2 w-full"
                      required
                      value={formData.storage}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="power-supply" className="font-semibold">
                      Power Supply
                    </label>
                    <input
                      type="text"
                      id="power-supply"
                      name="powerSupply"
                      className="border-b-2 w-full"
                      required
                      value={formData.powerSupply}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="cooling-system" className="font-semibold">
                      Cooling System
                    </label>
                    <input
                      type="text"
                      id="cooling-system"
                      name="coolingSystem"
                      className="border-b-2 w-full"
                      required
                      value={formData.coolingSystem}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="case" className="font-semibold">
                      Case
                    </label>
                    <input
                      type="text"
                      id="case"
                      name="case"
                      className="border-b-2 w-full"
                      required
                      value={formData.case}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleSave(onClose)}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddComponentCategory;
