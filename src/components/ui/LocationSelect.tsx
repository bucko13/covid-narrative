import {
  capitalize,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from "@material-ui/core"
import React from "react"
import { makeStyles } from "@material-ui/core"
import { ThreeLiesData } from "../../../plugins/source-covid-data/types"
import {
  codeToCountry as codeToCountry_,
  codeToState as codeToState_,
} from "../../../plugins/source-covid-data/constants"

// get index signature for ts so we can key by variable
const codeToCountry: { [code: string]: string } = codeToCountry_
const codeToState: { [code: string]: string } = codeToState_

const useStyles = makeStyles({
  select: {
    fontSize: "1.5rem",
    marginTop: "5px",
    paddingBottom: "0px",
  },
  formControl: {
    minWidth: "150px",
    marginBottom: "1rem",
    fontSize: "1.5rem",
  },
})

interface LocationSelectProps {
  locations: ThreeLiesData[]
  onChangeLocation: (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void
  value: string
  // displayValue: string
  helperText?: string
}

export const LocationSelect = ({
  locations,
  onChangeLocation,
  value,
  helperText = "Select Location",
}: LocationSelectProps) => {
  const classes = useStyles()
  const locationsList = locations.sort(({ name: nameA }, { name: nameB }) => {
    if (nameA.toLowerCase() < nameB.toLowerCase()) return -1
    if (nameA.toLowerCase() > nameB.toLowerCase()) return 1
    return 0
  })
  return (
    <FormControl classes={{ root: classes.formControl }}>
      <Select
        labelId="select-country"
        id="select-country"
        value={value}
        onChange={onChangeLocation}
        inputProps={{ style: { fontSize: "1.5rem" } }}
        classes={{ select: classes.select }}
      >
        {locationsList.map(({ code, name }) => (
          <MenuItem value={code} key={code}>
            {capitalize(name)}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  )
}
