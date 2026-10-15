class User < ApplicationRecord
  # O Devise cuida do cadastro, login, recuperação de senha e sessão persistente.
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Os livros pertencem à conta que os adicionou. Ao excluir a conta,
  # seus livros também são removidos para não deixar registros órfãos.
  has_many :books, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
end
