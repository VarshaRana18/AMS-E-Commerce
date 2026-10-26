import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/navbar";
import { ImageLogo } from "@/components/ImageLogo";
import { NavbarItem } from "@heroui/navbar";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useEffect, useState } from "react";

// import NotificationsButton from "./notifications-button";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unseenCount, setUnseenCount] = useState(0);
  const [unseenOrdersCount, setUnseenOrdersCount] = useState(0);

  useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5170/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear the token from localStorage (if used)
        localStorage.removeItem("token");

        // Redirect to the home page
        window.location.href = "/";
        // navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  //Notifications- Repair Requests
  useEffect(() => {
    const fetchUnseenCount = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/repairs/requests/unseen-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setUnseenCount(data.count);
      } catch (err) {
        console.error("Error fetching unseen count for requests:", err);
      }
    };

    fetchUnseenCount();

    // Optional: Set up polling every 30 seconds
    const interval = setInterval(fetchUnseenCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unseen count on component mount
  useEffect(() => {
    if (location.pathname === "/repairs/requests") {
      const markAsSeen = async () => {
        const token = localStorage.getItem("token");
        try {
          await fetch("http://localhost:5170/api/repairs/requests/mark-seen", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          setUnseenCount(0);
        } catch (err) {
          console.error("Error marking as seen for requests:", err);
        }
      };
      markAsSeen();
    }
  }, [location.pathname]);

  //Notifications- Orders
  useEffect(() => {
    const fetchUnseenCount = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5170/api/orders/unseen-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setUnseenOrdersCount(data.count);
      } catch (err) {
        console.error("Error fetching unseen count for orders:", err);
      }
    };

    fetchUnseenCount();

    // Optional: Set up polling every 30 seconds
    const interval = setInterval(fetchUnseenCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unseen count on component mount
  useEffect(() => {
    if (location.pathname === "/orders") {
      const markAsSeen = async () => {
        const token = localStorage.getItem("token");
        try {
          await fetch("http://localhost:5170/api/orders/mark-seen", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          setUnseenOrdersCount(0);
        } catch (err) {
          console.error("Error marking as seen for orders:", err);
        }
      };
      markAsSeen();
    }
  }, [location.pathname]);

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "justify-evenly",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-[2px]",
          "data-[active=true]:after:bg-primary",
        ],
      }}
    >
      <NavbarContent className="basis-1/5 sm:basis-full gap-20" justify="start">
        <NavbarBrand className=" max-w-fit">
          <Link
            className="flex justify-start items-center gap-3"
            color="foreground"
            href="#"
          >
            <ImageLogo
              size={60}
              className="hover:scale-105 transition-transform items-center mx-10"
            />
          </Link>
        </NavbarBrand>

        <div className="flex relative h-full items-center gap-4">
          <NavbarItem isActive={location.pathname === "/carousel"}>
            <Link
              href="/carousel"
              className={`text-black ${location.pathname === "/carousel" ? "text-blue-600" : ""} montserrat`}
            >
              Carousel
            </Link>
          </NavbarItem>

          <NavbarItem isActive={location.pathname === "/components"}>
            <Link
              href="/components"
              className={`text-black ${location.pathname === "/components" ? "text-blue-600" : ""} montserrat`}
            >
              Components
            </Link>
          </NavbarItem>

          <NavbarItem
            isActive={
              location.pathname === "/repairs/steps" ||
              location.pathname === "/repairs/requests"
            }
          >
            <Dropdown>
              <DropdownTrigger>
                <Link
                  className={`montserrat cursor-pointer ${
                    location.pathname === "/repairs/steps" ||
                    location.pathname === "/repairs/requests"
                      ? "text-blue-600"
                      : "text-black"
                  }`}
                >
                  Repairs
                  {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-2 h-3 w-3 rounded-full bg-red-500"></span>
                  )}
                </Link>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Static Actions"
                color="primary"
                variant="bordered"
              >
                <DropdownItem key="steps" className="group text-center">
                  <Link
                    href="/repairs/steps"
                    className="text-black group-hover:text-blue-700"
                  >
                    Repair Steps
                  </Link>
                </DropdownItem>
                <DropdownItem
                  key="requests"
                  className="group text-center relative"
                >
                  <Link
                    href="/repairs/requests"
                    className="text-black group-hover:text-blue-700"
                    onPress={() => setUnseenCount(0)}
                  >
                    Repair Requests
                    {unseenCount > 0 && (
                      <span className="absolute -top-1 -right-3 h-3 w-3 rounded-full bg-red-500"></span>
                    )}
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>

          <NavbarItem isActive={location.pathname === "/customs/pre-built-pcs"}>
            <Link
              href="/customs/pre-built-pcs"
              className={`text-black ${location.pathname === "/customs/pre-built-pcs" ? "text-blue-600" : ""} montserrat`}
            >
              Pre Built PCs
            </Link>
          </NavbarItem>

          <NavbarItem isActive={location.pathname === "/orders"}>
            <Link
              href="/orders"
              className={`text-black ${location.pathname === "/orders" ? "text-blue-600" : ""} montserrat`}
            >
              Orders
              {unseenOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </Link>
          </NavbarItem>
          <NavbarItem isActive={location.pathname === "/users"}>
            <Link
              href="/users"
              className={`text-black ${location.pathname === "/users" ? "text-blue-600" : ""} montserrat`}
            >
              Users
            </Link>
          </NavbarItem>
          <NavbarItem isActive={location.pathname === "/faqs"}>
            <Link
              href="/faqs"
              className={`text-black ${location.pathname === "/faqs" ? "text-blue-600" : ""} montserrat`}
            >
              FAQs
            </Link>
          </NavbarItem>
        </div>

        <div className="flex relative h-full items-center gap-7">
          {/* <NavbarItem isActive={location.pathname === "/notifications"}>
            <Link
              href="/notifications"
              className={`text-black ${location.pathname === "/notifications" ? "text-blue-600" : ""} montserrat`}
            >
              <NotificationsButton notifications={0} />
            </Link>
          </NavbarItem> */}

          <NavbarItem isActive={location.pathname === "/logout"}>
            <Link
              href="/logout"
              className="text-red-600 montserrat flex items-center gap-2"
              onPress={(e) => {
                // e.preventDefault(); // Prevent default link behavior
                handleLogout(); // Call the logout function
              }}
            >
              Logout
              <svg
                className="w-4 h-4 text-red-600 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8h11m0 0-4-4m4 4-4 4m-5 3H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h3"
                />
              </svg>
            </Link>
          </NavbarItem>
        </div>
      </NavbarContent>
    </HeroUINavbar>
  );
};
