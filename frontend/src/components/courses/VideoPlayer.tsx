'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  videoUrl: string;
  lessonId: string;
  onComplete: (lessonId: string, watchTime: number) => void;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoPlayer({ videoUrl, lessonId, onComplete, title }: Props) {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';

  const [playedPercent, setPlayedPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [canMarkDone, setCanMarkDone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const youtubeId = getYouTubeId(videoUrl);

  // Reset completion state when lesson changes
  useEffect(() => {
    setPlayedPercent(0);
    setCompleted(false);
    setCanMarkDone(false);
    setIsLoaded(false);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, [lessonId]);

  // Load YouTube IFrame API if video is YouTube
  useEffect(() => {
    if (!youtubeId) return;

    const playerId = `yt-player-${lessonId}`;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      // Clean up previous instance
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }

      playerRef.current = new (window as any).YT.Player(playerId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setIsLoaded(true);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (!YT) return;

            // When video is playing, poll for progress
            if (event.data === YT.PlayerState.PLAYING) {
              if (!pollIntervalRef.current) {
                pollIntervalRef.current = setInterval(() => {
                  if (!playerRef.current || !playerRef.current.getCurrentTime) return;
                  const currentTime = playerRef.current.getCurrentTime() || 0;
                  const totalDuration = playerRef.current.getDuration() || 1;
                  const pct = Math.min(100, Math.round((currentTime / totalDuration) * 100));

                  setPlayedPercent(pct);

                  if (pct >= 80) {
                    setCanMarkDone(true);
                  }
                }, 1000);
              }
            } else if (event.data === YT.PlayerState.ENDED) {
              setPlayedPercent(100);
              setCanMarkDone(true);
              if (isStudent && !completed) {
                setCompleted(true);
                const dur = playerRef.current?.getDuration() || 0;
                onComplete(lessonId, Math.floor(dur));
              }
            } else {
              if (pollIntervalRef.current && event.data === YT.PlayerState.PAUSED) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }
    };
  }, [youtubeId, lessonId, isStudent, completed, onComplete]);

  const handleManualComplete = () => {
    if (!completed) {
      setCompleted(true);
      const dur = playerRef.current?.getDuration?.() || 0;
      onComplete(lessonId, Math.floor(dur));
    }
  };

  if (!videoUrl) {
    return (
      <div className="glass-card rounded-2xl aspect-video flex items-center justify-center border border-indigo-500/20">
        <div className="text-center">
          <Play className="w-10 h-10 text-indigo-400/30 mx-auto mb-3" />
          <p className="text-indigo-200/50 text-sm font-medium">No video attached to this lecture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/25 bg-[#05060f]">
      {/* Video Screen Container */}
      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center" ref={containerRef}>
        {youtubeId ? (
          <div className="w-full h-full">
            <div id={`yt-player-${lessonId}`} className="w-full h-full" />
          </div>
        ) : (
          <video
            controls
            className="w-full h-full"
            src={videoUrl}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (video.duration > 0) {
                const pct = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
                setPlayedPercent(pct);
                if (pct >= 80) setCanMarkDone(true);
              }
            }}
            onEnded={(e) => {
              setPlayedPercent(100);
              setCanMarkDone(true);
              if (isStudent && !completed) {
                setCompleted(true);
                onComplete(lessonId, Math.floor(e.currentTarget.duration));
              }
            }}
          />
        )}
      </div>

      {/* Control & Live Completion Bar */}
      <div className="bg-[#0a0d20] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-indigo-500/20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-white font-semibold truncate max-w-xs sm:max-w-md">
              {title || 'Lecture Stream'}
            </p>
            <p className="text-[11px] text-indigo-300/50 mt-0.5">
              Progress: <span className="text-teal-300 font-semibold">{playedPercent}%</span> watched
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {completed ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold shadow-lg shadow-teal-500/10">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Lecture Completed ✓</span>
            </div>
          ) : isStudent ? (
            <button
              type="button"
              onClick={handleManualComplete}
              disabled={!canMarkDone}
              title={
                canMarkDone
                  ? 'Click to complete lecture'
                  : 'Watch at least 80% or finish the video to complete'
              }
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                canMarkDone
                  ? 'glow-btn-teal text-white shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 text-indigo-300/40 border border-indigo-500/15 cursor-not-allowed opacity-75'
              }`}
            >
              {canMarkDone ? (
                <>
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>Mark Complete</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                  <span>
                    {playedPercent < 80
                      ? `Watch ${80 - playedPercent}% more to finish`
                      : 'Unlocking completion...'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-indigo-300/50 border border-indigo-500/20 px-3 py-1.5 rounded-lg bg-white/3">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Instructor Preview</span>
            </span>
          )}

          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300/60 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}