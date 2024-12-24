"use client";
import { useEffect, useState, useRef } from "react";

interface Hotel {
  _id: string;
  Hotel_Name: string;
  Hotel_Rating: number;
  City: string;
  Feature_1: string;
  Feature_2: string;
  Feature_3: string;
  Feature_4: string;
  Feature_5: string;
  Feature_6: string;
  Feature_7: string;
  Feature_8: string;
  Feature_9: string;
  Hotel_Price: number;
}

const PaginatedHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]); // All hotels from API
  const [visibleHotels, setVisibleHotels] = useState<Hotel[]>([]); // Hotels currently displayed
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const HOTELS_PER_PAGE = 10; // Number of hotels to display per scroll
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Tracks the current index

  const [searchFilters, setSearchFilters] = useState({
    hotelName: "",
    hotelCity: "",
    minPrice: 0,
    maxPrice: 0,
  });

  // Fetch the hotel data from the backend using the 'fetch-data' route
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch("/api/fetch-data"); // Updated route for fetching hotels
        if (!response.ok) {
          throw new Error("Failed to fetch hotel data");
        }
        const data: Hotel[] = await response.json();
        setHotels(data);
        setVisibleHotels(data.slice(0, HOTELS_PER_PAGE)); // Initially show the first batch
        setCurrentIndex(HOTELS_PER_PAGE); // Set current index for next batch
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Apply filters to the hotel data
  const applyFilters = async () => {
    const filterParams: { [key: string]: string | number } = {};

    if (searchFilters.hotelName) {
      filterParams.hotelName = searchFilters.hotelName;
    }

    if (searchFilters.hotelCity) {
      filterParams.hotelCity = searchFilters.hotelCity;
    }

    if (searchFilters.minPrice && searchFilters.maxPrice) {
      filterParams.minPrice = searchFilters.minPrice;
      filterParams.maxPrice = searchFilters.maxPrice;
    }

    setLoading(true);

    try {
      // Create a new URLSearchParams object from filterParams
      const queryString = new URLSearchParams(filterParams as Record<string, string>).toString();

      const response = await fetch(
        queryString ? `/api/fetch-data?${queryString}` : `/api/fetch-data` // Updated API route
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered hotel data");
      }

      const data: Hotel[] = await response.json();
      setHotels(data); // Update the hotels with filtered data
      setVisibleHotels(data.slice(0, HOTELS_PER_PAGE)); // Show the first batch
      setCurrentIndex(HOTELS_PER_PAGE); // Reset pagination
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Use Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreHotels(); // Load next batch of hotels when the div is visible
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [observerRef.current, currentIndex]);

  // Load more hotels function
  const loadMoreHotels = () => {
    if (hotels.length > currentIndex) {
      const nextBatch = hotels.slice(currentIndex, currentIndex + HOTELS_PER_PAGE);
      setVisibleHotels((prevHotels) => [...prevHotels, ...nextBatch]);
      setCurrentIndex(currentIndex + HOTELS_PER_PAGE);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(); // Apply the filters on search
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-center mb-4">Paginated Hotels</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            name="hotelName"
            placeholder="Search by Hotel Name"
            value={searchFilters.hotelName}
            onChange={handleSearchChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="hotelCity"
            placeholder="Search by City"
            value={searchFilters.hotelCity}
            onChange={handleSearchChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={searchFilters.minPrice}
            onChange={handlePriceChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={searchFilters.maxPrice}
            onChange={handlePriceChange}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {visibleHotels.map((hotel, index) => (
          <div key={index} className="border border-gray-400 p-4 rounded shadow">
            <h2 className="text-lg font-bold">{hotel.Hotel_Name}</h2>
            <p>Rating: {hotel.Hotel_Rating}</p>
            <p>City: {hotel.City}</p>
            <p>Price: ₹{hotel.Hotel_Price}</p>
            <p>
              Features: {hotel.Feature_1}, {hotel.Feature_2}, {hotel.Feature_3},{" "}
              {hotel.Feature_4}, {hotel.Feature_5}, {hotel.Feature_6},{" "}
              {hotel.Feature_7}, {hotel.Feature_8}, {hotel.Feature_9}
            </p>
          </div>
        ))}
      </div>

      {/* Hidden div for Intersection Observer */}
      <div ref={observerRef} className="h-10"></div>
    </div>
  );
};

export default PaginatedHotels;
