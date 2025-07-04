# /adaptive-auto-hub/fix_png_images.py
"""
Fix PNG images script for Adaptive Auto Hub.
Converts PNG images to JPG format and organizes them properly.

Usage:
    python3 fix_png_images.py
"""

import os
import sys
from pathlib import Path
from PIL import Image

def convert_png_to_jpg():
    """Convert all PNG images to JPG format for web compatibility"""
    print("🔄 Converting PNG images to JPG format...")
    print("="*60)
    
    # Project paths
    project_root = Path(__file__).parent
    images_dir = project_root / 'app' / 'static' / 'images'
    
    if not images_dir.exists():
        print("❌ Images directory not found!")
        return
    
    # Find all PNG files
    png_files = []
    for root, dirs, files in os.walk(images_dir):
        # Skip optimization directories
        if 'optimized' in root or 'placeholders' in root:
            continue
            
        for file in files:
            if file.lower().endswith('.png'):
                png_path = Path(root) / file
                png_files.append(png_path)
    
    print(f"📷 Found {len(png_files)} PNG files to convert")
    
    converted_count = 0
    error_count = 0
    
    for png_path in png_files:
        try:
            # Create JPG filename
            jpg_path = png_path.with_suffix('.jpg')
            
            # Skip if JPG already exists and is newer
            if jpg_path.exists() and jpg_path.stat().st_mtime > png_path.stat().st_mtime:
                print(f"⏭️  Skipping {png_path.name} (JPG already exists)")
                continue
            
            print(f"🔄 Converting: {png_path.relative_to(images_dir)}")
            
            # Open and convert PNG to JPG
            with Image.open(png_path) as img:
                # Convert RGBA to RGB (remove transparency)
                if img.mode in ('RGBA', 'LA'):
                    # Create white background
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        rgb_img.paste(img, mask=img.split()[-1])  # Use alpha channel as mask
                    else:
                        rgb_img.paste(img)
                    img = rgb_img
                elif img.mode == 'P':
                    img = img.convert('RGB')
                
                # Save as JPG with high quality
                img.save(jpg_path, 'JPEG', quality=95, optimize=True)
                
            file_size = jpg_path.stat().st_size
            print(f"   ✅ Created {jpg_path.name} ({file_size // 1024} KB)")
            converted_count += 1
            
        except Exception as e:
            print(f"   ❌ Error converting {png_path.name}: {e}")
            error_count += 1
    
    print(f"\n📊 Conversion complete:")
    print(f"   ✅ Converted: {converted_count}")
    print(f"   ❌ Errors: {error_count}")
    
    return converted_count

def organize_images():
    """Organize and rename images to match website expectations"""
    print("\n🗂️  Organizing images...")
    print("="*60)
    
    # Project paths
    project_root = Path(__file__).parent
    images_dir = project_root / 'app' / 'static' / 'images'
    
    # Define expected image mappings
    image_mappings = {
        # Main images
        'hero-drone.jpg': [
            'hero-drone.png', 'hero-drone.jpg', 'hero.png', 'hero.jpg',
            'main-hero.png', 'main-hero.jpg', 'drone-hero.png', 'drone-hero.jpg'
        ],
        'og-image.jpg': [
            'og-image.png', 'og-image.jpg', 'social.png', 'social.jpg',
            'facebook.png', 'facebook.jpg'
        ],
        'twitter-card.jpg': [
            'twitter-card.png', 'twitter-card.jpg', 'twitter.png', 'twitter.jpg'
        ],
        # Product images
        'products/aura-hero.jpg': [
            'products/aura-hero.png', 'products/aura-hero.jpg',
            'products/aura.png', 'products/aura.jpg',
            'aura-hero.png', 'aura-hero.jpg', 'aura.png', 'aura.jpg'
        ],
        'products/aegis-hero.jpg': [
            'products/aegis-hero.png', 'products/aegis-hero.jpg',
            'products/aegis.png', 'products/aegis.jpg',
            'aegis-hero.png', 'aegis-hero.jpg', 'aegis.png', 'aegis.jpg'
        ],
        # Partner logos
        'partners/elphel-logo.png': [
            'partners/elphel-logo.png', 'partners/elphel.png',
            'elphel-logo.png', 'elphel.png', 'el-logo.png'
        ],
        'partners/interproinvest-logo.png': [
            'partners/interproinvest-logo.png', 'partners/interproinvest.png',
            'interproinvest-logo.png', 'interproinvest.png'
        ]
    }
    
    organized_count = 0
    
    for target_path, source_candidates in image_mappings.items():
        target_full_path = images_dir / target_path
        
        # Create directory if needed
        target_full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Skip if target already exists
        if target_full_path.exists():
            print(f"✅ {target_path} already exists")
            continue
        
        # Find matching source file
        found_source = None
        for candidate in source_candidates:
            candidate_path = images_dir / candidate
            if candidate_path.exists():
                found_source = candidate_path
                break
        
        if found_source:
            # Copy file to target location
            try:
                import shutil
                shutil.copy2(found_source, target_full_path)
                print(f"📁 Copied {found_source.name} → {target_path}")
                organized_count += 1
            except Exception as e:
                print(f"❌ Error copying {found_source.name}: {e}")
        else:
            print(f"⚠️  No source found for {target_path}")
    
    print(f"\n📊 Organization complete:")
    print(f"   ✅ Organized: {organized_count}")
    
    return organized_count

def create_missing_images():
    """Create missing social media images from hero image"""
    print("\n🎨 Creating missing social media images...")
    print("="*60)
    
    # Project paths
    project_root = Path(__file__).parent
    images_dir = project_root / 'app' / 'static' / 'images'
    
    # Find hero image
    hero_candidates = ['hero-drone.jpg', 'hero-drone.png']
    hero_image = None
    
    for candidate in hero_candidates:
        hero_path = images_dir / candidate
        if hero_path.exists():
            hero_image = hero_path
            break
    
    if not hero_image:
        print("❌ No hero image found to create social media images")
        return 0
    
    # Create social media images
    social_images = {
        'og-image.jpg': (1200, 630),      # Facebook/LinkedIn
        'twitter-card.jpg': (1200, 600)   # Twitter
    }
    
    created_count = 0
    
    for social_name, (width, height) in social_images.items():
        social_path = images_dir / social_name
        
        if social_path.exists():
            print(f"✅ {social_name} already exists")
            continue
        
        try:
            with Image.open(hero_image) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA'):
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        rgb_img.paste(img, mask=img.split()[-1])
                    else:
                        rgb_img.paste(img)
                    img = rgb_img
                
                # Resize to social media dimensions
                img_resized = img.resize((width, height), Image.Resampling.LANCZOS)
                
                # Save as JPG
                img_resized.save(social_path, 'JPEG', quality=90, optimize=True)
                
            print(f"🎨 Created {social_name} ({width}x{height})")
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creating {social_name}: {e}")
    
    print(f"\n📊 Social media images:")
    print(f"   ✅ Created: {created_count}")
    
    return created_count

def main():
    """Main function to fix all PNG images"""
    print("🎯 Fixing PNG Images for Adaptive Auto Hub")
    print("="*60)
    
    try:
        # Step 1: Convert PNG to JPG
        converted = convert_png_to_jpg()
        
        # Step 2: Organize images
        organized = organize_images()
        
        # Step 3: Create missing social media images
        created = create_missing_images()
        
        # Step 4: Process all images
        print("\n🔄 Processing all images...")
        print("="*60)
        os.system("python3 process_images_simple.py")
        
        # Final summary
        print("\n" + "="*60)
        print("🎉 PNG IMAGE FIX COMPLETE!")
        print("="*60)
        print(f"✅ Converted PNG to JPG: {converted}")
        print(f"✅ Organized images: {organized}")
        print(f"✅ Created social media images: {created}")
        
        print("\n🚀 Next steps:")
        print("1. Check results: python3 check_optimized_images.py")
        print("2. Test website: python3 run.py")
        print("3. Visit: http://localhost:5000")
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        print("💡 Make sure you have Pillow installed: pip install Pillow")

if __name__ == "__main__":
    main()
