import React, { useState, useEffect } from 'react';

// The Google Apps Script Web app URL to fetch driver data from your Google Sheet.
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwXMRH2IWQNAEGrFf8s_q6ahe08y-a32DEpSZAqbFuIgeL4u7TR_drVRHi95GKGc4ug7Q/exec';

export default function App() {
  const [carNumberInput, setCarNumberInput] = useState('');
  const [driverData, setDriverData] = useState(null);
  const [driverStats, setDriverStats] = useState('');
  const [allDrivers, setAllDrivers] = useState([]); // State to store all drivers fetched from sheet
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [error, setError] = useState(null); // Error state for data fetch

  // Effect to fetch all driver data from Google Sheet API when component mounts
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const response = await fetch(GOOGLE_SHEET_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        setAllDrivers(data);
      } catch (e) {
        console.error("Failed to fetch driver data:", e);
        setError("Failed to load driver data. Please check the Apps Script deployment and URL.");
      } finally {
        setLoading(false);
      }
    };

    // Ensure the URL is set before attempting to fetch
    if (GOOGLE_SHEET_API_URL && GOOGLE_SHEET_API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
      fetchDrivers();
    } else {
      setError("Please set the GOOGLE_SHEET_API_URL in the code to your Apps Script Web app URL.");
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Effect to update driver data and stats when carNumberInput or allDrivers changes
  useEffect(() => {
    if (carNumberInput.trim() === '' || allDrivers.length === 0) {
      setDriverData(null);
      setDriverStats('');
      return;
    }

    // Find the driver in the fetched allDrivers array
    const foundDriver = allDrivers.find(
      (driver) => driver.carNumber === carNumberInput.trim()
    );

    setDriverData(foundDriver);

    // Set driver stats if driver is found
    if (foundDriver) {
      setDriverStats(foundDriver.stats || 'No specific stats available for this driver.');
    } else {
      setDriverStats('Driver not found. Please check the car number.');
    }
  }, [carNumberInput, allDrivers]); // Dependencies: carNumberInput and allDrivers

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 font-inter flex items-center justify-center">
        <p className="text-2xl text-gray-400">Loading driver data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 font-inter flex items-center justify-center">
        <p className="text-2xl text-red-500 text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 font-inter p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-10 border border-gray-700">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-red-500 mb-8 tracking-tight">
          URC Announcing Dashboard
        </h1>

        {/* Car Number Input */}
        <div className="mb-8">
          <label htmlFor="carNumber" className="block text-xl sm:text-2xl font-semibold text-gray-300 mb-3">
            Enter Car Number:
          </label>
          <input
            type="text"
            id="carNumber"
            value={carNumberInput}
            onChange={(e) => setCarNumberInput(e.target.value)}
            placeholder="e.g., 24"
            className="w-full p-4 text-3xl sm:text-4xl font-bold text-red-500 bg-gray-900 border border-red-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-600 focus:border-transparent transition duration-300 ease-in-out"
            autoFocus
          />
        </div>

        {/* Driver Information Card */}
        {driverData ? (
          <div className="bg-gray-700 rounded-lg p-6 sm:p-8 mb-8 shadow-inner border border-gray-600">
            <h2 className="text-3xl sm:text-4xl font-bold text-red-400 mb-5 text-center">
              Driver Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg sm:text-xl">
              {/* Display order matches your request */}
              <p><span className="font-semibold text-gray-300">Hometown:</span> {driverData.hometown}</p>
              <p><span className="font-semibold text-gray-300">Car Owner:</span> {driverData.carOwner}</p>
              <p><span className="font-semibold text-gray-300">Sponsors:</span> {driverData.sponsors}</p>
              <p><span className="font-semibold text-gray-300">Engine:</span> {driverData.engineManufacture}</p>
              <p><span className="font-semibold text-gray-300">Chassis:</span> {driverData.chassisManufacture}</p>
              <p><span className="font-semibold text-gray-300">Car Number:</span> <span className="text-red-300">{driverData.carNumber}</span></p>
              <p><span className="font-semibold text-gray-300">Nickname:</span> "{driverData.nickname}"</p>
              <p><span className="font-semibold text-gray-300">Name:</span> {driverData.name}</p>
            </div>
          </div>
        ) : carNumberInput.trim() !== '' ? (
          <div className="bg-gray-700 rounded-lg p-6 sm:p-8 mb-8 text-center text-red-300 text-xl sm:text-2xl font-semibold">
            Driver not found for car number "{carNumberInput}".
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-6 sm:p-8 mb-8 text-center text-gray-400 text-xl sm:text-2xl font-semibold">
            Enter a car number above to see driver details.
          </div>
        )}

        {/* Driver Stats Section */}
        <div className="bg-gray-700 rounded-lg p-6 sm:p-8 shadow-inner border border-gray-600">
          <h2 className="text-3xl sm:text-4xl font-bold text-red-400 mb-5 text-center">
            Driver Stats
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-gray-200 whitespace-pre-wrap">
            {driverStats || "Driver stats will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}
