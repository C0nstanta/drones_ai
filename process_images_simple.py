# /adaptive-auto-hub/process_images_simple.py
"""
Simple image processing script for Adaptive Auto Hub.
Place this file in the project root directory.

Usage:
    python process_images_simple.py
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from app.utils.image_optimizer import ImageOptimizer
except ImportError as e:
    print(f"❌ Error importing ImageOptimizer: {e}")
    print("💡 Make sure you're in the project root directory")
    print("💡 Install requirements: pip install -r requirements.txt")
    sys.exit(1)

def main():
    """Process all images in the static/images directory"""
    print("🎨 Processing images for Adaptive Auto Hub...")
    print("=" * 50)
    
    # Setup paths
    static_folder = project_root / 'app' / 'static'
    images_dir = static_folder / 'images'
    
    # Check if directories exist
    if not images_dir.exists():
        print(f"📁 Creating images directory: {images_dir}")
        images_dir.mkdir(parents=True, exist_ok=True)
        print("📷 No images found. Place your images in:")
        print(f"   {images_dir}")
        return
    
    # Initialize optimizer
    try:
        optimizer = ImageOptimizer(static_folder=str(static_folder))
        print(f"✅ Image optimizer initialized")
    except Exception as e:
        print(f"❌ Error initializing optimizer: {e}")
        return
    
    # Find and process images
    image_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    processed_count = 0
    error_count = 0
    
    print(f"🔍 Scanning directory: {images_dir}")
    print()
    
    # Skip these directories
    skip_dirs = {'optimized', 'placeholders', 'gen', '__pycache__'}
    
    for root, dirs, files in os.walk(images_dir):
        # Remove directories we want to skip
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if file.lower().endswith(image_extensions):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, images_dir)
                
                print(f"📷 Processing: {relative_path}")
                
                try:
                    # Generate alt text based on filename
                    alt_text = generate_alt_text(file)
                    
                    # Process the image
                    result = optimizer.process_image(filepath, alt_text)
                    
                    # Count successful sizes
                    sizes_count = len(result.get('sizes', []))
                    print(f"   ✅ Generated {sizes_count} optimized versions")
                    
                    processed_count += 1
                    
                except Exception as e:
                    print(f"   ❌ Error: {e}")
                    error_count += 1
                
                print()
    
    # Final summary
    print("=" * 50)
    print("📊 PROCESSING COMPLETE")
    print(f"✅ Successfully processed: {processed_count}")
    print(f"❌ Errors: {error_count}")
    
    if processed_count > 0:
        print()
        print("🔍 Check your optimized images:")
        print("   python check_optimized_images.py")
        print()
        print("🚀 Test your website:")
        print("   python run.py")
    
    if error_count > 0:
        print()
        print("💡 Common solutions for errors:")
        print("   - Check file permissions")
        print("   - Ensure image files aren't corrupted")
        print("   - Verify you have enough disk space")

def generate_alt_text(filename):
    """Generate alt text based on filename"""
    # Remove extension and clean up
    base_name = os.path.splitext(filename)[0]
    alt_text = base_name.replace('-', ' ').replace('_', ' ')
    
    # Known image patterns
    alt_patterns = {
        'hero-drone': 'AI-powered drone conducting infrastructure inspection',
        'aura-hero': 'Aura Analytics - AI-powered infrastructure analysis',
        'aegis-hero': 'Aegis Defense - Counter-drone security system',
        'infrastructure': 'Drone inspecting industrial infrastructure',
        'pipeline': 'AI-powered pipeline monitoring',
        'defense': 'Advanced defense applications',
        'computer-vision': 'Computer vision technology',
        'predictive-analytics': 'Predictive analytics dashboard',
        'autonomous-navigation': 'Autonomous drone navigation',
        'elphel-logo': 'Elphel Inc. partner logo',
        'interproinvest-logo': 'InterProInvest partner logo'
    }
    
    # Check for matches
    for pattern, description in alt_patterns.items():
        if pattern in base_name.lower():
            return description
    
    # Default capitalized version
    return alt_text.title()

if __name__ == "__main__":
    main()
