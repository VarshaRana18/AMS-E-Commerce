interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center w-full font-[sans-serif] my-2 grow-2">
      <div className="flex items-center flex-grow px-4 py-3 rounded-md border-2 border-blue-500 overflow-hidden">
        <input
          type="text"
          placeholder="Search Something..."
          className="w-full outline-none bg-transparent text-gray-600 text-sm"
          onChange={handleInputChange}
        />
      </div>
      <div className="relative z-20">{/* <FilterDropdown /> */}</div>
    </div>
  );
};

export default SearchBar;
