import React from 'react';
import { css } from '@emotion/react';

export interface VideoProps {
  videoSrcURL: string;
  videoTitle: string;
}

function Figcaption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption
      css={css`
        text-align: center;
        font-family: '.AppleSystemUIFont', sans-serif;
        font-size: 1.6rem;
        font-weight: 500;
        padding-bottom: 5%;
      `}
    >
      {children}
    </figcaption>
  );
}

function Video({ videoSrcURL, videoTitle }: VideoProps) {
  return (
    <div className="video">
      <iframe
        css={css`
          width: 100%;
        `}
        width="640"
        height="360"
        src={videoSrcURL}
        title={videoTitle}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
      <Figcaption>{videoTitle}</Figcaption>
    </div>
  );
}

export default Video;
