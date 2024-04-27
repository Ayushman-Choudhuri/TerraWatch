import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from utils.preprocess import center_crop, get_png
from model.unet import build_unet
import yaml


config = tf.compat.v1.ConfigProto()
config.gpu_options.allow_growth = True
sess = tf.compat.v1.Session(config=config)

config = yaml.safe_load(open("config.yaml"))
pretrained_model_path = config["pretrained_model"]
image = config["image"]


def get_prediction(image):

    final_filters = 2048
    model10 = build_unet(
        input_shape=(1024, 1024, 3),
        filters=[
            2**i for i in range(5, int(np.log2(final_filters) + 1))
        ],  # Amount of filters in U-Net arch.
        batchnorm=False,
        transpose=False,
        dropout_flag=False,
    )

    model10.load_weights(pretrained_model_path)

    image = Image.open(image)

    image = np.asarray(image)
    image = center_crop(image, (1024, 1024))
    image = image[:, :, :3]
    image = image[np.newaxis, ...]
    # plt.imshow(image[0])
    # plt.show()

    prediction = model10.predict(image)

    prediction_class1 = np.copy(prediction[..., 0])  # Forest
    prediction_class2 = np.copy(prediction[..., 1])  # Deforest
    prediction[..., 0] = prediction_class2  # RED - Deforest
    prediction[..., 1] = prediction_class1  # GREEN - Forest

    return get_png(prediction[0])


get_prediction(image)
