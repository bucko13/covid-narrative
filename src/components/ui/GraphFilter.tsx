import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
} from "@material-ui/core"
import React from "react"

interface GraphFilterPropTypes {
  items: { [key: string]: boolean }
  handleChange: (event: React.ChangeEvent) => void
}

const GraphFilter = ({ items, handleChange }: GraphFilterPropTypes) => (
  <FormControl component="fieldset">
    <FormGroup>
      <Grid container>
        {Object.keys(items).map(item => (
          <Grid item key={item}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={items[item]}
                  onChange={handleChange}
                  name={item}
                />
              }
              label={item.toUpperCase()}
            />
          </Grid>
        ))}
      </Grid>
    </FormGroup>
  </FormControl>
)

export default GraphFilter
