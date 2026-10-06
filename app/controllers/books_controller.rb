class BooksController < ApplicationController
  before_action :authenticate_user!, except: :index
  before_action :set_book, only: %i[edit update destroy]

  def index
    books = filtered_books
    page = [ params.fetch(:page, 1).to_i, 1 ].max
    per_page = 12
    total_pages = [ (books.count.to_f / per_page).ceil, 1 ].max
    page = [ page, total_pages ].min
    books = books.offset((page - 1) * per_page).limit(per_page)
    serialized_books = books.map { |book| serialize(book) }
    pagination = { page:, total_pages: }
    filters = params.permit(:author, :genre, :year).to_h

    respond_to do |format|
      format.html do
        render inertia: "Books/Index", props: {
          books: serialized_books,
          filters:,
          pagination:,
          current_user: current_user && { id: current_user.id, name: current_user.name },
          can_create: user_signed_in?,
          flash: { notice: flash[:notice], alert: flash[:alert] }.compact
        }
      end
      format.json { render json: { books: serialized_books, filters:, pagination: } }
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
    @book = current_user.books.build(book_params)
    authorize @book
    return redirect_to books_path if @book.save

    render inertia: "Books/New", props: { search_url: search_books_path, errors: @book.errors.to_hash }, status: :unprocessable_entity
  end

  def edit
    authorize @book
    render inertia: "Books/Edit", props: { book: serialize(@book) }
  end

  def update
    authorize @book
    return redirect_to books_path, notice: "Livro atualizado." if @book.update(book_params)

    render inertia: "Books/Edit", props: { book: serialize(@book), errors: @book.errors.to_hash }, status: :unprocessable_entity
  end

  def destroy
    authorize @book
    @book.destroy!
    redirect_to books_path
  end

  private

  def set_book = @book = Book.find(params[:id])
  def book_params = params.expect(book: %i[title author genre published_year open_library_key cover_url])

  def filtered_books
    Book.includes(:user).recent_first.by_author(params[:author]).by_genre(params[:genre]).published_in(params[:year])
  end

  def serialize(book)
    book.as_json(only: %i[id title author genre published_year open_library_key cover_url]).merge("owner_name" => book.user.name, "can_manage" => policy(book).update?)
  end
end
