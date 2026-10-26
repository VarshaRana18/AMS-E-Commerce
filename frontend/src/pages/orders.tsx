import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";
import OrderList from "@/components/order-list";
import OrderFilters from "@/components/order-filters";
import Pagination from "@/components/pagination";
import { useAuth } from "@/contexts/AuthContext";

const ORDERS_PER_PAGE = 10;

const Orders = () => {
  const { currentUser }: any = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all-orders",
    duration: "this-month",
  });

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  useEffect(() => {
    document.title = "AMS || Orders";

    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/auth/orders/${currentUser.email}`);

        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();

        setOrders(data.orders);
        setFilteredOrders(data.orders); // Initialize filtered orders with all orders
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Apply filters whenever filters or orders change
  useEffect(() => {
    if (orders.length === 0) return;

    let result = [...orders];

    // Apply status filter
    if (filters.status !== "all-orders") {
      result = result.filter(
        (order: any) =>
          order.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply duration filter only if not "the-lifetime"
    if (filters.duration !== "the-lifetime") {
      const now = new Date();
      let startDate = new Date();

      switch (filters.duration) {
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last-6-months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case "this-year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      result = result.filter((order: any) => {
        const orderDate = new Date(order.order_date);

        return orderDate >= startDate;
      });
    }

    // Sort orders in descending order (newest first)
    result.sort((a: any, b: any) => {
      const dateA: any = new Date(a.order_date);
      const dateB: any = new Date(b.order_date);

      return dateB - dateA; // For descending order
    });

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, orders]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <DefaultLayout>
      <section className="bg-white py-4 antialiased dark:bg-gray-900 md:py-8">
        <div className="mx-auto w-full sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1400px] 2xl:max-w-[1600px] px-4">
          <div className="mx-auto w-full">
            <div className="gap-4 sm:flex sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                My Orders
              </h2>
              <OrderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Loading orders...
              </p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                <OrderList orders={paginatedOrders} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Orders;
