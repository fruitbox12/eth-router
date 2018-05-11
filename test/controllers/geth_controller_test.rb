require 'test_helper'

class GethControllerTest < ActionDispatch::IntegrationTest
  test "should get ropsten" do
    get geth_ropsten_url
    assert_response :success
  end

end
