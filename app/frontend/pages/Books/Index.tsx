import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"

type Book = { id: number; title: string; author: string; genre?: string; published_year: number; cover_url?: string; owner_name: string; can_manage: boolean }
type Pagination = { page: number; total_pages: number }

export default function Index({ books, filters, pagination, current_user, can_create, flash }: { books: Book[]; filters: Record<string, string>; pagination: Pagination; current_user?: { name: string }; can_create: boolean; flash?: { notice?: string; alert?: string } }) {
  const [signupOpen, setSignupOpen] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [login, setLogin] = useState({ email: "", password: "" })
  const [loginErrors, setLoginErrors] = useState<Record<string, string[]>>({})
  const [signup, setSignup] = useState({ name: "", email: "", password: "" })
  const [signupErrors, setSignupErrors] = useState<Record<string, string[]>>({})
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.get("/", Object.fromEntries(new FormData(event.currentTarget)), { preserveState: true })
  }
  const goTo = (page: number) => router.get("/", { ...filters, page }, { preserveState: true, preserveScroll: true })
  const createAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupErrors({})
    router.post("/users", { user: signup }, {
      onSuccess: () => {
        setSignup({ name: "", email: "", password: "" })
        setSignupComplete(true)
      },
      onError: errors => setSignupErrors(errors as Record<string, string[]>)
    })
  }
  const closeSignup = () => {
    setSignupOpen(false)
    setSignupComplete(false)
  }
  const closeLogin = () => setLoginOpen(false)
  const signIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginErrors({})
    router.post("/users/sign_in", { user: login }, {
      onSuccess: () => {
        setLogin({ email: "", password: "" })
        closeLogin()
      },
      onError: errors => setLoginErrors(errors as Record<string, string[]>)
    })
  }

  return <main>
    <Head title="Estante coletiva" />
    <header><Link href="/">Biblioteca coletiva</Link><nav className="home-nav">{current_user ? <><span>Olá, {current_user.name}</span><Link href="/users/sign_out" method="delete">Sair</Link></> : <><button type="button" className="home-login" onClick={() => setLoginOpen(true)}>Entrar</button><button type="button" className="home-signup" onClick={() => { setSignupComplete(false); setSignupOpen(true) }}>Criar conta</button></>}</nav></header>
    {flash?.notice && !signupOpen && <p className="home-notice" role="status">{flash.notice}</p>}
    {flash?.alert && <p className="home-alert" role="alert">{flash.alert}</p>}
    <section className="hero"><p>Leituras que ficam</p><h1>Uma estante feita por quem lê.</h1><p>Descubra e compartilhe livros com a comunidade.</p>{can_create && <Link className="button" href="/books/new">Adicionar livro</Link>}</section>
    <form className="filters" onSubmit={submit}><input name="author" defaultValue={filters.author} placeholder="Filtrar por autor" /><input name="genre" defaultValue={filters.genre} placeholder="Gênero" /><input name="year" defaultValue={filters.year} type="number" placeholder="Ano" /><button>Filtrar</button></form>
    <section className="grid">{books.map(book => <article className="book" key={book.id}><div className="book-cover">{book.cover_url ? <img src={book.cover_url} alt={`Capa de ${book.title}`} /> : <span>Sem capa</span>}</div><div className="book-content"><small>{book.genre || "Literatura"} · {book.published_year}</small><h2>{book.title}</h2><p>{book.author}</p><small className="book-owner">Adicionado por {book.owner_name}</small>{book.can_manage && <div className="book-actions"><Link href={`/books/${book.id}/edit`}>Editar</Link><Link href={`/books/${book.id}`} method="delete" as="button">Remover</Link></div>}</div></article>)}</section>
    {books.length === 0 && <p className="empty">Nenhum livro encontrado com estes filtros.</p>}
    {pagination.total_pages > 1 && <nav className="pagination" aria-label="Paginação"><button disabled={pagination.page === 1} onClick={() => goTo(pagination.page - 1)}>Anterior</button><span>Página {pagination.page} de {pagination.total_pages}</span><button disabled={pagination.page === pagination.total_pages} onClick={() => goTo(pagination.page + 1)}>Próxima</button></nav>}
    {signupOpen && <div className="signup-overlay" role="presentation" onMouseDown={closeSignup}><section className="signup-modal" role="dialog" aria-modal="true" aria-labelledby="signup-modal-title" onMouseDown={event => event.stopPropagation()}><button type="button" className="signup-close" aria-label="Fechar cadastro" onClick={closeSignup}>×</button><p className="signup-kicker">Biblioteca coletiva</p><h2 id="signup-modal-title">Crie sua conta</h2>{signupComplete ? <div className="signup-success" role="status"><strong>Conta criada!</strong><span>Cadastro concluído com sucesso. Entre para adicionar seus livros.</span></div> : <><p>Guarde e compartilhe suas próximas leituras.</p><form onSubmit={createAccount}><label>Nome<input required value={signup.name} onChange={event => setSignup({ ...signup, name: event.target.value })} placeholder="Seu nome" /></label>{signupErrors.name && <small>{signupErrors.name.join(", ")}</small>}<label>E-mail<input required type="email" value={signup.email} onChange={event => setSignup({ ...signup, email: event.target.value })} placeholder="voce@exemplo.com" /></label>{signupErrors.email && <small>{signupErrors.email.join(", ")}</small>}<label>Senha<input required type="password" minLength={6} value={signup.password} onChange={event => setSignup({ ...signup, password: event.target.value })} placeholder="Crie uma senha" /></label>{signupErrors.password && <small>{signupErrors.password.join(", ")}</small>}<button type="submit">Criar minha conta</button></form><p className="modal-switch">Já tem uma conta? <button type="button" onClick={() => { closeSignup(); setLoginOpen(true) }}>Entrar</button></p></>}</section></div>}
    {loginOpen && <div className="signup-overlay" role="presentation" onMouseDown={closeLogin}><section className="signup-modal login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" onMouseDown={event => event.stopPropagation()}><button type="button" className="signup-close" aria-label="Fechar login" onClick={closeLogin}>×</button><p className="signup-kicker">Bem-vinda de volta</p><h2 id="login-modal-title">Entrar</h2><p>Continue cuidando da sua estante.</p><form onSubmit={signIn}><label>E-mail<input required type="email" value={login.email} onChange={event => setLogin({ ...login, email: event.target.value })} placeholder="voce@exemplo.com" /></label>{loginErrors.email && <small>{loginErrors.email.join(", ")}</small>}<label>Senha<input required type="password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} placeholder="Sua senha" /></label>{loginErrors.password && <small>{loginErrors.password.join(", ")}</small>}<button type="submit">Entrar na biblioteca</button></form><p className="modal-switch">Ainda não tem conta? <button type="button" onClick={() => { closeLogin(); setSignupComplete(false); setSignupOpen(true) }}>Criar conta</button></p></section></div>}
  </main>
}
