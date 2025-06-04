from flask import Flask, request, jsonify, send_from_directory
import os
#from dotenv import load_dotenv
import lyricsgenius
import random
import sys

app = Flask(__name__)

#load_dotenv('token.env')
GENIUS_TOKEN = os.getenv('TOKEN')

if not GENIUS_TOKEN:
    print("HIBA: Hiányzik a Genius API TOKEN ", file=sys.stderr)
    exit(1)

try:
    genius = lyricsgenius.Genius(
        GENIUS_TOKEN,
        verbose=True,
        timeout=15
    )
except Exception as e:
    print(f"HIBA: Nem sikerült inicializálni a Genius API-t: {e}", file=sys.stderr)
    exit(1)

artist_cache = {}

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/artist', methods=['POST'])
def get_artist():
    try:
        data = request.json
        lang = data.get('lang', 'hu')
        valaszt = data.get('artist')
        artist = artist_cache.get(valaszt)
        if not artist:
            artist = genius.search_artist(valaszt, max_songs=4, sort="popularity")
            if artist and artist.songs:
                artist_cache[valaszt] = artist
        if artist and artist.songs:
            if artist.name.lower() != valaszt.lower():
                return jsonify({
                    "confirm": True,
                    "found_name": artist.name,
                    "original_query": valaszt
                })
            return jsonify({
                "artist_name": artist.name,
                "songs": [song.title for song in artist.songs]
            })
        else:
            return jsonify({
                "error": "Előadó vagy dal nem található" if lang == "hu" else "Artist or song not found"
            }), 404
    except Exception as e:
        return jsonify({"error": f"Hiba az előadó keresésekor: {str(e)}"}), 500
    

@app.route('/random_song', methods=['POST'])
def get_random_song():
    try:
        data = request.json
        lang = data.get('lang', 'hu')
        artist_name = data.get('artist_name')
        artist = None
        for key, value in artist_cache.items():
            if key.lower() == artist_name.lower() or (hasattr(value, 'name') and value.name.lower() == artist_name.lower()):
                artist = value
                break
        if not artist or not artist.songs or len(artist.songs) < 4:
            return jsonify({
                "error": "Nincs elég dal az előadótól" if lang == "hu" else "Not enough songs from this artist"
            }), 404

        helyes_dal = random.choice(artist.songs)
        helyes_cim = helyes_dal.title

        tobbi_dal = [song for song in artist.songs if song.title != helyes_cim]
        if len(tobbi_dal) < 3:
            return jsonify({
                "error": "Nincs elég különböző dal" if lang == "hu" else "Not enough different songs"
            }), 404
        rossz_cimek = random.sample([song.title for song in tobbi_dal], 3)

        valaszok = rossz_cimek + [helyes_cim]
        random.shuffle(valaszok)

        lyrics = helyes_dal.lyrics.split('\n')
        if len(lyrics) > 10:
            szovegresz = lyrics[5:20]
        else:
            szovegresz = lyrics

        return jsonify({
            "lyrics_part": szovegresz,
            "options": valaszok,
            "answer": helyes_cim
        })
    except Exception as e:
        return jsonify({"error": f"Hiba a dalszöveg lekérdezésekor: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)