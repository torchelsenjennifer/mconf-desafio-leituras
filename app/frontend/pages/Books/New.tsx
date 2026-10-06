import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"

type Result = { key: string; title: string; author: string; published_year: number; genre?: string; cover_url?: string }

export default function New({ search_url }: { search_url: string }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [message, setMessage] = useState("")
  const [searching, setSearching] = useState(false)

  const search = async () => {
    const query = q.trim()
    if (query.length < 2) return setMessage("Digite ao menos dois caracteres para pesquisar.")

    setSearching(true)
    setMessage("")
    try {
      const response = await fetch(`${search_url}?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } })
      if (!response.ok) throw new Error("search failed")
      const books: Result[] = await response.json()
      setResults(books)
      setMessage(books.length === 0 ? "Nenhum livro encontrado. Tente outro título." : "Selecione um livro para adicioná-lo à coleção.")
    } catch {
      setMessage("Não foi possível consultar a OpenLibrary. Tente novamente.")
    } finally {
      setSearching(false)
    }
  }

  const addBook = (book: Result) => router.post("/books", { book: { ...book, open_library_key: book.key } }, {
    onError: errors => setMessage((errors.open_library_key as string[] | undefined)?.[0] || "Não foi possível adicionar este livro. Tente novamente.")
  })

  return <main><Head title="Adicionar livro" /><header><Link href="/">Biblioteca coletiva</Link></header><section className="form"><p>Nova leitura</p><h1>Encontre seu livro</h1><div className="search"><input value={q} onChange={event => setQ(event.target.value)} onKeyDown={event => event.key === "Enter" && search()} placeholder="Digite o título" /><button type="button" onClick={search} disabled={searching}>{searching ? "Buscando..." : "Buscar"}</button></div>{message && <p className="empty">{message}</p>}{results.map(book => <button type="button" className="result" key={book.key} onClick={() => addBook(book)}>{book.cover_url && <img src={book.cover_url} alt="" />}<span><strong>{book.title}</strong><br />{book.author} · {book.published_year}<br /><small>{book.genre}</small></span></button>)}</section></main>
}
