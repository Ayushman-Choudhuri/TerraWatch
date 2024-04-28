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
import { getInsights, postInsights, postSegmentation } from './api';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import getTheme from './getTheme';
import ToggleColorMode from './ToggleColorMode';
import { Container, Select } from '@mui/material';
import { MenuItem } from '@mui/material'; // Import the 'MenuItem' component from the '@mui/material' package

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

  const [longitude, setLongitude] = React.useState(11.484175312683817);
  const [latitude, setLatitude] = React.useState(47.72210520962133);

  const urlCreator = window.URL || window.webkitURL;

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleOpacityChange = (_, newValue) => {
    setOpacity(newValue);
  };


  const handleScreenshot = (_) => {
    const blob = dataURLToBlob(map.getCanvas().toDataURL("image/png"));
    setSatelliteImage(blob);
    const formData = new FormData();
    formData.append('image', blob, 'image');
    postSegmentation(formData).then((response) => {
      console.log(response);
      setDeforestationImage(response);
      formData.append('mask', response, 'mask');
      handleInsights(formData);
    }).catch((error) => {
      console.log(error);
    });

    // replace live map with static image
    setShowMap(false);
  };

  const handleInsights = (formData) => {
    getInsights(map.getCenter().lng, map.getCenter().lat).then((response) => {
      setGeneralInsights(response);
    });
    postInsights(formData).then((response) => {
      setDetailedInsights(response);
    });
  }

  const handleShowMap = (_) => {
    setSatelliteImage(null);
    setDeforestationImage(null);
    setGeneralInsights(null);
    setDetailedInsights(null);
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
          md={6}
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
            <Typography variant='h2'>TerraWatch</Typography>
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
                <Select value="test value" placeholder='test placeholder' label="test label">
                  <MenuItem default value={10}>Ten</MenuItem>
                </Select>
              </FormGrid>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  mt: 4,
                  height: 290,
                  width: '100%',
                  borderRadius: '20px',
                  border: '1px solid ',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                  textAlign: 'left',
                }}
              >
                <Typography variant="h4" gutterBottom component="div" style={{ textAlign: "center", marginBottom: "16px" }}>
                  Environmental Details
                </Typography>
                {generalInsights ? <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Country:</strong> {generalInsights.country}
                    </Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Type of Biome:</strong> {generalInsights.type_of_biome}
                    </Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Type of Vegetation:</strong> {generalInsights.type_of_vegetation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Summer Average Temperature:</strong> {generalInsights.summer_temperature}°C
                    </Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Winter Average Temperature:</strong> {generalInsights.winter_temperature}°C
                    </Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1">
                      <strong>Precipitation:</strong> {generalInsights.precipitation} mm
                    </Typography>
                  </Grid>
                </Grid> : <Typography variant='h6' style={{ textAlign: 'center', flex: 1, alignContent: 'center' }}>
                  No environmental details available. To get details, click on Analyze Area.
                </Typography>}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  mt: 4,
                  height: 340,
                  width: '100%',
                  borderRadius: '20px',
                  border: '1px solid ',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                  textAlign: 'left',
                }}
              >
                <Typography variant='h4' style={{ textAlign: "center", marginBottom: "16px" }}>Insights</Typography>
                {detailedInsights ? <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Deforestation:</strong> {detailedInsights.deforestation}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Fragmentation:</strong> {detailedInsights.fragmentation}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Causes:</strong> {detailedInsights.causes}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Biome:</strong> {detailedInsights.biome}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Patterns:</strong> {detailedInsights.patterns}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Deforestation Type:</strong> {detailedInsights.deforestation_type}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Use of Land:</strong> {detailedInsights.use_of_land}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Effect on Environment:</strong> {detailedInsights.effect_on_environment}</Typography>
                    <Typography style={{ marginBottom: "8px" }} variant="body1"><strong>Species Affected:</strong> {detailedInsights.species_affected.map((species) => (
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
          md={6}
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
                    marginTop: "80px",
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
                          height: '700px',
                          width: '700px',
                          borderRadius: 8,
                          marginBottom: "16px",
                        }}
                        onStyleLoad={handleMapLoad}
                        center={[longitude, latitude]}
                      />
                      <Button variant="outlined" color="primary" onClick={handleScreenshot}>Analyze Area</Button>
                    </> : <>
                      <img src={urlCreator.createObjectURL(satelliteImage)} style={{ height: "700px", width: "700px", borderRadius: 8, marginBottom: "16px", zIndex: 0 }} alt="satellite" />
                      <>
                        <img src={deforestationImage ? urlCreator.createObjectURL(deforestationImage) : null} style={{ height: "700px", width: "700px", borderRadius: 8, marginBottom: "16px", position: "absolute", zIndex: 1, opacity: opacity / 100 }} alt="satellite" />
                        {/* <img src={deforestationImage ? urlCreator.createObjectURL(deforestationImage) : null} style={{ top: "110px", left: "965px", height: "750px", width: "750px", borderRadius: 8, marginBottom: "16px", position: "absolute", zIndex: 1, opacity: opacity / 100 }} alt="satellite" /> */}
                      </>
                      <Button variant="outlined" color="primary" onClick={handleShowMap}>Show Map</Button>
                    </>}
                    <img src="./legend.png" style={{ height: "100px", width: "140px", borderRadius: 8, position: "absolute", top: 145, right: 130, zIndex: 2 }} alt="legend" />
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
