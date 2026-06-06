import React, { useState, useEffect } from 'react';
import { ArrowLeft, Car, CheckCircle, Loader2, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export default function RideBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Phase: 'input' -> 'searching' -> 'accepted'
  const [phase, setPhase] = useState('input');
  
  // Form Data
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [proposedFare, setProposedFare] = useState('');
  
  const [bookingId, setBookingId] = useState(null);
  const [bids, setBids] = useState([]);
  const [acceptedDriver, setAcceptedDriver] = useState(null);
  const [loading, setLoading] = useState(false);

  // Free Translation API (English to Hindi)
  const translateToHindi = async (text) => {
    if (!text) return '';
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`);
      const data = await res.json();
      return data.responseData?.translatedText || text;
    } catch (e) {
      console.error("Translation error", e);
      return text;
    }
  };

  const requestRide = async () => {
    if (!fromLoc || !toLoc || !proposedFare) return alert('Please fill in all fields.');
    setLoading(true);
    
    try {
      // Fetch Hindi translations for driver convenience
      const fromHi = await translateToHindi(fromLoc);
      const toHi = await translateToHindi(toLoc);

      const formattedFrom = fromHi !== fromLoc ? `${fromLoc} (${fromHi})` : fromLoc;
      const formattedTo = toHi !== toLoc ? `${toLoc} (${toHi})` : toLoc;

      const { data, error } = await supabase.from('ride_bookings').insert([{
        customer_id: user?.id,
        customer_name: user?.name || 'Customer',
        customer_phone: user?.phone || '9999999999',
        from_location: formattedFrom,
        to_location: formattedTo,
        vehicle_type: 'Any',
        price: Number(proposedFare),
        status: 'searching'
      }]).select().single();

      if (error) throw error;
      setBookingId(data.id);
      setPhase('searching');
    } catch (err) {
      console.error(err);
      alert('Failed to request ride.');
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (!bookingId) return;
    await supabase.from('ride_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    setPhase('input');
    setBids([]);
    setBookingId(null);
  };

  const acceptBid = async (bid) => {
    try {
      // 1. Update Bid to accepted
      await supabase.from('ride_bids').update({ status: 'accepted' }).eq('id', bid.id);
      // 2. Reject other bids
      await supabase.from('ride_bids').update({ status: 'rejected' }).eq('booking_id', bookingId).neq('id', bid.id);
      // 3. Update Booking
      await supabase.from('ride_bookings').update({
        status: 'accepted',
        driver_id: bid.driver_id,
        price: bid.bid_price,
        vehicle_type: `${bid.vehicle_name} (${bid.vehicle_number})`
      }).eq('id', bookingId);
      
      setAcceptedDriver(bid);
      setPhase('accepted');
    } catch (err) {
      console.error(err);
      alert('Error accepting bid.');
    }
  };

  // Realtime Bids Listener
  useEffect(() => {
    if (phase === 'searching' && bookingId) {
      const channel = supabase.channel(`bids-${bookingId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_bids', filter: `booking_id=eq.${bookingId}` }, (payload) => {
          setBids((prev) => [payload.new, ...prev]);
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [phase, bookingId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Book a Ride</h1>
      </div>

      {phase === 'input' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Where are you going?</h2>
            
            <div className="space-y-4 relative">
              <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-gray-200 z-0"></div>
              
              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white mr-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                </div>
                <div className="w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pickup Location</label>
                  <input 
                    type="text" 
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    placeholder="e.g. Jandaha Chowk" 
                    className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white mr-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div className="w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Drop-off Location</label>
                  <input 
                    type="text" 
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    placeholder="e.g. Hajipur Station" 
                    className="w-full mt-1 p-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Offer Your Fare (₹)</label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-lg">₹</span>
              <input 
                type="number" 
                value={proposedFare}
                onChange={(e) => setProposedFare(e.target.value)}
                placeholder="0" 
                className="w-full p-4 pl-8 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-xl"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">Drivers will see your offer and can accept or counter it.</p>
          </div>
          
          <button 
            onClick={requestRide}
            disabled={loading || !fromLoc || !toLoc || !proposedFare}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-md disabled:bg-gray-300 flex items-center justify-center transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Ride'}
          </button>
        </div>
      )}

      {phase === 'searching' && (
        <div className="flex-1 p-4 flex flex-col">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6 border border-teal-100">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-20"></div>
              <Car className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Finding Drivers...</h2>
            <p className="text-sm text-gray-500 mb-4">Drivers are reviewing your offer of ₹{proposedFare}</p>
            <button onClick={cancelRequest} className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg">Cancel Request</button>
          </div>

          <h3 className="font-bold text-gray-800 mb-3 px-2">Driver Offers ({bids.length})</h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto">
            {bids.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Waiting for bids...</p>
            ) : bids.map((bid) => (
              <div key={bid.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{bid.driver_name}</p>
                      <p className="text-xs text-gray-500">{bid.vehicle_name} • {bid.vehicle_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-teal-600">₹{bid.bid_price}</p>
                  </div>
                </div>
                <button 
                  onClick={() => acceptBid(bid)}
                  className="w-full bg-teal-50 text-teal-700 font-bold py-2.5 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  Accept Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'accepted' && acceptedDriver && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Driver is on the way!</h1>
          <p className="text-gray-500 mb-8">Your driver will arrive shortly.</p>
          
          <div className="bg-white rounded-2xl p-5 w-full text-left shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Ride Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Driver</span><span className="font-bold">{acceptedDriver.driver_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-bold">{acceptedDriver.vehicle_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Number Plate</span><span className="font-bold bg-yellow-100 px-2 rounded border border-yellow-300">{acceptedDriver.vehicle_number}</span></div>
              <div className="flex justify-between pt-3 border-t mt-3"><span className="text-gray-500">Agreed Fare (Cash)</span><span className="font-black text-teal-600 text-lg">₹{acceptedDriver.bid_price}</span></div>
            </div>
          </div>

          <button onClick={() => navigate('/')} className="mt-8 text-teal-600 font-bold w-full py-3 bg-teal-50 rounded-xl">Back to Home</button>
        </div>
      )}
    </div>
  );
}
