import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout(content) {

    return `

    <div class="layout">

        ${Sidebar()}

        <div class="main">

            ${Header()}

            <section class="content">

                ${content}

            </section>

        </div>

    </div>

    `;

}