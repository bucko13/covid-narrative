import React from "react"
import {Box} from "@material-ui/core"
import Layout from "../components/layout"

const IndexPage = () => {
  return (
    <Layout>
      <Box my={3}>
        <h2>What is the purpose of this site?</h2>
        <Box my={2} textAlign="center">
          <h4>
            "There are three kinds of lies: lies, damned lies, and statistics." -
            Mark Twain
          </h4>
        </Box>
        <p>
          They say knowledge is power, but what about the narrative you craft
          with that knowledge?
        </p>
        <p>
          This isn't the first global pandemic the human race has ever faced,
          but it is the first in which we have the full force of "Big Data",
          open source software, and the Internet at our disposal.
        </p>
      </Box>

      <Box my={3}>
        <h3>Data Sources</h3>
        <h5>
          State Level Data:{" "}
          <a href="https://covidtracking.com/data/api">
            COVID Tracking Project
          </a>
        </h5>
        <h5>
          Populations (US): <a href="https://datausa.io/">DataUSA.io</a>
        </h5>
        <h5>
          Rt (transmission rate) Data: <a href="https://rt.live/">Rt.live</a>
        </h5>
        <h5>
          Country-level Data: <a href="https://github.com/owid/covid-19-data/tree/master/public/data/">
            Our World In Data (OWID)
          </a>
        </h5>

      </Box>
    </Layout>
  )
}

export default IndexPage
