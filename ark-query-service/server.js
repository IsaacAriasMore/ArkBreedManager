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
        const authError = validateSecret(req);
        if (authError) return res.status(401).json(authError);

        const ip = String(req.body?.ip || "").trim();
        const queryPort = Number(req.body?.queryPort);
        const gameType = String(req.body?.gameType || "arkse").trim();

        const validationError = validateQueryInput(ip, queryPort);
        if (validationError) return res.status(400).json(validationError);

        const result = await queryArkServer({
            ip,
            queryPort,
            gameType,
            fast: false
        });

        return res.json({
            ...result,
            elapsed_ms: Date.now() - startedAt
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

app.post("/discover", async (req, res) => {
    const startedAt = Date.now();

    try {
        const authError = validateSecret(req);
        if (authError) return res.status(401).json(authError);

        const ip = String(req.body?.ip || "").trim();
        const gameType = String(req.body?.gameType || "arkse").trim();
        const candidatePorts = normalizeCandidatePorts(req.body?.candidatePorts || []);

        if (!ip) {
            return res.status(400).json({
                ok: false,
                error: "IP requerida."
            });
        }

        if (candidatePorts.length === 0) {
            return res.status(400).json({
                ok: false,
                error: "No hay puertos candidatos válidos."
            });
        }

        const attempts = [];

        for (const queryPort of candidatePorts) {
            const result = await queryArkServer({
                ip,
                queryPort,
                gameType,
                fast: true
            });

            attempts.push({
                queryPort,
                ok: result.ok,
                error: result.error || null,
                server: result.server || null
            });

            if (result.ok) {
                return res.json({
                    ...result,
                    source: "direct_query_discovery",
                    discovered_query_port: queryPort,
                    elapsed_ms: Date.now() - startedAt,
                    attempts
                });
            }
        }

        return res.status(200).json({
            ok: false,
            source: "direct_query_discovery",
            elapsed_ms: Date.now() - startedAt,
            error: "No se encontró un query port funcional.",
            attempts
        });
    } catch (error) {
        return res.status(200).json({
            ok: false,
            source: "direct_query_discovery",
            elapsed_ms: Date.now() - startedAt,
            error: error instanceof Error
                ? error.message
                : "Error descubriendo query port."
        });
    }
});

async function queryArkServer({ ip, queryPort, gameType, fast }) {
    try {
        const state = await Gamedig.query({
            type: gameType,
            host: ip,
            port: queryPort,
            givenPortOnly: true,
            maxAttempts: 1,
            socketTimeout: fast ? 3000 : 7000,
            attemptTimeout: fast ? 4000 : 9000
        });

        const players = normalizePlayers(state.players || []);

        return {
            ok: true,
            source: "direct_query",
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
        };
    } catch (error) {
        return {
            ok: false,
            source: "direct_query",
            query: {
                ip,
                queryPort,
                gameType
            },
            error: error instanceof Error
                ? error.message
                : "Error consultando servidor ARK."
        };
    }
}

function validateSecret(req) {
    const receivedSecret = req.headers["x-query-secret"];

    if (!QUERY_SECRET || receivedSecret !== QUERY_SECRET) {
        return {
            ok: false,
            error: "No autorizado."
        };
    }

    return null;
}

function validateQueryInput(ip, queryPort) {
    if (!ip) {
        return {
            ok: false,
            error: "IP requerida."
        };
    }

    if (!Number.isInteger(queryPort) || queryPort <= 0 || queryPort > 65535) {
        return {
            ok: false,
            error: "queryPort inválido."
        };
    }

    return null;
}

function normalizeCandidatePorts(candidatePorts) {
    return [...new Set(
        candidatePorts
            .map(port => Number(port))
            .filter(port => Number.isInteger(port) && port > 0 && port <= 65535)
    )];
}

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