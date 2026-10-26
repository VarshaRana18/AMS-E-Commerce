import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import UserCard from "@/components/user-card";
import { useSession } from "@/hooks/useSession";

interface CartItem {
  _id: string;
  type: string;
  quantity: number;
}

interface WishlistItem {
  _id: string;
  type: string;
}

interface Address {
  name: string;
  phoneNumber: string;
  pincode: string;
  flat: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: number;
  isVerified: boolean;
  image: string;
  cart: CartItem[];
  wishlist: WishlistItem[];
  addresses: Address[];
  totalCartItems: number; // Virtual property
  // createdAt: Date | string;
  // updatedAt: Date | string;
}

export default function DocsPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5170/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        alert("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center ">
        <div className="gap-10 max-w-6xl text-center grid grid-cols-1 lg:grid-cols-2 ">
          {users.map((user, index) => (
            <UserCard
              key={index}
              name={user.name}
              email={user.email}
              user_id={user._id}
              mobile={user.mobile}
              isVerified={user.isVerified}
              image={user.image}
              addresses={user.addresses}
              cart={user.cart}
              wishlist={user.wishlist}
              totalCartItems={user.totalCartItems}
            />
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
