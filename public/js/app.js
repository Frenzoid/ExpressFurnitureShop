function login()
{
    $.ajax({
        url:"/usuarios/login",
        type:"POST",
        data: JSON.stringify({username: $("#username").val(), password: $("#password").val()}),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: (resp) => {
            if(resp.ok){
                localStorage.setItem("token",resp.token);
                window.location.href = '/inmuebles';
            }else
                $('html').html(resp);
        }
    });
}

function register()
{
    $.ajax({
        url:"/usuarios/registro",
        type:"POST",
        data: JSON.stringify({username: $("#username").val(), password: $("#password").val(),  password2: $("#password2").val()}),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data) {
            $('html').html(data);
        },
        error: (err) => {
            if(err.status == 200)
                $('html').html(err.responseText);
        }
    });
}

function logout(){
    localStorage.setItem('token', '');
    window.location.href = '/inmuebles';
}

function borrar(id)
{
    if(confirm("Realmente deseas borrar este inmueble?")){
        $.ajax({
            url:"/inmuebles/" + id,
            type:"DELETE",
            data: JSON.stringify({}),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem('token'));
            },
            success: (resp) => {
                window.location.href = '/inmuebles';
            }
        });
    }
}

function access(){
    $.ajax({
        url:"/nuevo_inmueble/",
        type:"GET",
        contentType:"application/json; charset=utf-8",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem('token'));
        },
        success: function(data) {
            $('html').html(data);
        },
        error: function(data) {
            window.location.href = '/usuarios/login';
        }
    });
}

function edit(id){
    $.ajax({
        url:"/inmuebles/edit/" + id,
        type:"GET",
        contentType:"application/json; charset=utf-8",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem('token'));
        },
        success: function(data) {
            $('html').html(data);
        },
        error: function(data) {
            window.location.href = '/usuarios/login';
        }
    });
}