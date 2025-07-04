#!/usr/bin/env python3
# /app/utils/apply_mobile_fixes.py
"""
Apply Mobile Fixes Script for Adaptive Auto Hub
Automatically adds mobile compatibility fixes to the Flask application
"""

import os
import shutil
from pathlib import Path
import re


class MobileFixer:
    def __init__(self, app_path='app'):
        self.app_path = Path(app_path)
        self.static_path = self.app_path / 'static'
        self.templates_path = self.app_path / 'templates'
        self.backup_made = False
        
    def create_backup(self):
        """Create backup of templates before making changes"""
        if not self.backup_made:
            backup_dir = self.app_path / 'templates_backup'
            if not backup_dir.exists():
                shutil.copytree(self.templates_path, backup_dir)
                print(f"✅ Created backup at: {backup_dir}")
                self.backup_made = True
    
    def create_mobile_directories(self):
        """Create mobile-specific directories"""
        dirs = [
            self.static_path / 'css' / 'mobile',
            self.static_path / 'js' / 'mobile'
        ]
        
        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created directory: {dir_path}")
    
    def update_base_template(self):
        """Update base.html with mobile enhancements"""
        base_template = self.templates_path / 'base.html'
        
        if not base_template.exists():
            print("❌ base.html not found")
            return
        
        self.create_backup()
        
        with open(base_template, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if mobile fixes already added
        if 'mobile-fixes.css' in content:
            print("ℹ️  Mobile fixes already added to base.html")
            return
        
        # Add viewport meta tag if missing
        if 'viewport' not in content:
            viewport_meta = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
            content = content.replace('<head>', f'<head>\n    {viewport_meta}')
        
        # Add mobile CSS before </head>
        mobile_css = '''
    <!-- Mobile Fixes -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/mobile-fixes.css') }}">'''
        
        content = content.replace('</head>', f'{mobile_css}\n</head>')
        
        # Add mobile JS before </body>
        mobile_js = '''
    <!-- Mobile Menu Fix -->
    <script src="{{ url_for('static', filename='js/mobile-menu-fix.js') }}" defer></script>'''
        
        content = content.replace('</body>', f'{mobile_js}\n</body>')
        
        # Fix hamburger menu icon if it's using text
        content = re.sub(
            r'(☰|&#9776;|menu)',
            '<span class="sr-only">Menu</span>',
            content,
            flags=re.IGNORECASE
        )
        
        # Write updated content
        with open(base_template, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated base.html with mobile enhancements")
    
    def create_mobile_css(self):
        """Create mobile-fixes.css file"""
        css_content = '''/* Mobile Fixes for Adaptive Auto Hub */

/* Fix hamburger menu icon */
@media (max-width: 768px) {
    .nav__toggle,
    button[aria-label*="menu" i] {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        padding: 0;
        background: transparent;
        border: none;
        cursor: pointer;
        position: relative;
    }

    .nav__toggle::before {
        content: '';
        position: absolute;
        width: 24px;
        height: 2px;
        background: #374151;
        box-shadow: 0 8px 0 #374151, 0 -8px 0 #374151;
        transition: all 0.3s ease;
    }

    /* Hide text hamburger */
    .nav__toggle {
        font-size: 0;
        color: #374151;
    }

    /* Touch-friendly form inputs */
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="search"],
    textarea,
    select {
        min-height: 48px !important;
        padding: 12px 16px !important;
        font-size: 16px !important;
        border-radius: 8px;
        width: 100%;
        -webkit-appearance: none;
    }
    
    /* Full-width buttons */
    .btn,
    button[type="submit"] {
        width: 100%;
        min-height: 48px;
        padding: 14px 24px;
        font-size: 16px;
    }
    
    /* Fix checkbox/radio sizing */
    input[type="checkbox"],
    input[type="radio"] {
        width: 24px !important;
        height: 24px !important;
        margin: 4px 8px 4px 0;
    }
    
    /* Improve spacing */
    .container {
        padding-left: 16px;
        padding-right: 16px;
    }
    
    h1 { font-size: 28px; line-height: 1.2; }
    h2 { font-size: 24px; line-height: 1.3; }
    p { font-size: 16px; line-height: 1.6; }
}

/* Fix header */
.header,
header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Better tap highlights */
a, button, input, select, textarea {
    -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
}
'''
        
        css_file = self.static_path / 'css' / 'mobile-fixes.css'
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(css_content)
        
        print(f"✅ Created mobile-fixes.css")
    
    def create_mobile_js(self):
        """Create mobile menu fix JavaScript"""
        js_content = '''// Mobile Menu Fix
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.nav__toggle, [aria-label*="menu"], .hamburger');
    const nav = document.querySelector('.nav__menu, nav ul');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = nav.classList.contains('is-open');
            
            if (isOpen) {
                nav.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            } else {
                nav.classList.add('is-open');
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }
});

// Add required CSS for mobile menu
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav__menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1rem;
        }
        
        .nav__menu.is-open {
            display: block;
        }
        
        .nav__menu li {
            margin-bottom: 0.5rem;
        }
        
        .nav__menu a {
            display: block;
            padding: 0.75rem;
            text-decoration: none;
        }
    }
`;
document.head.appendChild(style);
'''
        
        js_file = self.static_path / 'js' / 'mobile-menu-fix.js'
        js_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"✅ Created mobile-menu-fix.js")
    
    def update_form_templates(self):
        """Update form templates for better mobile experience"""
        form_files = list(self.templates_path.rglob('*contact*.html'))
        form_files.extend(list(self.templates_path.rglob('*form*.html')))
        
        for form_file in form_files:
            if form_file.is_file():
                self.create_backup()
                
                with open(form_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update input types for mobile
                replacements = [
                    (r'<input([^>]+)type="text"', r'<input\1type="text" autocomplete="name"'),
                    (r'<input([^>]+)type="email"', r'<input\1type="email" autocomplete="email"'),
                    (r'<input([^>]+)type="tel"', r'<input\1type="tel" autocomplete="tel"'),
                ]
                
                for pattern, replacement in replacements:
                    content = re.sub(pattern, replacement, content)
                
                with open(form_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Updated form template: {form_file.name}")
    
    def apply_all_fixes(self):
        """Apply all mobile fixes"""
        print("\n🚀 Starting Mobile Fix Application...\n")
        
        self.create_mobile_directories()
        self.create_mobile_css()
        self.create_mobile_js()
        self.update_base_template()
        self.update_form_templates()
        
        print("\n✨ Mobile fixes applied successfully!")
        print("\nNext steps:")
        print("1. Test on real mobile devices")
        print("2. Clear browser cache")
        print("3. Check JavaScript console for errors")
        print("\nIf you need to restore backups, check: app/templates_backup/")


if __name__ == '__main__':
    import sys
    
    # Check if app directory exists
    app_dir = 'app' if os.path.exists('app') else '.'
    
    if len(sys.argv) > 1:
        app_dir = sys.argv[1]
    
    fixer = MobileFixer(app_dir)
    
    print("Mobile Fix Script for Adaptive Auto Hub")
    print("=" * 40)
    print(f"App directory: {fixer.app_path.absolute()}")
    print("\nThis script will:")
    print("- Create mobile CSS and JS files")
    print("- Update base template")
    print("- Improve form templates")
    print("- Create backups before changes")
    
    response = input("\nContinue? (y/n): ").lower()
    
    if response == 'y':
        fixer.apply_all_fixes()
    else:
        print("❌ Operation cancelled")
