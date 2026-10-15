import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"

type ResultadoDaBusca = {
  key: string
  title: string
  author: string
  published_year: number
  genre?: string
  cover_url?: string
}

type PropriedadesDaPagina = {
  search_url: string
}

export default function NovoLivro({ search_url: enderecoDeBusca }: PropriedadesDaPagina) {
  const [termo, definirTermo] = useState("")
  const [resultados, definirResultados] = useState<ResultadoDaBusca[]>([])
  const [mensagem, definirMensagem] = useState("")
  const [buscando, definirBuscando] = useState(false)

  async function buscarLivros() {
    const termoLimpo = termo.trim()

    if (termoLimpo.length < 2) {
      definirMensagem("Digite ao menos dois caracteres para pesquisar.")
      return
    }

    definirBuscando(true)
    definirMensagem("")

    try {
      const resposta = await fetch(
        `${enderecoDeBusca}?q=${encodeURIComponent(termoLimpo)}`,
        { headers: { Accept: "application/json" } }
      )

      if (!resposta.ok) throw new Error("A busca de livros falhou")

      const livros: ResultadoDaBusca[] = await resposta.json()
      definirResultados(livros)
      definirMensagem(
        livros.length === 0
          ? "Nenhum livro encontrado. Tente outro título."
          : "Selecione um livro para adicioná-lo à coleção."
      )
    } catch {
      definirMensagem("Não foi possível consultar a OpenLibrary. Tente novamente.")
    } finally {
      definirBuscando(false)
    }
  }

  function adicionarLivro(livro: ResultadoDaBusca) {
    // O identificador `key` vem da OpenLibrary. A API local o armazena como
    // `open_library_key` para impedir duplicações na estante do mesmo usuário.
    router.post(
      "/books",
      { book: { ...livro, open_library_key: livro.key } },
      {
        onError: (erros) => {
          const erroRecebido = erros.open_library_key
          const erroDeDuplicidade = Array.isArray(erroRecebido)
            ? erroRecebido[0]
            : erroRecebido

          definirMensagem(
            erroDeDuplicidade || "Não foi possível adicionar este livro. Tente novamente."
          )
        }
      }
    )
  }

  function buscarAoPressionarEnter(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter") buscarLivros()
  }

  return (
    <main>
      <Head title="Adicionar livro" />

      <header>
        <Link href="/">Biblioteca coletiva</Link>
      </header>

      <section className="form">
        <p>Nova leitura</p>
        <h1>Encontre seu livro</h1>

        <div className="search">
          <input
            value={termo}
            onChange={(evento) => definirTermo(evento.target.value)}
            onKeyDown={buscarAoPressionarEnter}
            placeholder="Digite o título"
          />
          <button type="button" onClick={buscarLivros} disabled={buscando}>
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {mensagem && <p className="empty">{mensagem}</p>}

        {resultados.map((livro) => (
          <button
            type="button"
            className="result"
            key={livro.key}
            onClick={() => adicionarLivro(livro)}
          >
            {livro.cover_url && <img src={livro.cover_url} alt="" />}
            <span>
              <strong>{livro.title}</strong>
              <br />
              {livro.author} · {livro.published_year}
              <br />
              <small>{livro.genre}</small>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}
