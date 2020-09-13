import { ReactComponentLike } from 'prop-types';
import React, { ReactChildren, ReactComponentElement } from 'react';


const ExternalLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode | string
}) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
)

export default ExternalLink;