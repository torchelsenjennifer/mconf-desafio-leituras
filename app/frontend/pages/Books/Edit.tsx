import { Head, Link, useForm } from "@inertiajs/react"

type Livro = {
  id: number
  title: string
  author: string
  genre?: string
  published_year: number
  cover_url?: string
  open_library_key: string
}

type CampoEditavel = "title" | "author" | "genre" | "published_year"
type ErrosDosCampos = Partial<Record<CampoEditavel, string[]>>

type PropriedadesDaPagina = {
  book: Livro
  errors?: ErrosDosCampos
}

const ROTULOS: Record<CampoEditavel, string> = {
  title: "Título",
  author: "Autoria",
  genre: "Gênero",
  published_year: "Ano de publicação"
}

export default function EditarLivro({ book: livro, errors: erros = {} }: PropriedadesDaPagina) {
  const {
    data: dados,
    setData: definirDado,
    patch: atualizar,
    processing: processando
  } = useForm({
    title: livro.title,
    author: livro.author,
    genre: livro.genre || "",
    published_year: String(livro.published_year),
    open_library_key: livro.open_library_key,
    cover_url: livro.cover_url || ""
  })

  function salvarAlteracoes(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    atualizar(`/books/${livro.id}`)
  }

  function campoDoFormulario(campo: CampoEditavel, tipo = "text") {
    return (
      <label className="edit-field" key={campo}>
        <span>{ROTULOS[campo]}</span>
        <input
          type={tipo}
          value={dados[campo]}
          onChange={(evento) => definirDado(campo, evento.target.value)}
          aria-invalid={Boolean(erros[campo])}
        />
        {erros[campo] && (
          <small className="edit-error">{erros[campo]?.join(", ")}</small>
        )}
      </label>
    )
  }

  return (
    <main className="edit-page">
      <Head title={`Editar ${livro.title}`} />

      <header className="edit-header">
        <Link href="/">Biblioteca coletiva</Link>
        <Link className="edit-cancel-link" href="/">Cancelar</Link>
      </header>

      <section className="edit-hero">
        <div>
          <p className="edit-eyebrow">Seu livro, sua estante</p>
          <h1>Editar detalhes da leitura</h1>
          <p>
            Atualize as informações para que a coleção compartilhada continue sempre bem cuidada.
          </p>
        </div>

        {livro.cover_url ? (
          <img src={livro.cover_url} alt={`Capa de ${livro.title}`} />
        ) : (
          <div className="edit-cover-placeholder" aria-hidden="true">Livro</div>
        )}
      </section>

      <form className="edit-card" onSubmit={salvarAlteracoes}>
        <div className="edit-card-heading">
          <div>
            <p className="edit-eyebrow">Informações bibliográficas</p>
            <h2>Dados do livro</h2>
          </div>
          <span>Campos com * são obrigatórios</span>
        </div>

        <div className="edit-fields">
          {campoDoFormulario("title")}
          {campoDoFormulario("author")}
          {campoDoFormulario("genre")}
          {campoDoFormulario("published_year", "number")}
        </div>

        <div className="edit-actions">
          <Link href="/" className="edit-secondary">Descartar alterações</Link>
          <button type="submit" disabled={processando}>
            {processando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </main>
  )
}
