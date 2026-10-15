'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
interface Player {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (
    node: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number>;
      events: { onStateChange: (event: { data: number }) => void };
    },
  ) => Player;
}
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiReady: Promise<YouTubeAPI> | undefined;
function youtubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiReady)
    apiReady = new Promise((resolve, reject) => {
      window.onYouTubeIframeAPIReady = () => {
        if (window.YT) resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        apiReady = undefined;
        reject(new Error('Video provider unavailable'));
      };
      document.body.appendChild(script);
    });
  return apiReady;
}
interface Props {
  videoUrl: string;
  lessonId: string;
  onComplete: (lessonId: string, watchTime: number) => void;
  title?: string;
}
export default function VideoPlayer({
  videoUrl,
  lessonId,
  onComplete,
  title,
}: Props) {
  const params = useParams();
  const student = useAuthStore((s) => s.user?.role === 'student');
  const container = useRef<HTMLDivElement>(null),
    player = useRef<Player | null>(null),
    callback = useRef(onComplete),
    heartbeatAt = useRef(0);
  const [percent, setPercent] = useState(0),
    [duration, setDuration] = useState(0),
    [error, setError] = useState('');
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  const youtubeId = match?.[1];
  const beat = (force = false) => {
    if (
      !student ||
      !params.id ||
      (!force && Date.now() - heartbeatAt.current < 9000)
    )
      return;
    heartbeatAt.current = Date.now();
    void api.post(`/enrollments/${params.id}/watch`, { lessonId }).catch(() => {
      /* Preview/unavailable enrollment must not fabricate progress. */
    });
  };
  const beatRef = useRef(beat);
  useEffect(() => {
    beatRef.current = beat;
  });
  useEffect(() => {
    setPercent(0);
    setDuration(0);
    setError('');
    heartbeatAt.current = 0;
    if (!youtubeId || !container.current) return;
    let disposed = false,
      timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    youtubeAPI()
      .then((YT) => {
        if (disposed || !container.current) return;
        const node = document.createElement('div');
        container.current.appendChild(node);
        player.current = new YT.Player(node, {
          videoId: youtubeId,
          playerVars: { controls: 1, rel: 0 },
          events: {
            onStateChange: (event) => {
              stop();
              if (event.data === 1) {
                beatRef.current();
                timer = setInterval(() => {
                  const d = player.current?.getDuration() || 0,
                    time = player.current?.getCurrentTime() || 0;
                  setDuration(d);
                  setPercent(
                    d ? Math.min(100, Math.round((time / d) * 100)) : 0,
                  );
                  beatRef.current();
                }, 1000);
              }
              if (event.data === 0) {
                beatRef.current(true);
                setPercent(100);
                setDuration(player.current?.getDuration() || 0);
              }
            },
          },
        });
      })
      .catch(() => {
        if (!disposed)
          setError('Video provider unavailable. Try the original video link.');
      });
    return () => {
      disposed = true;
      stop();
      player.current?.destroy();
      player.current = null;
    };
  }, [youtubeId, lessonId]);
  return (
    <section className="glass-card rounded-2xl overflow-hidden border border-indigo-500/25 text-white">
      {youtubeId ? (
        <div
          ref={container}
          className="aspect-video w-full bg-black [&_iframe]:w-full [&_iframe]:h-full"
        />
      ) : (
        <video
          key={lessonId}
          onPlay={() => beat(true)}
          onEnded={() => {
            beat(true);
            setPercent(100);
          }}
          controls
          src={videoUrl}
          className="w-full aspect-video bg-black"
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            setDuration(video.duration || 0);
            setPercent(
              video.duration
                ? Math.round((video.currentTime / video.duration) * 100)
                : 0,
            );
            if (!video.paused) beat();
          }}
        />
      )}
      <div className="p-4 space-y-3">
        <h2 className="font-semibold">{title || 'Lesson video'}</h2>
        <p>{percent}% watched</p>
        {error && <p role="alert">{error}</p>}
        {student && (
          <button
            disabled={percent < 80 || !duration}
            onClick={() => callback.current(lessonId, Math.floor(duration))}
            className="px-4 py-2 bg-teal-800 rounded-lg disabled:opacity-50"
          >
            Mark Complete
          </button>
        )}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-teal-300"
        >
          Open original video
        </a>
        <p className="text-xs text-indigo-200">
          Completion requires server-recorded watch time. Seeking alone does not
          complete a lesson.
        </p>
      </div>
    </section>
  );
}
