import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"

type Livro = {
  id: number
  title: string
  author: string
  genre?: string
  published_year: number
  cover_url?: string
  owner_name: string
  can_manage: boolean
}

type Paginacao = {
  page: number
  total_pages: number
}

type UsuarioAtual = {
  name: string
}

type MensagensTemporarias = {
  notice?: string
  alert?: string
}

type DadosDeCadastro = {
  name: string
  email: string
  password: string
}

type DadosDeLogin = {
  email: string
  password: string
}

type ErrosDeFormulario = Record<string, string | string[]>
type Filtros = Record<string, string>

type PropriedadesDaPagina = {
  books: Livro[]
  filters: Filtros
  pagination: Paginacao
  current_user?: UsuarioAtual
  can_create: boolean
  flash?: MensagensTemporarias
}

const CADASTRO_VAZIO: DadosDeCadastro = { name: "", email: "", password: "" }
const LOGIN_VAZIO: DadosDeLogin = { email: "", password: "" }

export default function PaginaInicial({
  books: livros,
  filters: filtros,
  pagination: paginacao,
  current_user: usuarioAtual,
  can_create: podeCriar,
  flash: mensagensTemporarias
}: PropriedadesDaPagina) {
  const [cadastroAberto, definirCadastroAberto] = useState(false)
  const [cadastroConcluido, definirCadastroConcluido] = useState(false)
  const [loginAberto, definirLoginAberto] = useState(false)
  const [dadosDeLogin, definirDadosDeLogin] = useState(LOGIN_VAZIO)
  const [errosDeLogin, definirErrosDeLogin] = useState<ErrosDeFormulario>({})
  const [dadosDeCadastro, definirDadosDeCadastro] = useState(CADASTRO_VAZIO)
  const [errosDeCadastro, definirErrosDeCadastro] = useState<ErrosDeFormulario>({})

  function filtrarLivros(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const filtrosDoFormulario = Object.fromEntries(new FormData(evento.currentTarget))

    // O Inertia faz a navegação sem recarregar toda a página e mantém os modais.
    router.get("/", filtrosDoFormulario, { preserveState: true })
  }

  function irParaPagina(pagina: number) {
    router.get(
      "/",
      { ...filtros, page: pagina },
      { preserveState: true, preserveScroll: true }
    )
  }

  function abrirCadastro() {
    definirCadastroConcluido(false)
    definirCadastroAberto(true)
  }

  function fecharCadastro() {
    definirCadastroAberto(false)
    definirCadastroConcluido(false)
  }

  function abrirLogin() {
    definirLoginAberto(true)
  }

  function fecharLogin() {
    definirLoginAberto(false)
  }

  function trocarCadastroPorLogin() {
    fecharCadastro()
    abrirLogin()
  }

  function trocarLoginPorCadastro() {
    fecharLogin()
    abrirCadastro()
  }

  function criarConta(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    definirErrosDeCadastro({})

    router.post(
      "/users",
      { user: dadosDeCadastro },
      {
        onSuccess: () => {
          definirDadosDeCadastro(CADASTRO_VAZIO)
          definirCadastroConcluido(true)
        },
        onError: (erros) => definirErrosDeCadastro(erros)
      }
    )
  }

  function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    definirErrosDeLogin({})

    router.post(
      "/users/sign_in",
      { user: dadosDeLogin },
      {
        onSuccess: () => {
          definirDadosDeLogin(LOGIN_VAZIO)
          fecharLogin()
        },
        onError: (erros) => definirErrosDeLogin(erros)
      }
    )
  }

  return (
    <main>
      <Head title="Estante coletiva" />

      <Cabecalho
        usuarioAtual={usuarioAtual}
        aoAbrirLogin={abrirLogin}
        aoAbrirCadastro={abrirCadastro}
      />

      <Avisos
        mensagens={mensagensTemporarias}
        esconderAvisoDeSucesso={cadastroAberto}
      />

      <Apresentacao podeCriar={podeCriar} />
      <FormularioDeFiltros filtros={filtros} aoEnviar={filtrarLivros} />
      <Catalogo livros={livros} />

      {livros.length === 0 && (
        <p className="empty">Nenhum livro encontrado com estes filtros.</p>
      )}

      <ControlesDePaginacao paginacao={paginacao} aoNavegar={irParaPagina} />

      {cadastroAberto && (
        <ModalDeCadastro
          dados={dadosDeCadastro}
          erros={errosDeCadastro}
          concluido={cadastroConcluido}
          aoAlterar={definirDadosDeCadastro}
          aoEnviar={criarConta}
          aoFechar={fecharCadastro}
          aoAbrirLogin={trocarCadastroPorLogin}
        />
      )}

      {loginAberto && (
        <ModalDeLogin
          dados={dadosDeLogin}
          erros={errosDeLogin}
          aoAlterar={definirDadosDeLogin}
          aoEnviar={entrar}
          aoFechar={fecharLogin}
          aoAbrirCadastro={trocarLoginPorCadastro}
        />
      )}
    </main>
  )
}

function Cabecalho({
  usuarioAtual,
  aoAbrirLogin,
  aoAbrirCadastro
}: {
  usuarioAtual?: UsuarioAtual
  aoAbrirLogin: () => void
  aoAbrirCadastro: () => void
}) {
  return (
    <header>
      <Link href="/">Biblioteca coletiva</Link>

      <nav className="home-nav">
        {usuarioAtual ? (
          <>
            <span>Olá, {usuarioAtual.name}</span>
            <Link href="/users/sign_out" method="delete">Sair</Link>
          </>
        ) : (
          <>
            <button type="button" className="home-login" onClick={aoAbrirLogin}>Entrar</button>
            <button type="button" className="home-signup" onClick={aoAbrirCadastro}>Criar conta</button>
          </>
        )}
      </nav>
    </header>
  )
}

function Avisos({ mensagens, esconderAvisoDeSucesso }: {
  mensagens?: MensagensTemporarias
  esconderAvisoDeSucesso: boolean
}) {
  return (
    <>
      {mensagens?.notice && !esconderAvisoDeSucesso && (
        <p className="home-notice" role="status">{mensagens.notice}</p>
      )}
      {mensagens?.alert && (
        <p className="home-alert" role="alert">{mensagens.alert}</p>
      )}
    </>
  )
}

function Apresentacao({ podeCriar }: { podeCriar: boolean }) {
  return (
    <section className="hero">
      <p>Leituras que ficam</p>
      <h1>Uma estante feita por quem lê.</h1>
      <p>Descubra e compartilhe livros com a comunidade.</p>
      {podeCriar && <Link className="button" href="/books/new">Adicionar livro</Link>}
    </section>
  )
}

function FormularioDeFiltros({ filtros, aoEnviar }: {
  filtros: Filtros
  aoEnviar: (evento: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="filters" onSubmit={aoEnviar}>
      <input name="author" defaultValue={filtros.author} placeholder="Filtrar por autor" />
      <input name="genre" defaultValue={filtros.genre} placeholder="Gênero" />
      <input name="year" defaultValue={filtros.year} type="number" placeholder="Ano" />
      <button>Filtrar</button>
    </form>
  )
}

function Catalogo({ livros }: { livros: Livro[] }) {
  return (
    <section className="grid">
      {livros.map((livro) => <CartaoDeLivro key={livro.id} livro={livro} />)}
    </section>
  )
}

function CartaoDeLivro({ livro }: { livro: Livro }) {
  return (
    <article className="book">
      <div className="book-cover">
        {livro.cover_url ? (
          <img src={livro.cover_url} alt={`Capa de ${livro.title}`} />
        ) : (
          <span>Sem capa</span>
        )}
      </div>

      <div className="book-content">
        <small>{livro.genre || "Literatura"} · {livro.published_year}</small>
        <h2>{livro.title}</h2>
        <p>{livro.author}</p>
        <small className="book-owner">Adicionado por {livro.owner_name}</small>

        {livro.can_manage && (
          <div className="book-actions">
            <Link href={`/books/${livro.id}/edit`}>Editar</Link>
            <Link href={`/books/${livro.id}`} method="delete" as="button">Remover</Link>
          </div>
        )}
      </div>
    </article>
  )
}

function ControlesDePaginacao({ paginacao, aoNavegar }: {
  paginacao: Paginacao
  aoNavegar: (pagina: number) => void
}) {
  if (paginacao.total_pages <= 1) return null

  return (
    <nav className="pagination" aria-label="Paginação">
      <button disabled={paginacao.page === 1} onClick={() => aoNavegar(paginacao.page - 1)}>
        Anterior
      </button>
      <span>Página {paginacao.page} de {paginacao.total_pages}</span>
      <button
        disabled={paginacao.page === paginacao.total_pages}
        onClick={() => aoNavegar(paginacao.page + 1)}
      >
        Próxima
      </button>
    </nav>
  )
}

function ModalDeCadastro({ dados, erros, concluido, aoAlterar, aoEnviar, aoFechar, aoAbrirLogin }: {
  dados: DadosDeCadastro
  erros: ErrosDeFormulario
  concluido: boolean
  aoAlterar: (dados: DadosDeCadastro) => void
  aoEnviar: (evento: React.FormEvent<HTMLFormElement>) => void
  aoFechar: () => void
  aoAbrirLogin: () => void
}) {
  return (
    <div className="signup-overlay" role="presentation" onMouseDown={aoFechar}>
      <section
        className="signup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <button type="button" className="signup-close" aria-label="Fechar cadastro" onClick={aoFechar}>×</button>
        <p className="signup-kicker">Biblioteca coletiva</p>
        <h2 id="signup-modal-title">Crie sua conta</h2>

        {concluido ? (
          <div className="signup-success" role="status">
            <strong>Conta criada!</strong>
            <span>Cadastro concluído com sucesso. Entre para adicionar seus livros.</span>
          </div>
        ) : (
          <>
            <p>Guarde e compartilhe suas próximas leituras.</p>
            <form onSubmit={aoEnviar}>
              <label>
                Nome
                <input required value={dados.name} onChange={(evento) => aoAlterar({ ...dados, name: evento.target.value })} placeholder="Seu nome" />
              </label>
              <ErroDoCampo mensagens={erros.name} />

              <label>
                E-mail
                <input required type="email" value={dados.email} onChange={(evento) => aoAlterar({ ...dados, email: evento.target.value })} placeholder="voce@exemplo.com" />
              </label>
              <ErroDoCampo mensagens={erros.email} />

              <label>
                Senha
                <input
                  required
                  type="password"
                  minLength={6}
                  value={dados.password}
                  onChange={(evento) =>
                    aoAlterar({ ...dados, password: evento.target.value })
                  }
                  placeholder="Crie uma senha"
                />
              </label>
              <ErroDoCampo mensagens={erros.password} />

              <button type="submit">Criar minha conta</button>
            </form>
            <p className="modal-switch">
              Já tem uma conta?{" "}
              <button type="button" onClick={aoAbrirLogin}>Entrar</button>
            </p>
          </>
        )}
      </section>
    </div>
  )
}

function ModalDeLogin({ dados, erros, aoAlterar, aoEnviar, aoFechar, aoAbrirCadastro }: {
  dados: DadosDeLogin
  erros: ErrosDeFormulario
  aoAlterar: (dados: DadosDeLogin) => void
  aoEnviar: (evento: React.FormEvent<HTMLFormElement>) => void
  aoFechar: () => void
  aoAbrirCadastro: () => void
}) {
  return (
    <div className="signup-overlay" role="presentation" onMouseDown={aoFechar}>
      <section
        className="signup-modal login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <button type="button" className="signup-close" aria-label="Fechar login" onClick={aoFechar}>×</button>
        <p className="signup-kicker">Bem-vinda de volta</p>
        <h2 id="login-modal-title">Entrar</h2>
        <p>Continue cuidando da sua estante.</p>

        <form onSubmit={aoEnviar}>
          <label>
            E-mail
            <input required type="email" value={dados.email} onChange={(evento) => aoAlterar({ ...dados, email: evento.target.value })} placeholder="voce@exemplo.com" />
          </label>
          <ErroDoCampo mensagens={erros.email} />

          <label>
            Senha
            <input required type="password" value={dados.password} onChange={(evento) => aoAlterar({ ...dados, password: evento.target.value })} placeholder="Sua senha" />
          </label>
          <ErroDoCampo mensagens={erros.password} />

          <button type="submit">Entrar na biblioteca</button>
        </form>
        <p className="modal-switch">
          Ainda não tem conta?{" "}
          <button type="button" onClick={aoAbrirCadastro}>Criar conta</button>
        </p>
      </section>
    </div>
  )
}

function ErroDoCampo({ mensagens }: { mensagens?: string | string[] }) {
  if (!mensagens) return null

  const texto = Array.isArray(mensagens) ? mensagens.join(", ") : mensagens
  return <small>{texto}</small>
}
