const root = "127.0.0.1:5000"

export const postInsights = async (formBody) => {
    const response = await fetch(`http://${root}/upload`, {
        method: 'POST',
        body: formBody,
    });
    return response.json();
}

export const getInsights = async (longitude, latitude) => {
    const response = await fetch(`http://${root}/lat_long/${longitude}/${latitude}`);
    return response.json();
}

export const postSegmentation = async (formBody) => {
    const response = await fetch(`http://${root}/segmentation`, {
        method: 'POST',
        body: formBody,
    });
    return response.json();
}