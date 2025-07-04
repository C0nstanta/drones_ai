#!/usr/bin/env python3
"""
Process all images in the static/images directory
Usage: python process_images.py
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.image_optimizer import ImageOptimizer

def process_all_images():
    optimizer = ImageOptimizer()
    images_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'images')
    
    # Process all images
    for root, dirs, files in os.walk(images_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(root, file)
                print(f"Processing: {filepath}")
                try:
                    result = optimizer.process_image(filepath)
                    print(f"✓ Generated {len(result['sizes'])} sizes for {file}")
                except Exception as e:
                    print(f"✗ Error processing {file}: {e}")

if __name__ == "__main__":
    process_all_images()
