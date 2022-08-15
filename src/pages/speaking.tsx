import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';

import { Footer } from '../components/Footer';
import SiteNav from '../components/header/SiteNav';
import { PostFullContent } from '../components/PostContent';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import {
  inner,
  outer,
  SiteArchiveHeader,
  SiteHeader,
  SiteMain,
  SiteNavMain,
} from '../styles/shared';
import { NoImage, PostFull, PostFullHeader, PostFullTitle } from '../templates/post';
import { colors } from '../styles/colors';
import Video from '../components/Video.tsx';

const PageTemplate = css`
  .site-main {
    margin-top: 64px;
    padding-bottom: 4vw;
    background: #fff;
  }

  @media (prefers-color-scheme: dark) {
    .site-main {
      /* background: var(--darkmode); */
      background: ${colors.darkmode};
    }
  }
`;

function Speaking() {
  return (
    <IndexLayout>
      <Helmet>
        <title>Speaking</title>
      </Helmet>
      <Wrapper css={PageTemplate}>
        <header className="site-archive-header no-image" css={[SiteHeader, SiteArchiveHeader]}>
          <div css={[outer, SiteNavMain]}>
            <div css={inner}>
              <SiteNav isHome={false} />
            </div>
          </div>
        </header>
        <main id="site-main" className={`site-main ${SiteMain} ${outer}`}>
          <article className={`${PostFull} post page ${NoImage}`}>
            <PostFullHeader>
              <PostFullTitle>Speaking</PostFullTitle>
            </PostFullHeader>

            <PostFullContent className="post-full-content">
              <div className="post-content">
                <p>
                  I like speaking at conferences and at my workplace! Covering topics ranging from
                  Kotlin and Kotlin Multiplatform, benchmarking and more. These are some of my
                  talks.
                </p>
                <h2> 2022 </h2>
                <h3> Benchmarking and other stories - Droidcon Berlin</h3>
                <Video
                  videoSrcURL="//player.vimeo.com/video/734760050?autopause=0&amp;autoplay=0&amp;color=00adef&amp;portrait=0&amp;byline=0&amp;title=0"
                  videoTitle="Benchmarking and other stories"
                />
                <h3> Benchmarking and other stories - Droidcon San Francisco</h3>
                <Video
                  videoSrcURL="//player.vimeo.com/video/723376674?autopause=0&amp;autoplay=0&amp;color=00adef&amp;portrait=0&amp;byline=0&amp;title=0"
                  videoTitle="Benchmarking and other stories"
                />
                <h3> Benchmarking and other stories - AndroidMakers Paris</h3>
                <Video
                  videoSrcURL="https://www.youtube.com/embed/zHoJEDjLtAY"
                  videoTitle="Kotlin Multiplatform"
                />
                <h2> 2021 </h2>
                <h3> Crash Course Kotlin Multiplatform - Company event</h3>
                <Video
                  videoSrcURL="https://drive.google.com/file/d/12iheQ3eTBrg3vYbEGWs7zRKJEkHv7Rs9/preview"
                  videoTitle="Kotlin Multiplatform"
                />
              </div>
            </PostFullContent>
          </article>
        </main>
        <Footer />
      </Wrapper>
    </IndexLayout>
  );
}

export default Speaking;
