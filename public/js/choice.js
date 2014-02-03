$(function(){
    
    var socket = io.connect('25.185.224.141:8080');

    socket.on('CHOICE_SENDCHARS', function(chars) {
	    for(var key in chars) {
	        ch = chars[key];
            socket.emit('debug', key+' : '+ch.name+' ('+ch.level+')');
	        $('#listchar').append('<div class="radio_image"><input type="radio" name="charselection" id="char'+key+'" value="'+key+'" /><label for="char'+key+'">'+ch.name+'('+ch.level+')</label></div>');
            $('#char'+key)
                .css('content', 'url("/images/avatars/PCs/'+key+'.png")')
                .error(function(){
                    $(this).css('content', 'url("/images/avatars/PCs/default.png")');
                }
            );
	    }
    });


    $('#newchar').on('click', function() {
        socket.emit('CLIENT_CREATECHAR');
    });

});