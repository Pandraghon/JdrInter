$(function(){
    
    var socket = io.connect('25.185.224.141:8080');

    socket.on('PAGE_LOGIN', function() {
        $('#pagecontainer').load('/html/login.html');
        $('head').append('<link rel="stylesheet" href="css/login.css" id="css_login" />');
        $('head').append('<link rel="stylesheet" href="css/connection.css" id="css_connection" />');
        $.getScript('/js/login.js');
    });

    socket.on('PAGE_CHOICE', function() {
        $('#pagecontainer').load('/html/choice.html');
        $('head').append('<link rel="stylesheet" href="css/chat.css" />');
        $.getScript('/js/chat.js');
        $.getScript('/js/class.js');
        $.getScript('/js/choice.js');
        $('#chatcontainer').css('opacity', '1');
    });

    socket.on('PAGE_CREATECHAR', function() {
        $('#pagecontainer').load('/html/charcreate.html');
        $.getScript('/js/class.js');
        $.getScript('/js/charcreate.js');
    });
});