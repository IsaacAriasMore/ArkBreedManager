export function SpeciesCard(species){

    return `

    <div class="species-card">

        <img
            src="${species.image_path}"
            alt="${species.name}"
        >

        <h3>${species.name}</h3>

        <p>${species.class}</p>

        <p>${species.dlc}</p>

        <button data-id="${species.id}" class="deleteSpecies">

            Eliminar

        </button>

    </div>

    `;

}