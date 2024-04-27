import * as React from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';


import { styled } from '@mui/system';
import { Button, Slider, Typography } from '@mui/material';
import { Checkbox } from '@mui/material';
import { MapboxMap } from './Mapbox';

import { useCallback } from 'react';
import { postInsights } from './api';

const FormGrid = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

function dataURLToBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export default function Map() {
  const [opacity, setOpacity] = React.useState(30);
  const [map, setMap] = React.useState(null);
  const [showMap, setShowMap] = React.useState(true);
  const [satelliteImage, setSatelliteImage] = React.useState(null);
  const [deforestationImage, setDeforestationImage] = React.useState(null);
  const urlCreator = window.URL || window.webkitURL;

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleOpacityChange = (event, newValue) => {
    setOpacity(newValue);
  };

  const handleScreenshot = (event) => {
    const dataURL = map.getCanvas().toDataURL("image/png");
    setSatelliteImage(dataURLToBlob(dataURL));
    const blob = dataURLToBlob(dataURL);
    // replace live map with static image
    setShowMap(false);
    const formData = new FormData();
    formData.append('image', blob, 'image');
    formData.append('mask', blob, 'mask');
    postInsights(formData).then((response) => {
      console.log(response);
    });
  };

  const handleShowMap = (event) => {
    setShowMap(true);
  }

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap>
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
            {showMap ? <>
              <MapboxMap
                style="mapbox://styles/mapbox/satellite-v9"
                containerStyle={{
                  height: '800px',
                  width: '800px',
                  borderRadius: 8,
                  marginBottom: "16px",
                }}
                onStyleLoad={handleMapLoad}
              />
              <Button variant="outlined" color="primary" onClick={handleScreenshot}>Analyze Area</Button>
            </> : <>
              <img src={urlCreator.createObjectURL(satelliteImage)} style={{ height: "800px", width: "800px", borderRadius: 8, marginBottom: "16px" }} alt="satellite" />
              <Button variant="outlined" color="primary" onClick={handleShowMap}>Show Map</Button>
            </>}

          </FormGrid>
        </Box>
      </Box>
    </Stack>
  );
}
