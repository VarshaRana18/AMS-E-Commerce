import DefaultLayout from "@/layouts/default";
import SearchBar from "@/components/search-bar";
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import { Button } from "@heroui/button";
import RequestsFilter from "../components/filter-requests";
import Pagination from "@/components/pagination";

interface Requests {
  _id?: Types.ObjectId;
  user_id: string;
  username?: string;
  component_name: string;
  description: string;
  status: string;
  totalCharge: string;
  request_date: Date;
}

const REQUESTS_PER_PAGE = 5;

export default function DocsPage() {
  const [requests, setRequests] = useState<Requests[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minMaxPrice, setMinMaxPrice] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [inputValues, setInputValues] = useState<{
    [key: string]: { status: string; totalCharge: string };
  }>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPriceRange = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/repairs/requests/pricerange",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMinMaxPrice({
            min: data.minPrice,
            max: data.maxPrice,
          });
          setPriceRange([data.minPrice, data.maxPrice]);
        }
      } catch (error) {
        setMinMaxPrice({ min: 0, max: 10000 });
        setPriceRange([0, 10000]);
      }
    };
    fetchPriceRange();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.component_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    const charge = parseFloat(request.totalCharge) || 0;
    const matchesPrice = charge >= priceRange[0] && charge <= priceRange[1];

    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(request.status);

    const requestDate = new Date(request.request_date);
    const now = new Date();
    let matchesDate = true;

    if (selectedDateRange) {
      const requestDateStr = requestDate.toISOString().split("T")[0];
      const todayStr = now.toISOString().split("T")[0];
      const requestDateOnly = new Date(requestDateStr);
      const today = new Date(todayStr);

      switch (selectedDateRange) {
        case "week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          matchesDate =
            requestDateOnly >= startOfWeek && requestDateOnly <= endOfWeek;
          break;
        case "month":
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );
          matchesDate =
            requestDateOnly >= startOfMonth && requestDateOnly <= endOfMonth;
          break;
        case "sixmonths":
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(today.getMonth() - 6);
          matchesDate =
            requestDateOnly >= sixMonthsAgo && requestDateOnly <= today;
          break;
        case "year":
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          const endOfYear = new Date(today.getFullYear(), 11, 31);
          matchesDate =
            requestDateOnly >= startOfYear && requestDateOnly <= endOfYear;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesPrice && matchesStatus && matchesDate;
  });

  // Calculate pagination data
  const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE
  );

  useEffect(() => {
    const fetchRepairs = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/repairs/requests",
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
          setRequests(data);

          const uniqueStatuses = [
            ...new Set(data.map((req: Requests) => req.status)),
          ] as string[];
          setStatusOptions(uniqueStatuses);

          const initialInputValues = data.reduce(
            (
              acc: { [key: string]: { status: string; totalCharge: string } },
              request: Requests
            ) => {
              acc[request._id?.toString() || ""] = {
                status: request.status,
                totalCharge: request.totalCharge,
              };
              return acc;
            },
            {}
          );
          setInputValues(initialInputValues);
        }
      } catch (error) {
        console.error("Error fetching repairs:", error);
      }
    };
    fetchRepairs();
  }, []);

  const handleStatusUpdate = async (repairId: string, newStatus: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5170/api/repairs/requests/${repairId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleInputChange = (
    repairId: string,
    field: string,
    value: string
  ) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [repairId]: {
        ...prevValues[repairId],
        [field]: value,
      },
    }));
  };

  const handleChargeUpdate = async (repairId: string, newCharge: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5170/api/repairs/requests/${repairId}/charge`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ totalCharge: newCharge }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error updating charge:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DefaultLayout>
      <section className="gap-4 py-8 md:py-5 mx-3 px-3 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="flex items-center gap-2 mb-4">
            <SearchBar onSearch={(query) => setSearchQuery(query)} />
            <RequestsFilter
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minPrice={minMaxPrice.min}
              maxPrice={minMaxPrice.max}
              statusOptions={statusOptions}
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
            />
          </div>

          {/* Show request count information */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * REQUESTS_PER_PAGE + 1}-
            {Math.min(currentPage * REQUESTS_PER_PAGE, filteredRequests.length)}{" "}
            of {filteredRequests.length} requests
          </div>

          {paginatedRequests.map((request, index) => (
            <div
              key={index}
              className="w-full p-4 border border-gray-300 shadow-lg rounded-xl bg-white text-center my-5"
            >
              <div className="flex justify-evenly items-center">
                <div className="w-full flex flex-col justify-between">
                  <div className="mb-4 w-full flex justify-evenly items-center">
                    <h4 className="text-lg">
                      <b>User Name:</b> {request.username}
                    </h4>
                    <h4 className="text-lg">
                      <b>Order Date:</b>{" "}
                      {new Date(request.request_date).toLocaleDateString(
                        "en-GB"
                      )}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="text-left gap-2 border-t border-gray-200 pt-4 flex flex-col justify-around px-6">
                <h5>
                  <b>Title</b> {request.component_name}
                </h5>
                <p>
                  <b>Description</b> {request.description}
                </p>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between px-6">
                <div className="flex flex-row justify-between">
                  <h5 className="text-lg font-medium pt-2">
                    <b>Status</b>
                  </h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        inputValues[request._id?.toString() || ""]?.status || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          request._id?.toString() || "",
                          "status",
                          e.target.value
                        )
                      }
                      className="p-2 border border-gray-300 rounded-md mx-3"
                      placeholder="Enter new status"
                    />
                    <Button
                      onPress={() =>
                        handleStatusUpdate(
                          request._id?.toString() || "",
                          inputValues[request._id?.toString() || ""]?.status ||
                            ""
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-200"
                    >
                      Save Status
                    </Button>
                  </div>
                </div>
                <h5 className="flex flex-row justify-between items-center gap-2">
                  <b>Total Charge</b>
                  <input
                    type="text"
                    value={
                      inputValues[request._id?.toString() || ""]?.totalCharge ||
                      ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        request._id?.toString() || "",
                        "totalCharge",
                        e.target.value
                      )
                    }
                    className="p-2 border border-gray-300 rounded-md mx-3"
                    placeholder="Enter Total Charge"
                  />
                  <Button
                    onPress={() =>
                      handleChargeUpdate(
                        request._id?.toString() || "",
                        inputValues[request._id?.toString() || ""]
                          ?.totalCharge || ""
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-200"
                  >
                    Save Charge
                  </Button>
                </h5>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}
