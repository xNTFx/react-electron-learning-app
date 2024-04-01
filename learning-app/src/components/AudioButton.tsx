import { useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';

interface AudioButtonArgType {
  audioSrc: string | null | undefined;
}

export default function AudioButton({ audioSrc }: AudioButtonArgType) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayPause = () => {
    const isAudioPlaying = isPlaying;
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center justify-center">
      {audioSrc ? (
        <div>
          <audio ref={audioRef} autoPlay onEnded={() => setIsPlaying(false)}>
            <source src={audioSrc} type="audio/mp3" />
          </audio>
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center rounded-full bg-black p-2"
          >
            {isPlaying ? (
              <FaPause className="size-6" />
            ) : (
              <FaPlay className="size-6" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
