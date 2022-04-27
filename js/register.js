var DomainUrl = "https://api.kefsc.com"

function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return null;
}

var second = 150;

function resetCode(second){
    $('#captcha div').text(second+"s");
    // $("#captcha").css("pointer-events","none");
    $("#captcha").addClass("disabled");

    var timer = null;
    timer = setInterval(function(){
        second -= 1;
        if(second >0 ){
            $('#captcha div').text(second+"s");
        }else{
            clearInterval(timer);
            second = 150;
            $('#captcha div').text("获取验证码");
            $("#captcha").removeClass("disabled");
            // $("#captcha").css("pointer-events","all");
        }
    },1000);
}

$(document).ready(function () {
    let timestamp=parseInt(new Date().getTime()/1000);
    let captchaTs = getStore('captcha_ts');
    if (captchaTs != undefined && captchaTs > timestamp){
        second = captchaTs - timestamp;
        resetCode(second);
    }

    let inviteCode = getQueryString("invite_code");
    if(inviteCode=="" || inviteCode == null){
        alert("无法获取验证码,请确认链接是否正确");
        return false;
    }else {
        $(".invite_code").val(inviteCode);
    }


});

$("#changePassword").on('click', function () {
    var src = $(this).find("img").attr("src")
    if (src=="images/icon-close.png"){
        $(this).find("img").attr('src','images/icon-open.png');
        $(".password").attr('type','text');
    }else {
        $(this).find("img").attr('src','images/icon-close.png');
        $(".password").attr('type','password');
    }
});

function register(){
    var emailReg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;

    var email = $(".email").val();
    var password = $(".password").val();
    var phone = $(".phone").val();
    var captcha = $(".captcha").val();
    var inviteCode = $(".invite_code").val();

    if(email=="" || !emailReg.test(email)){
        msg("邮箱格式不正确");
        return false;
    }
    if(password.length<6 || password.length>20){
        msg("密码长度为6-20位");
        return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)){
        msg("请输入正确的手机号");
        return false;
    }
    if (captcha.length<4 || captcha.length>8){
        msg("验证码有误");
        return false;
    }
    if (inviteCode.length<4){
        msg("邀请码有误");
        return false;
    }

    $("button.register").css("pointer-events","none");

    $.ajax({
        type: "post", // 请求类型（get/post）
        url: DomainUrl+"/api/register",
        async: true, // 是否异步
        dataType: "json", // 设置数据类型
        data:{"email": email,"password": password,"phone": phone,"captcha_code": captcha,"invite_code": inviteCode},
        success: function (data){
            $("button.register").css("pointer-events","all");
            if(data.code==200){
                layer.open({
                    content: "注册成功!",
                    skin: 'msg',
                    time: 3,
                    end: function () {
                        downloadUrl();
                    }
                });
            }else {
                msg(data.msg);
            }
        },
        error: function (errorMsg){
            $("button.register").css("pointer-events","all");
            msg("网络出错,请稍后重试～");
        }
    });
}

function getCaptcha(){
    var phone = $(".phone").val();
    if (!/^1[3-9]\d{9}$/.test(phone)){
        layer.open({
            content: "请输入正确的手机号",
            skin: 'msg',
            time: 2
        });
        return false;
    }

    $("#captcha").css("pointer-events","none");

    $.ajax({
        type: "post", // 请求类型（get/post）
        url: DomainUrl+"/api/captcha",
        async: true, // 是否异步
        dataType: "json", // 设置数据类型
        data: {"username": phone},
        success: function (data){
            $("#captcha").css("pointer-events","all");
            if(data.code==200){
                let timestamp=parseInt(new Date().getTime()/1000);
                setStore('captcha_ts',timestamp+second);
                resetCode(second);
                msg("验证码发送成功~");
            }else {
                msg(data.msg);
            }
        },
        error: function (errorMsg){
            $("#captcha").css("pointer-events","all");
            console.log(errorMsg)
            msg("网络出错,请稍后重试～");
        }
    });
}


function setStore(name, content) {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}


/**
 * 获取localStorage
 */
function getStore(name, exp) {
    if (!name) return;
    // return JSON.parse(window.localStorage.getItem(name));
    return window.localStorage.getItem(name);

}

function msg(msg){
    layer.open({
        content: msg,
        skin: 'msg',
        time: 2
    });
}

function downloadUrl(){
    location.href = "download.html?channel="+getQueryString("channel");
}

