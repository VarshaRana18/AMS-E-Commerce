import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import OrderList from "@/components/order-list";
import OrderFilters from "@/components/order-filters";
import Pagination from "@/components/pagination";

interface Order {
  id: string;
  _id: string;
  user_id: string;
  username?: string;
  components: {
    component_id: string;
    component_type: string;
    quantity: number;
  }[];
  order_date: string;
  status: string;
  total_price: number;
  tracking_number: string;
  courier: string;
}
const ORDERS_PER_PAGE = 7;

const Orders = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minMaxPrice, setMinMaxPrice] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Calculate pagination data
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5170/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data: Order[] = await response.json();
          const ordersArray = Array.isArray(data) ? data : [];
          setAllOrders(ordersArray);
          setFilteredOrders(ordersArray);

          const uniqueStatuses = [
            ...new Set(ordersArray.map((order) => order.status)),
          ];
          setStatusOptions(uniqueStatuses);
        }
      } catch (error) {
        console.error("Network error:", error);
        setAllOrders([]);
        setFilteredOrders([]);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchPriceRange = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/orders/pricerange",
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

  useEffect(() => {
    const filtered = allOrders.filter((order) => {
      // Status filter
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(order.status)
      ) {
        return false;
      }

      // Price range filter
      if (
        order.total_price < priceRange[0] ||
        order.total_price > priceRange[1]
      ) {
        return false;
      }

      // Date range filter
      if (selectedDateRange) {
        const orderDate = new Date(order.order_date);
        const currentDate = new Date();

        switch (selectedDateRange) {
          case "week":
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return orderDate >= startOfWeek;

          case "month":
            const startOfMonth = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1
            );
            return orderDate >= startOfMonth;

          case "sixmonths":
            const sixMonthsAgo = new Date(currentDate);
            sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
            return orderDate >= sixMonthsAgo;

          case "year":
            const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
            return orderDate >= startOfYear;

          default:
            return true;
        }
      }

      return true;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allOrders, selectedStatuses, priceRange, selectedDateRange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5170/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Update the local state to reflect the change
        setAllOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="bg-white antialiased dark:bg-gray-900">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <div className="mx-auto max-w-5xl">
            <div className="gap-4 sm:flex sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Component Orders
              </h2>
              <OrderFilters
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

            {/* Show order count information */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-
              {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}{" "}
              of {filteredOrders.length} orders
            </div>

            <OrderList
              orders={paginatedOrders}
              onStatusUpdate={handleStatusUpdate}
              statusOptions={statusOptions}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Orders;
