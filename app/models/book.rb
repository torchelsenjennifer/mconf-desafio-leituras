class Book < ApplicationRecord
  belongs_to :user

  validates :title, :author, :open_library_key, presence: true
  validates :open_library_key,
            uniqueness: {
              scope: :user_id,
              message: "já foi adicionado por você"
            }
  validates :published_year,
            numericality: {
              only_integer: true,
              greater_than: 0,
              less_than_or_equal_to: ->(_livro) { Date.current.year + 1 }
            }

  scope :mais_recentes_primeiro, -> { order(created_at: :desc) }

  # ILIKE torna a pesquisa independente de letras maiúsculas/minúsculas.
  # sanitize_sql_like escapa caracteres especiais usados pelo operador LIKE.
  scope :por_autor, lambda { |autor|
    if autor.present?
      autor_seguro = sanitize_sql_like(autor)
      where("author ILIKE ?", "%#{autor_seguro}%")
    end
  }

  scope :por_genero, lambda { |genero|
    if genero.present?
      genero_seguro = sanitize_sql_like(genero)
      where("genre ILIKE ?", "%#{genero_seguro}%")
    end
  }

  scope :publicados_em, lambda { |ano|
    where(published_year: ano) if ano.present?
  }
end
