class BookPolicy < ApplicationPolicy
  def create?
    usuario.present?
  end

  def update?
    proprietario?
  end

  def destroy?
    proprietario?
  end

  private

  # Somente a pessoa que adicionou o livro pode alterá-lo ou removê-lo.
  def proprietario?
    usuario.present? && usuario == registro.user
  end
end
