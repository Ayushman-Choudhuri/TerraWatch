import numpy as np
from PIL import Image
import tensorflow as tf


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


def resize(img, target_size=(1024, 1024)):
    """Resizes an image to the given size, padding it to maintain aspect ratio using TensorFlow.

    Args:
    img: PIL image to be resized and padded
    target_size: tuple (new_width, new_height)
    """
    # Convert PIL Image to TensorFlow tensor
    image = tf.convert_to_tensor(np.array(img))

    # Resize the image preserving the aspect ratio
    image = tf.image.resize_with_pad(
        image, target_size[0], target_size[1], antialias=False
    )

    # Convert back to uint8
    image = tf.image.convert_image_dtype(image, tf.uint8)

    return Image.fromarray(image.numpy())


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
