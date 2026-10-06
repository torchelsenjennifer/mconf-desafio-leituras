class BookPolicy < ApplicationPolicy
  def create?
    user.present?
  end

  def update?
    user == record.user
  end

  def destroy?
    update?
  end
end
