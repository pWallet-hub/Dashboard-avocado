import { useState, useEffect, useCallback } from 'react';
import { Map, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { getRegionalForecast } from '../../services/forecastingService';
import { useToast } from '../../components/Ui/Toast';

const varianceColor = (variance) => {
  if (variance == null) return 'text-gray-600';
  const value = Number(variance);
  if (Number.isNaN(value)) return 'text-gray-600';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

const Forecasting = () => {
  const toast = useToast();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRegional = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRegionalForecast();
      setRegions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load regional forecast data');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRegional();
  }, [loadRegional]);

  const totals = regions.reduce(
    (acc, region) => {
      acc.predicted += Number(region.total_predicted_kg ?? region.predicted_kg ?? 0);
      acc.actual += Number(region.total_actual_kg ?? region.actual_kg ?? 0);
      return acc;
    },
    { predicted: 0, actual: 0 }
  );

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Map className="h-7 w-7 mr-3 text-green-600" />
              Regional Harvest Forecasting
            </h2>
            <p className="text-green-600 mt-1">Aggregated forecast vs actual avocado harvest by district and province</p>
          </div>
          <button
            onClick={loadRegional}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Predicted (kg)</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{totals.predicted.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Actual (kg)</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{totals.actual.toLocaleString()}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <div>
            <p className="text-sm text-green-600">Regions Reporting</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{regions.length}</p>
          </div>
        </div>
      </div>

      {/* Regional table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading regional data...</p>
          </div>
        ) : regions.length === 0 ? (
          <div className="p-8 text-center text-green-600">No regional forecast data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Province</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Predicted (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actual (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Forecast Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {regions.map((region, index) => {
                  const predicted = Number(region.total_predicted_kg ?? region.predicted_kg ?? 0);
                  const actual = Number(region.total_actual_kg ?? region.actual_kg ?? 0);
                  const variance = region.variance_pct ?? (predicted ? (((actual - predicted) / predicted) * 100).toFixed(1) : null);
                  return (
                    <tr key={`${region.province || ''}-${region.district || index}`} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">{region.province || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{region.district || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{predicted.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{actual.toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${varianceColor(variance)}`}>
                        {variance != null ? `${variance}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                        {region.forecast_count ?? region.count ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
