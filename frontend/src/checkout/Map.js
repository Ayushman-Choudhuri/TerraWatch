import * as React from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';


import { styled } from '@mui/system';
import { Slider, Typography } from '@mui/material';
import { Checkbox } from '@mui/material';
import { MapboxMap } from './Mapbox';

import { useCallback } from 'react';

const FormGrid = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function Map() {
  const [opacity, setOpacity] = React.useState(30);
  const [map, setMap] = React.useState(null);

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleOpacityChange = (event, newValue) => {
    setOpacity(newValue);
  };

  const handleScreenshot = (event) => {
    const dataURL = map.getCanvas().toDataURL("image/png");
    const link = document.createElement('a');
    link.download = 'map-screenshot.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
      <FormControl component="fieldset" fullWidth>
      </FormControl>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: "1",
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
            p: 3,
            borderRadius: '20px',
            border: '1px solid ',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <FormGrid sx={{ width: "100%" }}>
            <FormGrid sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: "center", justifyContent: "center", alignContent: "center" }}>
              <Typography>Mask Opacity</Typography>
              <Slider min={0} max={100} defaultValue={30} value={opacity} onChange={handleOpacityChange} marks={[{ value: 0, label: "0%" }, { value: 100, label: "100%" }]} />
              <Checkbox onChange={handleScreenshot} />
              <Typography>Deforestation Outline</Typography>
            </FormGrid>
          </FormGrid>
          <FormGrid>
            <MapboxMap
              style="mapbox://styles/mapbox/satellite-v9"
              containerStyle={{
                height: '700px',
                width: '700px'
              }}
              onStyleLoad={handleMapLoad}
            >
            </MapboxMap>;
          </FormGrid>
        </Box>
      </Box>
    </Stack>
  );
}
