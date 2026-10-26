import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import SearchBar from "@/components/search-bar";
import { Button } from "@heroui/button";

interface OwnCustomPCOrder {
  _id: string;
  user_id: string;
  username?: string; // For Username from User model.
  status: string;
  date_of_order: string;
  price: number;
  motherboard: { name: string };
  processor: { name: string };
  graphicsCard: { name: string };
  ram: { name: string };
  storageDevice: { name: string };
  powerSupply: { name: string };
  coolingSystem: { name: string };
  cabinet: { name: string };
}

export default function DocsPage() {
  const [orders, setOrders] = useState<OwnCustomPCOrder[]>([]);

  // State for status and total charge
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [charges, setCharges] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5170/api/customs/own-custom-pcs",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(data);

          // Initialize statuses and charges
          const initialStatuses: { [key: string]: string } = {};
          const initialCharges: { [key: string]: string } = {};
          data.forEach((order: OwnCustomPCOrder) => {
            initialStatuses[order._id] = order.status;
            initialCharges[order._id] = `₹${order.price}`;
          });
          setStatuses(initialStatuses);
          setCharges(initialCharges);
        }
      } catch (error) {
        console.error("Error fetching pre-built PCs:", error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const handleSaveStatus = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5170/api/customs/own-custom-pcs/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: statuses[orderId] }),
        }
      );

      if (response.ok) {
        console.log("Status updated successfully");
        // Optionally, refetch orders to update the UI
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSaveCharge = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5170/api/customs/own-custom-pcs/${orderId}/charge`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalCharge: charges[orderId] }),
        }
      );

      if (response.ok) {
        console.log("Total charge updated successfully");
        // Optionally, refetch orders to update the UI
      } else {
        console.error("Failed to update total charge");
      }
    } catch (error) {
      console.error("Error updating total charge:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        <div className="w-full max-w-6xl mx-auto mb-5">
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
          {orders.map((order, index) => (
            <div
              key={index}
              className="p-6 border border-gray-300 shadow-lg rounded-xl bg-white text-center"
            >
              <div className="mb-4 flex justify-around">
                <div>
                  <h4 className="text-lg">
                    <b>User Name:</b> {order.username || "Unknown"}
                  </h4>
                </div>
                <div>
                  <h4 className="text-lg">
                    <b>Order Date:</b>{" "}
                    {new Date(order.date_of_order).toLocaleDateString()}
                  </h4>
                </div>
              </div>

              <div className="text-left border-t border-gray-200 pt-4 flex justify-around">
                <ul className="space-y-2 px-3">
                  <li>
                    <b>Motherboard:</b> {order.motherboard.name}
                  </li>
                  <li>
                    <b>Processor:</b> {order.processor.name}
                  </li>
                  <li>
                    <b>Graphics Card:</b> {order.graphicsCard.name}
                  </li>
                  <li>
                    <b>RAM:</b> {order.ram.name}
                  </li>
                  <li>
                    <b>Storage Device:</b> {order.storageDevice.name}
                  </li>
                  <li>
                    <b>Power Supply:</b> {order.powerSupply.name}
                  </li>
                  <li>
                    <b>Cooling System:</b> {order.coolingSystem.name}
                  </li>
                  <li>
                    <b>Cabinet:</b> {order.cabinet.name}
                  </li>
                </ul>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col justify-between items-center gap-2">
                <div className="flex items-between justify-evenly space-x-2">
                  <h5 className="text-lg">
                    <b>Status</b>
                  </h5>
                  <input
                    type="text"
                    value={statuses[order._id] || ""}
                    onChange={(e) =>
                      setStatuses({ ...statuses, [order._id]: e.target.value })
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-center"
                  />
                  <Button
                    onPress={() => handleSaveStatus(order._id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    Save Status
                  </Button>
                </div>
                <div className="flex items-between justify-evenly space-x-2">
                  <h5 className="text-lg">
                    <b>Total Charge</b>
                  </h5>
                  <input
                    type="text"
                    value={charges[order._id] || ""}
                    onChange={(e) =>
                      setCharges({ ...charges, [order._id]: e.target.value })
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-center"
                  />
                  <Button
                    onPress={() => handleSaveCharge(order._id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    Save Charge
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
