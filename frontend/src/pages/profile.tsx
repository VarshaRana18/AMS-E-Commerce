import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Alert,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import DefaultLayout from "@/layouts/default";
import EditAccountDetailsModal from "@/components/edit-account-details-modal";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { currentUser }: any = useAuth();
  const [userData, setUserData]: any = useState(null);
  const [orderCount, setOrderCount]: any = useState(0);
  const [isModalOpen, setIsModalOpen]: any = useState(false);

  const {
    isOpen: isPhoneModalOpen,
    onOpen: onPhoneModalOpen,
    onOpenChange: onPhoneModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPasswordModalOpen,
    onOpen: onPasswordModalOpen,
    onOpenChange: onPasswordModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddressModalOpen,
    onOpen: onAddressModalOpen,
    onOpenChange: onAddressModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isNameModalOpen,
    onOpen: onNameModalOpen,
    onOpenChange: onNameModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isProfilePicModalOpen,
    onOpen: onProfilePicModalOpen,
    onOpenChange: onProfilePicModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isAddAddressModalOpen,
    onOpen: onAddAddressModalOpen,
    onOpenChange: onAddAddressModalOpenChange,
  } = useDisclosure();

  const [editAddressDetails, setEditAddressDetails] = useState({
    addressId: "",
    fullName: "",
    mobileNumber: "",
    pincode: "",
    address: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
  });
  const {
    isOpen: isNameConfirmModalOpen,
    onOpen: onNameConfirmModalOpen,
    onOpenChange: onNameConfirmModalOpenChange,
  } = useDisclosure();
  const [newName, setNewName] = useState("");
  const [addressForm, setAddressForm] = useState({
    name: "",
    phoneNumber: "",
    pincode: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    isDefault: false,
  });
  const {
    isOpen: isAddressConfirmModalOpen,
    onOpen: onAddressConfirmModalOpen,
    onOpenChange: onAddressConfirmModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteAddressModalOpen,
    onOpen: onDeleteAddressModalOpen,
    onOpenChange: onDeleteAddressModalOpenChange,
  } = useDisclosure();
  const [addressToDelete, setAddressToDelete] = useState(null);
  const {
    isOpen: isAddAddressConfirmModalOpen,
    onOpen: onAddAddressConfirmModalOpen,
    onOpenChange: onAddAddressConfirmModalOpenChange,
  } = useDisclosure();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const phoneRegex = /^\d{10}$/;

  useEffect(() => {
    document.title = "AMS || Profile";

    if (currentUser?.email) {
      fetch(`/api/auth/user-with-stats/${currentUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data.userData);
          setOrderCount(data.orderCount);
        });
    }
  }, [currentUser]);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleEditAddress = (address) => {
    setEditAddressDetails({
      addressId: address._id, // Add this to track which address we're editing
      fullName: address.name,
      mobileNumber: address.phoneNumber,
      pincode: address.pincode,
      address: address.flat,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
    });
    onAddressModalOpen();
  };

  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const {
    isOpen: isPhoneConfirmModalOpen,
    onOpen: onPhoneConfirmModalOpen,
    onOpenChange: onPhoneConfirmModalOpenChange,
  } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddAddress = async () => {
    try {
      const response = await fetch(
        `/api/auth/user/address/${currentUser.email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressForm),
        }
      );

      if (response.ok) {
        // Fetch updated user data
        const userResponse = await fetch(`/api/auth/user/${currentUser.email}`);
        const freshUserData = await userResponse.json();

        setUserData(freshUserData);

        addToast({
          title: "Success!",
          description: "Address added successfully",
          timeout: 3000,

          color: "success",
        });
        onAddAddressModalOpenChange();
        setAddressForm({
          name: "",
          phoneNumber: "",
          pincode: "",
          flat: "",
          area: "",
          landmark: "",
          city: "",
          state: "",
          isDefault: false,
        });
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Failed to add address",
        timeout: 3000,

        color: "danger",
      });
    }
  };

  const handleEditAddressSubmit = async () => {
    try {
      const response = await fetch(
        `/api/auth/user/address/edit/${currentUser.email}/${editAddressDetails.addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addressId: editAddressDetails.addressId,
            name: editAddressDetails.fullName,
            phoneNumber: editAddressDetails.mobileNumber,
            pincode: editAddressDetails.pincode,
            flat: editAddressDetails.address,
            area: editAddressDetails.area,
            landmark: editAddressDetails.landmark,
            city: editAddressDetails.city,
            state: editAddressDetails.state,
          }),
        }
      );

      if (response.ok) {
        const userResponse = await fetch(`/api/auth/user/${currentUser.email}`);
        const freshUserData = await userResponse.json();

        setUserData(freshUserData);

        addToast({
          title: "Success!",
          description: "Address updated successfully",
          timeout: 3000,

          color: "success",
        });
        onAddressModalOpenChange();
      } else {
        throw new Error("Failed to update address");
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Failed to update address",
        timeout: 3000,

        color: "danger",
      });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(
        `/api/auth/user/address/delete/${currentUser.email}/${addressId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const userResponse = await fetch(`/api/auth/user/${currentUser.email}`);
        const freshUserData = await userResponse.json();

        setUserData(freshUserData);

        addToast({
          title: "Success!",
          description: "Address deleted successfully",
          timeout: 3000,

          color: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Failed to delete address",
        timeout: 3000,

        color: "danger",
      });
    }
  };

  const handleAddAddressValidation = () => {
    // Reset previous alert
    setShowAlert(false);
    // Validate each field
    if (!addressForm.name.trim()) {
      setAlertMessage("Name is required");
      setShowAlert(true);

      return;
    }
    if (addressForm.name.length < 3) {
      setAlertMessage("Name must be at least 3 characters long");
      setShowAlert(true);

      return;
    }

    if (!addressForm.phoneNumber.trim()) {
      setAlertMessage("Phone number is required");
      setShowAlert(true);

      return;
    }

    if (!phoneRegex.test(addressForm.phoneNumber)) {
      setAlertMessage("Please enter a valid 10-digit phone number");
      setShowAlert(true);

      return;
    }

    if (!addressForm.pincode.trim()) {
      setAlertMessage("Pincode is required");
      setShowAlert(true);

      return;
    }

    if (!/^\d{6}$/.test(addressForm.pincode)) {
      setAlertMessage("Please enter a valid 6-digit pincode");
      setShowAlert(true);

      return;
    }

    if (!addressForm.flat.trim()) {
      setAlertMessage("Flat is required");
      setShowAlert(true);

      return;
    }

    if (!addressForm.area.trim()) {
      setAlertMessage("Area is required");
      setShowAlert(true);

      return;
    }

    if (!addressForm.city.trim()) {
      setAlertMessage("City is required");
      setShowAlert(true);

      return;
    }

    if (!addressForm.state.trim()) {
      setAlertMessage("State is required");
      setShowAlert(true);

      return;
    }

    // If all validations pass, open confirmation modal
    onAddAddressConfirmModalOpen();
  };

  const handleEditAddressValidation = () => {
    // Reset previous alert
    setShowAlert(false);

    // Name validation
    if (!editAddressDetails.fullName.trim()) {
      setAlertMessage("Please enter your full name");
      setShowAlert(true);

      return;
    }

    if (editAddressDetails.fullName.length < 3) {
      setAlertMessage("Name must be at least 3 characters long");
      setShowAlert(true);

      return;
    }

    // Phone validation
    if (!editAddressDetails.mobileNumber.trim()) {
      setAlertMessage("Please enter your phone number");
      setShowAlert(true);

      return;
    }

    if (!phoneRegex.test(editAddressDetails.mobileNumber)) {
      setAlertMessage("Please enter a valid 10-digit phone number");
      setShowAlert(true);

      return;
    }

    // Pincode validation
    if (!editAddressDetails.pincode.trim()) {
      setAlertMessage("Please enter your pincode");
      setShowAlert(true);

      return;
    }

    if (!/^\d{6}$/.test(editAddressDetails.pincode)) {
      setAlertMessage("Please enter a valid 6-digit pincode");
      setShowAlert(true);

      return;
    }

    // Address validation
    if (!editAddressDetails.address.trim()) {
      setAlertMessage("Please enter your flat/house number");
      setShowAlert(true);

      return;
    }

    if (!editAddressDetails.area.trim()) {
      setAlertMessage("Please enter your area/street");
      setShowAlert(true);

      return;
    }

    if (!editAddressDetails.city.trim()) {
      setAlertMessage("Please enter your city");
      setShowAlert(true);

      return;
    }

    if (!editAddressDetails.state.trim()) {
      setAlertMessage("Please enter your state");
      setShowAlert(true);

      return;
    }

    // If all validations pass, open confirmation modal
    onAddressConfirmModalOpen();
  };
  const handlePhoneValidation = () => {
    setShowAlert(false);

    if (!newPhoneNumber.trim()) {
      setAlertMessage("Please enter your phone number");
      setShowAlert(true);

      return;
    }

    if (!phoneRegex.test(newPhoneNumber)) {
      setAlertMessage("Please enter a valid 10-digit phone number");
      setShowAlert(true);

      return;
    }

    onPhoneConfirmModalOpen();
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/webp"];

      if (!validTypes.includes(file.type)) {
        setShowAlert(true);
        setAlertMessage("Please upload only PNG, JPG or WEBP files");

        return;
      }

      setSelectedFile(file);
      setShowAlert(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `/api/auth/user/upload-image/${currentUser.email}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();

        setUserData(updatedUser);
        onProfilePicModalOpenChange();

        addToast({
          title: "Success!",
          description: "Profile picture updated successfully",
          timeout: 3000,

          color: "success",
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Failed to update profile picture",
        timeout: 3000,

        color: "danger",
      });
    }
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [hasStartedTypingNewPassword, setHasStartedTypingNewPassword] =
    useState(false);

  const handlePasswordChange = async () => {
    setPasswordError("");

    const auth = getAuth();
    const user: any = auth.currentUser;

    if (!user) {
      setPasswordError("User is not authenticated.");

      return;
    }

    // Password requirements regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Validation checks
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required");

      return;
    }

    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );

      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");

      return;
    }

    try {
      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      addToast({
        title: "Success!",
        description: "Password updated successfully",
        timeout: 3000,

        color: "success",
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onPasswordModalOpenChange();
    } catch (error: any) {
      // Handle Firebase Auth errors
      switch (error.code) {
        case "auth/invalid-credential":
          setPasswordError("Current password is incorrect.");
          break;
        case "auth/weak-password":
          setPasswordError("New password is too weak.");
          break;
        case "auth/requires-recent-login":
          setPasswordError("You need to log in again to change your password.");
          break;
        default:
          setPasswordError("Failed to update password. Please try again.");
      }
    }
  };
  const getPasswordErrors = (password) => {
    const errors: any = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must include at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must include at least one number.");
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push("Password must include at least one special character.");
    }

    return errors;
  };

  return (
    <DefaultLayout>
      <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
        <div className="w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4">
          <div className="py-4 md:py-8">
            <div className="mb-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-4">
                  <img
                    alt="Profile Pic"
                    className="h-16 w-16 rounded-lg"
                    src={userData?.image}
                  />
                  <h2 className="text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">
                    {userData?.name || "Loading..."}
                  </h2>
                </div>
                <div className="flex space-x-2">
                  <Button
                    color="primary"
                    radius="full"
                    size="sm"
                    variant="ghost"
                    onPress={onNameModalOpen}
                  >
                    Edit Name
                  </Button>
                  <Button
                    color="primary"
                    radius="full"
                    size="sm"
                    variant="ghost"
                    onPress={onProfilePicModalOpen}
                  >
                    Edit Profile Pic
                  </Button>
                </div>
              </div>
              <dl className="flex justify-between items-center">
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">
                    Email Address
                  </dt>
                  <dd className="text-gray-500 dark:text-gray-400">
                    {userData?.email}
                  </dd>
                </div>
              </dl>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <dl className="flex justify-between items-center">
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">
                    Phone Number
                  </dt>
                  <dd className="text-gray-500 dark:text-gray-400">
                    {userData?.mobile}
                  </dd>
                </div>
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  variant="ghost"
                  onPress={onPhoneModalOpen}
                >
                  Edit
                </Button>
              </dl>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <dl className="flex justify-between items-center">
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">
                    Password
                  </dt>
                  <dd className="text-gray-500 dark:text-gray-400">••••••••</dd>
                </div>
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  variant="ghost"
                  onPress={onPasswordModalOpen}
                >
                  Edit
                </Button>
              </dl>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Your Addresses
                </h2>
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  variant="ghost"
                  onPress={onAddAddressModalOpen}
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-4">
                {userData?.addresses && userData.addresses.length > 0 ? (
                  userData.addresses.map((address, index) => (
                    <dl
                      key={index}
                      className="flex justify-between items-start"
                    >
                      <div>
                        <dt className="font-semibold text-gray-900 dark:text-white">
                          {address.name}
                        </dt>
                        <dd className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
                          <span>Mobile Number: {address.phoneNumber}</span>
                          <span>Pincode: {address.pincode}</span>
                          <span>Address: {address.flat}</span>
                          <span>Area: {address.area}</span>
                          <span>Landmark: {address.landmark}</span>
                          <span>City: {address.city}</span>
                          <span>State: {address.state}</span>
                        </dd>
                      </div>
                      <div className="flex space-x-2 self-start">
                        <Button
                          color="primary"
                          radius="full"
                          size="sm"
                          variant="ghost"
                          onPress={() => handleEditAddress(address)}
                        >
                          * Edit
                        </Button>
                        <Button
                          color="danger"
                          radius="full"
                          size="sm"
                          variant="ghost"
                          onPress={() => {
                            setAddressToDelete(address._id);
                            onDeleteAddressModalOpen();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </dl>
                  ))
                ) : (
                  <div className=" text-gray-500">No addresses added yet</div>
                )}
              </div>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />
            </div>
          </div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl md:mb-6">
            General overview
          </h2>
          <div className="grid grid-cols-2 gap-6 border-b border-t border-gray-200 py-4 dark:border-gray-700 md:py-8 lg:grid-cols-4 xl:gap-16">
            <div>
              <svg
                aria-hidden="true"
                className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <h3 className="mb-2 text-gray-500 dark:text-gray-400">
                Orders made
              </h3>
              <span className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                {orderCount}
              </span>
            </div>
            <div>
              <svg
                aria-hidden="true"
                className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <h3 className="mb-2 text-gray-500 dark:text-gray-400">
                Favorite products added
              </h3>
              <span className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                {userData?.wishlist?.length}
              </span>
            </div>
          </div>
        </div>
      </section>
      {isModalOpen && <EditAccountDetailsModal onClose={handleModalToggle} />}

      {/* Name Modal */}
      <Modal isOpen={isNameModalOpen} onOpenChange={onNameModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Name
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={newName}
                  variant="bordered"
                  onChange={(e) => setNewName(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newName.trim()}
                  onPress={onNameConfirmModalOpen}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Profile Picture Modal */}
      <Modal
        isOpen={isProfilePicModalOpen}
        onOpenChange={onProfilePicModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Profile Picture
              </ModalHeader>
              <ModalBody>
                {/* <Input
                  label="Profile Picture URL"
                  placeholder="Enter the URL of your new profile picture"
                  variant="bordered"
                /> */}
                <div className="flex flex-col gap-2">
                  {showAlert && (
                    <Alert className="mb-4" color="danger">
                      {alertMessage}
                    </Alert>
                  )}
                  <div className="flex items-center gap-4">
                    <form>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input
                          ref={fileInputRef}
                          className="hidden"
                          id="fileInput"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <Button
                          as="label"
                          color="primary"
                          htmlFor="fileInput"
                          radius="full"
                          size="sm"
                          variant="ghost"
                        >
                          Choose File
                        </Button>
                      </label>
                    </form>
                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedFile.name}
                        </span>
                        <button
                          className="w-5 h-5 hover:scale-110 transition-transform"
                          onClick={handleFileRemove}
                        >
                          <svg
                            fill="#fc0303"
                            viewBox="-7.29 0 122.88 122.88"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M77.4,49.1h-5.94v56.09h5.94V49.1L77.4,49.1L77.4,49.1z M6.06,9.06h32.16V6.2c0-0.1,0-0.19,0.01-0.29 c0.13-2.85,2.22-5.25,5.01-5.79C43.97-0.02,44.64,0,45.38,0H63.9c0.25,0,0.49-0.01,0.73,0.02c1.58,0.08,3.02,0.76,4.06,1.81 c1.03,1.03,1.69,2.43,1.79,3.98c0.01,0.18,0.02,0.37,0.02,0.55v2.7H103c0.44,0,0.75,0.01,1.19,0.08c2.21,0.36,3.88,2.13,4.07,4.37 c0.02,0.24,0.03,0.47,0.03,0.71v10.54c0,1.47-1.19,2.66-2.67,2.66H2.67C1.19,27.43,0,26.23,0,24.76V24.7v-9.91 C0,10.64,2.04,9.06,6.06,9.06L6.06,9.06z M58.07,49.1h-5.95v56.09h5.95V49.1L58.07,49.1L58.07,49.1z M38.74,49.1H32.8v56.09h5.95 V49.1L38.74,49.1L38.74,49.1z M10.74,31.57h87.09c0.36,0.02,0.66,0.04,1.03,0.1c1.25,0.21,2.4,0.81,3.27,1.66 c1.01,1,1.67,2.34,1.7,3.83c0,0.31-0.03,0.63-0.06,0.95l-7.33,78.66c-0.1,1.03-0.27,1.95-0.79,2.92c-1.01,1.88-2.88,3.19-5.2,3.19 H18.4c-0.55,0-1.05,0-1.59-0.08c-0.22-0.03-0.43-0.08-0.64-0.14c-0.31-0.09-0.62-0.21-0.91-0.35c-0.27-0.13-0.52-0.27-0.78-0.45 c-1.51-1.04-2.51-2.78-2.69-4.72L4.5,37.88c-0.02-0.25-0.04-0.52-0.04-0.77c0.05-1.48,0.7-2.8,1.7-3.79 c0.88-0.86,2.06-1.47,3.33-1.67C9.9,31.59,10.34,31.57,10.74,31.57L10.74,31.57z M97.75,36.9H10.6c-0.57,0-0.84,0.1-0.79,0.7 l7.27,79.05h0l0,0.01c0.03,0.38,0.2,0.69,0.45,0.83l0,0l0.08,0.03l0.06,0.01l0.08,0h72.69c0.6,0,0.67-0.84,0.71-1.28l7.34-78.71 C98.53,37.04,98.23,36.9,97.75,36.9L97.75,36.9z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    PNG, JPG and WEBP are allowed
                  </span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSaveImage}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Phone Modal */}
      <Modal isOpen={isPhoneModalOpen} onOpenChange={onPhoneModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Phone Number
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <Alert className="mb-4" color="danger">
                    {alertMessage}
                  </Alert>
                )}
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={newPhoneNumber}
                  variant="bordered"
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handlePhoneValidation}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onOpenChange={onPasswordModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Change Password
              </ModalHeader>
              <ModalBody>
                {passwordError && (
                  <Alert className="mb-4" color="danger">
                    {passwordError}
                  </Alert>
                )}
                <Input
                  label="Current Password"
                  placeholder="Enter your current password"
                  type="password"
                  value={passwordForm.currentPassword}
                  variant="bordered"
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <Input
                  errorMessage={
                    hasStartedTypingNewPassword &&
                    getPasswordErrors(passwordForm.newPassword).length > 0 ? (
                      <ul>
                        {getPasswordErrors(passwordForm.newPassword).map(
                          (error, i) => (
                            <li key={i}>{error}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      ""
                    )
                  }
                  isInvalid={
                    hasStartedTypingNewPassword &&
                    getPasswordErrors(passwordForm.newPassword).length > 0
                  }
                  label="New Password"
                  placeholder="Enter your new password"
                  type="password"
                  value={passwordForm.newPassword}
                  variant="bordered"
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    });
                    if (!hasStartedTypingNewPassword) {
                      setHasStartedTypingNewPassword(true);
                    }
                  }}
                />
                <Input
                  errorMessage={
                    passwordForm.confirmPassword.length > 0 &&
                    passwordForm.confirmPassword !== passwordForm.newPassword
                      ? "Passwords do not match."
                      : ""
                  }
                  isInvalid={
                    passwordForm.confirmPassword.length > 0 &&
                    passwordForm.confirmPassword !== passwordForm.newPassword
                  }
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  variant="bordered"
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !passwordForm.currentPassword ||
                    getPasswordErrors(passwordForm.newPassword).length > 0 ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  onPress={handlePasswordChange}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onOpenChange={onAddressModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Address
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <Alert className="mb-4" color="danger">
                    {alertMessage}
                  </Alert>
                )}
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={editAddressDetails.fullName}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      fullName: e.target.value,
                    })
                  }
                />

                <Input
                  label="Mobile Number"
                  placeholder="Enter your 10-digit mobile number"
                  value={editAddressDetails.mobileNumber}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      mobileNumber: e.target.value,
                    })
                  }
                />
                <Input
                  label="Pincode"
                  placeholder="Enter your 6-digit pincode"
                  value={editAddressDetails.pincode}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      pincode: e.target.value,
                    })
                  }
                />
                <Input
                  label="Flat, House no., Building, Company, Apartment"
                  placeholder="Enter your address"
                  value={editAddressDetails.address}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      address: e.target.value,
                    })
                  }
                />
                <Input
                  label="Area, Street, Sector, Village"
                  placeholder="Enter your area"
                  value={editAddressDetails.area}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      area: e.target.value,
                    })
                  }
                />
                <Input
                  label="Landmark"
                  placeholder="Enter a landmark"
                  value={editAddressDetails.landmark}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      landmark: e.target.value,
                    })
                  }
                />
                <Input
                  label="Town/City"
                  placeholder="Enter your town/city"
                  value={editAddressDetails.city}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      city: e.target.value,
                    })
                  }
                />
                <Input
                  label="State"
                  placeholder="Enter your state"
                  value={editAddressDetails.state}
                  variant="bordered"
                  onChange={(e) =>
                    setEditAddressDetails({
                      ...editAddressDetails,
                      state: e.target.value,
                    })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleEditAddressValidation}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddAddressModalOpen}
        onOpenChange={onAddAddressModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Address
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <Alert className="mb-4" color="danger">
                    {alertMessage}
                  </Alert>
                )}
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={addressForm.name}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, name: e.target.value })
                  }
                />
                <Input
                  label="Mobile Number"
                  placeholder="Enter your mobile number"
                  value={addressForm.phoneNumber}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      phoneNumber: e.target.value,
                    })
                  }
                />
                <Input
                  label="Pincode"
                  placeholder="Enter your pincode"
                  value={addressForm.pincode}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value })
                  }
                />
                <Input
                  label="Flat, House no., Building, Company, Apartment"
                  placeholder="Enter your address"
                  value={addressForm.flat}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, flat: e.target.value })
                  }
                />
                <Input
                  label="Area, Street, Sector, Village"
                  placeholder="Enter your area"
                  value={addressForm.area}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, area: e.target.value })
                  }
                />
                <Input
                  label="Landmark"
                  placeholder="Enter a landmark"
                  value={addressForm.landmark}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, landmark: e.target.value })
                  }
                />
                <Input
                  label="Town/City"
                  placeholder="Enter your town/city"
                  value={addressForm.city}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                />
                <Input
                  label="State"
                  placeholder="Enter your state"
                  value={addressForm.state}
                  variant="bordered"
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleAddAddressValidation}>
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Name Confirmation Modal */}
      <Modal
        isOpen={isNameConfirmModalOpen}
        onOpenChange={onNameConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Name Change
              </ModalHeader>
              <ModalBody>
                <p>{`Are you sure you want to change your name to "${newName}"?`}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={!newName.trim()}
                  onPress={async () => {
                    try {
                      const response = await fetch(
                        `/api/auth/user/name/${currentUser.email}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ name: newName.trim() }),
                        }
                      );

                      if (response.ok) {
                        const userResponse = await fetch(
                          `/api/auth/user/${currentUser.email}`
                        );
                        const freshUserData = await userResponse.json();

                        setUserData(freshUserData);
                        setNewName("");
                        onClose();
                        onNameModalOpenChange();
                      }
                    } catch (error) {}
                  }}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Address Confirmation Modal */}
      <Modal
        isOpen={isAddAddressConfirmModalOpen}
        onOpenChange={onAddAddressConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm New Address
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to add this address?</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Name: {addressForm.name}</p>
                  <p>Phone: {addressForm.phoneNumber}</p>
                  <p>Address: {addressForm.flat}</p>
                  <p>Area: {addressForm.area}</p>
                  <p>City: {addressForm.city}</p>
                  <p>State: {addressForm.state}</p>
                  <p>Pincode: {addressForm.pincode}</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await handleAddAddress();
                    onClose();
                    onAddAddressModalOpenChange();
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Address Confirmation Modal */}
      <Modal
        isOpen={isAddressConfirmModalOpen}
        onOpenChange={onAddressConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Address Change
              </ModalHeader>
              <ModalBody>
                Are you sure you want to update this address?
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await handleEditAddressSubmit();
                    onClose();
                    onAddressModalOpenChange();
                  }}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Address Confirmation Modal */}
      <Modal
        isOpen={isDeleteAddressModalOpen}
        onOpenChange={onDeleteAddressModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Address
              </ModalHeader>
              <ModalBody>
                Are you sure you want to delete this address? This action cannot
                be undone.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    await handleDeleteAddress(addressToDelete);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Phone Confirmation Modal */}
      <Modal
        isOpen={isPhoneConfirmModalOpen}
        onOpenChange={onPhoneConfirmModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Phone Number Change
              </ModalHeader>
              <ModalBody>
                <p>{`Are you sure you want to change your phone number to "${newPhoneNumber}"?`}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    try {
                      const response = await fetch(
                        `/api/auth/user/phone/${currentUser.email}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ mobile: newPhoneNumber }),
                        }
                      );

                      if (response.ok) {
                        const userResponse = await fetch(
                          `/api/auth/user/${currentUser.email}`
                        );
                        const freshUserData = await userResponse.json();

                        setUserData(freshUserData);
                        setNewPhoneNumber("");
                        onClose();
                        onPhoneModalOpenChange();

                        addToast({
                          title: "Success!",
                          description: "Phone number updated successfully",
                          timeout: 3000,

                          color: "success",
                        });
                      }
                    } catch (error) {
                      addToast({
                        title: "Error!",
                        description: "Failed to update phone number",
                        timeout: 3000,

                        color: "danger",
                      });
                    }
                  }}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default Profile;
