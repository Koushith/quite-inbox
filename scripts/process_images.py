import os
import requests
from PIL import Image
import io

# Configuration
# Mapping: URL -> Local Filename (without extension)
IMAGES = {
    "https://www.overflow.design/src/assets/img/oc/full-mailbox.jpg": "hero-overflow",
    "https://www.overflow.design/src/assets/img/oc/going-through-emails.jpg": "feature-find",
    "https://www.overflow.design/src/assets/img/oc/trash-bin.jpg": "feature-unsubscribe",
    "https://www.overflow.design/src/assets/img/oc/empty-mailbox.jpg": "feature-cleanup"
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src/assets/images')

def remove_white_background(img):
    """
    Convert white background to transparent.
    Assumes simple line art on white.
    """
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if pixel is close to white (allow some noise/compression artifacts)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))  # Transparent
        else:
            newData.append(item)
    
    img.putdata(newData)
    return img

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    for url, name in IMAGES.items():
        print(f"Processing {name} from {url}...")
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            img = Image.open(io.BytesIO(response.content))
            
            # Process
            img = remove_white_background(img)
            
            # Save
            output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
            img.save(output_path, "PNG")
            print(f"Saved to {output_path}")
            
        except Exception as e:
            print(f"Error processing {name}: {e}")

if __name__ == "__main__":
    main()
