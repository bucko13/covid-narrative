import React, { useState } from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, navigate } from "gatsby"
import SEO from "./seo"
import Header from "./header"
import "./layout.scss"
import { Grid, Box, ThemeProvider, Fab, IconButton } from "@material-ui/core"
import CustomTheme from "../CustomTheme"
import { GitHub, Navigation, Twitter } from "@material-ui/icons"
import { NarrativeMenu } from "./ui"

export const ShowAboutContext = React.createContext({
  showAbout: true,
  // tslint:disable-next-line: no-empty
  setShowAbout: (_current: boolean):void => { },
})

const Layout = ({ children }: any) => {
  // for setting ShowAboutContext
  const [showAbout, setShowAbout] = useState(true)

  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          menu {
            name
            path
          }
        }
      }
    }
  `)

  return (
    <ThemeProvider theme={CustomTheme}>
      <ShowAboutContext.Provider value={{ showAbout, setShowAbout }}>
        <Header
          siteTitle={data.site.siteMetadata.title}
          menu={data.site.siteMetadata.menu}
        />
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `0 1.0875rem 1.45rem`,
          }}
        >
          <SEO title="COVID-19 Narratives By the Numbers" />
          <Box mt={-13} id="top" style={{ position: "absolute" }}></Box>
          <Box mt={13}>
            <NarrativeMenu />
          </Box>
          <main>{children}</main>
          <Fab
            color="primary"
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
            }}
            href="#top"
          >
            <Navigation />
          </Fab>
          <footer>
            <div className="divider" />
            <Grid container justify="space-between" align-items="center">
              <Grid item>
                © {new Date().getFullYear()}, Built with
                {` `}
                <a href="https://www.gatsbyjs.org">Gatsby</a>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() =>
                    navigate("https://github.com/bucko13/covid-narrative")
                  }
                >
                  <GitHub />
                </IconButton>
                <IconButton
                  onClick={() => navigate("https://twitter.com/BuckPerley")}
                >
                  <Twitter />
                </IconButton>
              </Grid>
            </Grid>
          </footer>
        </div>
      </ShowAboutContext.Provider>
    </ThemeProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
