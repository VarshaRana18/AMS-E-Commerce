import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-full">
      <Navbar />
      <main className="container mx-auto w-full xl:max-w-full 2xl:max-w-full px-3 flex-grow pt-2">
        {children}
      </main>
      <Footer />
    </div>
  );
}
