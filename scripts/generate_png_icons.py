from PIL import Image, ImageDraw
import numpy as np

def render_logo_icon(size=512, bg_color=(15, 17, 21, 255), squircle=True):
    # Render at 4x scale for super clean anti-aliasing, then downsample
    scale = 4
    canvas_size = size * scale
    
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if squircle:
        radius = int(canvas_size * 0.22)
        draw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=radius, fill=bg_color)
    
    # Coordinates in 100x100 space, scaled to canvas_size
    s = canvas_size / 100.0
    
    # Left Half: White (#FFFFFF)
    white_fill = (255, 255, 255, 255)
    
    # Left rafter polygon
    left_rafter = [
        (48.5 * s, 13 * s),
        (13 * s, 36.5 * s),
        (13 * s, 87 * s),
        (20 * s, 87 * s),
        (20 * s, 40.5 * s),
        (48.5 * s, 21.8 * s)
    ]
    draw.polygon(left_rafter, fill=white_fill)
    
    # Stud 1 (Outer-Mid)
    draw.rectangle([25.5 * s, 32.5 * s, (25.5 + 7) * s, 87 * s], fill=white_fill)
    
    # Stud 2 (Inner-Mid)
    draw.rectangle([38 * s, 24 * s, (38 + 7) * s, 87 * s], fill=white_fill)
    
    # Right Half: Gradient from #FF9D3B (top) to #FF3823 (bottom)
    # Create mask for right half shapes
    mask_img = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask_img)
    
    # Right rafter
    right_rafter = [
        (51.5 * s, 13 * s),
        (87 * s, 36.5 * s),
        (87 * s, 87 * s),
        (80 * s, 87 * s),
        (80 * s, 40.5 * s),
        (51.5 * s, 21.8 * s)
    ]
    mask_draw.polygon(right_rafter, fill=255)
    
    # U-Shape left leg
    mask_draw.rectangle([55 * s, 24 * s, (55 + 7) * s, 87 * s], fill=255)
    # U-Shape right leg
    mask_draw.rectangle([67.5 * s, 32.5 * s, (67.5 + 7) * s, 87 * s], fill=255)
    # U-Shape bottom plate
    mask_draw.rectangle([55 * s, 80 * s, (55 + 19.5) * s, 87 * s], fill=255)
    
    # Gradient overlay
    grad_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    # Top color #FF9D3B (255, 157, 59), bottom color #FF3823 (255, 56, 35)
    for y in range(canvas_size):
        t = y / float(canvas_size)
        r = int(255)
        g = int(157 * (1 - t) + 56 * t)
        b = int(59 * (1 - t) + 35 * t)
        ImageDraw.Draw(grad_img).line([(0, y), (canvas_size, y)], fill=(r, g, b, 255))
    
    img.paste(grad_img, (0, 0), mask=mask_img)
    
    # High-quality downsample to target size
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate icons
icon_512 = render_logo_icon(512)
icon_512.save("public/icon-512.png", "PNG")

icon_192 = render_logo_icon(192)
icon_192.save("public/icon-192.png", "PNG")

apple_icon = render_logo_icon(180)
apple_icon.save("public/apple-touch-icon.png", "PNG")

favicon_png = render_logo_icon(32)
favicon_png.save("public/favicon.png", "PNG")

print("All raster PNG icons generated successfully!")
