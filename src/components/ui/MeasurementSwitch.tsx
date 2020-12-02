import {
  FormControlLabel,
  FormControlLabelProps,
  Grid,
  Switch,
} from "@material-ui/core"
import React from "react"
import styles from "./MeasurementSwitch.module.scss"

interface SwitchProps {
  isChecked: boolean
  onSwitch: (val: boolean) => void
  label?: string
  labelPlacement?: FormControlLabelProps["labelPlacement"]
  offLabel?: string
  onLabel?: string
}

const MeasurementSwitch = ({
  isChecked = true,
  onSwitch,
  label,
  labelPlacement = "end",
  offLabel,
  onLabel,
}: SwitchProps) => (
  <Grid container component="label" alignContent="center" spacing={1}>
    {offLabel && (
      <Grid item className={styles.switchSideLabels}>
        {offLabel}
      </Grid>
    )}
    <Grid item>
      <FormControlLabel
        control={
          <Switch
            checked={isChecked}
            onChange={() => onSwitch(!isChecked)}
            color="primary"
            name={label}
          />
        }
        className={styles.switch}
        labelPlacement={labelPlacement}
        label={label}
      />
    </Grid>
    {onLabel && (
      <Grid item className={styles.switchSideLabels}>
        {onLabel}
      </Grid>
    )}
  </Grid>
)

export default MeasurementSwitch
