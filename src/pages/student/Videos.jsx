import { useState, useEffect } from 'react';
import api from '../../services/api';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const studentRes = await api.get('/students/me');
        const batchId = studentRes.data.batchId;
        const res = await api.get(`/videos/batch/${batchId}`);
        setVideos(res.data);
      } catch (err) {
        console.error('Failed to load videos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <div>Loading videos...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Video Lectures</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded shadow overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-2">Duration: {Math.floor(video.duration / 60)} min</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Watch
              </a>
            </div>
          </div>
        ))}
      </div>
      {videos.length === 0 && <p>No videos available.</p>}
    </div>
  );
};

export default Videos;