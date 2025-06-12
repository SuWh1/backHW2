import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

def generate_gemini_response(message: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(message)
        return response.text.strip() if response.text else "No response from Gemini."
    except Exception as e:
        return f"Error: {str(e)}"
