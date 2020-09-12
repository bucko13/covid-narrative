/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, navigate } from "gatsby"
import SEO from "./seo"
import Header from "./header"
import "./layout.scss"
import { Button, Grid, Box, ThemeProvider, Fab } from "@material-ui/core"
import CustomTheme from "../CustomTheme"
import { Navigation } from "@material-ui/icons"

const Layout = ({ children }: any) => {
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
  const navList: {title: string; path: string}[] = [
    {
      title: 'NY Messed Up',
      path: 'ny-messed-up'
    },
    {
      title: 'NY Beat COVID-19',
      path: 'ny-beat-covid',
    },
    {
      title: 'US Mishandled COVID-19',
      path: 'us-mishandled',
    },
    {
      title: 'US Outperformed',
      path: 'us-outperformed',
    }
  ];

  const onClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(`/${path}`);

  }

  const pathname = typeof window !== "undefined" ? window.location.pathname : ""

  return (
    <ThemeProvider theme={CustomTheme}>
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
        <Box
          mt={-13}
          id="top"
          style={{ position: "absolute" }}
        ></Box>
        <Box my={3} mt={13}>
          <Grid container justify="space-around">
            {navList.map(navItem => (
              <Grid item key={navItem.path}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={e => onClick(e, navItem.path)}
                  color="primary"
                  disabled={pathname.includes(navItem.path)}
                >
                  {navItem.title}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
        <main>{children}</main>
        <Fab color="primary"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20
          }}
          href="#top"
        >
          <Navigation />
        </Fab>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </ThemeProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
