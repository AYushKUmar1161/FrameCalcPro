import os
from PIL import Image, ImageDraw

def create_logo_svg(left_color="#111827", bg_color=None, squircle=False, size=100):
    bg_svg = ""
    if squircle:
        bg_fill = bg_color or "#0E1015"
        bg_svg = f'<rect width="100" height="100" rx="22" fill="{bg_fill}" />'
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="{size}" height="{size}">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9D3B" />
      <stop offset="55%" stop-color="#FF5F6D" />
      <stop offset="100%" stop-color="#FF3823" />
    </linearGradient>
  </defs>
  {bg_svg}
  <g transform="translate(0, 0)">
    <!-- Left Half: Rafter + Outer Wall + 2 Studs -->
    <g fill="{left_color}">
      <!-- Left Rafter & Outer Wall -->
      <path d="M 48.5 13 L 13 36.5 L 13 87 L 20 87 L 20 40.5 L 48.5 21.8 Z" />
      <!-- Stud 1 (Outer-Mid) -->
      <rect x="25.5" y="32.5" width="7" height="54.5" />
      <!-- Stud 2 (Inner-Mid) -->
      <rect x="38" y="24" width="7" height="63" />
    </g>

    <!-- Right Half: Rafter + Outer Wall + U-Shape -->
    <g fill="url(#brandGrad)">
      <!-- Right Rafter & Outer Wall -->
      <path d="M 51.5 13 L 87 36.5 L 87 87 L 80 87 L 80 40.5 L 51.5 21.8 Z" />
      <!-- U-Shape: Left Leg -->
      <rect x="55" y="24" width="7" height="63" />
      <!-- U-Shape: Right Leg -->
      <rect x="67.5" y="32.5" width="7" height="54.5" />
      <!-- U-Shape: Bottom Plate -->
      <rect x="55" y="80" width="19.5" height="7" />
    </g>
  </g>
</svg>'''

# Generate SVGs
os.makedirs("public", exist_ok=True)

# 1. Dark squircle icon (matches bottom-left icon in user image)
with open("public/logo-icon-dark.svg", "w") as f:
    f.write(create_logo_svg(left_color="#FFFFFF", bg_color="#0F1115", squircle=True))

# 2. Light squircle icon (matches bottom-right icon in user image)
with open("public/logo-icon-light.svg", "w") as f:
    f.write(create_logo_svg(left_color="#18181B", bg_color="#FFFFFF", squircle=True))

# 3. Transparent mark (light theme)
with open("public/logo-mark.svg", "w") as f:
    f.write(create_logo_svg(left_color="#18181B", squircle=False))

# 4. Transparent mark (dark theme)
with open("public/logo-mark-dark.svg", "w") as f:
    f.write(create_logo_svg(left_color="#FFFFFF", squircle=False))

# 5. Favicon (dark squircle for maximum contrast in both light and dark browser tabs)
with open("public/favicon.svg", "w") as f:
    f.write(create_logo_svg(left_color="#FFFFFF", bg_color="#0D0E12", squircle=True, size=48))

# 6. Full horizontal logo SVG
full_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9D3B" />
      <stop offset="55%" stop-color="#FF5F6D" />
      <stop offset="100%" stop-color="#FF3823" />
    </linearGradient>
  </defs>

  <!-- House Mark (Scale 0.72, translated) -->
  <g transform="translate(6, 4) scale(0.72)">
    <!-- Left Half -->
    <g fill="#18181B">
      <path d="M 48.5 13 L 13 36.5 L 13 87 L 20 87 L 20 40.5 L 48.5 21.8 Z" />
      <rect x="25.5" y="32.5" width="7" height="54.5" />
      <rect x="38" y="24" width="7" height="63" />
    </g>
    <!-- Right Half -->
    <g fill="url(#brandGrad)">
      <path d="M 51.5 13 L 87 36.5 L 87 87 L 80 87 L 80 40.5 L 51.5 21.8 Z" />
      <rect x="55" y="24" width="7" height="63" />
      <rect x="67.5" y="32.5" width="7" height="54.5" />
      <rect x="55" y="80" width="19.5" height="7" />
    </g>
  </g>

  <!-- Typography -->
  <text x="86" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="29" font-weight="900" letter-spacing="-0.02em" fill="#18181B">FrameCalc<tspan fill="url(#brandGrad)">Pro</tspan></text>
  <text x="87" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.22em" fill="#6B7280">FRAMING MATERIAL TAKEOFF</text>
</svg>'''

with open("public/logo.svg", "w") as f:
    f.write(full_logo_svg)

# Full horizontal dark logo SVG
full_logo_dark_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9D3B" />
      <stop offset="55%" stop-color="#FF5F6D" />
      <stop offset="100%" stop-color="#FF3823" />
    </linearGradient>
  </defs>

  <!-- House Mark (Scale 0.72, translated) -->
  <g transform="translate(6, 4) scale(0.72)">
    <!-- Left Half -->
    <g fill="#FFFFFF">
      <path d="M 48.5 13 L 13 36.5 L 13 87 L 20 87 L 20 40.5 L 48.5 21.8 Z" />
      <rect x="25.5" y="32.5" width="7" height="54.5" />
      <rect x="38" y="24" width="7" height="63" />
    </g>
    <!-- Right Half -->
    <g fill="url(#brandGrad)">
      <path d="M 51.5 13 L 87 36.5 L 87 87 L 80 87 L 80 40.5 L 51.5 21.8 Z" />
      <rect x="55" y="24" width="7" height="63" />
      <rect x="67.5" y="32.5" width="7" height="54.5" />
      <rect x="55" y="80" width="19.5" height="7" />
    </g>
  </g>

  <!-- Typography -->
  <text x="86" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="29" font-weight="900" letter-spacing="-0.02em" fill="#F4F4F5">FrameCalc<tspan fill="url(#brandGrad)">Pro</tspan></text>
  <text x="87" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.22em" fill="#A1A1AA">FRAMING MATERIAL TAKEOFF</text>
</svg>'''

with open("public/logo-dark.svg", "w") as f:
    f.write(full_logo_dark_svg)

print("All SVGs generated successfully")
