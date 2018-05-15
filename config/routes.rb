Rails.application.routes.draw do
  namespace :geth do
    namespace :v1 do
      post 'ropsten', to: 'base#ropsten'
      post 'development', to: 'base#development'
    end
  end

  namespace :parity do
    namespace :v1 do

    end
  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
