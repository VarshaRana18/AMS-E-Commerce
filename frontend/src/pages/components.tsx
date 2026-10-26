// import { useNavigate } from "react-router-dom";
// import DefaultLayout from "@/layouts/default";
// import ProductCard from "@/components/product-card";

// export default function ComponentsPage() {
//   const navigate = useNavigate();

//   const productList = [
//     {
//       title: "RAM",
//       img: "https://images.unsplash.com/photo-1542978709-19c95dc3bc7e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       href: "/components/ram",
//     },
//     {
//       title: "Graphics Card",
//       img: "https://images.unsplash.com/photo-1591489378430-ef2f4c626b35?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       href: "/components/graphics-card",
//     },
//     {
//       title: "Processor",
//       img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       href: "/components/processor",
//     },
//     {
//       title: "Keyboard",
//       img: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       href: "/components/keyboard",
//     },
//     {
//       title: "Monitor",
//       img: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       href: "/components/monitor",
//     },
//   ];

//   return (
//     <DefaultLayout>
//       <div className="container mx-auto px-4">
//         <ProductCard list={productList}/>
//       </div>
//     </DefaultLayout>
//   );
// }

import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";
import ProductCard from "@/components/product-card";

export default function ComponentsPage() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "AMS || Components";

    const fetchComponents = async () => {
      try {
        const response = await fetch("/api/components/categories"); // Adjust API endpoint

        if (!response.ok) {
          throw new Error("Failed to fetch components");
        }
        const data = await response.json();

        setProductList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4">
        <ProductCard list={productList} />
      </div>
    </DefaultLayout>
  );
}
