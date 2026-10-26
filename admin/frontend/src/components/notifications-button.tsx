import React from "react";

interface NotificationsButtonProps {
  notifications: number;
}

const NotificationsButton: React.FC<NotificationsButtonProps> = ({
  notifications,
}) => {
  return (
    <a href="/notifications" className="relative py-2 cursor-pointer">
      <div className="absolute top-0 left-4">
        <p className="flex h-2 w-2 items-center justify-center rounded-full bg-red-500 p-2 text-xs text-white">
          {notifications}
        </p>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className=" h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2a6 6 0 00-6 6v4a4 4 0 01-1.33 2.99L4 16h16l-.67-.01A4 4 0 0118 12V8a6 6 0 00-6-6zM10 20h4a2 2 0 01-4 0z"
        />
      </svg>
    </a>
  );
};

export default NotificationsButton;
