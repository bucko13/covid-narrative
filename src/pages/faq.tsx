import React from "react"
import { Box, List, ListItem, ListItemText } from "@material-ui/core"
import Layout from "../components/layout"
import "./index.scss"
import { Link } from "gatsby"
import { ReactComponentLike } from "prop-types"
import { linkify } from "../utils/helpers"
import "./faq.scss"
import ExternalLink from "../components/ExternalLink"

interface Question {
  question: string
  Answer: ReactComponentLike
}

const FAQPage = () => {
  const questions: Question[] = [
    {
      question: "Where did you source your data from?",
      Answer: () => (
        <p>
          Most U.S. state-level data comes from the COVID Tracking Project by
          The Atlantic. Country level data comes from Our World in Data (OWID).
          You can learn more about where the data is sourced from the{" "}
          <Link to="/#data">data</Link> section of the website.
        </p>
      ),
    },
    {
      question: "How can I trust your data?",
      Answer: () => (
        <p>
          You don't have to! All of the code for this website, including data
          sourcing and custom calculations, is open source and auditble by
          anyone on GitHub{" "}
          <ExternalLink href="https://github.com/bucko13/covid-narrative">
            here
          </ExternalLink>
          . If you're comfortable running a couple commands in the terminal, you
          can even run the site yourself with your own data.
        </p>
      ),
    },
    {
      question: "Why are only certain regions shown?",
      Answer: () => (
        <>
          <p>
            This was primarily a matter of convenience. There are websites that
            can give you COVID tracking data for nearly every country in the
            world and even regional-level data for many of those (such as states
            and counties in the US). Since the point of this project is to show
            how narratives can be shaped using data, most of the comparisons
            were chosen because of how often they are discussed together (e.g.
            NY compared to Florida) or because they offer more similar
            situations (strain of the virus, demographics, geography, etc.).
          </p>
          <p>
            In particular, some countries don't make as much sense to compare
            together for data purposes. Different areas of the world got hit
            with{" "}
            <ExternalLink href="https://www.bloomberg.com/news/articles/2020-08-17/malaysia-detects-virus-strain-that-s-10-times-more-infectious">
              different strains of the virus
            </ExternalLink>{" "}
            for example, some (notably the European strain which is what
            primarily affected the U.S.) being more deadly than others.
          </p>
          <p>
            New Zealand is often given as an example of a country that is widely
            considered to have handled the pandemic well. However, if we
            consider their situation, being incredibly remote, an island that is
            easier to block travel to and from, and being much more sparsely
            populated than other parts of the world, it doesn't give as useful
            of a comparison in terms of situations that countries in Europe and
            North America faced.
          </p>
        </>
      ),
    },
    {
      question:
        "What if I think another region, comparison, or narrative should be shown?",
      Answer: () => (
        <p>
          For now, requests and contributions are welcome in the{" "}
          <ExternalLink href="https://github.com/bucko13/covid-narrative">
            GitHub repo
          </ExternalLink>
          . For those not as comfortable with GitHub, feel free to reach out on
          Twitter{" "}
          <ExternalLink href="https://twitter.com/BuckPerley">
            @BuckPerley
          </ExternalLink>
          .
        </p>
      ),
    },
    {
      question: `What is "smoothed" data?`,
      Answer: () => (
        <p>
          For "smoothed" data, I took the rolling 7-day average for any given
          date. Some data sources provide this out of the box and for others it
          needed to be calculated manually. The reason to use this is that the
          data reporting is not always consistent over time. For example, some
          data points get underreported on weekends. Getting the average over
          the previous 7 days still gives us an accurate picture (possibly more
          accurate) of the outcomes in a way that is easier and more accurate to
          illustrate in the graph when smoothed.
        </p>
      ),
    },
    {
      question: `What are some other narratives you plan on adding?`,
      Answer: () => (
        <>
          <p>
            My next priorities are the narratives around lockdowns, mobility,
            and possibly mask usage as these seem to be some of the most
            contentious, political, and, as a result, likely manipulated
            narratives.
          </p>
          <p>
            I would also like look more into the economic ramifications of
            policy decisions particularly when compared to health outcomes and
            how they correlate.
          </p>
          <p>
            Data isn't my specialty though and these are trickier things to
            graph especially since the data is not as precise and the impacts
            are harder to display graphically. If this is something you're
            interested in and have experience with, feel free to reach out!
          </p>
        </>
      ),
    },
    {
      question: `Why are some of the colors so terrible?`,
      Answer: () => (
        <>
          <p>
            The colors are generated using a random color generator seeded by an
            item from the data being displayed, making the color deterministic
            and consistent. The generator is supposed to pick from an
            aesthetically pleasing palette but it's not perfect. Picking the
            colors progamattically rather than manually assigning colors to each
            chart, line, and bar means I can easily remove and add new data sets
            with minimal effort, but it also means that sometimes there are some
            jarring color choices.
          </p>
        </>
      ),
    },
    {
      question: `How often is the data updated?`,
      Answer: () => (
        <>
          <p>
            There's currently no set schedule, but every chart should make it
            clear the time frames that are being used. If it's missing
            somewhere, please let me know on Twitter or GitHub, or you can
            submit a pull request with a fix. For any raw data that is kept in
            JSON form on GitHub, you can also see the last date a file was
            updated{" "}
            <ExternalLink href="https://github.com/bucko13/covid-narrative/tree/master/src/data">
              here
            </ExternalLink>{" "}
            or{" "}
            <ExternalLink href="https://github.com/bucko13/covid-narrative/tree/master/plugins/source-covid-data/data">
              here
            </ExternalLink>
            . Sometimes though shorter selective timeframes are deliberate as
            this can be a common way to shape a narrative with data.
          </p>
        </>
      ),
    },
    {
      question: `What's the tech stack you use?`,
      Answer: () => (
        <>
          <p>
            Everything is written in Typescript for no other reason than that
            (JS) is the language I'm most comfortable with, performance wasn't a
            huge issue, and I built this as a side project without too much time
            to work with more data friendly languages.
          </p>
          <p>
            The site is built and deployed as a serverless app using{" "}
            <ExternalLink href="https://gatsbyjs.com/">Gatsby</ExternalLink>.
            Data pre-processing is done in Nodejs and it's hosted/deployed
            automatically using{" "}
            <ExternalLink href="https://vercel.com">Vercel</ExternalLink>.
            Visualizations are rendered using a wrapper library around{" "}
            <ExternalLink href="">D3</ExternalLink> called{" "}
            <ExternalLink href="http://recharts.org/">recharts</ExternalLink>.
          </p>
        </>
      ),
    },
    {
      question: `Got more questions?`,
      Answer: () => (
        <>
          <p>
            Let me know on{" "}
            <ExternalLink href="https://github.com/bucko13/covid-narrative">
              GitHub
            </ExternalLink>{" "}
            or Twitter,{" "}
            <ExternalLink href="https://twitter.com/BuckPerley">
              @BuckPerley
            </ExternalLink>
            , and I'll do my best to answer!
          </p>
        </>
      ),
    },
  ]
  return (
    <Layout>
      <Box my={3}>
        <h3>Frequently Asked Questions</h3>
      </Box>
      <Box>
        <List>
          {questions.map(({ question }) => (
            <ListItem button component={Link} to={`#${linkify(question)}`}>
              <ListItemText primary={question} />
            </ListItem>
          ))}
        </List>
      </Box>
      {questions.map(({ question, Answer }) => (
        <div className="answer" key={linkify(question)}>
          <h5 id={linkify(question)}>{question}</h5>
          <Answer />
        </div>
      ))}
    </Layout>
  )
}

export default FAQPage
