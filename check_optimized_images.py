#!/usr/bin/env python3
"""
Check and list all optimized images created by the build process
"""

import os
from pathlib import Path
import json

def check_optimized_images():
    """List all images in the optimized directory"""
    script_dir = Path(__file__).parent
    optimized_dir = script_dir / 'app' / 'static' / 'images' / 'optimized'
    placeholders_dir = script_dir / 'app' / 'static' / 'images' / 'placeholders'
    
    print("📸 Checking optimized images...")
    print(f"📁 Optimized directory: {optimized_dir}")
    print(f"📁 Placeholders directory: {placeholders_dir}")
    print("\n" + "="*60 + "\n")
    
    # Group images by base name
    image_groups = {}
    
    if optimized_dir.exists():
        for file in sorted(optimized_dir.glob('**/*')):
            if file.is_file():
                relative_path = file.relative_to(optimized_dir)
                
                # Extract base name (without size suffix and extension)
                parts = file.stem.split('_')
                if parts[-1].endswith('w'):
                    base_name = '_'.join(parts[:-1])
                else:
                    base_name = file.stem
                
                key = str(relative_path.parent / base_name)
                
                if key not in image_groups:
                    image_groups[key] = {
                        'sizes': [],
                        'formats': set()
                    }
                
                # Extract size if present
                if parts[-1].endswith('w'):
                    size = parts[-1]
                    image_groups[key]['sizes'].append({
                        'file': str(relative_path),
                        'size': size,
                        'format': file.suffix
                    })
                
                image_groups[key]['formats'].add(file.suffix)
    
    # Print organized results
    print("🖼️  Optimized Images Available:\n")
    
    for base_name, info in sorted(image_groups.items()):
        print(f"📄 {base_name}")
        formats = ', '.join(sorted(info['formats']))
        print(f"   Formats: {formats}")
        if info['sizes']:
            sizes = sorted(set(s['size'] for s in info['sizes']))
            print(f"   Sizes: {', '.join(sizes)}")
        print()
    
    # Check placeholders
    print("\n" + "="*60 + "\n")
    print("🎨 Placeholder Images (LQIP):\n")
    
    if placeholders_dir.exists():
        placeholder_count = 0
        for file in sorted(placeholders_dir.glob('**/*')):
            if file.is_file():
                print(f"   ✓ {file.name}")
                placeholder_count += 1
        
        print(f"\n   Total: {placeholder_count} placeholders")
    
    # Generate example usage
    print("\n" + "="*60 + "\n")
    print("📝 Example Usage in Templates:\n")
    
    print("For responsive images, use this pattern:\n")
    print("""<picture>
    <source srcset="/static/images/optimized/hero-drone_1200w.webp 1200w,
                    /static/images/optimized/hero-drone_800w.webp 800w,
                    /static/images/optimized/hero-drone_400w.webp 400w"
            type="image/webp">
    <source srcset="/static/images/optimized/hero-drone_1200w.jpg 1200w,
                    /static/images/optimized/hero-drone_800w.jpg 800w,
                    /static/images/optimized/hero-drone_400w.jpg 400w"
            type="image/jpeg">
    <img src="/static/images/hero-drone.jpg" 
         alt="AI-powered drone inspection"
         loading="lazy"
         width="1920"
         height="1080">
</picture>""")
    
    print("\n✅ Image optimization check complete!")

if __name__ == "__main__":
    check_optimized_images()
