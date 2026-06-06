import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Navigation, Bike, Car, Phone, CheckCircle, IndianRupee, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bikeRentals } from '../data/travelData'; // Still use local for bikes since we didn't add a table for it yet
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const RideBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bike' ? 'bike' : 'shuttle';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { user } = useAuth();
  
  const [shuttleRoutes, setShuttleRoutes] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);

  // Booking State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Shuttle Form
  const [shuttleForm, setShuttleForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    time: '',
    seats: 1,
    date: new Date().toISOString().split('T')[0]
  });

  // Bike Form
  const [bikeForm, setBikeForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    days: 1,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchRides() {
      try {
        const { data, error } = await supabase.from('rides').select('*');
        if (error) throw error;
        // Transform data from snake_case to camelCase
        const mappedRides = data.map(r => ({
          id: r.id,
          from: r.from_location,
          to: r.to_location,
          distance: r.distance,
          price: r.price,
          vehicleType: r.vehicle_type,
          departureTimes: r.departure_times || ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'],
          totalSeats: r.total_seats,
          icon: r.icon
        }));
        setShuttleRoutes(mappedRides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoadingRides(false);
      }
    }
    fetchRides();
  }, []);

  const handleBookShuttle = (route) => {
    setSelectedItem(route);
    setShuttleForm(prev => ({ ...prev, time: route.departureTimes[0] }));
  };

  const handleRentBike = (bike) => {
    setSelectedItem(bike);
  };

  const submitShuttleBooking = () => {
    if (!shuttleForm.name || !shuttleForm.phone || !shuttleForm.time) {
      alert("Please fill all fields.");
      return;
    }
    // In a real app we'd push this to a 'bookings' table in Supabase
    setIsSuccess(true);
  };

  const submitBikeRental = () => {
    if (!bikeForm.name || !bikeForm.phone) {
      alert("Please fill all fields.");
      return;
    }
    setIsSuccess(true);
  };

  const resetBooking = () => {
    setSelectedItem(null);
    setIsSuccess(false);
  };

  // Success Screen
  if (isSuccess && selectedItem) {
    const isShuttle = !!selectedItem.from;
    const total = isShuttle ? selectedItem.price * shuttleForm.seats : selectedItem.pricePerDay * bikeForm.days;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h1>
        
        <div className="bg-gray-50 rounded-2xl p-4 w-full my-6 text-left border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">{selectedItem.name || `${selectedItem.from} to ${selectedItem.to}`}</h3>
          
          {isShuttle ? (
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">Date:</span> {shuttleForm.date}</p>
              <p><span className="font-medium text-gray-800">Time:</span> {shuttleForm.time}</p>
              <p><span className="font-medium text-gray-800">Seats:</span> {shuttleForm.seats}</p>
              <p><span className="font-medium text-gray-800">Vehicle:</span> {selectedItem.vehicleType}</p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">Start Date:</span> {bikeForm.startDate}</p>
              <p><span className="font-medium text-gray-800">Duration:</span> {bikeForm.days} {bikeForm.days === 1 ? 'Day' : 'Days'}</p>
              <p><span className="font-medium text-gray-800">Deposit:</span> ₹{selectedItem.deposit} (Refundable)</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold">
            <span>Total to Pay:</span>
            <span className="text-teal-600">₹{total}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-8">Please pay cash directly to the driver/owner.</p>
        
        <button 
          onClick={resetBooking}
          className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-md mb-3"
        >
          Book Another
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full text-teal-600 font-bold py-3"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Booking Modal
  if (selectedItem) {
    const isShuttle = !!selectedItem.from;
    
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center border-b border-gray-100 shadow-sm">
          <button onClick={resetBooking} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{isShuttle ? 'Book Seat' : 'Rent Bike'}</h1>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="font-bold text-lg mb-4 text-teal-700">
              {isShuttle ? `${selectedItem.from} ➔ ${selectedItem.to}` : selectedItem.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name</label>
                <input 
                  type="text" 
                  value={isShuttle ? shuttleForm.name : bikeForm.name}
                  onChange={(e) => isShuttle ? setShuttleForm({...shuttleForm, name: e.target.value}) : setBikeForm({...bikeForm, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500" 
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={isShuttle ? shuttleForm.phone : bikeForm.phone}
                  onChange={(e) => isShuttle ? setShuttleForm({...shuttleForm, phone: e.target.value}) : setBikeForm({...bikeForm, phone: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500" 
                  placeholder="Phone"
                />
              </div>

              {isShuttle ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={shuttleForm.date}
                      onChange={(e) => setShuttleForm({...shuttleForm, date: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.departureTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => setShuttleForm({...shuttleForm, time})}
                          className={`px-3 py-2 rounded-lg text-sm border ${shuttleForm.time === time ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setShuttleForm({...shuttleForm, seats: Math.max(1, shuttleForm.seats - 1)})}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                      >-</button>
                      <span className="text-xl font-bold w-6 text-center">{shuttleForm.seats}</span>
                      <button 
                        onClick={() => setShuttleForm({...shuttleForm, seats: Math.min(4, shuttleForm.seats + 1)})}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                      >+</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={bikeForm.startDate}
                      onChange={(e) => setBikeForm({...bikeForm, startDate: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setBikeForm({...bikeForm, days: Math.max(1, bikeForm.days - 1)})}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                      >-</button>
                      <span className="text-xl font-bold w-6 text-center">{bikeForm.days}</span>
                      <button 
                        onClick={() => setBikeForm({...bikeForm, days: bikeForm.days + 1})}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                      >+</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 mb-6">
            <div className="flex justify-between items-center text-lg font-bold text-teal-800">
              <span>Total Fare</span>
              <span>₹{isShuttle ? selectedItem.price * shuttleForm.seats : selectedItem.pricePerDay * bikeForm.days}</span>
            </div>
            {!isShuttle && (
              <p className="text-xs text-teal-600 mt-1">* Plus refundable deposit of ₹{selectedItem.deposit} to be paid on pickup.</p>
            )}
          </div>

          <button 
            onClick={isShuttle ? submitShuttleBooking : submitBikeRental}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-teal-700 transition-colors"
          >
            Confirm Booking — ₹{isShuttle ? selectedItem.price * shuttleForm.seats : selectedItem.pricePerDay * bikeForm.days}
          </button>
        </div>
      </div>
    );
  }

  // Main Listings
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-10 px-4 pt-4 border-b border-gray-100 shadow-sm">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Travel & Rides</h1>
        </div>
        
        <div className="flex">
          <button 
            onClick={() => setActiveTab('shuttle')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'shuttle' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            Town Shuttle 🛺
          </button>
          <button 
            onClick={() => setActiveTab('bike')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bike' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            Rent a Bike 🏍️
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'shuttle' && (
          <div className="space-y-4">
            {loadingRides ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              </div>
            ) : shuttleRoutes.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No shuttle routes available.
              </div>
            ) : shuttleRoutes.map(route => (
              <div key={route.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{route.icon}</span>
                    <div>
                      <div className="flex items-center font-bold text-gray-800 text-lg">
                        {route.from} <ArrowRight className="w-4 h-4 mx-2 text-gray-400" /> {route.to}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Navigation className="w-3 h-3 mr-1" /> {route.distance} • {route.vehicleType}
                      </div>
                    </div>
                  </div>
                  <div className="bg-teal-50 text-teal-700 font-bold px-2 py-1 rounded-lg text-sm border border-teal-100">
                    ₹{route.price}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 flex items-center"><Clock className="w-3 h-3 mr-1"/> Departure Times</p>
                  <div className="flex flex-wrap gap-2">
                    {route.departureTimes.map(time => (
                      <span key={time} className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-200">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleBookShuttle(route)}
                  className="w-full bg-white text-teal-600 font-bold py-2.5 rounded-xl border-2 border-teal-500 hover:bg-teal-50 transition-colors"
                >
                  Book Seat
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bike' && (
          <div className="space-y-4">
            {bikeRentals.map(bike => (
              <div key={bike.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-4xl mr-3 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center">{bike.image}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{bike.name}</h3>
                      <div className="text-xs text-gray-500 flex items-center mt-1 gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{bike.type}</span>
                        <span className="flex items-center"><Car className="w-3 h-3 mr-1"/> {bike.fuelType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">Rent / Day</p>
                    <p className="font-bold text-teal-600 text-lg">₹{bike.pricePerDay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Deposit</p>
                    <p className="font-medium text-gray-800">₹{bike.deposit}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleRentBike(bike)}
                  disabled={!bike.available}
                  className={`w-full font-bold py-3 rounded-xl transition-colors ${bike.available ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {bike.available ? 'Rent Now' : 'Currently Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Also adding a mock ArrowRight component inline for the shuttle routes
const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default RideBookingPage;
