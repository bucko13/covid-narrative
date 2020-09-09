import React from "react"
import { Box } from "@material-ui/core"
import Layout from "../components/layout"
import './index.scss'
import { Link } from "gatsby"

const IndexPage = () => {
  return (
    <Layout>
      <div className="home-content">
        <Box my={3}>
          <h5 id="about">
            "There are three kinds of lies: lies, damned lies, and statistics."
            <br />- Mark Twain
          </h5>
          <p>
            Data properly understood is fundamentally just a tool. On its own
            and without context, data can't really tell you very much. If
            someone tells you that they make $60k a year, how much does that
            really tell you about their standard of living or how well they are
            able to support a family? This obviously depends on context, first
            and foremost where you're living. $60k in San Francisco for example
            gets you a lot less than $60k in Boise, ID.
          </p>
          <p>
            The same of course is true when discussing COVID-19 and its impacts.
            100 fatalities in a town of 30k people means something entirely
            differeant than in one with 1 million, and both circumstances would
            demand completely divergent policy responses. The same is true when
            we're talking about testing. 1k positive test results means
            something very different when 50% of them are asymptomatic (i.e.
            exhibiting no symptoms or adverse effects) vs. only 5% and has
            wildly varying impacts on an area's hospital system. The list of
            confounding variables goes on and on: age demographics,
            comorbitities, date of first recorded cases, etc.
          </p>

          <h4>What is the purpose of this site?</h4>
          <p>
            The goal of this site is to make the case that data on its own tells
            us very little. By taking, in most cases,{" "}
            <strong>the exact same data sets</strong> on the impacts of COVID-19
            on regions in the U.S. and around the world, but painting a
            completely different picture either by changing the time frame or
            using different "lenses" through which to visualize the data, we can
            show how easily real data can be{" "}
            <a
              href="https://simplicable.com/new/data-massage"
              target="_blank"
              rel="noreferrer"
            >
              massaged
            </a>{" "}
            to further a particular narrative.
          </p>
          <h5>What does it mean to "follow the data"?</h5>
          <p>
            When someone says that they believe in science or they're listening
            to the "experts", more often than not it's a way to shut down
            debate. Who can argue with science after all! Science is only as
            effective as the dissent that is allowed to be brought to it.
          </p>

          <p>
            While data itself doesn't lie, people can use real data in service
            of one.
          </p>
        </Box>

        <Box my={3}>
          <h3 className="divider">How to use this site</h3>
          <p>
            At the <Link to="#top">top</Link> of every page is a list of buttons
            that list out a series of narratives commonly heard about COVID-19.
            Each "Narrative Page" contains a set of visualizations using
            publicly available <Link to="#">data</Link> to make the case for
            that narrative.
          </p>
          <p>
            For example, if you want to make the case that{" "}
            <Link to="/ny-beat-covid">New York State "beat" COVID-19</Link>, you
            can view a graph that shows fatality and case counts from after late
            May. Conversely if you want to see how the{" "}
            <Link to="/us-outperformed">US outperformed</Link> other countries
            in Europe, there are a set of graphs that show data adjusted for population.
          </p>
          <p>
            <Box textAlign="center">
              <strong>This is not meant to be a political statement</strong>
            </Box>
          </p>
          <p>
            While there are some conclusions that can be clearly drawn when all the narratives
            are laid out side-by-side, the point is not to cast blame on any set of politicians.
            Taking any of these narratives on their own is precisely how partisans play political
            games, getting their followers scared or riled up.
          </p>
          <p>
            Rather, the story we see is more about how little we knew when the virus first hit and
            how the story of what happened, what worked, and what didn't is a more complicated one.
            One major difference between the first and second halves of 2020 though is that at the
            beginning of the year, we didn't have access to this much data, nor the ability to see
            the types of patterns that are becoming much more clear.
          </p>
          <p>
            My hope is that by not letting demagogues control public fear and perception by telling
            us to trust them because they "believe in science", but rather look at the story
            the data is telling us for ourselves, we can make better, more informed decisions as a society.
          </p>
        </Box>

        <Box my={3}>
          <h3 className="divider" id="data">
            Data Sources
          </h3>
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

        <Box my={3}>
          <h3 className="divider" id="acknowledgements">Acknowledgements</h3>
        </Box>
      </div>
    </Layout>
  )
}

export default IndexPage
