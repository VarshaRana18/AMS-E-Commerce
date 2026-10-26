import React from "react";

interface DropdownRadioProps {
  options: { id: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const DropdownRadio: React.FC<DropdownRadioProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <select
      value={selectedValue}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border border-gray-300 rounded-md"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DropdownRadio;

// import React, { useState } from "react";

// interface DropdownRadioProps {
//   options: {
//     id: string;
//     label: string;
//   }[];
// }

// const DropdownRadio: React.FC<DropdownRadioProps> = ({ options }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   };

//   const handleOptionChange = (label: string) => {
//     setSelectedOption(label);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative">
//       <button
//         id="dropdownHelperRadioButton"
//         onClick={toggleDropdown}
//         className="text-black hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-black-900 font-medium rounded-lg text-md px-4 py-2.5 text-center inline-flex items-center"
//         type="button"
//       >
//         {selectedOption || "New"}
//         <svg
//           className="w-2.5 h-2.5 ms-2.5"
//           aria-hidden="true"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 10 6"
//         >
//           <path
//             stroke="currentColor"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="m1 1 4 4 4-4"
//           />
//         </svg>
//       </button>

//       {isOpen && (
//         <div
//           id="dropdownHelperRadio"
//           className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-60 dark:bg-gray-700"
//         >
//           <ul
//             className="p-3 space-y-1 text-sm text-gray-700 flex justify-betwen items-center"
//             aria-labelledby="dropdownHelperRadioButton"
//           >
//             {options.map((option) => (
//               <li key={option.id}>
//                 <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
//                   <div className="flex items-center h-5">
//                     <input
//                       id={option.id}
//                       name="helper-radio"
//                       type="radio"
//                       value={option.label}
//                       onChange={() => handleOptionChange(option.label)}
//                       // className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
//                     />
//                   </div>
//                   <div className="ms-2 text-sm ">
//                     <label
//                       htmlFor={option.id}
//                       className="font-medium text-gray-900 "
//                     >
//                       <div className="">{option.label}</div>
//                     </label>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DropdownRadio;
