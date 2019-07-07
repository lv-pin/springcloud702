$(function () {
    // 更换验证码
    $('#verifycodeImg').click(function(){
        $('#verifycodeImg').attr('src','/newmonitor/getVerifyCode?flag=' + Math.random());
    })

    // 登录
    var toLogin = true;
    var infoList = null;
    var Login = function () {
            var $this = $('#btnLogin');
            toLogin = false;
            var username = encodeURI($('#username').val());
            var password = encodeURI($('#password').val());
            var verifycode = encodeURI($('#verifycode').val());
            $this.css({
                'background': '#cccccc',
                'color': '#666666'
            });
            $.ajax({ // 发送数据
                url: '/newmonitor/doVerify',
                type: 'post',
                dataType:'json',
                data: { username: username, password: password, verifycode: verifycode }, // 传送请求数据
                success: function(data) {	// 登录成功后返回的数据
                    infoList = data;
                    if(infoList.success == true){
                        window.location.href ="index";
                        // window.location.href ="index?&username="+encodeURI(infoList.username);
                    }
                    else{
                        $('.error-tips').removeClass('hidden');
                        $('#verifycodeImg').attr('src','/newmonitor/getVerifyCode?flag=' + Math.random());
                        if(infoList.data == '0001'){
                            $('.error-tips').html('用户名不能为空');
                            $('#username').focus();
                        }else if(infoList.data == '0002'){
                            $('.error-tips').html('密码不能为空');
                            $('#password').focus();
                        }else if(infoList.data == '0003'){
                            $('.error-tips').html('错误的验证码');
                            $('#verifycode').focus();
                        }else if(infoList.data == '0004'){
                            $('.error-tips').html('错误的用户名或密码');
                            $('#username').focus();
                        }else if(infoList.data == '0005'){
                            $('.error-tips').html('登陆异常');
                        }else if(infoList.data == '0006'){
                            $('.error-tips').html('登录失败');
                        }else if(infoList.data == '0007' || infoList.data == '0008'){
                            $('.error-tips').html('0007/0008');
                        }else if(infoList.data == '0009'){
                            $('.error-tips').html('未知错误');
                        }
                        toLogin = true;
                        $this.css({
                           'background': '#316ce3',
                            'color':'#eee'
                        });

                    };
                }
            });


    };
    $('#btnLogin').click(function () {
        toLogin ? Login() : console.log("It's logining.");
    });

    // 回车提交事件
    $('body').keydown(function() {
        (event.keyCode == '13' && toLogin) ? Login() : false;
    });
});
