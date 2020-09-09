import React, { ReactChildren } from 'react';


const ExternalLink = ({
  href,
  children,
}: {
  href: string
  children: ReactChildren | string
}) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
)

export default ExternalLink;