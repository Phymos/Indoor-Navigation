from flask import Flask, request, jsonify, render_template
import heapq

app = Flask(__name__)

# güncellenecek harita değişince js de yazdığımın aynısı
graph = {
    # --- KAT 2 ---
    "Lobby_Top": {"Lobby_Corridor_R3": 1, "Lobby_Mid": 1},
    "Lobby_Mid": {"Lobby_Top": 1, "Lobby_Bottom": 1, "Lobby_Corridor_R2": 1},
    "Lobby_Bottom": {"Lobby_Mid": 1, "R1": 1, "E": 1},
    "Lobby_Corridor_R2": {"Lobby_Mid": 1, "R2": 1},
    "Lobby_Corridor_R3": {"Lobby_Top": 1, "R3": 1, "Lobby_Corridor_R4": 1},
    "Lobby_Corridor_R4": {"Lobby_Corridor_R3": 1, "Lobby_Corridor_R5": 1, "R4": 1},
    "Lobby_Corridor_R5": {"Lobby_Corridor_R4": 1, "R5": 1},
    "R3": {"Lobby_Corridor_R3": 1},
    "R2": {"Lobby_Corridor_R2": 1},
    "R4": {"Lobby_Corridor_R4": 1},
    "R1": {"Lobby_Bottom": 1},
    "R5": {"Lobby_Corridor_R5": 1},
    "E": {"Lobby_Bottom": 1, "E_Kat3": 1}, # Katlar arası geçiş

    # --- KAT 3 ---
    "E_Kat3": {"Living_Quarters_First": 1, "E": 1},
    "Living_Quarters_First": {"E_Kat3": 1, "Living_Quarters_Mid": 1, "LIVINGROOM1.1": 1},
    "Living_Quarters_Mid": {"Living_Quarters_First": 1, "Living_Quarters_Last": 1, "LIVINGROOM2.1": 1},
    "Living_Quarters_Last": {"Living_Quarters_Mid": 1, "LIVINGROOM3.1": 1},

    # 1. oda
    "LIVINGROOM1.1": {"LIVINGROOM1.2": 1, "BATHROOM1": 1, "BEDROOM1": 1, "Living_Quarters_First": 1},
    "LIVINGROOM1.2": {"KITCHEN1": 1, "BALCONY1": 1, "LIVINGROOM1.1": 1},
    "KITCHEN1": {"LIVINGROOM1.2": 1},
    "BALCONY1": {"LIVINGROOM1.2": 1},
    "BEDROOM1": {"LIVINGROOM1.1": 1},
    "BATHROOM1": {"LIVINGROOM1.1": 1},

    # 2. oda
    "LIVINGROOM2.1": {"LIVINGROOM2.2": 1, "BATHROOM2": 1, "BEDROOM2": 1, "Living_Quarters_Mid": 1},
    "LIVINGROOM2.2": {"KITCHEN2": 1, "BALCONY2": 1, "LIVINGROOM2.1": 1},
    "KITCHEN2": {"LIVINGROOM2.2": 1},
    "BALCONY2": {"LIVINGROOM2.2": 1},
    "BEDROOM2": {"LIVINGROOM2.1": 1},
    "BATHROOM2": {"LIVINGROOM2.1": 1},

    # 3. oda
    "LIVINGROOM3.1": {"LIVINGROOM3.2": 1, "BATHROOM3": 1, "BEDROOM3": 1, "Living_Quarters_Last": 1},
    "LIVINGROOM3.2": {"KITCHEN3": 1, "BALCONY3": 1, "LIVINGROOM3.1": 1},
    "KITCHEN3": {"LIVINGROOM3.2": 1},
    "BALCONY3": {"LIVINGROOM3.2": 1},
    "BEDROOM3": {"LIVINGROOM3.1": 1},
    "BATHROOM3": {"LIVINGROOM3.1": 1}, # Pattern'e göre düzeltildi
}

# ------------------------------
# 2️⃣ Dijkstra Algoritması
# ------------------------------
def dijkstra(graph, start):
    distances = {node: float("inf") for node in graph}
    previous = {node: None for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_distance > distances[current_node]:
            continue
        for neighbor, weight in graph[current_node].items():
            new_distance = current_distance + weight
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (new_distance, neighbor))
    return previous

def get_path(previous, start, end):
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    path.reverse()
    if path and path[0] == start:
        return path
    return []

def shortest_path(graph, start, end):
    previous = dijkstra(graph, start)
    return get_path(previous, start, end)



@app.route("/")  #ana sayfa adresi (boş)
def index():
    return render_template("index.html")  #ana sayfanın arayüzü (index adlı html dosyası)

@app.route("/path", methods=["POST"])
def path():
    data = request.json   #fetchin body kısmından gelen veriyi alıyoruz
    start = data["start"]
    end = data["end"]
    result = shortest_path(graph, start, end)
    return jsonify(result)  #sonucu json olarak geri yolluyoruz

if __name__ == "__main__":
    app.run(debug=True)