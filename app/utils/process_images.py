# /adaptive-auto-hub/app/utils/process_images.py
"""
Image processing script for Adaptive Auto Hub Flask application.
Processes all images in the static/images directory for web optimization.

This script generates multiple responsive sizes, WebP conversions, and LQIP placeholders
for optimal web performance and user experience.

Usage:
    python app/utils/process_images.py
    python -m app.utils.process_images
"""

import os
import sys
import time
from pathlib import Path
from typing import List, Tuple, Dict, Optional

# Add project root to Python path
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from app.utils.image_optimizer import ImageOptimizer
    from PIL import Image
except ImportError as e:
    print(f"❌ Error importing required modules: {e}")
    print("💡 Make sure you've installed all requirements:")
    print("   pip install -r requirements.txt")
    sys.exit(1)


class ImageProcessor:
    """
    Main image processing service for the Flask application.
    
    Handles batch processing of all images in the static directory,
    with progress tracking and comprehensive error handling.
    """
    
    def __init__(self, static_folder: Optional[str] = None):
        """
        Initialize the image processor.
        
        Args:
            static_folder: Path to static folder. If None, auto-detects.
        """
        # Auto-detect static folder if not provided
        if static_folder is None:
            app_dir = project_root / 'app'
            static_folder = str(app_dir / 'static')
        
        self.static_folder = static_folder
        self.images_dir = os.path.join(static_folder, 'images')
        
        # Initialize optimizer with static_folder parameter
        try:
            self.optimizer = ImageOptimizer(static_folder=static_folder)
            print(f"✅ Image optimizer initialized")
            print(f"📁 Static folder: {static_folder}")
            print(f"📁 Images directory: {self.images_dir}")
        except Exception as e:
            print(f"❌ Error initializing optimizer: {e}")
            print(f"💡 Make sure the static folder exists: {static_folder}")
            sys.exit(1)
        
        # Supported image formats
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.webp'}
        
        # Directories to skip during processing
        self.skip_dirs = {'optimized', 'placeholders', 'gen', '__pycache__'}
        
        # Statistics tracking
        self.stats = {
            'processed': 0,
            'skipped': 0,
            'errors': 0,
            'total_found': 0,
            'start_time': 0
        }
    
    def find_images(self) -> List[Tuple[str, str]]:
        """
        Find all processable images in the images directory.
        
        Returns:
            List of tuples (file_path, relative_path)
        """
        images = []
        
        if not os.path.exists(self.images_dir):
            print(f"📁 Creating images directory: {self.images_dir}")
            os.makedirs(self.images_dir, exist_ok=True)
            return images
        
        print(f"🔍 Scanning for images in: {self.images_dir}")
        
        for root, dirs, files in os.walk(self.images_dir):
            # Skip optimization directories
            dirs[:] = [d for d in dirs if d not in self.skip_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                file_ext = os.path.splitext(file)[1].lower()
                
                if file_ext in self.supported_formats:
                    relative_path = os.path.relpath(file_path, self.images_dir)
                    images.append((file_path, relative_path))
        
        return images
    
    def generate_alt_text(self, filename: str) -> str:
        """
        Generate descriptive alt text based on filename.
        
        Args:
            filename: Name of the image file
            
        Returns:
            Generated alt text string
        """
        # Remove extension and replace common separators
        base_name = os.path.splitext(filename)[0]
        alt_text = base_name.replace('-', ' ').replace('_', ' ')
        
        # Specific alt text patterns for known image types
        alt_patterns = {
            'hero-drone': 'AI-powered drone conducting infrastructure inspection',
            'aura-hero': 'Aura Analytics - AI-powered infrastructure analysis platform',
            'aegis-hero': 'Aegis Defense - Counter-drone security system',
            'infrastructure': 'Drone inspecting industrial infrastructure',
            'pipeline': 'AI-powered pipeline monitoring and inspection',
            'defense': 'Advanced defense applications using AI drones',
            'computer-vision': 'Computer vision technology for automated analysis',
            'predictive-analytics': 'Predictive analytics dashboard and insights',
            'autonomous-navigation': 'Autonomous drone navigation system',
            'elphel-logo': 'Elphel Inc. - Technology partner logo',
            'interproinvest-logo': 'InterProInvest - Defense systems partner logo'
        }
        
        # Check for pattern matches
        for pattern, description in alt_patterns.items():
            if pattern in base_name.lower():
                return description
        
        # Default alt text with capitalization
        return alt_text.title()
    
    def process_single_image(self, file_path: str, relative_path: str) -> Dict:
        """
        Process a single image file.
        
        Args:
            file_path: Absolute path to the image file
            relative_path: Relative path from images directory
            
        Returns:
            Processing result dictionary
        """
        try:
            # Check if file exists and is readable
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Image file not found: {file_path}")
            
            # Check file size (warn if very large)
            file_size = os.path.getsize(file_path)
            if file_size > 10 * 1024 * 1024:  # 10MB
                print(f"⚠️  Large file detected: {relative_path} ({file_size // 1024 // 1024}MB)")
            
            # Generate appropriate alt text
            filename = os.path.basename(file_path)
            alt_text = self.generate_alt_text(filename)
            
            # Process the image
            result = self.optimizer.process_image(file_path, alt_text)
            
            return {
                'success': True,
                'file_path': file_path,
                'relative_path': relative_path,
                'sizes_generated': len(result.get('sizes', [])),
                'formats': result.get('formats', []),
                'alt_text': alt_text,
                'original_size': result.get('original_size', (0, 0)),
                'file_size': file_size
            }
            
        except Exception as e:
            return {
                'success': False,
                'file_path': file_path,
                'relative_path': relative_path,
                'error': str(e)
            }
    
    def process_all_images(self) -> None:
        """
        Process all images in the images directory.
        
        Provides progress tracking and comprehensive reporting.
        """
        print("\n🚀 Starting image processing...")
        print("=" * 60)
        
        self.stats['start_time'] = time.time()
        
        # Find all images
        images = self.find_images()
        self.stats['total_found'] = len(images)
        
        if not images:
            print("📷 No images found to process")
            print("💡 Place your images in the following directory:")
            print(f"   {self.images_dir}")
            return
        
        print(f"📷 Found {len(images)} image(s) to process")
        print()
        
        # Process each image
        for i, (file_path, relative_path) in enumerate(images, 1):
            print(f"[{i}/{len(images)}] Processing: {relative_path}")
            
            result = self.process_single_image(file_path, relative_path)
            
            if result['success']:
                self.stats['processed'] += 1
                sizes_count = result['sizes_generated']
                original_size = result['original_size']
                file_size_mb = result['file_size'] / (1024 * 1024)
                
                print(f"   ✅ Success: Generated {sizes_count} optimized versions")
                print(f"   📐 Original size: {original_size[0]}x{original_size[1]} ({file_size_mb:.2f}MB)")
                print(f"   🏷️  Alt text: {result['alt_text']}")
                
            else:
                self.stats['errors'] += 1
                print(f"   ❌ Error: {result['error']}")
            
            print()
        
        # Print final statistics
        self._print_final_stats()
    
    def _print_final_stats(self) -> None:
        """Print final processing statistics."""
        elapsed_time = time.time() - self.stats['start_time']
        
        print("=" * 60)
        print("📊 PROCESSING COMPLETE")
        print("=" * 60)
        print(f"📷 Total images found: {self.stats['total_found']}")
        print(f"✅ Successfully processed: {self.stats['processed']}")
        print(f"❌ Errors: {self.stats['errors']}")
        print(f"⏱️  Processing time: {elapsed_time:.2f} seconds")
        
        if self.stats['processed'] > 0:
            avg_time = elapsed_time / self.stats['processed']
            print(f"📈 Average time per image: {avg_time:.2f} seconds")
        
        print()
        print("🔍 To verify your optimized images:")
        print("   python check_optimized_images.py")
        print()
        print("🚀 To test your website:")
        print("   python run.py")
        print("   Visit: http://localhost:5000")
        
        if self.stats['errors'] > 0:
            print()
            print("⚠️  Some images had errors. Common solutions:")
            print("   - Check file permissions")
            print("   - Verify image format is supported")
            print("   - Ensure images aren't corrupted")
            print("   - Check available disk space")


def main():
    """
    Main entry point for the image processing script.
    
    Handles command-line arguments and error handling.
    """
    print("🎨 Adaptive Auto Hub - Image Processing Script")
    print("=" * 60)
    
    try:
        # Check if we're in the right directory
        if not os.path.exists('app'):
            print("❌ Error: This script must be run from the project root directory")
            print("💡 Navigate to your project root and run:")
            print("   python app/utils/process_images.py")
            sys.exit(1)
        
        # Initialize and run processor
        processor = ImageProcessor()
        processor.process_all_images()
        
    except KeyboardInterrupt:
        print("\n🛑 Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print("💡 Please check your setup and try again")
        sys.exit(1)


if __name__ == "__main__":
    main()
