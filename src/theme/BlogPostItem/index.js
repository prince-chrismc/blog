import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import {
  LinkedinShareButton, LinkedinIcon,
  TwitterIcon, TwitterShareButton,
  RedditIcon, RedditShareButton
} from 'react-share'

import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function BlogPostItemWrapper(props) {
  const { siteConfig } = useDocusaurusContext();
  const shareUrl = siteConfig.url + useBaseUrl(props.children.type.metadata.permalink);

  return (
    <>
      <BlogPostItem {...props} className='override-margin-bottom--sm' />
      <div className='row'>
        <LinkedinShareButton
          url={shareUrl}
          className='margin-bottom--xl margin-horiz--sm'
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <RedditShareButton
          url={shareUrl}
          className='margin-bottom--xl margin-horiz--sm'
        >
          <RedditIcon size={32} round />
        </RedditShareButton>
        <TwitterShareButton
          url={shareUrl}
          className='margin-bottom--xl margin-horiz--sm'
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>
    </>
  );
}
