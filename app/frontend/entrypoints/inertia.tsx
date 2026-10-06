import { createInertiaApp } from "@inertiajs/react"
import { createRoot } from "react-dom/client"
import "../styles/app.css"
import "../styles/book-cards.css"
import "../styles/home-actions.css"
createInertiaApp({ resolve: name => { const pages = import.meta.glob("../pages/**/*.tsx", { eager: true }); return pages[`../pages/${name}.tsx`] }, setup({ el, App, props }) { createRoot(el).render(<App {...props} />) } })
