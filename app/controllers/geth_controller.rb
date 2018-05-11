class GethController < ApplicationController
  include ReverseProxy::Controller

  def ropsten
    reverse_proxy "http://localhost:8547", verify_ssl: false
  end

  def development
    reverse_proxy "http://localhost:8545", verify_ssl: false
  end
end
