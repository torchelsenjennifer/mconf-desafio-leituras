class BooksController < ApplicationController
  LIVROS_POR_PAGINA = 12

  # A listagem é pública. Todas as outras ações exigem uma sessão autenticada.
  before_action :authenticate_user!, except: :index
  before_action :definir_livro, only: %i[edit update destroy]

  def index
    livros = livros_filtrados
    paginacao = calcular_paginacao(livros)
    livros_paginados = paginar(livros, paginacao[:page])

    respond_to do |formato|
      formato.html { renderizar_pagina_de_livros(livros_paginados, paginacao) }
      formato.json { renderizar_livros_em_json(livros_paginados, paginacao) }
    end
  end

  def new
    authorize Book
    render inertia: "Books/New", props: { search_url: search_books_path }
  end

  def search
    authorize Book, :create?
    render json: OpenLibrary::Search.new(params[:q]).call
  end

  def create
    @livro = current_user.books.build(parametros_do_livro)
    authorize @livro

    if @livro.save
      redirect_to books_path
    else
      renderizar_novo_com_erros
    end
  end

  def edit
    authorize @livro
    render inertia: "Books/Edit", props: { book: serializar_livro(@livro) }
  end

  def update
    authorize @livro

    if @livro.update(parametros_do_livro)
      redirect_to books_path, notice: "Livro atualizado."
    else
      renderizar_edicao_com_erros
    end
  end

  def destroy
    authorize @livro
    @livro.destroy!
    redirect_to books_path
  end

  private

  def definir_livro
    @livro = Book.find(params[:id])
  end

  # Strong Parameters impede que o cliente altere atributos não permitidos,
  # como user_id. O proprietário sempre é definido a partir de current_user.
  def parametros_do_livro
    params.expect(
      book: %i[title author genre published_year open_library_key cover_url]
    )
  end

  def livros_filtrados
    Book
      .includes(:user)
      .mais_recentes_primeiro
      .por_autor(params[:author])
      .por_genero(params[:genre])
      .publicados_em(params[:year])
  end

  def calcular_paginacao(livros)
    total_de_paginas = [ (livros.count.to_f / LIVROS_POR_PAGINA).ceil, 1 ].max
    pagina_solicitada = [ params.fetch(:page, 1).to_i, 1 ].max

    {
      page: [ pagina_solicitada, total_de_paginas ].min,
      total_pages: total_de_paginas
    }
  end

  def paginar(livros, pagina)
    deslocamento = (pagina - 1) * LIVROS_POR_PAGINA
    livros.offset(deslocamento).limit(LIVROS_POR_PAGINA)
  end

  def renderizar_pagina_de_livros(livros, paginacao)
    render inertia: "Books/Index", props: {
      books: serializar_livros(livros),
      filters: parametros_dos_filtros,
      pagination: paginacao,
      current_user: usuario_atual_serializado,
      can_create: user_signed_in?,
      flash: mensagens_temporarias
    }
  end

  def renderizar_livros_em_json(livros, paginacao)
    render json: {
      books: serializar_livros(livros),
      filters: parametros_dos_filtros,
      pagination: paginacao
    }
  end

  def renderizar_novo_com_erros
    render inertia: "Books/New",
           props: { search_url: search_books_path, errors: @livro.errors.to_hash },
           status: :unprocessable_entity
  end

  def renderizar_edicao_com_erros
    render inertia: "Books/Edit",
           props: { book: serializar_livro(@livro), errors: @livro.errors.to_hash },
           status: :unprocessable_entity
  end

  def parametros_dos_filtros
    params.permit(:author, :genre, :year).to_h
  end

  def usuario_atual_serializado
    return unless current_user

    { id: current_user.id, name: current_user.name }
  end

  def mensagens_temporarias
    { notice: flash[:notice], alert: flash[:alert] }.compact
  end

  def serializar_livros(livros)
    livros.map { |livro| serializar_livro(livro) }
  end

  # Acrescenta dados usados pela interface que não são colunas de books.
  def serializar_livro(livro)
    atributos = livro.as_json(
      only: %i[id title author genre published_year open_library_key cover_url]
    )

    atributos.merge(
      "owner_name" => livro.user.name,
      "can_manage" => policy(livro).update?
    )
  end
end
