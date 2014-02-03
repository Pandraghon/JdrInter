$(function(){
    
    var socket = io.connect('25.185.224.141:8080');
    var currentuser;

    socket.on('CHAT_LOGIN', function(users, me){
        currentuser = me;
        for(var key in users){
            if(users[key].userid != me.userid){
                chat_addUser(users[key]);   
            }
        }
    });
    socket.on('CHAT_LOGOUT', function(user){
        $('#user'+user.userid).remove();
        chat_updateCount();
    })

    socket.on('CHAT_NEWUSER', function(user){
        chat_addUser(user);
    });

    socket.on('CHAT_MESSAGEIN', function(data){
        if(currentuser.userid == data.message.dest){
            newChatBox('user'+data.author.userid, data.author.login);
            $('#chat_withuser'+data.author.userid+' .chat_contentchat').append('<div class="chat_line chat_in">'+
                                                                               '    <p class="chat_message">'+
                                                                                    data.message.message+
                                                                               '    </p>'+
                                                                               '</div>').scrollTop($(this).scrollHeight);
        }
    });

    $(document).on('click', '.chat_titleblock', function(){
        var block = $(this).parent('.chat_oneblock').find('.chat_contentblock');
        if(block.css('display') == "none") {
            block.css('display', 'block');
        }else{
            block.css('display', 'none');
        }
    });
    $(document).on('click', '.chat_oneuser', function(){
        newChatBox(this.id, $(this).text());
    });
    $(document).on('click', '.chat_close', function(){
        $(this).parent().parent().remove();
    });
    $(document).on('keypress', '.chat_form', function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which),
            blockID = $(this).parent().parent().prop('id').substr(13);
        if(keycode == '13'){
            event.preventDefault();
            var message = $(this).val(),
                dest = blockID;
            $(this).val('');
            if(message != ''){
                $('#chat_withuser'+dest+' .chat_contentchat').append('<div class="chat_line chat_out">'+
                                                                     '    <p class="chat_message">'+
                                                                              message+
                                                                     '    </p>'+
                                                                     '</div>').scrollTop($(this)[0].scrollHeight);
                socket.emit('SERVER_MESSAGEOUT', {
                    message     : message,
                    dest        : dest
                });
            }
        }
    });

    function chat_addUser(user){
        $('#chat_allusers').append('<li class="chat_oneuser" id="user'+user.userid+'">'+user.login+'</li>');
        chat_updateCount();
    };
    function chat_updateCount(){
        $('#chat_countusers').text('('+$('.chat_oneuser').length+')');
    };
    function newChatBox(userID, userName){
        if($('#chat_with'+userID).length == 0){
            $('#chat_allblocks').prepend('<li class="chat_oneblock" id="chat_with'+userID+'">'+
                                         '  <div class="chat_titleblock">'+userName+'<span class="chat_close">X</span></div>'+
                                         '  <div class="chat_contentblock">'+
                                         '      <div class="chat_contentchat"></div>'+
                                         '      <textarea rows="1" class="chat_form"></textarea>'+
                                         '  </div>'+
                                         '</li>');
        }
    };
});