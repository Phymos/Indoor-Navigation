# Indoor Navigation

A web-based indoor pathfinding app that finds the shortest route between rooms across multiple floors using Dijkstra's algorithm.

Built with Flask (Python) and vanilla JavaScript — no external routing libraries.

---

## Features

- Shortest path calculation between any two rooms via **Dijkstra's algorithm**
- Multi-floor support with automatic floor switching during animation
- Animated route drawing on a canvas overlay
- Dark / light mode toggle (persisted via localStorage)

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Backend   | Python, Flask            |
| Frontend  | HTML, CSS, JavaScript    |
| Algorithm | Dijkstra (custom impl.)  |

---

## Project Structure
```
indoor-navigation/
├── static/
│   ├── script.js      # Canvas animation & fetch logic
│   ├── style.css      # Theming & layout
│   ├── floor 2.png    # Floor map images
│   ├── floor 3.png
│   ├── start.png      # Pin icons
│   └── end.png
├── templates/
│   └── index.html     # Main UI
└── app.py             # Flask server & pathfinding logic
```

---

## Setup

**Requirements:** Python 3.8+
```bash
# 1. Clone the repo
git clone https://github.com/your-username/indoor-navigation.git
cd indoor-navigation

# 2. Install dependencies
pip install flask

# 3. Run
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

---

## Usage

1. Select a **start** room from the dropdown
2. Select a **destination** room
3. Click **Yolu Bul** — the shortest path animates on the map

If the route crosses floors, the map automatically switches to the correct floor.
