class Book < ApplicationRecord
  belongs_to :user

  validates :title, :author, :open_library_key, presence: true
  validates :open_library_key, uniqueness: { scope: :user_id, message: "já foi adicionado por você" }
  validates :published_year, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: Date.current.year + 1 }

  scope :recent_first, -> { order(created_at: :desc) }
  scope :by_author, ->(author) { where("author ILIKE ?", "%#{sanitize_sql_like(author)}%") if author.present? }
  scope :by_genre, ->(genre) { where("genre ILIKE ?", "%#{sanitize_sql_like(genre)}%") if genre.present? }
  scope :published_in, ->(year) { where(published_year: year) if year.present? }
end
