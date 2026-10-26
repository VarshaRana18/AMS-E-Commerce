import React from "react";
import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
} from "@heroui/react";
import { signOut } from "firebase/auth";
import { addToast } from "@heroui/toast";

import { auth } from "../firebase.config";

import { ImageLogo } from "./ImageLogo";
// Custom Styling !!! Added Manually !!
import CartButton from "./cart-button";
import Login from "./login";

import { useAuth } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { currentUser }: any = useAuth();
  const [isMenuOpen] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData]: any = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      setIsLoading(true);
      fetch(`/api/auth/user/${currentUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentUser]);

  // Function to check if the current path starts with the item's href
  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    } else {
      return location.pathname.startsWith(href);
    }
  };

  return (
    <HeroUINavbar isBlurred={false} maxWidth="full" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <ImageLogo
              className="hover:scale-105 transition-transform items-center"
              size={55}
            />
          </Link>
        </NavbarBrand>
        <div className="hidden sm:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  isActive(item.href) && "text-blue-500 font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {currentUser ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <User
                    as="button"
                    avatarProps={{
                      isBordered: true,
                      src: isLoading ? undefined : userData?.image,
                    }}
                    className="transition-transform"
                    description={isLoading ? "" : currentUser.email}
                    name={isLoading ? "Loading..." : userData?.name}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{currentUser.email}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="view_profile"
                    onPress={() => navigate("/profile")}
                  >
                    View Profile
                  </DropdownItem>
                  <DropdownItem
                    key="your_wishlist"
                    onPress={() => navigate("/wishlist")}
                  >
                    Your Wishlist
                  </DropdownItem>
                  <DropdownItem
                    key="your_cart"
                    onPress={() => navigate("/cart")}
                  >
                    Your Cart
                  </DropdownItem>
                  <DropdownItem
                    key="your_orders"
                    onPress={() => navigate("/orders")}
                  >
                    Your Orders
                  </DropdownItem>
                  <DropdownItem
                    key="contact_us"
                    onPress={() => navigate("/contactUs")}
                  >
                    Contact Us
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={async () => {
                      await signOut(auth);
                      addToast({
                        title: "Goodbye!",
                        description: "You have been logged out successfully",
                        timeout: 3000,
                        color: "danger",
                      });

                      setTimeout(() => {
                        window.location.href = "/";
                      }, 3000);
                    }}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
            <NavbarItem>
              <CartButton itemCount={userData?.totalCartItems} />
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Login placement={"top-center"} />
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>

      <NavbarMenu className="">
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {currentUser ? (
            <>
              <div className="flex justify-start">
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: isLoading ? undefined : userData?.image,
                  }}
                  className="transition-transform"
                  description={isLoading ? "" : currentUser.email}
                  name={
                    isLoading
                      ? "Loading..."
                      : userData?.name || currentUser.email
                  }
                />
              </div>

              <NavbarMenuItem>
                <Link
                  className={isActive("/") ? "text-blue-500 font-medium" : ""}
                  color={isActive("/") ? "primary" : "foreground"}
                  href="/"
                  size="lg"
                >
                  Home
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/components") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/components") ? "primary" : "foreground"}
                  href="/components"
                  size="lg"
                >
                  Components
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/repairs") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/repairs") ? "primary" : "foreground"}
                  href="/repairs"
                  size="lg"
                >
                  Repairs
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/custom-pc") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/custom-pc") ? "primary" : "foreground"}
                  href="/custom-pc"
                  size="lg"
                >
                  Custom PC
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/profile") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/profile") ? "primary" : "foreground"}
                  href="/profile"
                  size="lg"
                >
                  View Profile
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/wishlist") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/wishlist") ? "primary" : "foreground"}
                  href="/wishlist"
                  size="lg"
                >
                  Your Wishlist
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/cart") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/cart") ? "primary" : "foreground"}
                  href="/cart"
                  size="lg"
                >
                  Your Cart
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/orders") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/orders") ? "primary" : "foreground"}
                  href="/orders"
                  size="lg"
                >
                  Your Orders
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/contactUs") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/contactUs") ? "primary" : "foreground"}
                  href="/contactUs"
                  size="lg"
                >
                  Contact Us
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  color="danger"
                  href="#"
                  size="lg"
                  onClick={async () => {
                    await signOut(auth);
                    addToast({
                      title: "Goodbye!",
                      description: "You have been logged out successfully",
                      timeout: 3000,
                      color: "danger",
                    });
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 3000);
                  }}
                >
                  Logout
                </Link>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <Link
                  className={isActive("/") ? "text-blue-500 font-medium" : ""}
                  color={isActive("/") ? "primary" : "foreground"}
                  href="/"
                  size="lg"
                >
                  Home
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/components") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/components") ? "primary" : "foreground"}
                  href="/components"
                  size="lg"
                >
                  Components
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/repairs") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/repairs") ? "primary" : "foreground"}
                  href="/repairs"
                  size="lg"
                >
                  Repairs
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className={
                    isActive("/custom-pc") ? "text-blue-500 font-medium" : ""
                  }
                  color={isActive("/custom-pc") ? "primary" : "foreground"}
                  href="/custom-pc"
                  size="lg"
                >
                  Custom PC
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
        {!currentUser && (
          <Login
            isOpen={showLoginModal}
            placement={"bottom"}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
