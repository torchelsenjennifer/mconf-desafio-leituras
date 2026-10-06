import { Head, Link, useForm } from "@inertiajs/react"

type Book = {
  id: number
  title: string
  author: string
  genre?: string
  published_year: number
  cover_url?: string
  open_library_key: string
}

type Field = "title" | "author" | "genre" | "published_year"

const labels: Record<Field, string> = {
  title: "Título",
  author: "Autoria",
  genre: "Gênero",
  published_year: "Ano de publicação"
}

export default function Edit({ book, errors = {} }: { book: Book; errors?: Partial<Record<Field, string[]>> }) {
  const { data, setData, patch, processing } = useForm({
    title: book.title,
    author: book.author,
    genre: book.genre || "",
    published_year: String(book.published_year),
    open_library_key: book.open_library_key,
    cover_url: book.cover_url || ""
  })

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    patch(`/books/${book.id}`)
  }

  const input = (field: Field, type = "text") => <label className="edit-field" key={field}>
    <span>{labels[field]}</span>
    <input type={type} value={data[field]} onChange={event => setData(field, event.target.value)} aria-invalid={Boolean(errors[field])} />
    {errors[field] && <small className="edit-error">{errors[field]?.join(", ")}</small>}
  </label>

  return <main className="edit-page">
    <Head title={`Editar ${book.title}`} />
    <header className="edit-header"><Link href="/">Biblioteca coletiva</Link><Link className="edit-cancel-link" href="/">Cancelar</Link></header>
    <section className="edit-hero"><div><p className="edit-eyebrow">Seu livro, sua estante</p><h1>Editar detalhes da leitura</h1><p>Atualize as informações para que a coleção compartilhada continue sempre bem cuidada.</p></div>{book.cover_url ? <img src={book.cover_url} alt={`Capa de ${book.title}`} /> : <div className="edit-cover-placeholder" aria-hidden="true">Livro</div>}</section>
    <form className="edit-card" onSubmit={submit}>
      <div className="edit-card-heading"><div><p className="edit-eyebrow">Informações bibliográficas</p><h2>Dados do livro</h2></div><span>Campos com * são obrigatórios</span></div>
      <div className="edit-fields">{input("title")}{input("author")}{input("genre")}{input("published_year", "number")}</div>
      <div className="edit-actions"><Link href="/" className="edit-secondary">Descartar alterações</Link><button type="submit" disabled={processing}>{processing ? "Salvando..." : "Salvar alterações"}</button></div>
    </form>
  </main>
}
