import { createInertiaApp } from "@inertiajs/react"
import { createRoot } from "react-dom/client"
import "../styles/app.css"
import "../styles/book-cards.css"
import "../styles/home-actions.css"

// O Rails informa o nome da página (por exemplo, "Books/Index") e o Vite
// encontra o componente correspondente sem manter uma lista manual de imports.
const paginas = import.meta.glob("../pages/**/*.tsx", { eager: true })

createInertiaApp({
  resolve: (nomeDaPagina) => paginas[`../pages/${nomeDaPagina}.tsx`],
  setup({ el: elemento, App: Aplicacao, props: propriedades }) {
    createRoot(elemento).render(<Aplicacao {...propriedades} />)
  }
})
