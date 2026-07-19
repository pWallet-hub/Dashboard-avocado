import { useEffect, useState } from 'react';
import { GraduationCap, Video, FileText, File, HelpCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { listTraining, getTraining } from '../../services/trainingService';
import { useToast } from '../../components/Ui/Toast';

const contentTypeIcon = (type) => {
  switch (type) {
    case 'video': return Video;
    case 'pdf': return File;
    case 'quiz': return HelpCircle;
    default: return FileText;
  }
};

const Training = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTraining();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading training content:', err);
      setError(err.message || 'Failed to load training content');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => typeFilter === 'all' || item.content_type === typeFilter);

  const openDetail = async (item) => {
    setDetailLoading(true);
    try {
      const detail = await getTraining(item.id);
      setSelected(detail || item);
    } catch (err) {
      console.error('Error loading training detail:', err);
      toast.error(err.message || 'Failed to load training content');
      setSelected(item);
    } finally {
      setDetailLoading(false);
    }
  };

  if (selected) {
    const Icon = contentTypeIcon(selected.content_type);
    return (
      <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center text-green-700 hover:text-green-900 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Training
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
          {selected.thumbnail_url && (
            <img src={selected.thumbnail_url} alt={selected.title} className="w-full max-h-80 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
              <Icon className="h-4 w-4" /> {selected.content_type}
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">{selected.title}</h2>
            <p className="text-green-700 whitespace-pre-line mb-4">{selected.description}</p>

            {selected.tags && selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            )}

            {selected.content_url && (
              <a
                href={selected.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Open Content <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <GraduationCap className="h-7 w-7 mr-3 text-green-600" />
          Training & Resources
        </h2>
        <p className="text-green-600 mt-1">Browse published training material to grow your farming knowledge</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-green-700">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>

      {loading || detailLoading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center ring-1 ring-green-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-green-600">Loading training content...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center ring-1 ring-green-100">
          <GraduationCap className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-green-600 text-lg font-medium">No training content available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const Icon = contentTypeIcon(item.content_type);
            return (
              <button
                key={item.id}
                onClick={() => openDetail(item)}
                className="text-left bg-white rounded-xl shadow-lg ring-1 ring-green-100 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-green-100 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-green-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-1 text-green-600 text-xs mb-2 uppercase font-medium">
                    <Icon className="h-3 w-3" /> {item.content_type}
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-green-600 line-clamp-2">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Training;
