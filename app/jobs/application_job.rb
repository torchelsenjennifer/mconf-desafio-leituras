class ApplicationJob < ActiveJob::Base
  # Repete automaticamente tarefas que encontrarem um deadlock no banco.
  # retry_on ActiveRecord::Deadlocked

  # Descarta tarefas cujo registro relacionado não existe mais.
  # discard_on ActiveJob::DeserializationError
end
