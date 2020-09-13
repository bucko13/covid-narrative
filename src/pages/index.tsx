import React from "react"
import { Box } from "@material-ui/core"
import Layout from "../components/layout"
import './index.scss'
import { Link } from "gatsby"
import ExternalLink from "../components/ExternalLink"

const IndexPage = () => {
  const acknowledgements: string[] = [
    "politicalmath",
    "gummibear737",
    "EconTalker",
    "boriquagato",
    "BallouxFrancois",
    "EthicalSkeptic",
    "Hold2LLC",
  ]
  
  return (
    <Layout>
      <div className="home-content">
        <Box my={3}>
          <h5 id="about">
            "There are three kinds of lies: lies, damned lies, and statistics."
            <br />- Mark Twain
          </h5>
          <p>
            The best way to think about data is as a tool. On its own and
            without context, data can't really tell you very much. If someone
            tells you that they make $60k a year, how much does that really tell
            you about their standard of living or how well they are able to
            support a family? This obviously depends on context, first and
            foremost where you're living. $60k in San Francisco for example gets
            you a lot less than $60k in Boise, ID.
          </p>
          <p>
            The same of course is true when discussing COVID-19 and its impacts.
            100 fatalities in a town of 30k people means something entirely
            differeant than in one with 1 million, and both circumstances would
            demand completely divergent policy responses. The same is true when
            we're talking about testing. 1k positive test results tells us
            something very different when there are 50% positive or 4% or when
            half of them are asymptomatic vs. only 5%. All of which has wildly
            divergent implications on an area's hospital system. The list of
            confounding variables goes on and on: patient age, demographics,
            comorbitities, date of first recorded cases, population density,
            culture, etc.
          </p>

          <h4>What is the purpose of this site?</h4>
          <p>
            The goal of this site is to make the case that data on its own tells
            us very little. By taking, in most cases,{" "}
            <strong>the exact same data sets</strong> regarding the impacts of
            COVID-19 on regions in the U.S. and around the world but painting a
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
          <h5>Cargo Cult Science</h5>
          <p>
            When someone says that they only trust in science or they're
            listening to the "experts", more often than not it's a way to shut
            down debate. Who can argue with science after all! Unfortunately,
            the truth is that science is only as effective as the dissent that
            is allowed to be brought to it and data on its own isn't the same
            thing as doing science.
          </p>
          <p>
            While data itself doesn't lie, people can use real data in service
            of one.
          </p>
          <p>
            This is the general idea of "Cargo Cult Science",first introduced by
            Doctor Richard Feynman in 1974: the process of going through the
            motions of "science" more as a performative exercise but which
            ultimately undermines the search for knowledge that it is meant to
            represent. This project is meant to highlight how seductive this
            tendency can be by showing some examples of how this has been
            happening with our current narratives, even for something as
            important as a global pandemic.
          </p>
          <p>
            Learn more about this idea of "Cargo Cult Scientists" and what Dr.
            Feynman had to say about it{" "}
            <ExternalLink href="https://medium.com/@BuckPerley/beware-the-cargo-cult-scientists-ab18758bf878">
              here
            </ExternalLink>
            .
          </p>
        </Box>

        <Box my={3}>
          <h3 className="divider">How to use this site</h3>
          <h6>The Narratives</h6>
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
            in Europe, there are a set of graphs that show data adjusted for
            population.
          </p>
          <h6>The Explanations</h6>
          <p>
            Each graph has an accompanying description that details what can
            potentially be learned from the visualization as well as any
            explanations regarding special calculations or data abstractions
            being done. These explanations can be toggled on and off via the
            main menu accessible from the header navigation.
          </p>
          <h6>The Filters + Comparisons</h6>
          <p>
            Many visualizations offer filters so that you can view
            comparisons between regions in a more isolated way. It's useful
            to have many regions available to make the comparisons but it can
            sometimes make the graph too crowded. There are also switches
            on some graphs so that you can alternate between absolute and
            relative views (e.g. cases per 100k). Most narratives have
            corresponding alternatives in an opposing narrative that you can
            also look to for comparision. Where relevant, this will be linked
            in the graph explanation.
          </p>
          <p>
            <Box textAlign="center">
              <strong>This is not meant to be a political statement</strong>
            </Box>
          </p>
          <p>
            While there are some conclusions that can be clearly drawn when all
            the narratives are laid out side-by-side, the point is not to cast
            blame on any set of politicians. Taking any of these narratives on
            their own is precisely how partisans play political games, getting
            their followers scared or riled up.
          </p>
          <p>
            Rather, the story we see is more about how little we knew when the
            virus first hit and how the story of what happened, what worked, and
            what didn't is a more complicated one. One major difference between
            the first and second halves of 2020 though is that at the beginning
            of the year, we didn't have access to this much data nor the ability
            to see the types of patterns that are becoming much more clear in
            hindsight.
          </p>
          <p>
            My hope is that by not letting demagogues control public fear and
            perception by telling us to trust them because they "believe in
            science", but rather look at the story the data is telling us for
            ourselves, we can make better, more informed decisions as a society,
            and hopefully start to better hold our political leaders accountable
            in a more honest way.
          </p>
        </Box>

        <Box my={3}>
          <h3 className="divider" id="data">
            Data Sources
          </h3>
          <p>
            All of the data you see on this site was sourced from the following
            websites and API services. Not all of the data may even have been
            used yet in any visualizations, but they were helpful nonetheless
            and could find their way into future visualizations. Some
            pre-processing is done for certain fields. All data handling as well
            as the saved versions of the raw data files themselves can be viewed
            and reviewed on{" "}
            <ExternalLink href="https://github.com/bucko13/covid-narrative">
              GitHub
            </ExternalLink>
            .
          </p>
          <p>
            Check the <Link to="/faq">FAQ</Link> for any other questions.
          </p>
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
          <p>
            Polimath has a great list of data sources on{" "}
            <ExternalLink href="https://polimath.substack.com/p/measuring-certainty-and-mountains">
              his substack
            </ExternalLink> and his own data visualization tool on{" "}
            <ExternalLink href="https://github.com/politicalmath/covid-sharp">GitHub</ExternalLink>.
          </p>
        </Box>

        <Box my={3}>
          <h3 className="divider" id="acknowledgements">
            Acknowledgements
          </h3>
          <p>
            While the data was all sourced via the channels listed above, I was
            greatly influenced in my thinking and data/trend discovery by the
            following individuals. I found it interesting, as you might too,
            that I quickly found that while primary news sources, the
            self-proclaimed "most trusted names", seemed to be the least
            scrutinized and the most shallow, the sources that I started to turn
            to below were almost all pseudonymous and on Twitter (not on
            official publications). All provided more details, more background,
            and opened themselves up to more scrutiny than what I found in the
            most common "mainstream" narratives.
          </p>
          <p>
            I'm grateful to them for taking the time to put this information out
            there and allowing others to come to their own conclusions with the
            most information possible.
          </p>
          {acknowledgements.map((handle: string) => (
            <p key={handle}>
              <ExternalLink href={`https://twitter.com/${handle}`}>
                @{handle}
              </ExternalLink>
            </p>
          ))}
        </Box>
      </div>
    </Layout>
  )
}

export default IndexPage
