

const staticTexts = {
    hu: {
        mainTitle: "Zenequiz",
        langLabel: "Nyelv:",
        artistLabel: "Előadó neve:",
        searchBtn: "Keresés"
    },
    en: {
        mainTitle: "Music Quiz",
        langLabel: "Language:",
        artistLabel: "Artist name:",
        searchBtn: "Search"
    }
};

const texts = {
    hu: {
        search: "Keresés...",
        loadingSongs: "Dalok betöltése...",
        loadingLyrics: "Dalszöveg betöltése...",
        showLyrics: "Mutass dalszöveget!",
        correct: "Helyes válasz!",
        wrong: "Rossz válasz! A helyes: ",
        newGame: "Akarsz új játékot?",
        yes: "Igen",
        no: "Nem",
        thanks: "Köszönjük a játékot!",
        tryAgain: "Kérlek, próbáld újra pontosabb névvel!"
    },
    en: {
        search: "Searching...",
        loadingSongs: "Loading songs...",
        loadingLyrics: "Loading lyrics...",
        showLyrics: "Show lyrics!",
        correct: "Correct answer!",
        wrong: "Wrong answer! The correct one is: ",
        newGame: "Do you want a new game?",
        yes: "Yes",
        no: "No",
        thanks: "Thanks for playing!",
        tryAgain: "Please try again with a more precise name!"
    }
};

function updateStaticTexts(lang) {
    document.getElementById('mainTitle').innerText = staticTexts[lang].mainTitle;
    document.getElementById('langLabel').innerText = staticTexts[lang].langLabel;
    document.getElementById('artistLabel').innerText = staticTexts[lang].artistLabel;
    document.getElementById('searchBtn').innerText = staticTexts[lang].searchBtn;
}

// Nyelvváltáskor frissítjük a statikus szövegeket
document.getElementById('lang').onchange = function() {
    updateStaticTexts(this.value);
};
window.onload = function() {
    updateStaticTexts(document.getElementById('lang').value);
};

document.getElementById('artistForm').onsubmit = async function(e) {
    e.preventDefault();
    const keresBtn = document.querySelector('#artistForm button[type="submit"]');
    const lang = document.getElementById('lang').value;
    keresBtn.disabled = true;
    document.getElementById('songs').innerHTML = texts[lang].search;
    document.getElementById('lyrics').innerHTML = "";

    const artist = document.getElementById('artist').value;
    const res = await fetch('/artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist: artist, lang: lang })
    });
    const data = await res.json();

    // Ha visszakérdezés szükséges
    if (data.confirm) {
        document.getElementById('songs').innerHTML =
            `<p>${lang === "hu" ? "Erre az előadóra gondoltál" : "Did you mean"}: <b>${data.found_name}</b>?<br>
            <button id="yesBtn">${texts[lang].yes}</button>
            <button id="noBtn">${texts[lang].no}</button></p>`;
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        yesBtn.onclick = async function() {
            keresBtn.disabled = true;
            yesBtn.disabled = true;
            noBtn.disabled = true;
            document.getElementById('artist').value = data.found_name;
            document.getElementById('songs').innerHTML = texts[lang].loadingSongs;
            const res2 = await fetch('/artist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artist: data.found_name, lang: lang })
            });
            const data2 = await res2.json();

            if (data2.songs) {
                let html = `<button id='randomBtn'>${texts[lang].showLyrics}</button>`;
                document.getElementById('songs').innerHTML = html;
                const randomBtn = document.getElementById('randomBtn');
                randomBtn.onclick = async function() {
                    randomBtn.disabled = true;
                    document.getElementById('lyrics').innerHTML = texts[lang].loadingLyrics;
                    const res3 = await fetch('/random_song', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ artist_name: data2.artist_name, lang: lang })
                    });
                    const lyricData = await res3.json();
                    if (lyricData.lyrics_part && lyricData.options) {
                        document.getElementById('lyrics').innerHTML =
                            `<h3>${lang === "hu" ? "Dalszöveg részlet:" : "Lyrics excerpt:"}</h3><pre>` +
                            lyricData.lyrics_part.join('\n') + "</pre>";

                        // Válaszlehetőségek gombok
                        let optionsHtml = "<div>";
                        lyricData.options.forEach(option => {
                            optionsHtml += `<button class="optionBtn">${option}</button><br>`;
                        });
                        optionsHtml += "</div>";
                        document.getElementById('lyrics').innerHTML += optionsHtml;

                        // Gombok eseménykezelője
                        document.querySelectorAll('.optionBtn').forEach(btn => {
                            btn.onclick = function() {
                                let helyes = btn.textContent === lyricData.answer;
                                if (helyes) {
                                    btn.style.background = "lightgreen";
                                    alert(texts[lang].correct);
                                } else {
                                    btn.style.background = "salmon";
                                    alert(texts[lang].wrong + lyricData.answer);
                                }
                                document.querySelectorAll('.optionBtn').forEach(b => b.disabled = true);
                                randomBtn.disabled = false;

                                // Új játék kérdés
                                document.getElementById('lyrics').innerHTML += `
                                    <div style="margin-top:15px;">
                                        <b>${texts[lang].newGame}</b><br>
                                        <button id="ujJatekIgen">${texts[lang].yes}</button>
                                        <button id="ujJatekNem">${texts[lang].no}</button>
                                    </div>
                                `;
                                document.getElementById('ujJatekIgen').onclick = function() {
                                    document.getElementById('artist').value = "";
                                    document.getElementById('songs').innerHTML = "";
                                    document.getElementById('lyrics').innerHTML = "";
                                    keresBtn.disabled = false;
                                    document.getElementById('artist').focus();
                                    localStorage.removeItem('gameEnded');
                                };
                                document.getElementById('ujJatekNem').onclick = function() {
                                    localStorage.setItem('gameEnded', '1');
                                    document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;">
                                        <h2 style="font-size:2em;text-align:center;">${texts[lang].thanks}</h2>
                                    </div>`;
                                };
                            }
                        });
                    } else if (lyricData.lyrics_part) {
                        document.getElementById('lyrics').innerHTML =
                            `<h3>${lang === "hu" ? "Dalszöveg részlet:" : "Lyrics excerpt:"}</h3><pre>` +
                            lyricData.lyrics_part.join('\n') + "</pre>";
                    } else {
                        document.getElementById('lyrics').innerText = lyricData.error;
                    }
                    randomBtn.disabled = false;
                }
            } else {
                document.getElementById('songs').innerText = data2.error;
            }
            keresBtn.disabled = false;
            yesBtn.disabled = false;
            noBtn.disabled = false;
        };
        noBtn.onclick = function() {
            document.getElementById('songs').innerText = texts[lang].tryAgain;
            keresBtn.disabled = false;
        };
        return;
    }

    if (data.songs) {
        let html = `<button id='randomBtn'>${texts[lang].showLyrics}</button>`;
        document.getElementById('songs').innerHTML = html;
        const randomBtn = document.getElementById('randomBtn');
        randomBtn.onclick = async function() {
            randomBtn.disabled = true;
            document.getElementById('lyrics').innerHTML = texts[lang].loadingLyrics;
            const res2 = await fetch('/random_song', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artist_name: data.artist_name, lang: lang })
            });
            const lyricData = await res2.json();
            if (lyricData.lyrics_part && lyricData.options) {
                document.getElementById('lyrics').innerHTML =
                    `<h3>${lang === "hu" ? "Dalszöveg részlet:" : "Lyrics excerpt:"}</h3><pre>` +
                    lyricData.lyrics_part.join('\n') + "</pre>";

                // Válaszlehetőségek gombok
                let optionsHtml = "<div>";
                lyricData.options.forEach(option => {
                    optionsHtml += `<button class="optionBtn">${option}</button><br>`;
                });
                optionsHtml += "</div>";
                document.getElementById('lyrics').innerHTML += optionsHtml;

                // Gombok eseménykezelője
                document.querySelectorAll('.optionBtn').forEach(btn => {
                    btn.onclick = function() {
                        let helyes = btn.textContent === lyricData.answer;
                        if (helyes) {
                            btn.style.background = "lightgreen";
                            alert(texts[lang].correct);
                        } else {
                            btn.style.background = "salmon";
                            alert(texts[lang].wrong + lyricData.answer);
                        }
                        document.querySelectorAll('.optionBtn').forEach(b => b.disabled = true);
                        randomBtn.disabled = false;

                        // Új játék kérdés
                        document.getElementById('lyrics').innerHTML += `
                            <div style="margin-top:15px;">
                                <b>${texts[lang].newGame}</b><br>
                                <button id="ujJatekIgen">${texts[lang].yes}</button>
                                <button id="ujJatekNem">${texts[lang].no}</button>
                            </div>
                        `;
                        document.getElementById('ujJatekIgen').onclick = function() {
                            document.getElementById('artist').value = "";
                            document.getElementById('songs').innerHTML = "";
                            document.getElementById('lyrics').innerHTML = "";
                            keresBtn.disabled = false;
                            document.getElementById('artist').focus();
                            localStorage.removeItem('gameEnded');
                        };
                        document.getElementById('ujJatekNem').onclick = function() {
                            localStorage.setItem('gameEnded', '1');
                            document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;">
                                <h2 style="font-size:2em;text-align:center;">${texts[lang].thanks}</h2>
                            </div>`;
                        };
                    }
                });
            } else if (lyricData.lyrics_part) {
                document.getElementById('lyrics').innerHTML =
                    `<h3>${lang === "hu" ? "Dalszöveg részlet:" : "Lyrics excerpt:"}</h3><pre>` +
                    lyricData.lyrics_part.join('\n') + "</pre>";
            } else {
                document.getElementById('lyrics').innerText = lyricData.error;
            }
            randomBtn.disabled = false;
        }
    } else {
        document.getElementById('songs').innerText = data.error;
    }
    keresBtn.disabled = false;
}