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
import "./layout.css"
import { Typography, Button, Grid, Box, ThemeProvider } from "@material-ui/core"
import CustomTheme from "../CustomTheme"

const Layout = ({ children }: any) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
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
      path: 'ny-beat-covid-19',
    },
    {
      title: 'US Mishandled COVID-19',
      path: 'us-mishandled-covid-19',
    },
    {
      title: 'US Outperformed',
      path: 'us-outperformed',
    }
  ];

  const onClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  
  }
  return (
    <ThemeProvider theme={CustomTheme}>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
        <SEO title="COVID-19 Data By the Numbers" />
        <Typography>
          "There are three kinds of lies: lies, damned lies, and statistics." -
          Mark Twain
        </Typography>
        <Box my={3}>
          <Grid container justify="space-around">
            {
              navList.map(navItem => (
                <Grid item>
                  <Button 
                    variant="outlined" 
                    onClick={(e) => onClick(e, navItem.path)}
                    key={navItem.path}
                    color="primary"
                    disabled={window.location.pathname.includes(navItem.path)}
                    >
                    {navItem.title}
                  </Button>
                </Grid>
              ))
            }
          </Grid>
        </Box>
        <main>{children}</main>
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
