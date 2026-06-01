import re

with open('src/components/SolarSystem.tsx', 'r') as f:
    content = f.read()

target = """            {/* Clean, bright sun */}
            <g>
              {/* Main sun composition - Layered PNG and GIF */}
              <g 
                className="sun-sprite"
                clipPath="url(#sunClip)"
                style={{
                  transformOrigin: 'center center'
                }}
              >
                {/* Base Texture - Swaps between Star HD and Black Hole GIF */}
                <image
                  href={isDarkMode ? "/stardark.gif" : "/starhd.png"}
                  x={sunCenterX - baseDimension * 0.9}
                  y={sunCenterY - baseDimension * 0.9}
                  width={baseDimension * 1.8}
                  height={baseDimension * 1.8}
                  preserveAspectRatio="xMidYMid slice"
                  style={{
                    filter: isDarkMode
                      ? 'scale(1.2) brightness(1.1) contrast(1.2)' // Slight scale up for black hole
                      : 'drop-shadow(0 0 50px rgba(255, 200, 50, 0.6))',
                    transition: 'filter 0.5s ease'
                  }}
                />

                {/* Animated Overlay - Only for Light Mode (Star) */}
                {!isDarkMode && (
                  <image
                    href="/stargif.gif"
                    x={sunCenterX - baseDimension * 0.9}
                    y={sunCenterY - baseDimension * 0.9}
                    width={baseDimension * 1.8}
                    height={baseDimension * 1.8}
                    preserveAspectRatio="xMidYMid slice"
                    style={{
                      opacity: 0.99, // Blend with the HD texture
                      mixBlendMode: 'screen', // Additive blending for glow effect
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </g>
            </g>"""

replacement = """            {/* Clean, bright sun */}
            <g transform={`translate(${sunCenterX}, ${sunCenterY})`}>
              {/* Main sun composition - Layered PNG and GIF */}
              <g 
                className="sun-inner"
                transform="scale(1, 1) rotate(0)"
                clipPath="url(#sunClip)"
                style={{
                  transformOrigin: 'center center'
                }}
              >
                {/* Base Texture - Swaps between Star HD and Black Hole GIF */}
                <image
                  href={isDarkMode ? "/stardark.gif" : "/starhd.png"}
                  x={-baseDimension * 0.9}
                  y={-baseDimension * 0.9}
                  width={baseDimension * 1.8}
                  height={baseDimension * 1.8}
                  preserveAspectRatio="xMidYMid slice"
                  style={{
                    filter: isDarkMode
                      ? 'scale(1.2) brightness(1.1) contrast(1.2)' // Slight scale up for black hole
                      : 'drop-shadow(0 0 50px rgba(255, 200, 50, 0.6))',
                    transition: 'filter 0.5s ease'
                  }}
                />

                {/* Animated Overlay - Only for Light Mode (Star) */}
                {!isDarkMode && (
                  <image
                    href="/stargif.gif"
                    x={-baseDimension * 0.9}
                    y={-baseDimension * 0.9}
                    width={baseDimension * 1.8}
                    height={baseDimension * 1.8}
                    preserveAspectRatio="xMidYMid slice"
                    style={{
                      opacity: 0.99, // Blend with the HD texture
                      mixBlendMode: 'screen', // Additive blending for glow effect
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </g>
            </g>"""

# Normalize whitespace for matching
def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()

norm_target = normalize(target)
norm_content = normalize(content)

if norm_target in norm_content:
    print("Found matching content! Replacing...")
    
    # Try exact string replacement first
    if target in content:
        content = content.replace(target, replacement)
        with open('src/components/SolarSystem.tsx', 'w') as f:
            f.write(content)
        print("Success using exact match")
    else:
        print("Exact match failed, using regex approach...")
        # Escape regex magic characters but allow flexible whitespace
        pattern = r'\s*'.join(re.escape(word) for word in target.split())
        content = re.sub(pattern, replacement, content)
        with open('src/components/SolarSystem.tsx', 'w') as f:
            f.write(content)
        print("Success using regex match")
else:
    print("Target content not found in file!")

