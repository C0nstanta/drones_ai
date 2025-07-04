# /app/utils/image_optimizer.py
"""
Image optimization utility for Adaptive Auto Hub website.
Handles WebP conversion, responsive sizing, and lazy loading optimization.
"""

import os
import hashlib
from io import BytesIO
from typing import Dict, List, Optional, Tuple
from PIL import Image, ImageFilter
import base64


class ImageOptimizer:
    """
    Image optimization service for Flask web applications.
    
    Provides WebP conversion, responsive sizing, LQIP generation,
    and URL management for optimized image delivery.
    """
    
    def __init__(self, static_folder: str):
        """
        Initialize image optimizer with static folder path.
        
        Args:
            static_folder: Path to Flask static folder
        """
        self.static_folder = static_folder
        self.images_folder = os.path.join(static_folder, 'images')
        self.original_folder = os.path.join(self.images_folder, 'original')
        self.optimized_folder = os.path.join(self.images_folder, 'optimized')
        self.placeholders_folder = os.path.join(self.images_folder, 'placeholders')
        
        # Ensure directories exist
        self._ensure_directories()
        
        # Standard responsive sizes
        self.responsive_sizes = [400, 800, 1200]
        self.webp_quality = 85
        self.jpeg_quality = 90
        self.lqip_size = (20, 20)
        self.lqip_quality = 20
    
    def _ensure_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        directories = [
            self.images_folder,
            self.original_folder,
            self.optimized_folder,
            self.placeholders_folder
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def process_image(self, image_path: str, alt_text: str = '') -> Dict:
        """
        Process a single image for web optimization.
        
        Generates WebP and JPEG versions in multiple sizes,
        creates LQIP placeholder, and returns metadata.
        
        Args:
            image_path: Path to original image file
            alt_text: Alternative text for accessibility
            
        Returns:
            Dict containing optimized image metadata
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load and analyze original image
        with Image.open(image_path) as img:
            original_format = img.format
            original_size = img.size
            
            # Convert to RGB if necessary (for WebP compatibility)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Generate file hash for cache busting
            file_hash = self._generate_file_hash(image_path)
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            
            # Process responsive sizes
            sizes_data = self._generate_responsive_sizes(
                img, base_name, file_hash
            )
            
            # Generate LQIP
            lqip_data = self._generate_lqip(img, base_name, file_hash)
            
            return {
                'base_name': base_name,
                'hash': file_hash,
                'original_size': original_size,
                'original_format': original_format,
                'alt_text': alt_text,
                'sizes': sizes_data,
                'lqip': lqip_data,
                'timestamp': os.path.getmtime(image_path)
            }
    
    def _generate_responsive_sizes(self, img: Image, base_name: str, 
                                 file_hash: str) -> List[Dict]:
        """
        Generate responsive image sizes in WebP and JPEG formats.
        
        Args:
            img: PIL Image object
            base_name: Base filename without extension
            file_hash: File hash for cache busting
            
        Returns:
            List of size metadata dictionaries
        """
        sizes_data = []
        original_width = img.size[0]
        
        for target_width in self.responsive_sizes:
            if target_width >= original_width:
                # Use original size if target is larger
                target_width = original_width
            
            # Calculate proportional height
            ratio = target_width / original_width
            target_height = int(img.size[1] * ratio)
            
            # Resize image
            resized_img = img.resize(
                (target_width, target_height), 
                Image.Resampling.LANCZOS
            )
            
            # Generate WebP version
            webp_filename = f"{base_name}_{target_width}w_{file_hash[:8]}.webp"
            webp_path = os.path.join(self.optimized_folder, webp_filename)
            resized_img.save(
                webp_path, 
                'WebP', 
                quality=self.webp_quality,
                optimize=True
            )
            
            # Generate JPEG fallback
            jpeg_filename = f"{base_name}_{target_width}w_{file_hash[:8]}.jpg"
            jpeg_path = os.path.join(self.optimized_folder, jpeg_filename)
            resized_img.save(
                jpeg_path, 
                'JPEG', 
                quality=self.jpeg_quality,
                optimize=True
            )
            
            # Calculate file sizes
            webp_size = os.path.getsize(webp_path)
            jpeg_size = os.path.getsize(jpeg_path)
            
            size_data = {
                'width': target_width,
                'height': target_height,
                'webp': {
                    'url': f'/static/images/optimized/{webp_filename}',
                    'filename': webp_filename,
                    'size': webp_size
                },
                'jpeg': {
                    'url': f'/static/images/optimized/{jpeg_filename}',
                    'filename': jpeg_filename,
                    'size': jpeg_size
                }
            }
            
            sizes_data.append(size_data)
            
            # Break if we've reached original size
            if target_width == original_width:
                break
        
        return sizes_data
    
    def _generate_lqip(self, img: Image, base_name: str, file_hash: str) -> Dict:
        """
        Generate Low Quality Image Placeholder (LQIP).
        
        Creates a tiny, blurred version for progressive loading.
        
        Args:
            img: PIL Image object
            base_name: Base filename without extension
            file_hash: File hash for cache busting
            
        Returns:
            Dictionary containing LQIP data
        """
        # Create tiny version
        lqip_img = img.resize(self.lqip_size, Image.Resampling.LANCZOS)
        
        # Apply blur filter
        lqip_img = lqip_img.filter(ImageFilter.GaussianBlur(radius=1))
        
        # Convert to base64 for inline use
        buffer = BytesIO()
        lqip_img.save(buffer, format='JPEG', quality=self.lqip_quality)
        lqip_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Also save as file for caching
        lqip_filename = f"{base_name}_lqip_{file_hash[:8]}.jpg"
        lqip_path = os.path.join(self.placeholders_folder, lqip_filename)
        lqip_img.save(lqip_path, 'JPEG', quality=self.lqip_quality)
        
        return {
            'base64': f"data:image/jpeg;base64,{lqip_base64}",
            'url': f'/static/images/placeholders/{lqip_filename}',
            'size': len(base64.b64decode(lqip_base64))
        }
    
    def _generate_file_hash(self, file_path: str) -> str:
        """
        Generate MD5 hash of file for cache busting.
        
        Args:
            file_path: Path to file
            
        Returns:
            MD5 hash string
        """
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def get_picture_element_html(self, image_data: Dict, 
                               css_class: str = '', 
                               loading: str = 'lazy') -> str:
        """
        Generate HTML picture element with responsive sources.
        
        Args:
            image_data: Processed image metadata
            css_class: CSS classes for img element
            loading: Loading strategy ('lazy', 'eager')
            
        Returns:
            HTML picture element string
        """
        if not image_data.get('sizes'):
            return ''
        
        picture_html = ['<picture>']
        
        # Generate source elements for WebP
        webp_srcset = []
        jpeg_srcset = []
        
        for size_data in image_data['sizes']:
            webp_url = size_data['webp']['url']
            jpeg_url = size_data['jpeg']['url']
            width = size_data['width']
            
            webp_srcset.append(f"{webp_url} {width}w")
            jpeg_srcset.append(f"{jpeg_url} {width}w")
        
        # WebP source
        picture_html.append(
            f'  <source srcset="{", ".join(webp_srcset)}" '
            f'type="image/webp" sizes="(max-width: 768px) 100vw, 50vw">'
        )
        
        # JPEG fallback source
        picture_html.append(
            f'  <source srcset="{", ".join(jpeg_srcset)}" '
            f'type="image/jpeg" sizes="(max-width: 768px) 100vw, 50vw">'
        )
        
        # Fallback img element
        fallback_src = image_data['sizes'][0]['jpeg']['url']
        lqip_src = image_data.get('lqip', {}).get('base64', '')
        
        img_attrs = [
            f'src="{fallback_src}"',
            f'alt="{image_data.get("alt_text", "")}"',
            f'loading="{loading}"',
            f'decoding="async"'
        ]
        
        if css_class:
            img_attrs.append(f'class="{css_class}"')
        
        if lqip_src and loading == 'lazy':
            img_attrs.append(f'data-lqip="{lqip_src}"')
        
        picture_html.append(f'  <img {" ".join(img_attrs)}>')
        picture_html.append('</picture>')
        
        return '\n'.join(picture_html)


# Global optimizer instance
_optimizer_instance = None


def get_optimizer(static_folder: str = None) -> ImageOptimizer:
    """
    Get or create global ImageOptimizer instance.
    
    Args:
        static_folder: Path to static folder (required for first call)
        
    Returns:
        ImageOptimizer instance
    """
    global _optimizer_instance
    
    if _optimizer_instance is None:
        if static_folder is None:
            from flask import current_app
            static_folder = current_app.static_folder
        
        _optimizer_instance = ImageOptimizer(static_folder)
    
    return _optimizer_instance


def get_optimized_url(image_path: str, format_type: str = 'webp', 
                     width: int = None) -> str:
    """
    Get optimized image URL for template use.
    
    Args:
        image_path: Original image path
        format_type: 'webp' or 'jpeg'
        width: Desired width (uses best available if None)
        
    Returns:
        Optimized image URL
    """
    # This would typically look up cached optimization data
    # For now, return a reasonable default
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    
    if width is None:
        width = 800  # Default responsive size
    
    if format_type == 'webp':
        return f'/static/images/optimized/{base_name}_{width}w.webp'
    else:
        return f'/static/images/optimized/{base_name}_{width}w.jpg'


def get_responsive_sizes(image_path: str) -> List[Dict]:
    """
    Get responsive image sizes for template use.
    
    Args:
        image_path: Original image path
        
    Returns:
        List of responsive size dictionaries
    """
    # This would typically look up cached optimization data
    # For now, return reasonable defaults
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    
    sizes = []
    for width in [400, 800, 1200]:
        sizes.append({
            'width': width,
            'webp_url': f'/static/images/optimized/{base_name}_{width}w.webp',
            'jpeg_url': f'/static/images/optimized/{base_name}_{width}w.jpg'
        })
    
    return sizes
