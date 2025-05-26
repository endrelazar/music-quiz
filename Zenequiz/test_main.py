import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_artist_found(client):
    # Teszteljünk egy ismert előadót
    response = client.post('/artist', json={"artist": "Ed Sheeran"})
    assert response.status_code == 200
    data = response.get_json()
    assert "artist_name" in data
    assert "songs" in data
    assert isinstance(data["songs"], list)
    assert len(data["songs"]) > 0

def test_artist_not_found(client):
    # Teszteljünk egy nem létező előadót
    response = client.post('/artist', json={"artist": "asdasdasdasdnoname"})
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data

def test_random_song(client):
    # Először lekérjük az előadót, majd kérünk dalszöveget
    response = client.post('/artist', json={"artist": "Ed Sheeran"})
    assert response.status_code == 200
    data = response.get_json()
    artist_name = data["artist_name"]

    response2 = client.post('/random_song', json={"artist_name": artist_name})
    assert response2.status_code == 200
    data2 = response2.get_json()
    assert "lyrics_part" in data2
    assert "options" in data2
    assert "answer" in data2
    assert isinstance(data2["options"], list)
    assert len(data2["options"]) == 4