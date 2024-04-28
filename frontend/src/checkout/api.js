const root = "127.0.0.1:8000"

export const postInsights = async (formBody) => {
    const response = await fetch(`http://${root}/deforestation`, {
        method: 'POST',
        body: formBody,
    });
    return response.json();
}

export const getInsights = async (longitude, latitude) => {
    const response = await fetch(`http://${root}/environmental-details/${latitude}/${longitude}`);
    return response.json();
}

export const postSegmentation = async (formBody) => {
    console.log(`http://${root}/segmentation`);
    console.log(formBody);
    const response = await fetch(`http://${root}/segmentation`, {
        method: 'POST',
        body: formBody,
    });
    return response.blob();
}