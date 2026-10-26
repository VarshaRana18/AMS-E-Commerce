import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const EditCategoryModal: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [categoryName, setCategoryName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    }
  };

  const handleSave = async () => {
    if (!categoryName || !file) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const base64File = await toBase64(file);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5170/api/components/categories/${categoryName}/image`,
        {
          method: "PUT",
          body: JSON.stringify({
            newImage: base64File,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Image updated successfully");
        onOpenChange();
        navigate(0);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to update image of component category: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating image of component category");
    }
  };

  return (
    <>
      {/* Button to open modal */}
      <Button
        isIconOnly
        color="primary"
        variant="light"
        aria-label="Edit"
        onPress={onOpen}
      >
        <svg
          className="h-9 w-9 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </Button>

      {/* Edit Category Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader>Edit Category</ModalHeader>
              <ModalBody>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Input
                  label="Component Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  fullWidth
                />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                      New Cover Image
                    </span>
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <span className="text-sm text-gray-500">{fileName}</span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={loading}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditCategoryModal;
