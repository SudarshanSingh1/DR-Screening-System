import re

with open('README.md', 'r') as f:
    content = f.read()

# Replace hero-slide-2.png with hero-slide-1.png
content = content.replace('frontend/public/images/hero-slide-2.png', 'frontend/public/images/hero-slide-1.png')

# Replace the Features image (hero-slide-4) with workflow-diagram.png
features_replacement = """<img src="frontend/src/assets/workflow-diagram.png" alt="Clinical Workflow" width="80%" style="border-radius: 8px;" />"""
content = re.sub(
    r'<img src="frontend/public/images/hero-slide-4.png".*?/>',
    features_replacement,
    content
)

# Replace the Simulation image (hero-slide-3) with the two simulation jpegs side-by-side
simulation_replacement = """<img src="frontend/src/assets/simulation-1.jpeg" width="45%" style="border-radius: 8px; margin-right: 5px;" />
<img src="frontend/src/assets/simulation-2.jpeg" width="45%" style="border-radius: 8px;" />"""
content = re.sub(
    r'<img src="frontend/public/images/hero-slide-3.png".*?/>',
    simulation_replacement,
    content
)

with open('README.md', 'w') as f:
    f.write(content)

print("Updated README.md")
