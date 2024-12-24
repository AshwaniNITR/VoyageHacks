import Caraosal from "./components/Caraosal";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import PaginatedHotels from "@/components/frontend";

export default function Home() {
  return (
    <>
    <div>
      <Navbar/>
      <Hero/>
      <Caraosal/>
      <PaginatedHotels/>
    </div>
    </>
  );
}
