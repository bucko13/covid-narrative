import React from "react"
import { Box, List, ListItem, ListItemText } from "@material-ui/core"
import Layout from "../components/layout"
import "./index.scss"
import { Link } from "gatsby"
import { ReactComponentLike } from "prop-types"
import { linkify } from "../utils/utils"
import "./faq.scss";
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
          <ExternalLink
            href="https://github.com/bucko13/covid-narrative"
          >
            here
          </ExternalLink>. If you're comfortable running a couple commands in the
          terminal, you can even run the site yourself with your own data.
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
            <ExternalLink
              href="https://www.bloomberg.com/news/articles/2020-08-17/malaysia-detects-virus-strain-that-s-10-times-more-infectious"
            >
              different strains of the virus
            </ExternalLink>{" "}
            for example, some (notably the European strain which is what
            primarily effected the U.S.) being more deadly than others.
          </p>
          <p>
            In another example, while New Zealand is widely considered to have
            handled the pandemic well, their situation, being incredibly remote,
            an island that is easier to block travel to and from, and being much
            more sparsely populated than other parts of the world, doesn't give
            an accurate comparisons in terms of situations that countries in
            Europe and North America faced.
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
          <ExternalLink
            href="https://github.com/bucko13/covid-narrative"
          >
            GitHub repo
          </ExternalLink>. For those not as comfortable with GitHub, feel free to reach out on Twitter {" "}
          <ExternalLink href="https://twitter.com/BuckPerley">@BuckPerley</ExternalLink>.
        </p>
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
          {
            questions.map(({ question }) => (
              <ListItem button component={Link} to={`#${linkify(question)}`}>
                <ListItemText primary={question} />
              </ListItem>
            ))
          }
        </List>
      </Box>
      {
        questions.map(({question, Answer}) => (
          <div className="answer" key={linkify(question)}>
            <h5 id={linkify(question)}>{question}</h5>
            <Answer />
          </div>
        ))
      }
    </Layout>
  )
}

export default FAQPage
