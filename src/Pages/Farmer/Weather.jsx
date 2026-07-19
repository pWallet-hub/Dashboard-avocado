import { useEffect, useState, useCallback } from 'react';
import {
  Cloud, CloudRain, CloudSnow, CloudLightning, Sun, CloudSun, Wind, Droplets,
  Thermometer, MapPin, RefreshCw, Lightbulb, AlertTriangle, CalendarDays, Search
} from 'lucide-react';
import apiClient, { extractData } from '../../services/apiClient';
import { getCurrentWeather, getForecast, getFarmConditions } from '../../services/weatherService';
import { getFarmerInformation } from '../../services/farmer-information';
import { useToast } from '../../components/Ui/Toast';

// Pick the first defined value among candidate keys on an object
const pick = (obj, keys, fallback = null) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  return fallback;
};

// The API returns numeric fields as pre-formatted strings (e.g. "23°C", "68%",
// "14 km/h"). Only append a unit when the value looks like a bare number.
const withUnit = (value, unit) => {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value);
  return /[^\d.\-]/.test(str) ? str : `${str}${unit}`;
};

const conditionIcon = (conditionText) => {
  const text = (conditionText || '').toLowerCase();
  if (text.includes('storm') || text.includes('thunder')) return CloudLightning;
  if (text.includes('snow')) return CloudSnow;
  if (text.includes('rain') || text.includes('shower') || text.includes('drizzle')) return CloudRain;
  if (text.includes('cloud') && (text.includes('part') || text.includes('few'))) return CloudSun;
  if (text.includes('cloud') || text.includes('overcast')) return Cloud;
  if (text.includes('clear') || text.includes('sun')) return Sun;
  return Cloud;
};

const formatDay = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function Weather() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(true);

  const [farm, setFarm] = useState(null);
  const [location, setLocation] = useState('');
  const [locationSource, setLocationSource] = useState(null); // 'farm' | 'profile' | 'manual'
  const [manualInput, setManualInput] = useState('');
  const [needsManualLocation, setNeedsManualLocation] = useState(false);

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [conditions, setConditions] = useState(null);
  const [errors, setErrors] = useState({});

  // Work out the farmer's farm/location without asking them to type anything, if at all possible.
  const resolveLocation = useCallback(async () => {
    setLocating(true);
    setNeedsManualLocation(false);
    try {
      const userId = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('farmerId');

      // 1. Try to find the farmer's registered farm (gives us both a farm_id and a location).
      if (userId) {
        try {
          const response = await apiClient.get('/farms', { params: { farmer_id: userId } });
          const extracted = extractData(response);
          const list = Array.isArray(extracted) ? extracted : Array.isArray(extracted?.data) ? extracted.data : [];
          if (list.length > 0) {
            const primaryFarm = list[0];
            const loc = primaryFarm.location || {};
            const locationString = loc.district || loc.sector || loc.province || primaryFarm.farmName;
            if (locationString) {
              setFarm(primaryFarm);
              setLocation(locationString);
              setLocationSource('farm');
              setLocating(false);
              return;
            }
          }
        } catch (err) {
          console.error('Error loading farm for weather:', err);
        }
      }

      // 2. Fall back to the farmer's own profile location (farm_district/farm_province).
      try {
        const info = await getFarmerInformation();
        const profile = info?.data?.farmer_profile || info?.farmer_profile;
        const locationString = pick(profile, ['farm_district', 'farm_sector', 'farm_province', 'district', 'province']);
        if (locationString) {
          setLocation(locationString);
          setLocationSource('profile');
          setLocating(false);
          return;
        }
      } catch (err) {
        console.error('Error loading farmer profile for weather:', err);
      }

      // 3. Nothing found automatically - ask the farmer to type a location.
      setNeedsManualLocation(true);
    } finally {
      setLocating(false);
    }
  }, []);

  const loadWeather = useCallback(async (locationString, farmId, { isRefresh = false } = {}) => {
    if (!locationString) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    const nextErrors = {};

    const [currentResult, forecastResult, conditionsResult] = await Promise.allSettled([
      getCurrentWeather(locationString),
      getForecast(locationString, 7),
      farmId ? getFarmConditions(farmId) : Promise.resolve(null),
    ]);

    if (currentResult.status === 'fulfilled') {
      setCurrent(currentResult.value?.data || currentResult.value);
    } else {
      nextErrors.current = currentResult.reason?.message || 'Failed to load current weather';
      setCurrent(null);
    }

    if (forecastResult.status === 'fulfilled') {
      const value = forecastResult.value?.data || forecastResult.value;
      const days = Array.isArray(value) ? value : Array.isArray(value?.forecast) ? value.forecast : [];
      setForecast(days);
    } else {
      nextErrors.forecast = forecastResult.reason?.message || 'Failed to load forecast';
      setForecast([]);
    }

    if (farmId) {
      if (conditionsResult.status === 'fulfilled') {
        setConditions(conditionsResult.value?.data || conditionsResult.value);
      } else {
        nextErrors.conditions = conditionsResult.reason?.message || 'Failed to load farm conditions';
        setConditions(null);
      }
    }

    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    resolveLocation();
  }, [resolveLocation]);

  useEffect(() => {
    if (location) {
      loadWeather(location, farm?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleManualSearch = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter a location');
      return;
    }
    setFarm(null);
    setLocationSource('manual');
    setNeedsManualLocation(false);
    setLocation(manualInput.trim());
  };

  const handleRefresh = () => {
    if (location) loadWeather(location, farm?.id, { isRefresh: true });
  };

  const temperature = pick(current, ['temperature', 'temp', 'temp_c']);
  const feelsLike = pick(current, ['feels_like', 'feelsLike', 'apparent_temperature']);
  const conditionText = pick(current, ['conditions', 'condition', 'description', 'weather_condition', 'summary'], 'Unknown');
  const humidity = pick(current, ['humidity', 'humidity_percent']);
  const windSpeed = pick(current, ['wind_speed', 'wind', 'windSpeed']);
  const ConditionIcon = conditionIcon(conditionText);

  const recommendations = pick(conditions, ['recommendations', 'farming_recommendations'], []);
  const alerts = pick(conditions, ['alerts', 'warnings'], []);
  const conditionsSummary = pick(conditions, ['summary', 'condition_summary']);

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Cloud className="h-7 w-7 mr-3 text-green-600" />
              Weather &amp; Farm Conditions
            </h2>
            <p className="text-green-600 mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-green-500" />
              {location ? (
                <>
                  {farm ? (farm.farmName || farm.farm_name || location) : location}
                  {locationSource === 'profile' && <span className="ml-2 text-xs text-green-500">(from your farm profile)</span>}
                  {locationSource === 'manual' && <span className="ml-2 text-xs text-green-500">(manually entered)</span>}
                </>
              ) : (
                'Locating your farm...'
              )}
            </p>
          </div>
          {location && (
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Manual location fallback */}
      {needsManualLocation && !locating && (
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <p className="text-sm text-green-700 mb-3">
            We couldn&apos;t find a registered farm or location on your profile. Enter your district or town to see the weather.
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="e.g. Musanze, Huye, Kigali..."
                className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleManualSearch}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {locating ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center ring-1 ring-green-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-green-600">Finding your farm location...</p>
        </div>
      ) : location && (
        <>
          {/* Farming Recommendations - highlighted */}
          {farm && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-amber-400 rounded-lg mr-3">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">Farming Recommendations</h3>
                  <p className="text-sm text-amber-700">Based on current conditions at your farm</p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-amber-700">Loading recommendations...</p>
              ) : errors.conditions ? (
                <p className="text-sm text-amber-700">{errors.conditions}</p>
              ) : (
                <>
                  {conditionsSummary && (
                    <p className="text-sm text-amber-800 mb-3 font-medium">{conditionsSummary}</p>
                  )}
                  {Array.isArray(recommendations) && recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start bg-white/60 rounded-lg p-3">
                          <span className="text-amber-500 mr-2 mt-0.5">•</span>
                          <span className="text-sm text-amber-900">
                            {typeof rec === 'string' ? rec : rec.title || rec.description || JSON.stringify(rec)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-amber-700">No specific recommendations at this time.</p>
                  )}

                  {Array.isArray(alerts) && alerts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {alerts.map((alert, index) => (
                        <div key={index} className="flex items-start bg-red-50 border border-red-200 rounded-lg p-3">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700">
                            {typeof alert === 'string' ? alert : alert.message || alert.description || JSON.stringify(alert)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Current Weather */}
          <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-green-600" />
              Current Weather
            </h3>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : errors.current ? (
              <p className="text-sm text-red-600">{errors.current}</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <ConditionIcon className="h-16 w-16 text-green-500" />
                  <div>
                    <p className="text-4xl font-bold text-green-900">
                      {temperature !== null ? withUnit(temperature, '°C') : 'N/A'}
                    </p>
                    <p className="text-green-600 capitalize">{conditionText}</p>
                    {feelsLike !== null && (
                      <p className="text-xs text-green-500">Feels like {withUnit(feelsLike, '°C')}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-green-600">Humidity</p>
                      <p className="text-sm font-semibold text-green-900">{humidity !== null ? withUnit(humidity, '%') : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                    <Wind className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-green-600">Wind</p>
                      <p className="text-sm font-semibold text-green-900">{windSpeed !== null ? withUnit(windSpeed, ' km/h') : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-green-600" />
              7-Day Forecast
            </h3>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : errors.forecast ? (
              <p className="text-sm text-red-600">{errors.forecast}</p>
            ) : forecast.length === 0 ? (
              <p className="text-sm text-green-600">No forecast data available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((day, index) => {
                  const dayCondition = pick(day, ['conditions', 'condition', 'description', 'summary'], '');
                  const DayIcon = conditionIcon(dayCondition);
                  const high = pick(day, ['temp_max', 'high', 'max_temp', 'temperature_max']);
                  const low = pick(day, ['temp_min', 'low', 'min_temp', 'temperature_min']);
                  const single = pick(day, ['temperature', 'temp']);
                  const date = pick(day, ['date', 'day', 'forecast_date']);
                  return (
                    <div key={index} className="bg-green-50 rounded-lg p-3 text-center ring-1 ring-green-100">
                      <p className="text-xs font-medium text-green-700 mb-1">{formatDay(date)}</p>
                      <DayIcon className="h-8 w-8 text-green-500 mx-auto my-2" />
                      <p className="text-xs text-green-600 capitalize truncate">{dayCondition || 'N/A'}</p>
                      <p className="text-sm font-semibold text-green-900 mt-1">
                        {high !== null || low !== null
                          ? `${high !== null ? withUnit(high, '°') : '--'} / ${low !== null ? withUnit(low, '°') : '--'}`
                          : single !== null ? withUnit(single, '°C') : '--'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
