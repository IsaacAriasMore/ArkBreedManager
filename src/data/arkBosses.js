export const DIFFICULTIES = ["gamma", "beta", "alpha"];

export const DIFFICULTY_LABELS = {
    es: {
        gamma: "Gamma",
        beta: "Beta",
        alpha: "Alpha"
    },
    en: {
        gamma: "Gamma",
        beta: "Beta",
        alpha: "Alpha"
    }
};

function item(amount, es, en) {
    return {
        amount,
        es,
        en
    };
}

function requirements(artifacts = [], tributes = []) {
    return {
        artifacts,
        tributes
    };
}

function emptyRequirements() {
    return {
        gamma: requirements(),
        beta: requirements(),
        alpha: requirements()
    };
}

const BROODMOTHER_ARTIFACTS = [
    item(1, "Artefacto del Inteligente", "Artifact of the Clever"),
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Masivo", "Artifact of the Massive")
];

const BROODMOTHER_TRIBUTES_BETA = [
    item(5, "Garra de Argentavis", "Argentavis Talon"),
    item(5, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(5, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(5, "Veneno de Titanoboa", "Titanoboa Venom")
];

const BROODMOTHER_TRIBUTES_ALPHA = [
    item(10, "Garra de Argentavis", "Argentavis Talon"),
    item(10, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(10, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(10, "Veneno de Titanoboa", "Titanoboa Venom")
];

const MEGAPITHECUS_ARTIFACTS = [
    item(1, "Artefacto del Bruto", "Artifact of the Brute"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto de la Manada", "Artifact of the Pack")
];

const MEGAPITHECUS_TRIBUTES_BETA = [
    item(5, "Toxina de Megalania", "Megalania Toxin"),
    item(5, "Diente de Megalodón", "Megalodon Tooth"),
    item(5, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(5, "Garras de Therizino", "Therizino Claws"),
    item(5, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw")
];

const MEGAPITHECUS_TRIBUTES_ALPHA = [
    item(10, "Toxina de Megalania", "Megalania Toxin"),
    item(10, "Diente de Megalodón", "Megalodon Tooth"),
    item(10, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(10, "Garras de Therizino", "Therizino Claws"),
    item(10, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw")
];

const DRAGON_ARTIFACTS = [
    item(1, "Artefacto del Astuto", "Artifact of the Cunning"),
    item(1, "Artefacto del Inmune", "Artifact of the Immune"),
    item(1, "Artefacto del Señor del Cielo", "Artifact of the Skylord"),
    item(1, "Artefacto del Fuerte", "Artifact of the Strong")
];

const DRAGON_TRIBUTES_BETA = [
    item(5, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(5, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(1, "Corazón de Giganotosaurus", "Giganotosaurus Heart"),
    item(5, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle"),
    item(5, "Brazo de Tiranosaurio", "Tyrannosaurus Arm"),
    item(5, "Pulmones de Yutyrannus", "Yutyrannus Lungs")
];

const DRAGON_TRIBUTES_ALPHA = [
    item(10, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(10, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(2, "Corazón de Giganotosaurus", "Giganotosaurus Heart"),
    item(10, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle"),
    item(15, "Brazo de Tiranosaurio", "Tyrannosaurus Arm"),
    item(10, "Pulmones de Yutyrannus", "Yutyrannus Lungs")
];

const OVERSEER_GAMMA_TRIBUTES = [
    item(1, "Trofeo de Broodmother Gamma", "Gamma Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Gamma", "Gamma Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Gamma", "Gamma Dragon Trophy")
];

const OVERSEER_BETA_TRIBUTES = [
    item(1, "Trofeo de Broodmother Beta", "Beta Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Beta", "Beta Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Beta", "Beta Dragon Trophy"),
    item(1, "Garra de Raptor Alfa", "Alpha Raptor Claw"),
    item(1, "Brazo de Carnotaurus Alfa", "Alpha Carnotaurus Arm"),
    item(1, "Diente de Tiranosaurio Alfa", "Alpha Tyrannosaur Tooth")
];

const OVERSEER_ALPHA_TRIBUTES = [
    item(1, "Trofeo de Broodmother Alfa", "Alpha Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Alfa", "Alpha Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Alfa", "Alpha Dragon Trophy"),
    item(1, "Garra de Raptor Alfa", "Alpha Raptor Claw"),
    item(1, "Brazo de Carnotaurus Alfa", "Alpha Carnotaurus Arm"),
    item(1, "Diente de Tiranosaurio Alfa", "Alpha Tyrannosaur Tooth"),
    item(1, "Aleta de Megalodón Alfa", "Alpha Megalodon Fin"),
    item(1, "Diente de Mosasaurio Alfa", "Alpha Mosasaur Tooth"),
    item(1, "Ojo de Tusoteuthis Alfa", "Alpha Tusoteuthis Eye"),
    item(1, "Grasa de Leedsichthys Alfa", "Alpha Leedsichthys Blubber")
];

const MANTICORE_ARTIFACTS = [
    item(1, "Artefacto del Guardián", "Artifact of the Gatekeeper"),
    item(1, "Artefacto del Risco", "Artifact of the Crag"),
    item(1, "Artefacto del Destructor", "Artifact of the Destroyer")
];

const MANTICORE_TRIBUTES_GAMMA = [
    item(55, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(2, "Garra de Fuego", "Fire Talon"),
    item(2, "Garra de Relámpago", "Lightning Talon"),
    item(2, "Garra Venenosa", "Poison Talon")
];

const MANTICORE_TRIBUTES_BETA = [
    item(70, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Garra de Fuego", "Fire Talon"),
    item(10, "Garra de Relámpago", "Lightning Talon"),
    item(10, "Garra Venenosa", "Poison Talon")
];

const MANTICORE_TRIBUTES_ALPHA = [
    item(95, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(20, "Garra de Fuego", "Fire Talon"),
    item(20, "Garra de Relámpago", "Lightning Talon"),
    item(20, "Garra Venenosa", "Poison Talon")
];

const ROCKWELL_ARTIFACTS = [
    item(1, "Artefacto de las Profundidades", "Artifact of the Depths"),
    item(1, "Artefacto de las Sombras", "Artifact of the Shadows"),
    item(1, "Artefacto del Acechador", "Artifact of the Stalker")
];

const ROCKWELL_TRIBUTES_GAMMA = [
    item(60, "Nivel mínimo de jugador", "Minimum Player Level")
];

const ROCKWELL_TRIBUTES_BETA = [
    item(75, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(4, "Escama de Basilisco", "Basilisk Scale"),
    item(12, "Veneno de Sin Nombre", "Nameless Venom"),
    item(2, "Glándula de Feromona de Reaper", "Reaper Pheromone Gland"),
    item(2, "Pluma de Rock Drake", "Rock Drake Feather")
];

const ROCKWELL_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(8, "Escama de Basilisco", "Basilisk Scale"),
    item(20, "Veneno de Sin Nombre", "Nameless Venom"),
    item(7, "Glándula de Feromona de Reaper", "Reaper Pheromone Gland"),
    item(7, "Pluma de Rock Drake", "Rock Drake Feather"),
    item(1, "Colmillo de Basilisco Alfa", "Alpha Basilisk Fang"),
    item(1, "Garra de Karkinos Alfa", "Alpha Karkinos Claw"),
    item(1, "Púa de Rey Reaper Alfa", "Alpha Reaper King Barb")
];

const DESERT_TITAN_ARTIFACTS = [
    item(1, "Artefacto del Caos", "Artifact of Chaos")
];

const DESERT_TITAN_TRIBUTES = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(100, "Corazón corrupto", "Corrupt Heart"),
    item(10, "Garra de Fuego", "Fire Talon"),
    item(10, "Piel de Sarcosuchus", "Sarcosuchus Skin")
];

const FOREST_TITAN_ARTIFACTS = [
    item(1, "Artefacto del Crecimiento", "Artifact of Growth")
];

const FOREST_TITAN_TRIBUTES = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(100, "Corazón corrupto", "Corrupt Heart"),
    item(10, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(10, "Brazo de Tiranosaurio", "Tyrannosaurus Arm")
];

const ICE_TITAN_ARTIFACTS = [
    item(1, "Artefacto del Vacío", "Artifact of the Void")
];

const ICE_TITAN_TRIBUTES = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(100, "Corazón corrupto", "Corrupt Heart"),
    item(10, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(10, "Garras de Therizino", "Therizino Claws")
];

const KING_TITAN_TRIBUTES_GAMMA = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(5, "Diente de Tiranosaurio Alfa", "Alpha Tyrannosaur Tooth"),
    item(150, "Corazón corrupto", "Corrupt Heart"),
    item(10, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(1, "Trofeo del Titán del Desierto", "Desert Titan Trophy"),
    item(1, "Trofeo del Titán del Bosque", "Forest Titan Trophy"),
    item(1, "Trofeo del Titán de Hielo", "Ice Titan Trophy")
];

const KING_TITAN_TRIBUTES_BETA = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Diente de Tiranosaurio Alfa", "Alpha Tyrannosaur Tooth"),
    item(300, "Corazón corrupto", "Corrupt Heart"),
    item(20, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(1, "Trofeo del Titán del Desierto", "Desert Titan Trophy"),
    item(1, "Trofeo del Titán del Bosque", "Forest Titan Trophy"),
    item(1, "Trofeo del Titán de Hielo", "Ice Titan Trophy"),
    item(1, "Trofeo de King Titan Gamma", "King Titan Trophy (Gamma)")
];

const KING_TITAN_TRIBUTES_ALPHA = [
    item(1, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Diente de Tiranosaurio Alfa", "Alpha Tyrannosaur Tooth"),
    item(300, "Corazón corrupto", "Corrupt Heart"),
    item(20, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(1, "Trofeo del Titán del Desierto", "Desert Titan Trophy"),
    item(1, "Trofeo del Titán del Bosque", "Forest Titan Trophy"),
    item(1, "Trofeo del Titán de Hielo", "Ice Titan Trophy"),
    item(1, "Trofeo de King Titan Beta", "King Titan Trophy (Beta)"),
    item(20, "Corazón de Giganotosaurus", "Giganotosaurus Heart"),
    item(20, "Vela de Spinosaurus", "Spinosaurus Sail")
];

const MOEDER_REQUIREMENTS_GAMMA = [
    item(1, "Misión: One Tough Moeder Gamma", "Mission: One Tough Moeder Gamma")
];

const MOEDER_REQUIREMENTS_BETA = [
    item(1, "Misión: One Tough Moeder Beta", "Mission: One Tough Moeder Beta")
];

const MOEDER_REQUIREMENTS_ALPHA = [
    item(1, "Misión: One Tough Moeder Alpha", "Mission: One Tough Moeder Alpha")
];

const MASTER_CONTROLLER_REQUIREMENTS_GAMMA = [
    item(58, "Misiones completadas en Genesis Part 1", "Completed Genesis Part 1 missions")
];

const MASTER_CONTROLLER_REQUIREMENTS_BETA = [
    item(116, "Misiones completadas en Genesis Part 1", "Completed Genesis Part 1 missions")
];

const MASTER_CONTROLLER_REQUIREMENTS_ALPHA = [
    item(168, "Misiones completadas en Genesis Part 1", "Completed Genesis Part 1 missions")
];

const ROCKWELL_PRIME_REQUIREMENTS_GAMMA = [
    item(1, "Todas las misiones completadas en dificultad Gamma o superior", "All missions completed on Gamma difficulty or higher"),
    item(6, "Mutágeno", "Mutagen")
];

const ROCKWELL_PRIME_REQUIREMENTS_BETA = [
    item(1, "Todas las misiones completadas en dificultad Beta o superior", "All missions completed on Beta difficulty or higher"),
    item(12, "Mutágeno", "Mutagen")
];

const ROCKWELL_PRIME_REQUIREMENTS_ALPHA = [
    item(1, "Todas las misiones completadas en dificultad Alpha", "All missions completed on Alpha difficulty"),
    item(24, "Mutágeno", "Mutagen")
];


const CENTER_ARENA_ARTIFACTS = [
    item(1, "Artefacto del Inteligente", "Artifact of the Clever"),
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Masivo", "Artifact of the Massive"),
    item(1, "Artefacto de la Manada", "Artifact of the Pack"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto del Bruto", "Artifact of the Brute")
];

const CENTER_ARENA_TRIBUTES_GAMMA = [
    item(70, "Nivel mínimo de jugador", "Minimum Player Level")
];

const CENTER_ARENA_TRIBUTES_BETA = [
    item(80, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Garra de Argentavis", "Argentavis Talon"),
    item(10, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(10, "Toxina de Megalania", "Megalania Toxin"),
    item(10, "Diente de Megalodón", "Megalodon Tooth"),
    item(10, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(10, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(10, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(10, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw"),
    item(10, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(10, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle")
];

const CENTER_ARENA_TRIBUTES_ALPHA = [
    item(90, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(25, "Garra de Argentavis", "Argentavis Talon"),
    item(25, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(25, "Toxina de Megalania", "Megalania Toxin"),
    item(25, "Diente de Megalodón", "Megalodon Tooth"),
    item(25, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(25, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(25, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(25, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw"),
    item(25, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(25, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle")
];

const RAGNAROK_ARENA_ARTIFACTS = [
    item(1, "Artefacto del Inteligente", "Artifact of the Clever"),
    item(1, "Artefacto del Astuto", "Artifact of the Cunning"),
    item(1, "Artefacto del Engaño", "Artifact of the Devious"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Inmune", "Artifact of the Immune"),
    item(1, "Artefacto del Masivo", "Artifact of the Massive"),
    item(1, "Artefacto de la Manada", "Artifact of the Pack"),
    item(1, "Artefacto del Señor del Cielo", "Artifact of the Skylord"),
    item(1, "Artefacto del Fuerte", "Artifact of the Strong")
];

const RAGNAROK_ARENA_TRIBUTES_GAMMA = [
    item(70, "Nivel mínimo de jugador", "Minimum Player Level")
];

const RAGNAROK_ARENA_TRIBUTES_BETA = [
    item(80, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Garra de Argentavis", "Argentavis Talon"),
    item(10, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(10, "Toxina de Megalania", "Megalania Toxin"),
    item(10, "Diente de Megalodón", "Megalodon Tooth"),
    item(10, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(10, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(10, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(10, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw"),
    item(10, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(10, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle")
];

const RAGNAROK_ARENA_TRIBUTES_ALPHA = [
    item(90, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(25, "Garra de Argentavis", "Argentavis Talon"),
    item(25, "Grasa de Basilosaurus", "Basilosaurus Blubber"),
    item(25, "Toxina de Megalania", "Megalania Toxin"),
    item(25, "Diente de Megalodón", "Megalodon Tooth"),
    item(25, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(25, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(25, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(25, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw"),
    item(25, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(25, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle")
];

const VALGUERO_ARENA_ARTIFACTS_GAMMA = [
    item(1, "Artefacto del Bruto", "Artifact of the Brute"),
    item(1, "Artefacto del Risco", "Artifact of the Crag"),
    item(1, "Artefacto del Astuto", "Artifact of the Cunning"),
    item(1, "Artefacto del Destructor", "Artifact of the Destroyer"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto de la Manada", "Artifact of the Pack"),
    item(1, "Artefacto del Señor del Cielo", "Artifact of the Skylord")
];

const VALGUERO_ARENA_ARTIFACTS_BETA = [
    item(1, "Artefacto del Astuto", "Artifact of the Cunning"),
    item(1, "Artefacto del Inmune", "Artifact of the Immune"),
    item(1, "Artefacto del Fuerte", "Artifact of the Strong")
];

const VALGUERO_ARENA_ARTIFACTS_ALPHA = [
    item(1, "Artefacto del Bruto", "Artifact of the Brute"),
    item(1, "Artefacto del Risco", "Artifact of the Crag"),
    item(1, "Artefacto del Destructor", "Artifact of the Destroyer"),
    item(1, "Artefacto del Guardián", "Artifact of the Gatekeeper")
];

const VALGUERO_ARENA_TRIBUTES_GAMMA = [
    item(50, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(5, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(5, "Garra de Argentavis", "Argentavis Talon"),
    item(5, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(5, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(5, "Veneno de Titanoboa", "Titanoboa Venom")
];

const VALGUERO_ARENA_TRIBUTES_BETA = [
    item(85, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(8, "Garra de Argentavis", "Argentavis Talon"),
    item(8, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(8, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(5, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(10, "Brazo de Tiranosaurio", "Tyrannosaurus Arm")
];

const VALGUERO_ARENA_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(15, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(15, "Garra de Argentavis", "Argentavis Talon"),
    item(2, "Corazón de Giganotosaurus", "Giganotosaurus Heart"),
    item(10, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(10, "Veneno de Titanoboa", "Titanoboa Venom"),
    item(15, "Brazo de Tiranosaurio", "Tyrannosaurus Arm")
];

const CRYSTAL_WYVERN_QUEEN_ARTIFACTS_GAMMA = [
    item(1, "Artefacto del Masivo", "Artifact of the Massive"),
    item(1, "Artefacto del Engaño", "Artifact of the Devious"),
    item(1, "Artefacto del Señor del Cielo", "Artifact of the Skylord"),
    item(1, "Artefacto del Inmune", "Artifact of the Immune"),
    item(1, "Artefacto del Bruto", "Artifact of the Brute")
];

const CRYSTAL_WYVERN_QUEEN_ARTIFACTS_BETA = [
    item(1, "Artefacto de las Profundidades", "Artifact of the Depths"),
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Inteligente", "Artifact of the Clever"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto del Fuerte", "Artifact of the Strong"),
    item(1, "Artefacto del Astuto", "Artifact of the Cunning")
];

const CRYSTAL_WYVERN_QUEEN_ARTIFACTS_ALPHA = [
    item(1, "Artefacto de la Manada", "Artifact of the Pack"),
    item(1, "Artefacto de las Sombras", "Artifact of the Shadows"),
    item(1, "Artefacto del Acechador", "Artifact of the Stalker"),
    item(1, "Artefacto del Perdido", "Artifact of the Lost"),
    item(1, "Artefacto del Guardián", "Artifact of the Gatekeeper"),
    item(1, "Artefacto del Risco", "Artifact of the Crag"),
    item(1, "Artefacto del Destructor", "Artifact of the Destroyer")
];

const CRYSTAL_WYVERN_QUEEN_TRIBUTES_GAMMA = [
    item(55, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(10, "Cristal Primigenio", "Primal Crystal"),
    item(5, "Garra de Cristal", "Crystal Talon"),
    item(1, "Garra de Cristal Alfa", "Alpha Crystal Talon")
];

const CRYSTAL_WYVERN_QUEEN_TRIBUTES_BETA = [
    item(75, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(20, "Cristal Primigenio", "Primal Crystal"),
    item(10, "Garra de Cristal", "Crystal Talon"),
    item(3, "Garra de Cristal Alfa", "Alpha Crystal Talon")
];

const CRYSTAL_WYVERN_QUEEN_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(30, "Cristal Primigenio", "Primal Crystal"),
    item(15, "Garra de Cristal", "Crystal Talon"),
    item(5, "Garra de Cristal Alfa", "Alpha Crystal Talon")
];

const DINOPITHECUS_KING_ARTIFACTS_GAMMA = [
    item(1, "Artefacto del Astuto", "Artifact of the Cunning"),
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto de la Manada", "Artifact of the Pack"),
    item(1, "Artefacto del Señor del Cielo", "Artifact of the Skylord")
];

const DINOPITHECUS_KING_ARTIFACTS_BETA = [
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Bruto", "Artifact of the Brute"),
    item(1, "Artefacto del Inmune", "Artifact of the Immune"),
    item(1, "Artefacto del Fuerte", "Artifact of the Strong")
];

const DINOPITHECUS_KING_ARTIFACTS_ALPHA = [
    item(1, "Artefacto del Cazador", "Artifact of the Hunter"),
    item(1, "Artefacto del Engaño", "Artifact of the Devious"),
    item(1, "Artefacto del Devorador", "Artifact of the Devourer"),
    item(1, "Artefacto del Masivo", "Artifact of the Massive")
];

const DINOPITHECUS_KING_TRIBUTES_GAMMA = [
    item(55, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(3, "Cerebro de Allosaurus", "Allosaurus Brain"),
    item(5, "Garra de Argentavis", "Argentavis Talon"),
    item(5, "Piel de Sarcosuchus", "Sarcosuchus Skin"),
    item(3, "Garras de Therizino", "Therizino Claws"),
    item(5, "Veneno de Titanoboa", "Titanoboa Venom")
];

const DINOPITHECUS_KING_TRIBUTES_BETA = [
    item(75, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(2, "Escama de Basilisco", "Basilisk Scale"),
    item(5, "Diente de Megalodón", "Megalodon Tooth"),
    item(5, "Vértebra de Saurópodo", "Sauropod Vertebra"),
    item(2, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(5, "Garra-garfio de Thylacoleo", "Thylacoleo Hook-Claw")
];

const DINOPITHECUS_KING_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(5, "Garras de Therizino", "Therizino Claws"),
    item(2, "Escama de Basilisco", "Basilisk Scale"),
    item(10, "Diente de Megalodón", "Megalodon Tooth"),
    item(2, "Vela de Spinosaurus", "Spinosaurus Sail"),
    item(1, "Corazón de Giganotosaurus", "Giganotosaurus Heart"),
    item(10, "Toxina de Megalania", "Megalania Toxin"),
    item(2, "Tentáculo de Tusoteuthis", "Tusoteuthis Tentacle"),
    item(5, "Brazo de Tiranosaurio", "Tyrannosaurus Arm"),
    item(2, "Pulmones de Yutyrannus", "Yutyrannus Lungs")
];

const FJORDUR_MINI_BOSS_TRIBUTES = [
    item(50, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(30, "Piedra rúnica", "Runestone")
];

const FJORDUR_BROODMOTHER_TRIBUTES_GAMMA = [
    item(30, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Beyla", "Beyla Relic")
];

const FJORDUR_BROODMOTHER_TRIBUTES_BETA = [
    item(50, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Beyla", "Beyla Relic"),
    ...BROODMOTHER_TRIBUTES_BETA
];

const FJORDUR_BROODMOTHER_TRIBUTES_ALPHA = [
    item(70, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Beyla", "Beyla Relic"),
    ...BROODMOTHER_TRIBUTES_ALPHA
];

const FJORDUR_MEGAPITHECUS_TRIBUTES_GAMMA = [
    item(45, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Steinbjörn", "Steinbjörn Relic")
];

const FJORDUR_MEGAPITHECUS_TRIBUTES_BETA = [
    item(65, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Steinbjörn", "Steinbjörn Relic"),
    ...MEGAPITHECUS_TRIBUTES_BETA
];

const FJORDUR_MEGAPITHECUS_TRIBUTES_ALPHA = [
    item(85, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Steinbjörn", "Steinbjörn Relic"),
    ...MEGAPITHECUS_TRIBUTES_ALPHA
];

const FJORDUR_DRAGON_TRIBUTES_GAMMA = [
    item(55, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Hati", "Hati Relic"),
    item(1, "Reliquia de Sköll", "Sköll Relic")
];

const FJORDUR_DRAGON_TRIBUTES_BETA = [
    item(75, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Hati", "Hati Relic"),
    item(1, "Reliquia de Sköll", "Sköll Relic"),
    ...DRAGON_TRIBUTES_BETA
];

const FJORDUR_DRAGON_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Reliquia de Hati", "Hati Relic"),
    item(1, "Reliquia de Sköll", "Sköll Relic"),
    ...DRAGON_TRIBUTES_ALPHA
];

const FENRISULFR_TRIBUTES_GAMMA = [
    item(55, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Trofeo de Broodmother Gamma", "Gamma Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Gamma", "Gamma Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Gamma", "Gamma Dragon Trophy")
];

const FENRISULFR_TRIBUTES_BETA = [
    item(75, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Trofeo de Broodmother Beta", "Beta Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Beta", "Beta Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Beta", "Beta Dragon Trophy")
];

const FENRISULFR_TRIBUTES_ALPHA = [
    item(100, "Nivel mínimo de jugador", "Minimum Player Level"),
    item(1, "Trofeo de Broodmother Alfa", "Alpha Broodmother Trophy"),
    item(1, "Trofeo de Megapithecus Alfa", "Alpha Megapithecus Trophy"),
    item(1, "Trofeo de Dragón Alfa", "Alpha Dragon Trophy")
];
export const ARK_MAPS = [
    {
        slug: "the-island",
        name: "The Island",
        image: "/images/ark/maps/ark_logo_theisland.png",
        description: {
            es: "Mapa base de ARK con los guardianes clásicos y el Overseer.",
            en: "ARK base map with the classic guardians and the Overseer."
        },
        bosses: [
            {
                name: "Broodmother Lysrix",
                image: "/images/ark/bosses/Dossier_Broodmother.png",
                description: {
                    es: "Boss araña de The Island.",
                    en: "Spider boss from The Island."
                },
                requirements: {
                    gamma: requirements(BROODMOTHER_ARTIFACTS, []),
                    beta: requirements(BROODMOTHER_ARTIFACTS, BROODMOTHER_TRIBUTES_BETA),
                    alpha: requirements(BROODMOTHER_ARTIFACTS, BROODMOTHER_TRIBUTES_ALPHA)
                }
            },
            {
                name: "Megapithecus",
                image: "/images/ark/bosses/Dossier_Megapithecus.png",
                description: {
                    es: "Boss gorila de The Island.",
                    en: "Gorilla boss from The Island."
                },
                requirements: {
                    gamma: requirements(MEGAPITHECUS_ARTIFACTS, []),
                    beta: requirements(MEGAPITHECUS_ARTIFACTS, MEGAPITHECUS_TRIBUTES_BETA),
                    alpha: requirements(MEGAPITHECUS_ARTIFACTS, MEGAPITHECUS_TRIBUTES_ALPHA)
                }
            },
            {
                name: "Dragon",
                image: "/images/ark/bosses/Dossier_Dragon.png",
                description: {
                    es: "Boss dragón de The Island.",
                    en: "Dragon boss from The Island."
                },
                requirements: {
                    gamma: requirements(DRAGON_ARTIFACTS, []),
                    beta: requirements(DRAGON_ARTIFACTS, DRAGON_TRIBUTES_BETA),
                    alpha: requirements(DRAGON_ARTIFACTS, DRAGON_TRIBUTES_ALPHA)
                }
            },
            {
                name: "Overseer",
                image: "/images/ark/bosses/Dossier_Overseer.png",
                description: {
                    es: "Boss final de The Island. Estos tributos abren la entrada de la Tek Cave.",
                    en: "Final boss from The Island. These tributes open the Tek Cave entrance."
                },
                requirements: {
                    gamma: requirements([], OVERSEER_GAMMA_TRIBUTES),
                    beta: requirements([], OVERSEER_BETA_TRIBUTES),
                    alpha: requirements([], OVERSEER_ALPHA_TRIBUTES)
                }
            }
        ]
    },
    {
    slug: "scorched-earth",
    name: "Scorched Earth",
    image: "/images/ark/maps/Scorched_logo_new.png",
    description: {
        es: "Mapa desértico con la Manticore como boss principal.",
        en: "Desert map with the Manticore as the main boss."
    },
    bosses: [
        {
            name: "Manticore",
            image: "/images/ark/bosses/Dossier_Manticore.png",
            description: {
                es: "Boss principal de Scorched Earth. Usa artefactos del desierto y garras de wyvern.",
                en: "Main boss from Scorched Earth. Uses desert artifacts and wyvern talons."
            },
            requirements: {
                gamma: requirements(MANTICORE_ARTIFACTS, MANTICORE_TRIBUTES_GAMMA),
                beta: requirements(MANTICORE_ARTIFACTS, MANTICORE_TRIBUTES_BETA),
                alpha: requirements(MANTICORE_ARTIFACTS, MANTICORE_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "aberration",
    name: "Aberration",
    image: "/images/ark/maps/ark-logo-aberration.png",
    description: {
        es: "Mapa subterráneo con Rockwell como boss principal.",
        en: "Underground map with Rockwell as the main boss."
    },
    bosses: [
        {
            name: "Rockwell",
            image: "/images/ark/bosses/Dossier_Rockwell.png",
            description: {
                es: "Boss principal de Aberration. Requiere artefactos de Aberration y tributos de criaturas del mapa.",
                en: "Main boss from Aberration. Requires Aberration artifacts and creature tributes from the map."
            },
            requirements: {
                gamma: requirements(ROCKWELL_ARTIFACTS, ROCKWELL_TRIBUTES_GAMMA),
                beta: requirements(ROCKWELL_ARTIFACTS, ROCKWELL_TRIBUTES_BETA),
                alpha: requirements(ROCKWELL_ARTIFACTS, ROCKWELL_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "extinction",
    name: "Extinction",
    image: "/images/ark/maps/ARK-_Extinction.png",
    description: {
        es: "Mapa postapocalíptico con titanes y King Titan.",
        en: "Post-apocalyptic map with titans and the King Titan."
    },
    bosses: [
        {
            name: "Desert Titan",
            image: "/images/ark/bosses/Dossier_Desert_Titan.png",
            description: {
                es: "Titán del desierto. Se invoca desde el Desert Titan Terminal.",
                en: "Desert titan. Summoned from the Desert Titan Terminal."
            },
            requirements: {
                gamma: requirements(DESERT_TITAN_ARTIFACTS, DESERT_TITAN_TRIBUTES),
                beta: requirements(DESERT_TITAN_ARTIFACTS, DESERT_TITAN_TRIBUTES),
                alpha: requirements(DESERT_TITAN_ARTIFACTS, DESERT_TITAN_TRIBUTES)
            }
        },
        {
            name: "Forest Titan",
            image: "/images/ark/bosses/Dossier_Forest_Titan.png",
            description: {
                es: "Titán del bosque. Se invoca desde el Forest Titan Terminal.",
                en: "Forest titan. Summoned from the Forest Titan Terminal."
            },
            requirements: {
                gamma: requirements(FOREST_TITAN_ARTIFACTS, FOREST_TITAN_TRIBUTES),
                beta: requirements(FOREST_TITAN_ARTIFACTS, FOREST_TITAN_TRIBUTES),
                alpha: requirements(FOREST_TITAN_ARTIFACTS, FOREST_TITAN_TRIBUTES)
            }
        },
        {
            name: "Ice Titan",
            image: "/images/ark/bosses/Dossier_Ice_Titan.png",
            description: {
                es: "Titán de hielo. Se invoca desde el Ice Titan Terminal.",
                en: "Ice titan. Summoned from the Ice Titan Terminal."
            },
            requirements: {
                gamma: requirements(ICE_TITAN_ARTIFACTS, ICE_TITAN_TRIBUTES),
                beta: requirements(ICE_TITAN_ARTIFACTS, ICE_TITAN_TRIBUTES),
                alpha: requirements(ICE_TITAN_ARTIFACTS, ICE_TITAN_TRIBUTES)
            }
        },
        {
            name: "King Titan",
            image: "/images/ark/bosses/Dossier_King_Titan.png",
            description: {
                es: "Boss final de Extinction. Sus requisitos cambian por dificultad.",
                en: "Final boss from Extinction. Requirements change by difficulty."
            },
            requirements: {
                gamma: requirements([], KING_TITAN_TRIBUTES_GAMMA),
                beta: requirements([], KING_TITAN_TRIBUTES_BETA),
                alpha: requirements([], KING_TITAN_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "genesis-part-1",
    name: "Genesis Part 1",
    image: "/images/ark/maps/Genesis_Logo_350-1.png",
    description: {
        es: "Simulación con biomas, misiones y bosses especiales.",
        en: "Simulation map with biomes, missions and special bosses."
    },
    bosses: [
        {
            name: "Moeder, Master of the Ocean",
            image: "/images/ark/bosses/Moeder, Master of the Ocean.png",
            description: {
                es: "Boss oceánico de Genesis Part 1. Se pelea mediante la misión One Tough Moeder.",
                en: "Ocean boss from Genesis Part 1. Fought through the One Tough Moeder mission."
            },
            requirements: {
                gamma: requirements([], MOEDER_REQUIREMENTS_GAMMA),
                beta: requirements([], MOEDER_REQUIREMENTS_BETA),
                alpha: requirements([], MOEDER_REQUIREMENTS_ALPHA)
            }
        },
        {
            name: "Corrupted Master Controller",
            image: "/images/ark/bosses/Corrupted_Master_Controller_Image.png",
            description: {
                es: "Boss final de Genesis Part 1. Requiere completar cierta cantidad de misiones para acceder.",
                en: "Final boss from Genesis Part 1. Requires completing a certain number of missions to access."
            },
            requirements: {
                gamma: requirements([], MASTER_CONTROLLER_REQUIREMENTS_GAMMA),
                beta: requirements([], MASTER_CONTROLLER_REQUIREMENTS_BETA),
                alpha: requirements([], MASTER_CONTROLLER_REQUIREMENTS_ALPHA)
            }
        }
    ]
},
    {
    slug: "genesis-part-2",
    name: "Genesis Part 2",
    image: "/images/ark/maps/xark-logo-genesis-part2.png",
    description: {
        es: "Mapa de nave con Rockwell Prime como boss final.",
        en: "Ship map with Rockwell Prime as the final boss."
    },
    bosses: [
        {
            name: "Rockwell Prime",
            image: "/images/ark/bosses/Dossier_Rockwell_prime.png",
            description: {
                es: "Boss final de Genesis Part 2. Requiere misiones completadas y Mutágeno.",
                en: "Final boss from Genesis Part 2. Requires completed missions and Mutagen."
            },
            requirements: {
                gamma: requirements([], ROCKWELL_PRIME_REQUIREMENTS_GAMMA),
                beta: requirements([], ROCKWELL_PRIME_REQUIREMENTS_BETA),
                alpha: requirements([], ROCKWELL_PRIME_REQUIREMENTS_ALPHA)
            }
        }
    ]
},


    {
    slug: "the-center",
    name: "The Center",
    image: "/images/ark/maps/egs-thecenter.png",
    description: {
        es: "Mapa con arena compartida de Broodmother y Megapithecus.",
        en: "Map with a shared Broodmother and Megapithecus arena."
    },
    bosses: [
        {
            name: "The Center Arena",
            image: "/images/ark/bosses/thecenterarena.png",
            description: {
                es: "Arena doble donde se pelea contra Broodmother Lysrix y Megapithecus al mismo tiempo.",
                en: "Double arena where Broodmother Lysrix and Megapithecus are fought at the same time."
            },
            requirements: {
                gamma: requirements(CENTER_ARENA_ARTIFACTS, CENTER_ARENA_TRIBUTES_GAMMA),
                beta: requirements(CENTER_ARENA_ARTIFACTS, CENTER_ARENA_TRIBUTES_BETA),
                alpha: requirements(CENTER_ARENA_ARTIFACTS, CENTER_ARENA_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "ragnarok",
    name: "Ragnarok",
    image: "/images/ark/maps/ARK-_Ragnarok.png",
    description: {
        es: "Mapa con arena doble de Dragon y Manticore.",
        en: "Map with a double Dragon and Manticore arena."
    },
    bosses: [
        {
            name: "Ragnarok Arena",
            image: "/images/ark/bosses/Ragnarok Arena.png",
            description: {
                es: "Arena donde se pelea contra Dragon y Manticore al mismo tiempo.",
                en: "Arena where Dragon and Manticore are fought at the same time."
            },
            requirements: {
                gamma: requirements(RAGNAROK_ARENA_ARTIFACTS, RAGNAROK_ARENA_TRIBUTES_GAMMA),
                beta: requirements(RAGNAROK_ARENA_ARTIFACTS, RAGNAROK_ARENA_TRIBUTES_BETA),
                alpha: requirements(RAGNAROK_ARENA_ARTIFACTS, RAGNAROK_ARENA_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "valguero",
    name: "Valguero",
    image: "/images/ark/maps/valguero.png",
    description: {
        es: "Mapa con la arena Forsaken Oasis.",
        en: "Map with the Forsaken Oasis arena."
    },
    bosses: [
        {
            name: "Forsaken Oasis",
            image: "/images/ark/bosses/Forsaken_Oasis.png",
            description: {
                es: "Arena donde se pelea contra Megapithecus, Dragon y Manticore al mismo tiempo.",
                en: "Arena where Megapithecus, Dragon and Manticore are fought at the same time."
            },
            requirements: {
                gamma: requirements(VALGUERO_ARENA_ARTIFACTS_GAMMA, VALGUERO_ARENA_TRIBUTES_GAMMA),
                beta: requirements(VALGUERO_ARENA_ARTIFACTS_BETA, VALGUERO_ARENA_TRIBUTES_BETA),
                alpha: requirements(VALGUERO_ARENA_ARTIFACTS_ALPHA, VALGUERO_ARENA_TRIBUTES_ALPHA)
            }
        }
    ]
},
    {
    slug: "crystal-isles",
    name: "Crystal Isles",
    image: "/images/ark/maps/ARK-_Crystal_Isles.png",
    description: {
        es: "Mapa con Crystal Wyvern Queen como boss principal.",
        en: "Map with Crystal Wyvern Queen as the main boss."
    },
    bosses: [
        {
            name: "Crystal Wyvern Queen",
            image: "/images/ark/bosses/Crystal_Wyvern_Queen.png",
            description: {
                es: "Boss principal de Crystal Isles. Requiere cristales, garras de wyvern de cristal y artefactos distintos según dificultad.",
                en: "Main boss from Crystal Isles. Requires crystals, crystal wyvern talons and different artifacts depending on difficulty."
            },
            requirements: {
                gamma: requirements(
                    CRYSTAL_WYVERN_QUEEN_ARTIFACTS_GAMMA,
                    CRYSTAL_WYVERN_QUEEN_TRIBUTES_GAMMA
                ),
                beta: requirements(
                    CRYSTAL_WYVERN_QUEEN_ARTIFACTS_BETA,
                    CRYSTAL_WYVERN_QUEEN_TRIBUTES_BETA
                ),
                alpha: requirements(
                    CRYSTAL_WYVERN_QUEEN_ARTIFACTS_ALPHA,
                    CRYSTAL_WYVERN_QUEEN_TRIBUTES_ALPHA
                )
            }
        }
    ]
},
    {
    slug: "lost-island",
    name: "Lost Island",
    image: "/images/ark/maps/ARK-_Lost_Island.png",
    description: {
        es: "Mapa con Dinopithecus King como boss principal.",
        en: "Map with Dinopithecus King as the main boss."
    },
    bosses: [
        {
            name: "Dinopithecus King",
            image: "/images/ark/bosses/Dinopithecus_King.png",
            description: {
                es: "Boss principal de Lost Island. Cambia artefactos y tributos dependiendo de Gamma, Beta o Alpha.",
                en: "Main boss from Lost Island. Artifacts and tributes change depending on Gamma, Beta or Alpha."
            },
            requirements: {
                gamma: requirements(
                    DINOPITHECUS_KING_ARTIFACTS_GAMMA,
                    DINOPITHECUS_KING_TRIBUTES_GAMMA
                ),
                beta: requirements(
                    DINOPITHECUS_KING_ARTIFACTS_BETA,
                    DINOPITHECUS_KING_TRIBUTES_BETA
                ),
                alpha: requirements(
                    DINOPITHECUS_KING_ARTIFACTS_ALPHA,
                    DINOPITHECUS_KING_TRIBUTES_ALPHA
                )
            }
        }
    ]
},
    {
    slug: "fjordur",
    name: "Fjordur",
    image: "/images/ark/maps/ARK_Fjordur_logo.png",
    description: {
        es: "Mapa nórdico con mini bosses, bosses principales y Fenrisúlfr como boss final.",
        en: "Nordic map with mini bosses, main bosses and Fenrisúlfr as the final boss."
    },
    bosses: [
        {
            name: "Beyla",
            image: "/images/ark/bosses/beyla.png",
            description: {
                es: "Mini boss de Fjordur. Derrotarla entrega la Reliquia de Beyla, necesaria para Broodmother en Fjordur.",
                en: "Fjordur mini boss. Defeating it gives Beyla Relic, needed for Broodmother on Fjordur."
            },
            requirements: {
                gamma: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                beta: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                alpha: requirements([], FJORDUR_MINI_BOSS_TRIBUTES)
            }
        },
        {
            name: "Hati & Sköll",
            image: "/images/ark/bosses/Hati_Skoll.png",
            description: {
                es: "Mini bosses de Fjordur. Entregan las reliquias de Hati y Sköll, necesarias para Dragon en Fjordur.",
                en: "Fjordur mini bosses. They give Hati and Sköll relics, needed for Dragon on Fjordur."
            },
            requirements: {
                gamma: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                beta: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                alpha: requirements([], FJORDUR_MINI_BOSS_TRIBUTES)
            }
        },
        {
            name: "Steinbjörn",
            image: "/images/ark/bosses/Steinbjörn.png",
            description: {
                es: "Mini boss de Fjordur. Derrotarlo entrega la Reliquia de Steinbjörn, necesaria para Megapithecus en Fjordur.",
                en: "Fjordur mini boss. Defeating it gives Steinbjörn Relic, needed for Megapithecus on Fjordur."
            },
            requirements: {
                gamma: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                beta: requirements([], FJORDUR_MINI_BOSS_TRIBUTES),
                alpha: requirements([], FJORDUR_MINI_BOSS_TRIBUTES)
            }
        },
        {
            name: "Broodmother Lysrix",
            image: "/images/ark/bosses/Dossier_Broodmother.png",
            description: {
                es: "Boss principal disponible en Fjordur. Requiere la Reliquia de Beyla.",
                en: "Main boss available on Fjordur. Requires Beyla Relic."
            },
            requirements: {
                gamma: requirements(
                    BROODMOTHER_ARTIFACTS,
                    FJORDUR_BROODMOTHER_TRIBUTES_GAMMA
                ),
                beta: requirements(
                    BROODMOTHER_ARTIFACTS,
                    FJORDUR_BROODMOTHER_TRIBUTES_BETA
                ),
                alpha: requirements(
                    BROODMOTHER_ARTIFACTS,
                    FJORDUR_BROODMOTHER_TRIBUTES_ALPHA
                )
            }
        },
        {
            name: "Megapithecus",
            image: "/images/ark/bosses/Dossier_Megapithecus.png",
            description: {
                es: "Boss principal disponible en Fjordur. Requiere la Reliquia de Steinbjörn.",
                en: "Main boss available on Fjordur. Requires Steinbjörn Relic."
            },
            requirements: {
                gamma: requirements(
                    MEGAPITHECUS_ARTIFACTS,
                    FJORDUR_MEGAPITHECUS_TRIBUTES_GAMMA
                ),
                beta: requirements(
                    MEGAPITHECUS_ARTIFACTS,
                    FJORDUR_MEGAPITHECUS_TRIBUTES_BETA
                ),
                alpha: requirements(
                    MEGAPITHECUS_ARTIFACTS,
                    FJORDUR_MEGAPITHECUS_TRIBUTES_ALPHA
                )
            }
        },
        {
            name: "Dragon",
            image: "/images/ark/bosses/Dossier_Dragon.png",
            description: {
                es: "Boss principal disponible en Fjordur. Requiere las reliquias de Hati y Sköll.",
                en: "Main boss available on Fjordur. Requires Hati and Sköll relics."
            },
            requirements: {
                gamma: requirements(
                    DRAGON_ARTIFACTS,
                    FJORDUR_DRAGON_TRIBUTES_GAMMA
                ),
                beta: requirements(
                    DRAGON_ARTIFACTS,
                    FJORDUR_DRAGON_TRIBUTES_BETA
                ),
                alpha: requirements(
                    DRAGON_ARTIFACTS,
                    FJORDUR_DRAGON_TRIBUTES_ALPHA
                )
            }
        },
        {
            name: "Fenrisúlfr",
            image: "/images/ark/bosses/Fenrisúlfr.png",
            description: {
                es: "Boss final de Fjordur. Requiere los trofeos de Broodmother, Megapithecus y Dragon de la misma dificultad.",
                en: "Final boss from Fjordur. Requires Broodmother, Megapithecus and Dragon trophies from the same difficulty."
            },
            requirements: {
                gamma: requirements([], FENRISULFR_TRIBUTES_GAMMA),
                beta: requirements([], FENRISULFR_TRIBUTES_BETA),
                alpha: requirements([], FENRISULFR_TRIBUTES_ALPHA)
            }
        }
    ]
}
];