#!/usr/bin/env python3
"""
Create placeholder images for Adaptive Auto Hub website
Generates appropriately sized images with text labels for development
"""

import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Image definitions with sizes and colors
IMAGES = {
    'hero-drone.jpg': {
        'size': (1920, 1080),
        'color': '#1e40af',
        'text': 'Hero - AI Drone Solutions'
    },
    'og-image.jpg': {
        'size': (1200, 630),
        'color': '#0f172a',
        'text': 'Adaptive Auto Hub - OG Image'
    },
    'twitter-card.jpg': {
        'size': (1200, 600),
        'color': '#3b82f6',
        'text': 'Adaptive Auto Hub - Twitter Card'
    },
    'partners/elphel-logo.png': {
        'size': (400, 200),
        'color': '#64748b',
        'text': 'Elphel Inc.\nPartner Logo'
    },
    'partners/interproinvest-logo.png': {
        'size': (400, 200),
        'color': '#475569',
        'text': 'InterProInvest\nPartner Logo'
    },
    'use-cases/infrastructure.jpg': {
        'size': (800, 600),
        'color': '#059669',
        'text': 'Infrastructure\nInspection'
    },
    'use-cases/defense.jpg': {
        'size': (800, 600),
        'color': '#dc2626',
        'text': 'Defense\nApplications'
    },
    'use-cases/pipeline.jpg': {
        'size': (800, 600),
        'color': '#7c3aed',
        'text': 'Pipeline\nMonitoring'
    },
    'products/aura-hero.jpg': {
        'size': (1200, 800),
        'color': '#2563eb',
        'text': 'Aura Analytics\nProduct Hero'
    },
    'products/aegis-hero.jpg': {
        'size': (1200, 800),
        'color': '#991b1b',
        'text': 'Aegis Defense\nProduct Hero'
    },
    'solutions/computer-vision.jpg': {
        'size': (600, 400),
        'color': '#0891b2',
        'text': 'Computer Vision\nSolution'
    },
    'solutions/predictive-analytics.jpg': {
        'size': (600, 400),
        'color': '#7c2d12',
        'text': 'Predictive Analytics\nSolution'
    },
    'solutions/autonomous-navigation.jpg': {
        'size': (600, 400),
        'color': '#166534',
        'text': 'Autonomous Navigation\nSolution'
    },
    'industries/oil-gas.jpg': {
        'size': (800, 600),
        'color': '#1e293b',
        'text': 'Oil & Gas\nIndustry'
    },
    'industries/infrastructure.jpg': {
        'size': (800, 600),
        'color': '#334155',
        'text': 'Infrastructure\nIndustry'
    },
    'industries/defense-security.jpg': {
        'size': (800, 600),
        'color': '#7f1d1d',
        'text': 'Defense & Security\nIndustry'
    },
    'industries/renewable-energy.jpg': {
        'size': (800, 600),
        'color': '#14532d',
        'text': 'Renewable Energy\nIndustry'
    },
    'logo.png': {
        'size': (200, 60),
        'color': '#1e40af',
        'text': 'AAH',
        'font_size': 40
    },
    'favicon.png': {
        'size': (32, 32),
        'color': '#1e40af',
        'text': 'A',
        'font_size': 24
    }
}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_font(size):
    """Get a font, with fallback to default"""
    try:
        # Try to use a better font if available
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        # Fallback to default font
        return ImageFont.load_default()

def create_placeholder_image(filename, config):
    """Create a single placeholder image"""
    # Create image with specified color
    img = Image.new('RGB', config['size'], hex_to_rgb(config['color']))
    draw = ImageDraw.Draw(img)
    
    # Add semi-transparent overlay for better text visibility
    overlay = Image.new('RGBA', config['size'], (255, 255, 255, 30))
    img.paste(overlay, (0, 0), overlay)
    
    # Calculate font size
    font_size = config.get('font_size', min(config['size']) // 10)
    font = get_font(font_size)
    
    # Get text
    text = config['text']
    
    # Calculate text position (centered)
    if '\n' in text:
        # Multi-line text
        lines = text.split('\n')
        line_height = font_size + 10
        total_height = len(lines) * line_height
        y = (config['size'][1] - total_height) // 2
        
        for line in lines:
            # Simple text size estimation
            text_width = len(line) * (font_size * 0.6)
            x = (config['size'][0] - text_width) // 2
            draw.text((x, y), line, fill='white', font=font)
            y += line_height
    else:
        # Single line text
        text_width = len(text) * (font_size * 0.6)
        text_height = font_size
        x = (config['size'][0] - text_width) // 2
        y = (config['size'][1] - text_height) // 2
        draw.text((x, y), text, fill='white', font=font)
    
    # Add border
    draw.rectangle(
        [(0, 0), (config['size'][0]-1, config['size'][1]-1)],
        outline='white',
        width=2
    )
    
    # Add dimension info in corner
    dim_text = f"{config['size'][0]}x{config['size'][1]}"
    dim_font = get_font(14)
    draw.text((10, 10), dim_text, fill='white', font=dim_font)
    
    return img

def main():
    """Create all placeholder images"""
    # Get the static images directory
    script_dir = Path(__file__).parent
    static_dir = script_dir / 'app' / 'static'
    images_dir = static_dir / 'images'
    
    print("🎨 Creating placeholder images for Adaptive Auto Hub")
    print(f"📁 Target directory: {images_dir}")
    
    # Create base images directory if it doesn't exist
    images_dir.mkdir(parents=True, exist_ok=True)
    
    created_count = 0
    skipped_count = 0
    
    for filename, config in IMAGES.items():
        filepath = images_dir / filename
        
        # Create subdirectory if needed
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Check if file already exists
        if filepath.exists():
            print(f"⏭️  Skipping {filename} (already exists)")
            skipped_count += 1
            continue
        
        try:
            # Create the placeholder image
            img = create_placeholder_image(filename, config)
            
            # Save the image
            if filename.endswith('.png'):
                img.save(filepath, 'PNG')
            else:
                img.save(filepath, 'JPEG', quality=85)
            
            print(f"✅ Created {filename}")
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creating {filename}: {e}")
    
    # Create favicon.ico from favicon.png
    favicon_png = images_dir.parent / 'favicon.png'
    favicon_ico = images_dir.parent / 'favicon.ico'
    
    if not favicon_ico.exists() and favicon_png.exists():
        try:
            img = Image.open(favicon_png)
            img.save(favicon_ico, format='ICO', sizes=[(16,16), (32,32)])
            print(f"✅ Created favicon.ico")
            created_count += 1
        except Exception as e:
            print(f"❌ Error creating favicon.ico: {e}")
    
    print(f"\n📊 Summary:")
    print(f"  ✅ Created: {created_count} images")
    print(f"  ⏭️  Skipped: {skipped_count} images")
    print(f"\n✨ Done! You can now run build.py to optimize these images.")

if __name__ == "__main__":
    main()
