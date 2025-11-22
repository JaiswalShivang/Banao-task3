import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/userSlice';
import { fetchCryptos, updatePrices } from '../features/cryptoSlice';
import { fetchAlerts, createAlert, deleteAlert } from '../features/alertSlice';
import { SOCKET_URL } from '../config/constants';

function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state) => state.user.user);
  const { cryptos, loading: cryptosLoading } = useAppSelector((state) => state.crypto);
  const { alerts, loading: alertsLoading } = useAppSelector((state) => state.alert);
  
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCryptos());
    dispatch(fetchAlerts());

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('priceUpdate', (data: any[]) => {
      dispatch(updatePrices(data));
    });

    socket.on('alert', (data: { message: string; crypto: string; price: number }) => {
      alert(`Alert: ${data.message} - ${data.crypto} is now $${data.price}`);
      dispatch(fetchAlerts());
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateAlert = async () => {
    if (!selectedCrypto || !targetPrice) {
      alert('Please select a cryptocurrency and enter a target price');
      return;
    }

    try {
      await dispatch(createAlert({
        coinId: selectedCrypto,
        condition,
        targetPrice: parseFloat(targetPrice),
      })).unwrap();
      
      setSelectedCrypto('');
      setTargetPrice('');
      alert('Alert created successfully!');
    } catch (error: any) {
      alert(error || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await dispatch(deleteAlert(alertId)).unwrap();
      alert('Alert deleted successfully!');
    } catch (error: any) {
      alert(error || 'Failed to delete alert');
    }
  };

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">₿</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Crypto Tracker</h1>
                <p className="text-xs text-gray-500 font-medium">Live Market Data</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-72 group">
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-0 bg-white/60 backdrop-blur-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white shadow-lg transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 backdrop-blur-sm rounded-full border border-green-200/50 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">Market Live</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Cryptocurrency Prices
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track real-time cryptocurrency prices and set price alerts for your favorite coins
          </p>
        </div>

        <section className="mb-16">
          {cryptosLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin animation-delay-300"></div>
              </div>
              <p className="text-gray-600 mt-6 font-medium">Loading market data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCryptos.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No cryptocurrencies found</h3>
                  <p className="text-gray-500 text-center max-w-md">Try adjusting your search terms or check back later for more coins</p>
                </div>
              ) : (
                filteredCryptos.map((crypto, index) => (
                  <div
                    key={crypto.id}
                    className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 animate-fade-in hover:bg-white"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{crypto.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">{crypto.name}</p>
                            <p className="text-sm text-gray-500 uppercase font-semibold">{crypto.symbol}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                        crypto.price_change_percentage_24h >= 0
                          ? 'bg-green-50 text-green-700 group-hover:bg-green-100'
                          : 'bg-red-50 text-red-700 group-hover:bg-red-100'
                      }`}>
                        <span className="text-lg">
                          {crypto.price_change_percentage_24h >= 0 ? '📈' : '📉'}
                        </span>
                        <span>
                          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        ${crypto.current_price.toLocaleString()}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            crypto.price_change_percentage_24h >= 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(Math.abs(crypto.price_change_percentage_24h) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 rounded-full mb-4">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm font-semibold text-blue-700">Price Alerts</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Create Price Alert
              </h2>
              <p className="text-gray-600">Get notified when your favorite cryptocurrencies reach your target price</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Cryptocurrency</label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  >
                    <option value="">Select Crypto</option>
                    {cryptos.map((crypto) => (
                      <option key={crypto.id} value={crypto.id}>
                        {crypto.name} ({crypto.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  >
                    <option value="above">Price goes above</option>
                    <option value="below">Price goes below</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Target Price</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 opacity-0">Create</label>
                  <button
                    onClick={handleCreateAlert}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Alert
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Your Price Alerts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Monitor your active price alerts and get notified when conditions are met
            </p>
          </div>

          {alertsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin animation-delay-300"></div>
              </div>
              <p className="text-gray-600 mt-6 font-medium">Loading your alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm border-2 border-dashed border-gray-300/50 rounded-3xl p-16 text-center shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No alerts yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first price alert above to start monitoring cryptocurrency prices</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium text-blue-700">Get notified instantly</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-fade-in hover:bg-white"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">₿</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg capitalize truncate group-hover:text-blue-600 transition-colors">{alert.coinId}</p>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Alert</p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      !alert.triggered
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${!alert.triggered ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {!alert.triggered ? 'Active' : 'Triggered'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 capitalize">{alert.condition}</span>
                      <span className="text-lg font-bold text-gray-900">${alert.targetPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Alert
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
