import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Alert,
} from "@heroui/react";

const AddComponentForm: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [fileName, setFileName] = useState("No file chosen");
  const [componentName, setComponentName] = useState("");
  const [componentType, setComponentType] = useState("");
  const [company, setCompany] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [coverImage, setCoverImage] = useState("");
  const [specifications, setSpecifications] = useState<
    { label: string; value: string; basicInfo: boolean }[]
  >([]);
  const [categories, setCategories] = useState<{ title: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
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
        const data = await response.json();
        setCategories(data);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPresetForComponentType = async (type: string) => {
    try {
      const response = await fetch(
        `http://localhost:5170/api/components/presets/${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.specifications) {
          return data.specifications.map((spec: any) => ({
            label: spec.label,
            value: "",
            basicInfo: spec.isBasicInfo || false,
          }));
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching preset:", error);
      return null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "No file chosen");
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddField = () => {
    // Check if the last specification has an empty label
    if (
      specifications.length > 0 &&
      specifications[specifications.length - 1].label.trim() === ""
    ) {
      alert(
        "Please fill in the label for the current specification before adding a new one"
      );
      return;
    }

    setSpecifications([
      ...specifications,
      { label: "", value: "", basicInfo: false },
    ]);
  };

  const handleSpecificationChange = (
    index: number,
    field: "label" | "value" | "basicInfo",
    value: string | boolean
  ) => {
    const newSpecifications = [...specifications];
    newSpecifications[index][
      field as keyof (typeof newSpecifications)[number]
    ] = value as never;
    setSpecifications(newSpecifications);
  };

  const handlePreset = async () => {
    if (!componentType) {
      alert("Select a Component type");
      return;
    }

    const preset = await fetchPresetForComponentType(componentType);
    if (preset) {
      setSpecifications(
        preset.map((spec: { label: any; basicInfo: any }) => ({
          label: spec.label, // Keep the label but don't set a value
          value: "", // User should input value
          basicInfo: spec.basicInfo,
        }))
      );
    } else {
      alert(`No preset found for ${componentType}`);
    }
  };

  const handleSavePreset = async () => {
    if (!componentType) {
      alert("Select a Component type");
      return;
    }

    // Filter out specifications with empty labels
    const validSpecifications = specifications.filter(
      (spec) => spec.label.trim() !== ""
    );

    if (validSpecifications.length === 0) {
      alert("Add some valid specifications first (with non-empty labels)");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5170/api/components/presets/${componentType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ specifications: validSpecifications }),
        }
      );

      if (response.ok) {
        alert("Preset saved successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to save preset:", errorData);
        alert("Failed to save preset.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the preset.");
    }
  };

  const handleCreate = async () => {
    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    // Filter out specifications with empty labels
    const validSpecifications = specifications.filter(
      (spec) => spec.label.trim() !== ""
    );

    const componentData = {
      _id: componentName.replace(/\s+/g, "-"),
      title: componentName,
      company: company,
      type: componentType,
      price: parseFloat(price),
      quantity: quantity,
      coverImage: coverImage,
      specifications: validSpecifications.map((spec) => ({
        title: spec.label,
        value: spec.value,
        isBasicInfo: spec.basicInfo,
      })),
      img: coverImage,
    };

    console.log("Sending component data:", componentData);

    try {
      const response = await fetch("http://localhost:5170/api/components", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(componentData),
      });

      if (response.ok) {
        alert("Component added successfully!");
        onOpenChange();
      } else {
        const errorData = await response.json();
        console.error("Failed to add component:", errorData);
        alert("Failed to add component.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the component.");
    }
  };

  useEffect(() => {
    if (componentType) {
      handlePreset();
    }
  }, [componentType]);

  return (
    <>
      <Button color="secondary" onPress={onOpen} className="px-7">
        Add Component
      </Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent className="w-full max-w-5xl px-5">
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add a New Component
              </ModalHeader>
              <ModalBody>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2.5 w-full p-5 border border-gray-300 rounded-lg">
                    <label htmlFor="component-name" className="font-semibold">
                      Name of The Component
                    </label>
                    <input
                      type="text"
                      id="component-name"
                      name="ComponentName"
                      className="border-b-2"
                      required
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                    />

                    <label htmlFor="component-type" className="font-semibold">
                      Component Type
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {categories.map((category) => (
                        <div
                          key={category.title}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            id={category.title}
                            name="componentType"
                            value={category.title}
                            checked={componentType === category.title}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComponentType(category.title);
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={category.title} className="text-sm">
                            {category.title}
                          </label>
                        </div>
                      ))}
                    </div>

                    <label
                      htmlFor="component-company"
                      className="font-semibold"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="componentcompany"
                      name="ComponenCompany"
                      className="border-b-2"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />

                    <label htmlFor="component-price" className="font-semibold">
                      Price
                    </label>
                    <input
                      type="text"
                      id="component-price"
                      name="ComponentPrice"
                      className="border-b-2"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />

                    <label
                      htmlFor="component-quantity"
                      className="font-semibold"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="component-quantity"
                      name="ComponentQuantity"
                      className="border-b-2"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value, 10))
                      }
                    />

                    <label htmlFor="image-upload" className="font-semibold">
                      Display Image
                    </label>
                    <div className="flex items-center space-x-1">
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
                        className="bg-blue-500 text-white px-3 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-green-600 transition text-center"
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

                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-center px-5 gap-3">
                      <h3 className="font-semibold">Specifications</h3>
                      <Button
                        color="warning"
                        className="py-1 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-blue-100 border border-blue-200"
                        onPress={handlePreset}
                      >
                        Preset
                      </Button>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) =>
                              handleSpecificationChange(
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            className={`border-b-2 ${spec.label.trim() === "" ? "border-red-500" : ""}`}
                            required
                            placeholder="Label (required)"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) =>
                              handleSpecificationChange(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            className="border-b-2"
                            placeholder="Value"
                            required
                          />
                          <div className="flex flex-row items-center gap-2 ">
                            <span className="text-sm text-gray-700 w-[80px] montserrat">
                              Basic Info?
                            </span>
                            <input
                              type="checkbox"
                              id="default-checkbox"
                              checked={spec.basicInfo}
                              onChange={(e) =>
                                handleSpecificationChange(
                                  index,
                                  "basicInfo",
                                  e.target.checked
                                )
                              }
                              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between gap-2">
                        <Button
                          onPress={handleAddField}
                          className="w-full bg-yellow-300"
                        >
                          + Add
                        </Button>
                        <Button
                          onPress={handleSavePreset} // Changed from handleSavePreset to handleSavePreset
                          className="w-full"
                          color="secondary"
                        >
                          Save Preset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="success" onPress={handleCreate}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddComponentForm;
