#!/usr/bin/env python3
"""
Build script for production deployment of Adaptive Auto Hub
Handles asset optimization, image processing, and bundle generation
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app import create_app
from app.utils.image_optimizer import ImageOptimizer

def build_assets():
    """Build and optimize all assets for production"""
    print("🚀 Starting production build...")
    
    # Create app with production config
    app = create_app('production')
    
    with app.app_context():
        # 1. Build CSS/JS bundles
        print("\n📦 Building asset bundles...")
        assets = app.extensions.get('assets')
        if assets:
            try:
                assets.build()
                print("✅ Asset bundles created successfully")
            except Exception as e:
                print(f"❌ Error building assets: {e}")
        
        # 2. Optimize images
        print("\n🖼️  Optimizing images...")
        static_folder = app.static_folder or os.path.join(project_root, 'app', 'static')
        
        try:
            optimizer = ImageOptimizer(static_folder=static_folder)
            images_dir = os.path.join(static_folder, 'images')
            
            # Get all image files
            image_extensions = ('.jpg', '.jpeg', '.png', '.webp')
            image_count = 0
            optimized_count = 0
            
            for root, dirs, files in os.walk(images_dir):
                # Skip already optimized directories
                if 'optimized' in root or 'placeholders' in root:
                    continue
                    
                for file in files:
                    if file.lower().endswith(image_extensions):
                        filepath = os.path.join(root, file)
                        relative_path = os.path.relpath(filepath, images_dir)
                        
                        print(f"  Processing: {relative_path}")
                        image_count += 1
                        
                        try:
                            # Process image with appropriate alt text
                            alt_text = generate_alt_text(file)
                            result = optimizer.process_image(filepath, alt_text)
                            
                            print(f"  ✅ Generated {len(result['sizes'])} sizes for {file}")
                            optimized_count += 1
                            
                        except Exception as e:
                            print(f"  ❌ Error processing {file}: {e}")
            
            print(f"\n✅ Optimized {optimized_count}/{image_count} images")
            
        except Exception as e:
            print(f"❌ Error initializing image optimizer: {e}")
        
        # 3. Generate critical CSS (if needed)
        print("\n🎨 Checking critical CSS...")
        critical_css_path = os.path.join(static_folder, 'css', 'critical.css')
        if os.path.exists(critical_css_path):
            print("✅ Critical CSS found")
        else:
            print("⚠️  No critical CSS found - consider creating one for better performance")
        
        # 4. Create production-ready structure
        print("\n📁 Verifying production structure...")
        required_dirs = [
            os.path.join(static_folder, 'gen'),  # For generated assets
            os.path.join(static_folder, 'images', 'optimized'),
            os.path.join(static_folder, 'images', 'placeholders'),
            'logs'  # For production logs
        ]
        
        for directory in required_dirs:
            os.makedirs(directory, exist_ok=True)
            print(f"  ✅ Directory ready: {directory}")
        
        print("\n✅ Build completed successfully!")
        print("\n📋 Next steps:")
        print("  1. Run tests: python -m pytest")
        print("  2. Check .env file for production settings")
        print("  3. Deploy to server")

def generate_alt_text(filename):
    """Generate appropriate alt text based on filename"""
    # Remove extension and replace separators with spaces
    name = os.path.splitext(filename)[0]
    name = name.replace('-', ' ').replace('_', ' ')
    
    # Capitalize words
    words = name.split()
    alt_text = ' '.join(word.capitalize() for word in words)
    
    # Add context based on filename patterns
    if 'hero' in filename.lower():
        alt_text = f"Adaptive Auto Hub - {alt_text}"
    elif 'aura' in filename.lower():
        alt_text = f"Aura Analytics - {alt_text}"
    elif 'aegis' in filename.lower():
        alt_text = f"Aegis Defense - {alt_text}"
    elif 'logo' in filename.lower():
        alt_text = f"{alt_text} Logo"
    
    return alt_text

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("\n🔍 Checking dependencies...")
    
    required_packages = {
        'flask': 'Flask',
        'flask_assets': 'Flask-Assets',
        'PIL': 'Pillow',
        'cssmin': 'cssmin',
        'jsmin': 'jsmin'
    }
    
    missing = []
    for module, package in required_packages.items():
        try:
            __import__(module)
            print(f"  ✅ {package} installed")
        except ImportError:
            missing.append(package)
            print(f"  ❌ {package} missing")
    
    if missing:
        print(f"\n❌ Missing dependencies: {', '.join(missing)}")
        print("Install with: pip install " + ' '.join(missing))
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("Adaptive Auto Hub - Production Build Script")
    print("=" * 50)
    
    # Check dependencies first
    if not check_dependencies():
        sys.exit(1)
    
    # Run build
    try:
        build_assets()
    except Exception as e:
        print(f"\n❌ Build failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
