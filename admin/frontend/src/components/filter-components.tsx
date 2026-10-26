import { Checkbox, CheckboxGroup, Slider } from "@heroui/react";
import React, { useState, useEffect, useRef } from "react";
import "../styles/custom-slider.css";

interface FilterDropdownProps {
  selectedComponent: string;
  selectedCompanies: string[];
  setSelectedCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  showCompanies?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedComponent,
  selectedCompanies,
  setSelectedCompanies,
  priceRange,
  setPriceRange,
  showCompanies = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: { target: any }) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!selectedComponent) return; // Prevents unnecessary API calls

    const formattedComponent = selectedComponent
      .toLowerCase()
      .replace(/\s+/g, "-");

    fetch(
      `http://localhost:5170/api/components/companies/${formattedComponent}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []); // Ensures `setCompanies` gets an array
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        setCompanies([]); // Reset on failure
      });
  }, [selectedComponent]);

  useEffect(() => {
    if (!selectedComponent) return;

    const formattedComponent = selectedComponent
      .toLowerCase()
      .replace(/\s+/g, "-");

    fetch(
      `http://localhost:5170/api/components/pricerange/${formattedComponent}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.minPrice && data.maxPrice) {
          const minNum = Math.floor(data.minPrice / 1000) * 1000;
          const maxNum = Math.ceil(data.maxPrice / 1000) * 1000;

          setMinPrice(minNum);
          setMaxPrice(maxNum);
          setPriceRange([minNum, maxNum]); // Update slider range
        }
      })
      .catch((error) => {
        console.error("Error fetching price range:", error);
        setMinPrice(10000); // Reset to default on error
        setMaxPrice(200000);
      });
  }, [selectedComponent]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center h-12 px-3 py-3 rounded-md bg-white text-sm font-semibold text-gray-900 border-2 border-blue-500 border-0 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:shadow-lg"
          id="menu-button"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
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
          className="absolute right-0 z-[1000] mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
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
                label="Price"
                maxValue={maxPrice}
                minValue={minPrice}
                step={500}
                size="sm"
              />
            </div>
          </div>

          <div role="none">
            <div
              className={`px-4 py-2 flex justify-between items-center ${showCompanies}`}
            >
              <label className="text-sm font-semibold">Company</label>
              <button
                className="text-red-500 text-xs font-semibold hover:underline"
                onClick={() => setSelectedCompanies([])} // Clears selected checkboxes
              >
                Clear
              </button>
            </div>
            <div className="px-4 py-2">
              <CheckboxGroup
                size="sm"
                value={selectedCompanies}
                onChange={setSelectedCompanies}
              >
                {companies.map((company) => (
                  <Checkbox key={company} value={company}>
                    {company}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
