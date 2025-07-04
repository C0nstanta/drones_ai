# /adaptive-auto-hub/setup_images.py
"""
Setup script to create image directories and provide guidance.
Run this first to set up your image organization.

Usage:
    python setup_images.py
"""

import os
from pathlib import Path

def setup_image_directories():
    """Create all necessary image directories"""
    print("📁 Setting up image directories for Adaptive Auto Hub...")
    
    # Define directory structure
    project_root = Path(__file__).parent
    static_dir = project_root / 'app' / 'static'
    images_dir = static_dir / 'images'
    
    directories = {
        'main': images_dir,
        'products': images_dir / 'products',
        'partners': images_dir / 'partners',
        'solutions': images_dir / 'solutions',
        'use-cases': images_dir / 'use-cases',
        'optimized': images_dir / 'optimized',
        'placeholders': images_dir / 'placeholders'
    }
    
    # Create directories
    for name, path in directories.items():
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created: {path}")
        else:
            print(f"📁 Exists: {path}")
    
    print("\n" + "="*60)
    print("📸 IMAGE PLACEMENT GUIDE")
    print("="*60)
    
    # Main images
    print("\n🎯 MAIN IMAGES (Place these first):")
    print(f"├── {images_dir / 'hero-drone.png'}")
    print(f"├── {images_dir / 'og-image.jpg'}")
    print(f"└── {images_dir / 'twitter-card.jpg'}")
    
    # Product images
    print("\n📦 PRODUCT IMAGES:")
    print(f"├── {directories['products'] / 'aura-hero.jpg'}")
    print(f"└── {directories['products'] / 'aegis-hero.jpg'}")
    
    # Use case images
    print("\n🏭 USE CASE IMAGES:")
    print(f"├── {directories['use-cases'] / 'infrastructure.jpg'}")
    print(f"├── {directories['use-cases'] / 'defense.jpg'}")
    print(f"└── {directories['use-cases'] / 'pipeline.jpg'}")
    
    # Solution images
    print("\n🔧 SOLUTION IMAGES:")
    print(f"├── {directories['solutions'] / 'computer-vision.jpg'}")
    print(f"├── {directories['solutions'] / 'predictive-analytics.jpg'}")
    print(f"└── {directories['solutions'] / 'autonomous-navigation.jpg'}")
    
    # Partner logos
    print("\n🤝 PARTNER LOGOS:")
    print(f"├── {directories['partners'] / 'elphel-logo.png'}")
    print(f"└── {directories['partners'] / 'interproinvest-logo.png'}")
    
    print("\n" + "="*60)
    print("🚀 NEXT STEPS:")
    print("="*60)
    print("1. Place your hero-drone.png in the main images directory")
    print("2. Add your other images to the appropriate directories")
    print("3. Run: python process_images_simple.py")
    print("4. Check results: python check_optimized_images.py")
    print("5. Test website: python run.py")
    
    print("\n💡 TIP: Start with just the hero-drone.png file to test the system!")
    
    # Check if hero image already exists
    hero_path = images_dir / 'hero-drone.png'
    hero_jpg = images_dir / 'hero-drone.jpg'
    
    if hero_path.exists():
        print(f"\n✅ Found hero image: {hero_path}")
        print("   Ready to process!")
    elif hero_jpg.exists():
        print(f"\n✅ Found hero image: {hero_jpg}")
        print("   Ready to process!")
    else:
        print(f"\n📷 Place your hero-drone.png here: {hero_path}")
        print("   Then run: python process_images_simple.py")

if __name__ == "__main__":
    setup_image_directories()
