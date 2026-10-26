import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Image,
  Badge,
} from "@heroui/react";

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

interface UserCardProps {
  name: string;
  email: string;
  user_id: string;
  mobile?: number;
  isVerified?: boolean;
  image?: string;
  addresses?: Address[];
  cart?: Array<{
    _id: string;
    type: string;
    quantity: number;
  }>;
  wishlist?: Array<{
    _id: string;
    type: string;
  }>;
  totalCartItems?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  user_id,
  mobile,
  isVerified = false,
  image = "https://www.svgrepo.com/show/452030/avatar-default.svg",
  addresses = [],
  cart = [],
  wishlist = [],
  totalCartItems = 0,
}) => {
  return (
    <Card className="max-w-3xl shadow-md px-3 mx-2">
      {/* Header Section */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-6">
          <Image
            src={image}
            alt="Profile"
            className="h-20 w-20 rounded-full border-4 border-white shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-2xl font-bold text-gray-800 montserrat pl-3">
                {name}
              </h2>
              {isVerified && <Badge color="success" variant="dot" />}
            </div>
            <div className="flex flex-col pt-2">
              <span className="inline-flex items-center rounded-full px-3 font-medium text-purple-800  montserrat">
                {email}
              </span>
              <span className="inline-flex items-center rounded-full px-3 font-medium text-gray-600 montserrat">
                {mobile || "Not provided"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <CardBody className="px-6 py-3">
        <h3 className="text-lg font-semibold mb-3 montserrat">
          📍 Saved Addresses
        </h3>

        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border montserrat ${
                  address.isDefault
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {address.name}
                    </h4>
                    {address.isDefault && (
                      <Badge color="primary" size="sm">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.flat}, {address.area}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.landmark && `${address.landmark}, `}
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No addresses saved</p>
        )}

        {/* Stats Section */}
        <div className="px-6 py-3 border-b my-3">
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-sm text-gray-500 montserrat">Cart Items</p>
              <p className="text-lg font-semibold">🛒 {totalCartItems}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 montserrat">Wishlist</p>
              <p className="text-lg font-semibold">❤️ {wishlist.length}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserCard;
