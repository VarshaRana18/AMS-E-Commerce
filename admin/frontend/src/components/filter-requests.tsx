import { Slider } from "@heroui/react";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";

interface FilterDropdownProps {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  minPrice: number;
  maxPrice: number;
  statusOptions: string[];
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDateRange: string;
  setSelectedDateRange: React.Dispatch<React.SetStateAction<string>>;
}

const RequestsFilter: React.FC<FilterDropdownProps> = ({
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  statusOptions,
  selectedStatuses,
  setSelectedStatuses,
  selectedDateRange,
  setSelectedDateRange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearStatusFilter = () => {
    setSelectedStatuses([]);
  };

  const clearDateFilter = () => {
    setSelectedDateRange("");
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateRangeOptions = [
    { value: "week", label: "Current Week" },
    { value: "month", label: "Current Month" },
    { value: "sixmonths", label: "Last 6 months" },
    { value: "year", label: "Current Year" },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center h-12 px-3 py-3 rounded-md bg-white text-sm font-semibold text-gray-900 border-2 border-blue-500 border-0 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:shadow-lg"
          onClick={toggleMenu}
        >
          <svg
            className="h-6 w-6 text-black-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="absolute right-0 z-[1000] mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
          role="menu"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-2">
              <Slider
                color="primary"
                className="max-w-md custom-slider"
                value={priceRange}
                onChange={(value) => {
                  if (Array.isArray(value) && value.length === 2) {
                    setPriceRange([value[0], value[1]]);
                  }
                }}
                formatOptions={{
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }}
                label="Charge"
                maxValue={maxPrice}
                minValue={minPrice}
                step={1000}
                size="sm"
              />
            </div>
          </div>
          <div className="py-1" role="none">
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Status</h3>
                <Button
                  onPress={clearStatusFilter}
                  className="text-xs p-1 text-red-700"
                  size="sm"
                  variant="light"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {statusOptions.map((status) => (
                  <div key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="py-1" role="none">
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Order Date</h3>
                <Button
                  onPress={clearDateFilter}
                  className="text-xs p-1 text-red-700"
                  size="sm"
                  variant="light"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-2">
                {dateRangeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`date-${option.value}`}
                      name="dateRange"
                      value={option.value}
                      checked={selectedDateRange === option.value}
                      onChange={() => setSelectedDateRange(option.value)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`date-${option.value}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsFilter;
