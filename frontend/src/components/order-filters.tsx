/* eslint-disable prettier/prettier */
const OrderFilters = ({ filters, onFilterChange }: any) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    onFilterChange(name, value);
  };

  return (
    <div className="mt-6 gap-4 space-y-4 sm:mt-0 sm:flex sm:items-center sm:justify-end sm:space-y-0">
      <div>
        <label
          className="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          htmlFor="status"
        >
          Select order type
        </label>
        <select
          className="block w-full min-w-[8rem] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
          id="status"
          name="status"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="all-orders">All orders</option>
          <option value="in transit">In transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <span className="inline-block text-gray-500 dark:text-gray-400">
        {" "}
        from{" "}
      </span>

      <div>
        <label
          className="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          htmlFor="duration"
        >
          Select duration
        </label>
        <select
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
          id="duration"
          name="duration"
          value={filters.duration}
          onChange={handleChange}
        >
          <option value="this-month">this month</option>
          <option value="last-6-months">the last 6 months</option>
          <option value="this-year">this year</option>
          <option value="the-lifetime">the lifetime</option>
        </select>
      </div>
    </div>
  );
};

export default OrderFilters;
