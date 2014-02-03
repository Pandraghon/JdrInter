$(document).ready(function($){
    
    var socket = io.connect('25.185.224.141:8080');

    $('#message').attr('class', 'content font' + $('#font').val());
    $('#font option[value=1]').css('font-family', 'font1');

    loadChat();


    ////// GESTION DES PDF ///////////

    var flashvars = {};
    /* Adjust setting below to your personal needs (Don't forget to remove '//' from the beginning of the line)  */
        
    flashvars.locales = "en_EN";
    //flashvars.bookPath = "ebook/content/publication";     //path to folder with publication files
    //flashvars.skinPath = "ebook/content/skin/skin_1.swf"; //path to viewer skin (swf)
    flashvars.useSounds = "true";                           //use sounds ("true=yes, "false"=no)
    flashvars.soundsPath = "/snd/";                         //path to folder with sound
    //flashvars.configPath = "ebook/config/";               //path to folder with eBook configuration (xml)
    //flashvars.logoPath = "ebook/content/logo.png";        //path to logo (png or jpg)
    //flashvars.logoURL = "www.yourpage.pl";                //URL logo link     
    //flashvars.logoURLWindow = "_blank";                   //open URL in new window ("_blank") or in the same window ("_self")
    flashvars.print = "true";
    //flashvars.save = "true";
    //flashvars.dragSpeed = "5";                            //speed of page flip (1-7)
    flashvars.print = "true";
    flashvars.save = "true";
    flashvars.buttons = "save, print, zoom";
    
    var w = "90%"; //width
    var h = "1150px"//"100%"; //height
    
    var params = {};
    params.allowfullscreen = "true";
    params.allowscriptaccess = "always";
    params.allownetworking = "all";
    params.wmode = "transparent"; 
    loadPdf("manuelJoueurs");
    hidePdf();



    ////// GESTION DES EVENEMENTS //////////////

    socket.on('newusr', function(user){
        $('#users').append('<div class="user" id="' + user.userid + '"><div class="avatar"></div><div class="pseudo">' + user.login + '</div></div>');
        $('.user#'+user.userid+' .avatar').append('<img class="avatarimg" src="/images/avatars/users/'+user.userid+'.jpg" />');
    });

    socket.on('disusr', function(user){
        $('#' + user.userid).remove();
    });

    socket.on('newmsg', function() {
        loadChat();
    });
    $('#formulaire_chat').submit(function() {
        var data = {
            message : $('#message').val(),
            font : $('#font').val()
        };
        socket.emit('newmsgsent', data); // Transmet le message au serveur
        $('#message').val(''); // Vide la zone de Chat et remet le focus dessus
        return false; // Permet de bloquer l'envoi "classique" du formulaire
    });
    $('#font').on('change', function(){
        $('#message').attr('class', 'content font' + this.value);
    })

    $('#size_block').on('change', function(){
        socket.emit('changeSize', this.value);
    });
    $('#width_map').on('change', function(){
        socket.emit('changeWidth', this.value);
    });
    $('#height_map').on('change', function(){
        socket.emit('changeHeight', this.value);
    });
    $('#img_map').on('change', function(){
        socket.emit('changeImage', this.value.split('\\').pop());
    });

    socket.on('changeMap', function(map){
        loadMap(map);
        $('#size_block').val(map.size);
        $('#width_map').val(map.width);
        $('#height_map').val(map.height);
    });

    $('.pdflink').on('click', function(){
        $(location).attr('hash', '\#/' + this.id);
        if($('#pdfcontainer').attr('data') != "/pdf/manuelJoueurs/ebook.swf"){
            loadPdf('manuelJoueurs');
        }
        displayPdf();
    });
    $('#display_pdf').on('click', function(){
        if($('#pdfcontainer').css('display') == 'none'){
            displayPdf();
        }
        else{
            hidePdf();
        }
    });
    $('.pdfone').on('click', function(){
        $('#pdfcontainer').empty();
        loadPdf(this.id);
        $(location).attr('hash', '');
        displayPdf();
    });

    function loadMap(map) {
        $('#map').css('height', map.height*map.size + 'px');
        $('#map').css('width', map.width*map.size + 'px');
        $('#map').css('content', map.image);
    }

    function loadChat() {
        $('#zone_chat').load('/chat.htm');
        $('#zone_chat').scrollTop($('#zone_chat').prop("scrollHeight"));
    }

    function loadPdf(name) {
        swfobject.embedSWF( "/pdf/" + name + "/ebook.swf", "pdfcontainer", w, h, "10.0.0", "/js/expressInstall.swf", flashvars, params );
    }
    function displayPdf() {
        $('#pdfcontainer').css('display', 'block');
        $('#pdflist').css('display', 'block');
        $('#display_pdf').attr('value', 'Cacher les manuels');
        $('html,body').animate({scrollTop: $('#pdfcontainer').offset().top}, 'slow');
    }
    function hidePdf() {
        $('#pdfcontainer').css('display', 'none');
        $('#pdflist').css('display', 'none');
        $('#display_pdf').attr('value', 'Afficher les manuels');
    }

})(jQuery);