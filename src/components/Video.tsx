import React from 'react';

export interface VideoProps {
  videoSrcURL: string;
  videoTitle: string;
}

function Video({ videoSrcURL, videoTitle }: VideoProps) {
  return (
    <div className="video">
      <iframe
        width="640"
        height="360"
        src={videoSrcURL}
        title={videoTitle}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

export default Video;
