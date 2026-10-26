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

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const AddComponentCategory: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [componentName, setComponentName] = useState("");
  const [presetFields, setPresetFields] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    }
  };

  const handleSave = async () => {
    if (!componentName || !file) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const base64File = await toBase64(file);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5170/api/components/categories",
        {
          method: "POST",
          body: JSON.stringify({
            title: componentName,
            image: base64File,
            presetFields: presetFields
              ? presetFields.split(",").map((f) => f.trim())
              : [],
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Component category added successfully");
        onOpenChange();
        navigate(0);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to add component category: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the component category");
    }
  };

  return (
    <>
      <Button color="secondary" onPress={onOpen} className="px-7">
        Add Component
      </Button>
      <Modal
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
        className="w-full"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Component
              </ModalHeader>
              <ModalBody>
                <label htmlFor="component-name" className="font-semibold">
                  Component Name
                </label>
                <input
                  type="text"
                  id="component-name"
                  name="componentName"
                  className="border-b-2 mb-4"
                  required
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                />

                <label htmlFor="preset-fields" className="font-semibold">
                  Preset Fields (comma separated)
                </label>
                <input
                  type="text"
                  id="preset-fields"
                  name="presetFields"
                  className="border-b-2 mb-4"
                  placeholder="e.g. Color,Size,Material"
                  value={presetFields}
                  onChange={(e) => setPresetFields(e.target.value)}
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
                    className="hidden"
                    onChange={handleFileChange}
                    required
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
                <Button color="primary" onPress={handleSave}>
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
