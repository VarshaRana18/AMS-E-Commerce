import { Accordion, AccordionItem } from "@heroui/react";
import { Tooltip, Button } from "@heroui/react"; //added by varsha
import React, { useEffect, useState } from "react"; //added by varsha
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";

interface RepairRequest {
  _id: string;
  component_name: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  request_date: string;
  totalCharge: string;
}
interface RepairSteps {
  step_number: number;
  description: string;
}

const statusClasses = {
  "Pre-order":
    "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
  "In transit":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function DocsPage() {
  const { currentUser }: any = useAuth();
  const [steps, setSteps]: any = useState<RepairSteps[]>([]); //added by varsha
  ///Modal
  const { isOpen, onOpen, onClose }: any = useDisclosure();
  const [repairRequests, setRepairRequests]: any = useState<RepairRequest[]>(
    []
  );
  const [isLoading, setIsLoading]: any = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen]: any = useState(false);
  const [selectedRequest, setSelectedRequest]: any =
    useState<RepairRequest | null>(null);
  const [backdrop, setBackdrop] = useState<"opaque" | "transparent" | "blur">(
    "opaque"
  );
  const backdrops = ["opaque"] as const;
  const handleOpen = (backdrop: "opaque") => {
    setBackdrop(backdrop);
    onOpen();
  };

  //Repair-Form
  const [formData, setFormData] = useState({
    component_name: "",
    repair_description: "",
  });

  // Handle input changes
  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openDetailsModal = (request: RepairRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission if event exists
    }

    try {
      // Validate required fields
      if (!formData.repair_description) {
        alert("Repair description is required");

        return;
      }

      const response = await fetch(`/api/auth/repairs/${currentUser.email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          component_name: formData.component_name,
          repair_description: formData.repair_description,
        }),
      });

      if (response.ok) {
        // Refresh the requests list
        const requestsResponse = await fetch(
          `/api/auth/requests/${currentUser.email}`
        );
        const updatedRequests = await requestsResponse.json();

        setRepairRequests(updatedRequests);

        // Close modal and reset form
        onClose();
        setFormData({ component_name: "", repair_description: "" });

        // Show success message
        addToast({
          title: "Success!",
          description: "Your request has been submitted.",
          timeout: 2000,

          color: "success",
        });
      } else {
        addToast({
          title: "Error!",
          description:
            "There was an error submitting your request. Please try again.",
          timeout: 2000,

          color: "danger",
        });
      }
    } catch (error) {
      alert("Failed to submit repair request. Please try again.");
    }
  };

  useEffect(() => {
    document.title = "AMS || Repairs";
    // const token = localStorage.getItem("token");
    const fetchSteps = async () => {
      try {
        // const response = await fetch(`${baseURL}/api/repairs/steps`, {
        const response = await fetch("api/repairs/steps", {
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          setSteps(data);
        } else {
        }
      } catch (error) {}
    };

    fetchSteps();
  }, []); //added by varsha

  useEffect(() => {
    const fetchRepairRequests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/auth/requests/${currentUser.email}`);

        if (response.ok) {
          const data = await response.json();

          setRepairRequests(data);
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepairRequests();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center gap-4 py-4">
        <div className="flex w-full p-4 mx-10 flex-col gap-4 ">
          <h1 className="text-3xl">The Steps?</h1>
          <Accordion
            className="w-full p-3"
            selectionMode="multiple"
            variant="shadow"
          >
            <AccordionItem
              key="steps"
              aria-label="Steps"
              title="Steps to Request a Repair"
            >
              <ul className="space-y-4 py-6 px-4 w-full mx-auto bg-white shadow-lg rounded-2xl border border-gray-200 dark:bg-gray-900">
                {steps.map((step, index) => (
                  <li
                    key={step.step_number}
                    className="flex items-start text-lg text-gray-800 break-words"
                  >
                    <span className="mr-3 flex-shrink-0 flex h-10 w-10 items-start sm:items-center justify-center rounded-full sm:bg-gray-100 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1 min-w-0 break-words">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex justify-center gap-7 items-center mt-3">
          {backdrops.map((b) =>
            currentUser ? (
              <Button
                key={b}
                className="px-5 me-2 mb-2 text-md font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-none-0 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 capitalize"
                onPress={() => handleOpen(b)}
              >
                + Submit a Request for Repair
              </Button>
            ) : (
              <Tooltip
                key={`tooltip-${b}`} // Add this line
                className="bg-gray-200"
                closeDelay={150}
                content="Login to submit repair requests"
              >
                <Button
                  key={b}
                  isDisabled
                  className="px-5 me-2 mb-2 text-md font-medium text-gray-400 focus:outline-none bg-white rounded-full border border-none-0 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 capitalize cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <span>+ Submit a Request for Repair</span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                </Button>
              </Tooltip>
            )
          )}
        </div>

        <div className="w-full px-4 mx-10 flex-col gap-4">
          <h2 className="text-2xl font-semibold text-left w-full">
            Your Requests
          </h2>

          {isLoading ? (
            <div className="py-6 text-center">
              Loading your repair requests...
            </div>
          ) : repairRequests.length === 0 ? (
            <div className="py-6 text-center">
              You haven&apos;t submitted any repair requests yet.
            </div>
          ) : (
            repairRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-wrap items-center gap-y-4 py-6"
              >
                <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                  <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                    Request ID:
                  </dt>
                  <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                    <button className="hover:underline" type="button">
                      {request._id}
                    </button>
                  </dd>
                </dl>

                <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                  <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                    Component:
                  </dt>
                  <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                    {request.component_name || "Not specified"}
                  </dd>
                </dl>

                <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                  <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                    Date:
                  </dt>
                  <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                    {new Date(request.request_date).toLocaleDateString("en-GB")}
                  </dd>
                </dl>

                <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                  <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                    Status:
                  </dt>
                  <dd
                    className={`me-2 mt-1.5 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                      statusClasses[
                        request.status as keyof typeof statusClasses
                      ] ||
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      className="me-1 h-3 w-3"
                      fill="none"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {request.status === "Pending" && (
                        <path
                          d="M18.5 4h-13m13 16h-13M8 20v-3.333a2 2 0 0 1 .4-1.2L10 12.6a1 1 0 0 0 0-1.2L8.4 8.533a2 2 0 0 1-.4-1.2V4h8v3.333a2 2 0 0 1-.4 1.2L13.957 11.4a1 1 0 0 0 0 1.2l1.643 2.867a2 2 0 0 1 .4 1.2V20H8Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      )}
                      {request.status === "In Progress" && (
                        <path
                          d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      )}
                      {request.status === "Completed" && (
                        <path
                          d="M5 11.917 9.724 16.5 19 7.5"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      )}
                      {request.status === "Cancelled" && (
                        <path
                          d="M6 18 17.94 6M18 18 6.06 6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      )}
                    </svg>
                    {request.status}
                  </dd>
                </dl>

                <div className="w-full sm:w-auto grid sm:grid-cols-2 lg:flex lg:w-64 lg:items-center lg:justify-end gap-4">
                  <button
                    className="w-full inline-flex justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 lg:w-auto"
                    type="button"
                    onClick={() => openDetailsModal(request)}
                  >
                    View details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* The Repair Form */}
        <Modal
          backdrop={backdrop}
          isOpen={isOpen}
          placement={"center"}
          onClose={onClose}
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit}>
                {" "}
                {/* Wrap content in form */}
                <ModalHeader className="flex flex-col gap-1 text-lg">
                  Repair Request
                </ModalHeader>
                <ModalBody>
                  <label className="block mt-4 mb-2" htmlFor="component_name">
                    Component
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="component_name"
                    type="text"
                    value={formData.component_name}
                    onChange={handleChange}
                  />

                  <label
                    className="block mt-4 mb-2"
                    htmlFor="repair_description"
                  >
                    Repair Request:
                  </label>
                  <textarea
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="repair_description"
                    rows={8}
                    value={formData.repair_description}
                    onChange={handleChange}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="success" type="submit" variant="light">
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* View Details Modal */}
        <Modal
          backdrop="opaque"
          isOpen={isDetailsModalOpen}
          placement="center"
          onClose={closeDetailsModal}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Repair Request Details
                </ModalHeader>
                <ModalBody>
                  {selectedRequest && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Request Date
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {new Date(
                            selectedRequest.request_date
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Component Name
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedRequest.component_name || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Description
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {selectedRequest.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </h3>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                              statusClasses[
                                selectedRequest.status as keyof typeof statusClasses
                              ] ||
                              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {selectedRequest.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Charge
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedRequest.totalCharge}
                        </p>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </section>
    </DefaultLayout>
  );
}
