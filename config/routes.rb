Rails.application.routes.draw do
  get 'parity/kovan'

  get 'parity/mainnet'

  get 'geth/ropsten'
  post 'geth/ropsten'

  post 'geth/development'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
