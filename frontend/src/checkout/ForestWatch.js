import * as React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/system';
import { MapboxMap } from './Mapbox';

import { useCallback } from 'react';
import { getInsights, postInsights } from './api';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import getTheme from './getTheme';
import ToggleColorMode from './ToggleColorMode';

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

export default function Checkout() {
  const [mode, setMode] = React.useState('light');
  const checkoutTheme = createTheme(getTheme(mode));

  const [opacity, setOpacity] = React.useState(30);
  const [map, setMap] = React.useState(null);
  const [showMap, setShowMap] = React.useState(true);
  const [satelliteImage, setSatelliteImage] = React.useState(null);
  const [deforestationImage, setDeforestationImage] = React.useState(null);
  const [generalInsights, setGeneralInsights] = React.useState(null);
  const [detailedInsights, setDetailedInsights] = React.useState(null);

  const [generalInsightsLoading, setGeneralInsightsLoading] = React.useState(false);
  const [detailedInsightsLoading, setDetailedInsightsLoading] = React.useState(false);

  const urlCreator = window.URL || window.webkitURL;

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleOpacityChange = (event, newValue) => {
    setOpacity(newValue);
  };

  const handleScreenshot = (event) => {
    const blob = dataURLToBlob(map.getCanvas().toDataURL("image/png"));
    setSatelliteImage(blob);
    const formData = new FormData();
    console.log(satelliteImage);
    formData.append('image', blob, 'image');
    formData.append('mask', blob, 'mask');
    handleInsights(formData);

    // replace live map with static image
    setShowMap(false);
  };

  const handleInsights = (formData) => {
    const center = map.getCenter();
    const longitude = center.lng;
    const latitude = center.lat;
    getInsights(longitude, latitude).then((response) => {
      console.log("general insights", response);
      setGeneralInsights(response);
    });
    postInsights(formData).then((response) => {
      console.log("detailed insights", response);
      setDetailedInsights(response);
    });
  }

  const handleShowMap = (_) => {
    setShowMap(true);
  }

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={checkoutTheme}>
      <CssBaseline />
      <Grid container >
        <Grid
          item
          md={5}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            height: '100vh',
            pt: 4,
            px: 10,
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            xs={5}
          >
            <Typography variant='h2'>ForestWatch</Typography>
            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: "100%"
            }}
          >
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: "100%",
            }}
          >
            <React.Fragment>
              <FormGrid sx={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
                <Typography>Mask Opacity</Typography>
                <Slider min={0} max={100} defaultValue={30} value={opacity} onChange={handleOpacityChange} marks={[{ value: 0, label: "0%" }, { value: 100, label: "100%" }]} />
              </FormGrid>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1,
                  mt: 4,
                  height: 250,
                  width: '100%',
                  borderRadius: '20px',
                  border: '1px solid ',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                  textAlign: 'left',
                }}
              >
                <Typography variant="h4" gutterBottom component="div" style={{ textAlign: "center" }}>
                  Environmental Details
                </Typography>
                {generalInsights ? <>
                  <Typography variant="body1">
                    <strong>Country:</strong> {generalInsights.country}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type of Biome:</strong> {generalInsights.type_of_biome}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type of Vegetation:</strong> {generalInsights.type_of_vegetation}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type of Forest:</strong> {generalInsights.type_of_forest}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Summer Average Temperature:</strong> {generalInsights.summer_avg_temp}°C
                  </Typography>
                  <Typography variant="body1">
                    <strong>Winter Average Temperature:</strong> {generalInsights.winter_avg_temp}°C
                  </Typography>
                  <Typography variant="body1">
                    <strong>Precipitation:</strong> {generalInsights.precipitation} mm
                  </Typography>
                </> : <Typography variant='h6' style={{ textAlign: 'center', flex: 1, alignContent: 'center' }}>
                  No environmental details available. To get details, click on Analyze Area.
                </Typography>}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1,
                  mt: 4,
                  height: 375,
                  width: '100%',
                  borderRadius: '20px',
                  border: '1px solid ',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                  textAlign: 'left',
                }}
              >
                <Typography variant='h4' style={{ textAlign: "center" }}>Deforestation Insights</Typography>
                {detailedInsights ? <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Deforestation:</strong> {detailedInsights.deforestation}</Typography>
                    <Typography variant="body1"><strong>Fragmentation:</strong> {detailedInsights.fragmentation}</Typography>
                    <Typography variant="body1"><strong>Causes:</strong> {detailedInsights.causes}</Typography>
                    <Typography variant="body1"><strong>Biome:</strong> {detailedInsights.biome}</Typography>
                    <Typography variant="body1"><strong>Patterns:</strong> {detailedInsights.patterns}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Deforestation Type:</strong> {detailedInsights.deforestation_type}</Typography>
                    <Typography variant="body1"><strong>Use of Land:</strong> {detailedInsights.use_of_land}</Typography>
                    <Typography variant="body1"><strong>Effect on Environment:</strong> {detailedInsights.effect_on_environment}</Typography>
                    <Typography variant="body1"><strong>Species Affected:</strong> {detailedInsights.species_affected.map((species) => (
                      `${species},`
                    ))}</Typography>
                  </Grid>
                </Grid> : <Typography variant='h6' style={{ textAlign: 'center', flex: 1, alignContent: 'center' }}>
                  No deforestation insights available. To get insights, click on Analyze Area.
                </Typography>}
              </Box>
            </React.Fragment>
          </Box>
        </Grid>
        <Grid
          item
          md={7}
          sx={{
            display: 'flex',
            height: '100vh',
            mt: "16px",
            flexDirection: 'column',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'center',
            pt: { xs: 2, sm: 2 },
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap>
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
                  <FormGrid>
                    {showMap ? <>
                      <MapboxMap
                        style="mapbox://styles/mapbox/satellite-v9"
                        containerStyle={{
                          height: '850px',
                          width: '850px',
                          borderRadius: 8,
                          marginBottom: "16px",
                        }}
                        onStyleLoad={handleMapLoad}
                      />
                      <Button variant="outlined" color="primary" onClick={handleScreenshot}>Analyze Area</Button>
                    </> : <>
                      <img src={urlCreator.createObjectURL(satelliteImage)} style={{ height: "850px", width: "850px", borderRadius: 8, marginBottom: "16px" }} alt="satellite" />
                      <Button variant="outlined" color="primary" onClick={handleShowMap}>Show Map</Button>
                    </>}

                  </FormGrid>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider >
  );
}
