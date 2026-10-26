const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const MAX_VISIBLE_PAGES = 5; // Maximum pages to show at once

  const getPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(
      1,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2)
    );
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    const pages: any = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Page navigation"
      className="mt-6 flex items-center justify-center sm:mt-8"
    >
      <ul className="flex h-8 items-center -space-x-px text-sm">
        <li>
          <button
            className={`ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 px-3 leading-tight ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
            disabled={currentPage === 1}
            onClick={() => handlePageClick(currentPage - 1)}
          >
            <span className="sr-only">Previous</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m15 19-7-7 7-7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </li>

        {pages[0] > 1 && (
          <>
            <li>
              <button
                className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => handlePageClick(1)}
              >
                1
              </button>
            </li>
            {pages[0] > 2 && (
              <li>
                <span className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  ...
                </span>
              </li>
            )}
          </>
        )}

        {pages.map((page) => (
          <li key={page}>
            <button
              className={`flex h-8 items-center justify-center border border-gray-300 px-3 leading-tight ${
                page === currentPage
                  ? "z-10 border-primary-300 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <li>
                <span className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  ...
                </span>
              </li>
            )}
            <li>
              <button
                className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => handlePageClick(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            className={`flex h-8 items-center justify-center rounded-e-lg border border-gray-300 px-3 leading-tight ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
          >
            <span className="sr-only">Next</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4 rtl:rotate-180"
              fill="none"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m9 5 7 7-7 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
