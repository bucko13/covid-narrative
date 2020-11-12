import React, { useContext, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import {
  AppBar,
  Toolbar,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Grid,
  FormControlLabel,
  Switch,
} from "@material-ui/core"
import { Home, Menu } from "@material-ui/icons"
import { ShowAboutContext } from "./layout"
import { titleify } from "../utils/helpers"

interface HeaderProps {
  siteTitle: string
  menu: {
    name: string
    path: string
  }[]
}

const Header = ({ siteTitle, menu }: HeaderProps) => {
  const [open, setOpen] = useState(false)
  const { showAbout, setShowAbout } = useContext(ShowAboutContext)

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return
    }
    setOpen(!open)
  }

  const pageTitle =
    typeof window !== "undefined" && window.location
      ? titleify(window.location.pathname)
      : ""

  return (
    <header>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Grid container>
            <Link
              to="/"
              style={{
                color: `white`,
                textDecoration: `none`,
                marginRight: "1rem",
                minWidth: "90%",
              }}
            >
              <Grid container alignItems="center">
                <Grid item style={{ marginRight: "1rem" }}>
                  <Home fontSize="large" />
                </Grid>
                <Grid item xs={10}>
                  <h1>
                    {siteTitle}
                    {pageTitle.length > 1 ? ` - ${pageTitle}` : ""}
                  </h1>
                </Grid>
              </Grid>
            </Link>
          </Grid>
          <IconButton
            edge="end"
            aria-label="menu"
            onClick={toggleDrawer}
            style={{ color: "white", position: "absolute", right: "1rem" }}
          >
            <Menu fontSize="large" />
          </IconButton>
          <SwipeableDrawer
            anchor="right"
            open={open}
            onClose={toggleDrawer}
            onOpen={toggleDrawer}
          >
            <div style={{ width: 250 }}>
              <List>
                {menu.map(item => (
                  <ListItem
                    button
                    component={props => <Link to={item.path} {...props} />}
                    key={item.name}
                  >
                    <ListItemText primary={item.name.toUpperCase()} />
                  </ListItem>
                ))}
                <ListItem
                  component={() => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAbout}
                          onChange={() => setShowAbout(!showAbout)}
                          name="Show Graph Explanations"
                          color="primary"
                        />
                      }
                      labelPlacement="end"
                      label="Show Graph Explanations"
                    />
                  )}
                />
              </List>
            </div>
          </SwipeableDrawer>
        </Toolbar>
      </AppBar>
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
