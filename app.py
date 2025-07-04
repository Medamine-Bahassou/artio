import streamlit as st

# Title
st.title("🖼️ Pollinations AI Image Generator")

# User input for the image description
prompt = st.text_input("Enter your image prompt (e.g., 'a bold man wearing a hat')", "")

# Optional user inputs for style keywords
style1 = st.text_input("Style 1 (optional)", "gritty realism")
style2 = st.text_input("Style 2 (optional)", "vintage photography")
style3 = st.text_input("Style 3 (optional)", "dramatic lighting")

# Width and height input
width = st.number_input("Image Width (px)", min_value=50, max_value=1024, value=400)
height = st.number_input("Image Height (px)", min_value=50, max_value=1024, value=400)

# Generate button
if st.button("Generate Image"):
    # Convert the prompt into URL-friendly format
    title = prompt.replace(" ", "%20")
    description = f"A%20generated%20image%20of%20{prompt.replace(' ', '%20')}"
    style_1 = style1.replace(" ", "%20")
    style_2 = style2.replace(" ", "%20")
    style_3 = style3.replace(" ", "%20")

    # Build the final URL
    url = (
        f"https://image.pollinations.ai/prompt/(photorealistic:1.4),"
        f"{title},{description},{style_1},{style_2},{style_3}"
        f"?width={width}px&height={height}px&nologo=true"
    )

    # Show the link and the image
    st.markdown(f"### ✅ [**CLICK TO VIEW OR DOWNLOAD IMAGE**]({url})")
    st.image(url, caption="Generated Image", width=width)

    # Debug (optional)
    st.code(url, language="markdown")

