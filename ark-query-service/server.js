const express = require("express");
const cors = require("cors");
const Gamedig = require("gamedig");

const app = express();

const PORT = process.env.PORT || 3001;
const QUERY_SECRET = process.env.ARK_QUERY_SERVICE_SECRET;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "ark-query-service",
        message: "ARK query service online"
    });
});

app.post("/query", async (req, res) => {
    const startedAt = Date.now();

    try {
        const receivedSecret = req.headers["x-query-secret"];

        if (!QUERY_SECRET || receivedSecret !== QUERY_SECRET) {
            return res.status(401).json({
                ok: false,
                error: "No autorizado."
            });
        }

        const ip = String(req.body?.ip || "").trim();
        const queryPort = Number(req.body?.queryPort);
        const gameType = String(req.body?.gameType || "arkse").trim();

        if (!ip) {
            return res.status(400).json({
                ok: false,
                error: "IP requerida."
            });
        }

        if (!Number.isInteger(queryPort) || queryPort <= 0 || queryPort > 65535) {
            return res.status(400).json({
                ok: false,
                error: "queryPort inválido."
            });
        }

        const state = await Gamedig.query({
            type: gameType,
            host: ip,
            port: queryPort,
            givenPortOnly: true,
            maxAttempts: 1,
            socketTimeout: 7000,
            attemptTimeout: 9000
        });

        const players = normalizePlayers(state.players || []);

        return res.json({
            ok: true,
            source: "direct_query",
            elapsed_ms: Date.now() - startedAt,
            query: {
                ip,
                queryPort,
                gameType
            },
            server: {
                name: state.name || "Servidor ARK",
                map: state.map || state.raw?.map || "Mapa desconocido",
                current_players:
                    Number(state.raw?.numplayers) ||
                    Number(state.numplayers) ||
                    players.length ||
                    0,
                max_players:
                    Number(state.maxplayers) ||
                    Number(state.raw?.maxplayers) ||
                    0
            },
            players
        });
    } catch (error) {
        return res.status(200).json({
            ok: false,
            source: "direct_query",
            elapsed_ms: Date.now() - startedAt,
            error: error instanceof Error
                ? error.message
                : "Error consultando servidor ARK."
        });
    }
});

function normalizePlayers(players) {
    return players
        .map((player) => {
            const name = String(player?.name || "").trim();

            if (!name) return null;

            return {
                id: null,
                detected_name: name,
                battlemetrics_name: name
            };
        })
        .filter(Boolean);
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(`ark-query-service running on port ${PORT}`);
});