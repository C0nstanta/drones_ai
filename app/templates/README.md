# /app/templates/README.md
# Templates Directory Structure

This directory contains all Jinja2 templates for the Adaptive Auto Hub website.

## Directory Structure

```
templates/
├── base.html                    # Base template with navigation and footer
├── sitemap.xml                  # XML sitemap template
├── main/
│   └── index.html              # Homepage template
├── products/
│   ├── index.html              # Products overview
│   ├── aura.html               # Aura Analytics product page
│   └── aegis.html              # Aegis Defense product page
├── industries/
│   ├── index.html              # Industries overview
│   └── detail.html             # Individual industry pages
├── partnerships/
│   ├── index.html              # Partnerships overview
│   └── detail.html             # Individual partner pages
├── about/
│   ├── index.html              # About company page
│   └── contact.html            # Contact form page
├── errors/
│   └── 404.html                # 404 error page
└── components/                  # Reusable components (future)
    ├── hero.html               # Hero section component
    ├── product-card.html       # Product card component
    ├── metric-card.html        # Metric display component
    └── cta-section.html        # Call-to-action component
```

## Template Inheritance

All templates extend from `base.html` which provides:
- HTML structure and meta tags
- Navigation header
- Footer with links
- CSS/JS asset management
- SEO schema blocks

## Template Variables

### Common Variables (available in all templates)
- `page_title` - Page title for SEO
- `meta_description` - Meta description for SEO
- `meta_keywords` - Meta keywords (optional)
- `canonical_url` - Canonical URL (optional)
- `og_image` - Open Graph image (optional)

### Page-Specific Variables
Each route provides specific context variables documented in the route files.

## Blocks

### Available blocks for override:
- `title` - Page title
- `content` - Main page content
- `extra_head` - Additional head tags
- `schema` - Structured data JSON-LD
- `scripts` - Additional JavaScript

## Usage Example

```jinja2
{% extends "base.html" %}

{% block content %}
<section class="section">
    <div class="container">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
    </div>
</section>
{% endblock %}

{% block schema %}
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{{ title }}"
}
</script>
{% endblock %}
```

## SEO Best Practices

1. Always provide `page_title` and `meta_description`
2. Include structured data in the `schema` block
3. Use semantic HTML5 elements
4. Include alt text for all images
5. Use proper heading hierarchy (h1 → h2 → h3)

## Performance Considerations

1. Minimize template logic - prepare data in routes
2. Use template caching in production
3. Lazy load images below the fold
4. Inline critical CSS, async load the rest
5. Use Flask-Assets for bundling

## Accessibility

1. Use ARIA labels where appropriate
2. Ensure color contrast meets WCAG 2.1 AA
3. Provide skip navigation links
4. Use semantic HTML elements
5. Test with screen readers