import React, { useState, useEffect, useRef } from 'react'; // Import useRef

// IMPORTANT: Only URC Sprints and Selinsgrove Ford Super Late Models are included now.
// Divisions are now sorted alphabetically by name.
const DIVISION_APIS = [
  { name: 'Select Division', url: '' }, // Default/placeholder option
  { name: 'High Caliber Cranes 410 Sprints', url: 'https://script.google.com/macros/s/AKfycbwtFukui0WBu5iGU7B1HHFe0ynchWY3U60rPyf3RW5vcI2RUk7hhcc2TX4U6oTu1OED/exec' }, // High Caliber Cranes 410 Sprints URL
  { name: 'Selinsgrove Ford Super Late Models', url: 'https://script.google.com/macros/s/AKfycby8fw5zKhssIivdid0awDEq7HY5cZaDww80aozWncSQpFa11I4ShMS6ZHtzmrXMMJf6vQ/exec' }, // Selinsgrove Ford Super Late Models URL
  { name: 'URC Sprints', url: 'https://script.google.com/macros/s/AKfycbwXMRH2IWQNAEGrFf8s_q6ahe08y-a32DEpSZAqbFuIgeL4u7TR_drVRHi95GKGc4ug7Q/exec' }, // Your existing URC URL
].sort((a, b) => {
  if (a.name === 'Select Division') return -1; // Keep 'Select Division' at the top
  if (b.name === 'Select Division') return 1;
  return a.name.localeCompare(b.name);
});

export default function App() {
  const [selectedDivisionUrl, setSelectedDivisionUrl] = useState(''); // Stores the URL of the selected division
  const [carNumberInput, setCarNumberInput] = useState('');
  const [driverData, setDriverData] = useState(null);
  const [driverStats, setDriverStats] = useState('');
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(false); // Initial loading is false until a division is selected
  const [error, setError] = useState(null);

  // Create a ref for the entire driver information section (details + stats)
  const driverInfoSectionRef = useRef(null);

  // Effect to fetch driver data when selectedDivisionUrl changes
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!selectedDivisionUrl) {
        setAllDrivers([]);
        setDriverData(null);
        setDriverStats('');
        setLoading(false);
        setError(null);
        return; // Don't fetch if no division is selected
      }

      // This check is less critical now that placeholders are removed, but good for robustness.
      if (selectedDivisionUrl.includes('PLEASE_REPLACE_WITH_')) {
          setError("Please select a valid division. The API URL for this division is still a placeholder.");
          setLoading(false);
          setAllDrivers([]);
          setDriverData(null);
          setDriverStats('');
          return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(selectedDivisionUrl);
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
        setError(`Failed to load driver data for this division. Error: ${e.message}. Please check the Apps Script deployment and URL.`);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [selectedDivisionUrl]); // Re-run this effect whenever the selected division URL changes

  // Effect to update driver data and stats when carNumberInput or allDrivers changes
  useEffect(() => {
    if (carNumberInput.trim() === '' || allDrivers.length === 0) {
      setDriverData(null);
      setDriverStats('');
      return;
    }

    // Convert both the input and the driver's car number to lowercase for case-insensitive comparison
    const searchCarNumber = carNumberInput.trim().toLowerCase();
    const foundDriver = allDrivers.find(
      (driver) => String(driver.carNumber).toLowerCase() === searchCarNumber
    );

    setDriverData(foundDriver);
    if (foundDriver) {
      setDriverStats(foundDriver.stats || 'No specific stats available for this driver.');
      // Scroll to the entire driver information section when data is found
      if (driverInfoSectionRef.current) {
        driverInfoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setDriverStats('Driver not found. Please check the car number.');
    }
  }, [carNumberInput, allDrivers]);

  const handleDivisionChange = (event) => {
    setSelectedDivisionUrl(event.target.value);
    setCarNumberInput(''); // Clear car number input when division changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black font-inter p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-10 border-2 border-red-700 text-center">
        {/* URC Logo has been removed from here */}

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 tracking-tight bg-red-700 py-3 px-6 rounded-lg shadow-lg mx-auto max-w-fit">
          Announcing Dashboard
        </h1>

        {/* Division Selector */}
        <div className="mb-8 max-w-md mx-auto p-4 bg-blue-900 rounded-lg shadow-inner border border-blue-700">
          <label htmlFor="division-select" className="block text-xl sm:text-2xl font-semibold text-white mb-3">
            Select Division:
          </label>
          <select
            id="division-select"
            value={selectedDivisionUrl}
            onChange={handleDivisionChange}
            className="w-full p-3 text-xl sm:text-2xl font-bold text-yellow-400 bg-gray-950 border border-yellow-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-600 focus:border-transparent transition duration-300 ease-in-out cursor-pointer"
          >
            {DIVISION_APIS.map((division) => (
              <option key={division.name} value={division.url}>
                {division.name}
              </option>
            ))}
          </select>
        </div>

        {/* Car Number Input */}
        <div className="mb-8 max-w-md mx-auto p-4 bg-blue-900 rounded-lg shadow-inner border border-blue-700">
          <label htmlFor="carNumber" className="block text-xl sm:text-2xl font-semibold text-white mb-3">
            Enter Car Number:
          </label>
          <input
            type="text"
            id="carNumber"
            value={carNumberInput}
            onChange={(e) => setCarNumberInput(e.target.value)}
            placeholder="e.g., 24"
            className="w-full p-4 text-3xl sm:text-4xl font-bold text-yellow-400 bg-gray-950 border border-yellow-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-600 focus:border-transparent transition duration-300 ease-in-out"
            autoFocus
          />
        </div>

        {/* Loading/Error/No Division Selected States */}
        {loading && (
          <div className="bg-blue-900 rounded-lg p-6 sm:p-8 mb-8 text-center text-white text-xl sm:text-2xl font-semibold border border-blue-700 shadow-inner">
            Loading driver data...
          </div>
        )}
        {error && !loading && (
          <div className="bg-blue-900 rounded-lg p-6 sm:p-8 mb-8 text-center text-red-500 text-xl sm:text-2xl font-semibold border border-blue-700 shadow-inner">
            {error}
          </div>
        )}
        {!selectedDivisionUrl && !loading && !error && (
            <div className="bg-blue-900 rounded-lg p-6 sm:p-8 mb-8 text-center text-white text-xl sm:text-2xl font-semibold border border-blue-700 shadow-inner">
                Please select a division from the dropdown above.
            </div>
        )}

        {/* New wrapper div for both Driver Details and Driver Stats */}
        {driverData && !loading && !error && selectedDivisionUrl && (
          <div ref={driverInfoSectionRef}> {/* Apply the ref to this new wrapper */}
            {/* Driver Information Card */}
            <div className="bg-blue-900 rounded-lg p-6 sm:p-8 mb-8 shadow-inner border border-blue-700 text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 text-center bg-red-700 py-2 rounded-md shadow-md">
                Driver Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg sm:text-xl text-white">
                <p><span className="font-semibold text-gray-300">Hometown:</span> {driverData.hometown}</p>
                <p><span className="font-semibold text-gray-300">Car Owner:</span> {driverData.carOwner}</p>
                <p><span className="font-semibold text-gray-300">Sponsors:</span> {driverData.sponsors}</p>
                <p><span className="font-semibold text-gray-300">Engine:</span> {driverData.engineManufacture}</p>
                <p><span className="font-semibold text-gray-300">Chassis:</span> {driverData.chassisManufacture}</p>
                <p><span className="font-semibold text-gray-300">Car Number:</span> <span className="text-yellow-400">{driverData.carNumber}</span></p>
                <p><span className="font-semibold text-gray-300">Nickname:</span> "{driverData.nickname}"</p>
                <p><span className="font-semibold text-gray-300">Name:</span> {driverData.name}</p>
              </div>
            </div>

            {/* Driver Stats Section */}
            <div className="bg-blue-900 rounded-lg p-6 sm:p-8 shadow-inner border border-blue-700 text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 text-center bg-red-700 py-2 rounded-md shadow-md">
                Driver Stats
              </h2>
              <p className="text-lg sm:text-xl leading-relaxed text-white whitespace-pre-wrap">
                {driverStats || "No specific stats available for this driver."}
              </p>
            </div>
          </div>
        )}

        {/* Message when car number is entered but driver not found in selected division */}
        {selectedDivisionUrl && !loading && !error && carNumberInput.trim() !== '' && !driverData && (
            <div className="bg-blue-900 rounded-lg p-6 sm:p-8 mb-8 text-center text-yellow-400 text-xl sm:text-2xl font-semibold border border-blue-700 shadow-inner">
                Driver not found for car number "{carNumberInput}" in the selected division.
            </div>
        )}

      </div>
    </div>
  );
}
