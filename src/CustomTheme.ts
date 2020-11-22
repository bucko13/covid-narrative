import { createMuiTheme } from "@material-ui/core"

const CustomTheme = createMuiTheme({
  typography: {},
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "black",
        color: "white",
      },
    },
  },
})

export default CustomTheme
