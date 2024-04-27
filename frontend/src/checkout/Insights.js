import * as React from 'react';
import PropTypes from 'prop-types';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Button, FormLabel, OutlinedInput, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import { getInsights } from './api';

const FormGrid = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

function Insights() {
  const [longitude, setLongitude] = React.useState(0);
  const [latitude, setLatitude] = React.useState(0);
  const [insights, setInsights] = React.useState(null);

  return (
    <React.Fragment>
      <FormGrid sx={{ flexDirection: "column", gap: 2 }}>
        <FormGrid sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <OutlinedInput placeholder='Longitude' value={longitude} onChange={(x) => setLongitude(x.target.value)} type='number' />
          <OutlinedInput placeholder='Latitude' value={latitude} onChange={(x) => setLatitude(x.target.value)} type='number' />
        </FormGrid>
        <Button variant="outlined" color="primary" onClick={() => { console.log(longitude, latitude); console.log(getInsights(longitude, latitude)) }}>
          Analyze</Button>
      </FormGrid>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 8,
          mt: 4,
          height: { xs: 300, sm: 350, md: 200 },
          width: '100%',
          borderRadius: '20px',
          border: '1px solid ',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 8,
          mt: 4,
          height: { xs: 300, sm: 350, md: 375 },
          width: '100%',
          borderRadius: '20px',
          border: '1px solid ',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        }}
      />
      <Typography></Typography>
    </React.Fragment>
  );
}

Insights.propTypes = {
  totalPrice: PropTypes.string.isRequired,
};

export default Insights;
