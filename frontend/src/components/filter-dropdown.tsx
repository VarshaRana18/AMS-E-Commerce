import { Checkbox, CheckboxGroup, Slider } from "@heroui/react";
import { useState, useEffect, useRef } from "react";
import "../styles/custom-slider.css";

const FilterDropdown = ({
  selectedComponent,
  selectedCompanies,
  setSelectedCompanies,
  priceRange,
  setPriceRange,
  showCompanies = "",
}: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const dropdownRef = useRef<any>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: any) => {
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

  // Fetch companies using fetch instead of Axios
  useEffect(() => {
    if (!selectedComponent) return; // Prevents unnecessary API calls

    const formattedComponent = selectedComponent
      .toLowerCase()
      .replace(/\s+/g, "-");

    fetch(`/api/components/companies/${formattedComponent}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []); // Ensures `setCompanies` gets an array
      })
      .catch((_error) => {
        setCompanies([]); // Reset on failure
      });
  }, [selectedComponent]);

  useEffect(() => {
    if (!selectedComponent) return;

    const formattedComponent = selectedComponent
      .toLowerCase()
      .replace(/\s+/g, "-");

    fetch(`/api/components/pricerange/${formattedComponent}`)
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
      .catch((_error) => {
        setMinPrice(10000); // Reset to default on error
        setMaxPrice(200000);
      });
  }, [selectedComponent]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div>
        <button
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          className="inline-flex justify-center items-center h-12 px-3 py-3 rounded-r-md bg-white text-sm font-semibold text-gray-900 border-2 border-blue-500 border-l-0 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-blue-500 hover:shadow-lg"
          id="menu-button"
          type="button"
          onClick={toggleMenu}
        >
          <svg
            className="h-6 w-6 text-black-400"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div
          aria-labelledby="menu-button"
          aria-orientation="vertical"
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
          role="menu"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            <div className="px-4 py-2">
              <Slider
                className="max-w-md custom-slider"
                color="primary"
                formatOptions={{
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }}
                label="Price"
                maxValue={maxPrice}
                minValue={minPrice}
                size="sm"
                step={500}
                value={priceRange}
                onChange={setPriceRange}
              />
            </div>
          </div>

          <div role="none">
            <div
              className={`px-4 py-2 flex justify-between items-center ${showCompanies}`}
            >
              <label className="text-sm font-semibold" htmlFor="company">
                Company
              </label>
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
