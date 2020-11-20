import { Box, Button, Grid } from "@material-ui/core"
import { navigate } from "gatsby"
import React, { useEffect, useState } from "react"

const navList: { title: string; path: string }[] = [
  {
    title: "NY Messed Up",
    path: "ny-messed-up",
  },
  {
    title: "NY Beat COVID-19",
    path: "ny-beat-covid",
  },
  {
    title: "US Mishandled COVID-19",
    path: "us-mishandled-covid",
  },
  {
    title: "US Outperformed",
    path: "us-outperformed",
  },
  {
    title: "Policy Impacts",
    path: "policies",
  },
]

const onClick = (e: React.MouseEvent, path: string) => {
  e.preventDefault()
  navigate(`/${path}`)
}

const NarrativeMenu = () => {
  const [currentPage, setCurrentPage] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPage(window.location.pathname)
    }
  }, [currentPage])

  return (
    <Box my={3}>
      <Grid container justify="space-around">
        {navList.map(navItem => (
          <Grid item key={navItem.path}>
            <Button
              variant="outlined"
              size="large"
              onClick={e => onClick(e, navItem.path)}
              color="primary"
              disabled={currentPage.includes(navItem.path)}
            >
              {navItem.title}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default NarrativeMenu
