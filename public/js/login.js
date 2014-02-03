$(function(){
    
    var socket = io.connect('25.185.224.141:8080');

    $('#login').submit(function(event) {
        event.preventDefault();
        var data = {
            pseudo : $('#pseudologin').val(),
            pass : $('#passlogin').val()
        };
        socket.emit('login', data);
    });
    socket.on('wronglogin', function() {
        $('#errlogin').css('display', 'block').text('Vos identifiants sont erronés');
    });
    socket.on('LOGIN_ALREADYCONNECTED', function(){
        $('#errlogin').css('display', 'block').text('Vous êtes déjà connecté');
    })

    $('#signup').submit(function(event) {
        event.preventDefault();
        var data = {
            pseudo  : $('#pseudosignup').val(),
            pass    : $('#passsignup').val(),
            verif   : $('#verifsignup').val(),
            mail    : $('#mailsignup').val()
        };
        socket.emit('signup', data);
    });
    socket.on('alreadypseudo', function() {

    });
    socket.on('alreadymail', function() {

    });
    socket.on('wrongsignup', function() {

    });
    socket.on('signed', function(info) {
        socket.emit('login', info);
    });

});