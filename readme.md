# Music Quiz Web App

A web-based music quiz game built with Flask and lyricsgenius.  
The user enters an artist, gets a random lyrics excerpt, and must guess the correct song title from four options.  
Supports both Hungarian 🇭🇺 and English 🇬🇧 languages.

## Features

- Enter an artist and play a lyrics guessing game
- Four answer options per round
- Language switcher (Hungarian/English)
- Responsive, modern UI
- Genius API integration for lyrics

## Quick Start

1. **Clone the repository:**

git clone https://github.com/endrelazar/music-quiz.git 
cd music-quiz

2. **Add your Genius API token:**

- Create a file named `token.env` in the root folder:
     ```
  TOKEN=your_genius_api_token_here
  ```

3. **Run with Docker:**

docker build -t music-quiz . 
docker run --env-file token.env -p 5000:5000 music-quiz

Or run locally:
pip install -r requirements.txt 
python app.py

4. **Open in browser:**  
Visit [http://localhost:5000](http://localhost:5000)

## Project Structure

- `app.py` - Flask backend
- `static/` - CSS and JS files
- `index.html` - Main HTML page
- `requirements.txt` - Python dependencies
- `.dockerfile` - Docker build file

## Testing

Run backend tests with:
pytest


## License

MIT License

---

**Note:**  
You need a [Genius API token](https://genius.com/api-clients) to use this app.