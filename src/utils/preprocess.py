import numpy as np
from PIL import Image


def center_crop(img, dim):
    """Returns center cropped image
    Args:
    img: image to be center cropped
    dim: dimensions (width, height) to be cropped
    """
    width, height = img.shape[1], img.shape[0]

    # process crop width and height for max available dimension
    crop_width = dim[0] if dim[0] < img.shape[1] else img.shape[1]
    crop_height = dim[1] if dim[1] < img.shape[0] else img.shape[0]
    mid_x, mid_y = int(width / 2), int(height / 2)
    cw2, ch2 = int(crop_width / 2), int(crop_height / 2)
    crop_img = img[mid_y - ch2 : mid_y + ch2, mid_x - cw2 : mid_x + cw2]
    return crop_img


def get_png(arr):
    color_map = {0: (255, 0, 0), 1: (0, 255, 0), 2: (0, 0, 255)}  # Red  # Green  # Blue

    data = arr
    # Create an empty array for the RGB values
    height, width, _ = data.shape
    rgb_array = np.zeros((height, width, 3), dtype=np.uint8)

    # Fill the rgb_array with colors based on the highest probability label
    for i in range(height):
        for j in range(width):
            # Get the index of the highest probability
            label_index = np.argmax(data[i, j])
            # Map this label index to a color
            rgb_array[i, j] = color_map[label_index]

    # Convert the numpy array to a Pillow Image
    image = Image.fromarray(rgb_array, "RGB")

    return image
