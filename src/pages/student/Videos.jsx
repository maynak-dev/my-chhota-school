import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, LoadingSpinner } from '../../components/UI';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const sRes = await api.get('/students/me');
        const res = await api.get(`/videos/batch/${sRes.data.batchId}`);
        setVideos(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchVideos();
  }, []);

  const formatDuration = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')} min`;
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Video Lectures" subtitle="Watch recorded lectures from your teachers" />

      {loading ? (
        <Card><LoadingSpinner /></Card>
      ) : videos.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-gray-500 font-semibold">No videos available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your teacher hasn't uploaded any lectures yet.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-500 font-semibold px-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} available
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, idx) => {
              const colors = ['#e8f0fe', '#e6f6ef', '#fff0f1', '#fef3c7', '#f0ebff'];
              const textColors = ['#1b3f7a', '#2d9e6b', '#e63946', '#d97706', '#8b5cf6'];
              const bg = colors[idx % colors.length];
              const col = textColors[idx % textColors.length];

              return (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
                  {/* Thumbnail placeholder */}
                  <div className="relative h-36 flex items-center justify-center" style={{ background: bg }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110"
                      style={{ background: col }}>
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-3 line-clamp-2" style={{ color: '#0f2447' }}>
                      {video.title}
                    </h3>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 w-full justify-center py-2 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: `linear-gradient(135deg, ${col}, ${col}cc)` }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Videos;
