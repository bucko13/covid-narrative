import React from "react"
import {Box, Divider} from "@material-ui/core"
import Layout from "../components/layout"

const IndexPage = () => {
  return (
    <Layout>
      <Box my={3}>
        <Box my={2} textAlign="center">
          <h3>What is the purpose of this site?</h3>
          <h5>
            "There are three kinds of lies: lies, damned lies, and statistics."
            - Mark Twain
          </h5>
        </Box>
        <p>
          "Data" properly understood is fundamentally just a tool. On its own
          and without context, data can't really tell you very much. If someone tells you
          that they make $60k a year, how much does that really tell you about their standard
          of living, how well they are able to support a family, etc.? This obviously depends
          on where you're living. $60k in San Francisco gets you a lot less than $60k in Boise, ID.
        </p>
        <p>
          The same of course is true when discussing COVID-19 and its impacts. 100 fatalities in a town of
          30k people means something entirely differeant than in one with 1 million, and both
          circumstances would demand completely divergent policy responses. The same is true when we're talking
          about testing. 1k positive test results means something very different when 50% of them are asymptomatic
          (i.e. exhibiting no symptoms or adverse effects) vs. only 5% and has wildly varying impacts on an area's
          hospital system.
        </p>

        <p>
          <strong>This is not meant to be a political statement</strong>
        </p>
      </Box>

      <Box my={3}>
        <h3>How to use this site</h3>
        <Divider />
      </Box>

      <Box my={3}>
        <Box mb={5}>
          <h3 id="data">Data Sources</h3>
          <Divider />
        </Box>
        <p>
          State Level Data:{" "}
          <a href="https://covidtracking.com/data/api">
            COVID Tracking Project
          </a>
        </p>
        <p>
          Populations (US): <a href="https://datausa.io/">DataUSA.io</a>
        </p>
        <p>
          Employment Statistics (US):{" "}
          <a href="https://datausa.io/">DataUSA.io</a>
        </p>
        <p>
          Rt (transmission rate) Data: <a href="https://rt.live/">Rt.live</a>
        </p>
        <p>
          Country-level Data:{" "}
          <a href="https://github.com/owid/covid-19-data/tree/master/public/data/">
            Our World In Data (OWID)
          </a>
        </p>
      </Box>
    </Layout>
  )
}

export default IndexPage
