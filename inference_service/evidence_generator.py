import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import io
import base64

def _to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_quality_evidence(img_arr: np.ndarray) -> str:
    # Enhance contrast and sharpness
    img = Image.fromarray(img_arr).convert('RGB')
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.2)
    return _to_b64(img)

def generate_vessel_evidence(img_arr: np.ndarray) -> str:
    img = Image.fromarray(img_arr).convert('RGB')
    r, g, b = img.split()
    
    # Apply Frangi-like or basic edge detection/thresholding on green channel
    # Convert to grayscale NumPy array for processing
    import numpy as np
    from scipy.ndimage import gaussian_filter, white_tophat
    
    g_arr = np.array(g, dtype=float)
    # Invert so vessels are bright
    inv_g = 255.0 - g_arr
    
    # White tophat to highlight vessels
    # We don't have cv2 morphologyEx easily, but scipy provides morphology
    import scipy.ndimage as ndimage
    
    # Enhance local contrast using a large Gaussian blur subtracted from original
    blur = gaussian_filter(inv_g, sigma=15)
    highpass = inv_g - blur
    
    # Threshold to get vessels
    threshold = np.percentile(highpass, 92)
    binary = highpass > threshold
    
    # Convert to uint8 (0 and 255)
    vessel_mask = (binary * 255).astype(np.uint8)
    
    # We want pure white on pure black
    out_img = Image.fromarray(vessel_mask, mode='L')
    out_rgb = out_img.convert('RGB')
    return _to_b64(out_rgb)

def generate_disc_fovea_evidence(img_arr: np.ndarray) -> str:
    # Very crude: optic disc is the brightest spot, fovea is the darkest spot in macular region
    img = Image.fromarray(img_arr).convert('RGB')
    # We will just draw a circle in a likely spot or just blur heavily to find brightest spot
    img_gray = img.convert('L')
    img_blur = img_gray.resize((32, 32)).resize(img.size, Image.BILINEAR)
    arr = np.array(img_blur)
    
    # Optic disc (brightest)
    y_disc, x_disc = np.unravel_index(np.argmax(arr), arr.shape)
    
    # Fovea (darkest, usually central-ish, we'll just pick a dark spot)
    y_fov, x_fov = np.unravel_index(np.argmin(arr), arr.shape)

    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    # Draw optic disc (Yellow)
    r = 30
    draw.ellipse((x_disc-r, y_disc-r, x_disc+r, y_disc+r), outline="yellow", width=4)
    # Draw fovea (Blue)
    r_f = 15
    draw.ellipse((x_fov-r_f, y_fov-r_f, x_fov+r_f, y_fov+r_f), outline="cyan", width=4)
    
    return _to_b64(img)

def generate_lesion_evidence(img_arr: np.ndarray) -> str:
    # Simple simulated lesion map: high contrast edge detection
    img = Image.fromarray(img_arr).convert('RGB')
    gray = img.convert('L')
    edges = gray.filter(ImageFilter.FIND_EDGES)
    # Colorize red
    red_edges = ImageOps.colorize(edges, black="black", white="red")
    
    # Blend with original
    blended = Image.blend(img, red_edges, alpha=0.5)
    return _to_b64(blended)
