import FilterDropdown from "./filter-dropdown";

const SearchBar = ({
  selectedComponent,
  setSearchQuery,
  selectedCompanies,
  setSelectedCompanies,
  priceRange,
  setPriceRange,
  showCompanies = "",
}) => {
  return (
    <div className="flex items-center max-w-xl mx-auto font-[sans-serif] mb-2">
      <div className="flex items-center flex-grow px-4 py-3 rounded-l-md border-2 border-blue-500 overflow-hidden">
        <input
          className="w-full outline-none bg-transparent text-gray-600 text-sm"
          placeholder="Search Something..."
          type="text"
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
      </div>
      <div className="relative z-20">
        <FilterDropdown
          priceRange={priceRange}
          selectedCompanies={selectedCompanies}
          selectedComponent={selectedComponent}
          setPriceRange={setPriceRange}
          setSelectedCompanies={setSelectedCompanies}
          showCompanies={showCompanies}
        />
      </div>
    </div>
  );
};

export default SearchBar;
