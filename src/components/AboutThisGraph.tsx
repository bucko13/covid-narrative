import React, { ReactNode } from 'react';
import { linkify } from '../utils/utils';
import "./AboutThisGraph.scss"

interface PropTypes {
  name?: string
  children: ReactNode | string
}

const AboutThisGraph = ({ name, children }: PropTypes) => (
  <div id={name ? linkify(name) : ''} className="about-this-graph">
    <h6>About this graph:</h6>
    {children}
  </div>
);

export default AboutThisGraph;
