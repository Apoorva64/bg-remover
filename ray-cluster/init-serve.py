import base64
from time import sleep

import ray
from ray import serve

import briarmbg
import utilities
from briarmbg import BriaRMBG
import torch
import skimage

from PIL import Image
import io

import base64
from utilities import preprocess_image, postprocess_image

RAY_CONTEXT = None


def get_ray_context():
    global RAY_CONTEXT
    if RAY_CONTEXT is None:
        print("Connecting to Ray...")
        RAY_CONTEXT = ray.init(
            address="ray://localhost:10001",
            runtime_env={
                "working_dir": ".",
                "pip": [
                    "scikit-image",
                    "huggingface_hub",
                    "imageio",
                    "torch",
                    "torchvision",
                    "Pillow",
                    "scikit-image",
                    "numpy",

                ]
            }
        )
        ray.serve.start(detached=True,
                        http_options={
                            "host": "0.0.0.0",
                            "location": "EveryNode"
                        }
                        )

        print("Connected to Ray.")
        return RAY_CONTEXT
    return RAY_CONTEXT


@serve.deployment(
    ray_actor_options={"num_gpus": 0, "num_cpus": 4},
    autoscaling_config={"min_replicas": 0, "max_replicas": 2},
)
class BGRemover(object):
    def __init__(self):
        self.net = BriaRMBG.from_pretrained("briaai/RMBG-1.4")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.net.to(self.device)
        self.net.eval()

    async def __call__(self, request):

        try:
            request = await request.json()
        except Exception as e:
            return {"error": "Invalid JSON provided."}

        if "image" not in request:
            return {"error": "No image parameter provided."}

        # check if image is base64
        img = None
        try:
            imgdata = base64.b64decode(request["image"])
            # check if image is bigger than 10MB
            if len(imgdata) > 10 * 1024 * 1024:
                return {"error": "Image size is too large."}
            img = skimage.io.imread(imgdata, plugin='imageio')
        except Exception as e:
            return {"error": "Invalid image parameter provided."}

        orig_im = img[:, :, :3]
        orig_im_size = orig_im.shape[0:2]
        model_input_size = [1024, 1024]
        image = preprocess_image(orig_im, model_input_size).to(self.device)

        # inference
        result = self.net(image)

        # post process
        result_image = postprocess_image(result[0][0], orig_im_size)

        # save result
        pil_im = Image.fromarray(result_image)
        no_bg_image = Image.new("RGBA", pil_im.size, (0, 0, 0, 0))
        no_bg_image.paste(Image.fromarray(orig_im)
                          , mask=pil_im)

        # convert to base64
        buffered = io.BytesIO()
        no_bg_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {"image": img_str}


ray_context = get_ray_context()
ray.serve.start(detached=True,
                http_options={
                    "host": "0.0.0.0",
                    "location": "EveryNode",
                    "port": 8000
                }
                )
handle = serve.run(BGRemover.bind(),
                   name="BGRemover", route_prefix="/api/v2/bg_remover")

print("Deployed BGRemover.")

while True:
    sleep(1000000)
