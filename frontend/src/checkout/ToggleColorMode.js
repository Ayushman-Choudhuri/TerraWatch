import * as React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';

import ModeNightRoundedIcon from '@mui/icons-material/ModeNightRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';

function ToggleColorMode({ mode, toggleColorMode }) {
  return (
    <IconButton
      onClick={toggleColorMode}
      color="primary"
      aria-label="Theme toggle button"
      style={{ marginLeft: 300 }}
    >
      {mode === 'dark' ? (
        <WbSunnyRoundedIcon fontSize="large" />
      ) : (
        <ModeNightRoundedIcon fontSize="large" />
      )}
    </IconButton>
  );
}

ToggleColorMode.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default ToggleColorMode;
