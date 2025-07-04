from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt', '')
    style1 = data.get('style1', 'gritty realism')
    style2 = data.get('style2', 'vintage photography')
    style3 = data.get('style3', 'dramatic lighting')
    width = data.get('width', 400)
    height = data.get('height', 400)
    num_outputs = data.get('num_outputs', 1)

    # Convert the prompt into URL-friendly format
    title = prompt.replace(" ", "%20")
    description = f"A%20generated%20image%20of%20{prompt.replace(' ', '%20')}"
    style_1 = style1.replace(" ", "%20")
    style_2 = style2.replace(" ", "%20")
    style_3 = style3.replace(" ", "%20")

    # Build the final URL
    image_urls = []
    for i in range(num_outputs):
        seed = i  # Use a different seed for each image
        image_url = (
            f"https://image.pollinations.ai/prompt/(photorealistic:1.4),"
            f"{title},{description},{style_1},{style_2},{style_3}"
            f"?width={width}px&height={height}px&nologo=true&seed={seed}"
        )
        image_urls.append(image_url)
        
    return jsonify({'image_urls': image_urls})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
