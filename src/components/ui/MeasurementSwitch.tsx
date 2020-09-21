import { FormControlLabel, Switch } from '@material-ui/core';
import React from 'react';

interface SwitchProps {
  isChecked: boolean
  onSwitch: (val: boolean) => void
  label: string
}

const MeasurementSwitch = ({
  isChecked=true,
  onSwitch,
  label,
}: SwitchProps) => (
  <FormControlLabel
    control={
      <Switch
        checked={isChecked}
        onChange={() => onSwitch(!isChecked)}
        color="primary"
        name={label}
      />
    }
    label={label}
  />
  )

export default MeasurementSwitch