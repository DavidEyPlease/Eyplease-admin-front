import React, { useRef } from 'react';

interface VideoPlayerProps {
    url: string;
    playerId: string;
    posterUrl?: string;
    title?: string;
    classPlayerHeight?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, playerId, posterUrl, title, classPlayerHeight = 'h-72' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div>
            <video
                ref={videoRef}
                controls
                playsInline
                webkit-playsinline="true"
                {...(posterUrl && { poster: posterUrl })}
                className='rounded-xl'
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
                id={playerId}
                src={url}
            >
            </video>
        </div>
    );
};

export default VideoPlayer;