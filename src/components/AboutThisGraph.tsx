import React, { ReactNode, useContext } from "react"
import { linkify } from "../utils/helpers"
import "./AboutThisGraph.scss"
import { ShowAboutContext } from "./layout"

interface PropTypes {
  name?: string
  children: ReactNode | string
}

const AboutThisGraph = ({ name, children }: PropTypes) => {
  const { showAbout } = useContext(ShowAboutContext)
  return (
    <div id={name ? linkify(name) : ""} className="about-this-graph">
      <h6>About this graph:</h6>
      {showAbout ? (
        children
      ) : (
        <p className="hidden-details">
          (turn on explanations from main menu to view details)
        </p>
      )}
    </div>
  )
}

export default AboutThisGraph
