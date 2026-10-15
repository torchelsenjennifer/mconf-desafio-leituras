# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :usuario, :registro

  # Toda policy recebe o usuário atual e o recurso que será autorizado.
  def initialize(usuario, registro)
    @usuario = usuario
    @registro = registro
  end

  # A classe base nega todas as ações. Cada policy concreta libera somente as
  # operações que fazem sentido para aquele recurso.
  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    def initialize(usuario, escopo)
      @usuario = usuario
      @escopo = escopo
    end

    def resolve
      raise NoMethodError, "Você precisa definir #resolve em #{self.class}"
    end

    private

    attr_reader :usuario, :escopo
  end
end
