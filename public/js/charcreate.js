$(function(){

    function conversionPO(value){
        value = value != null ? parseInt(value, 10) : 0;
        if(value >= 100){
            value = (value / 100)+'po';
        }else if(value >= 10{
            value = (value / 10)+'pa';
        }else{
            value += 'pc';
        }
        return value;
    };
    
    var socket = io.connect('25.185.224.141:8080');
    var arrayWeapon;

    socket.emit('SERVER_GETWEAPONS');
    socket.on('CHARCREATE_SETWEAPONS', function(array){
        arrayWeapon = array;
        socket.emit('debug', arrayWeapon['1'].nom);
        for(var armeID in arrayWeapon){
            var weapon = arrayWeapon[armeID];
            var prix = conversionPO(weapon.prix);
            var line = '<div id="arme'+armeID+'" class="arme_one_choice">'+
                       '<span class="arme_nom">'+weapon.nom+'</span>'+
                       '<span class="arme_prix">'+prix+'</span>'+
                       '<span class="arme_degats taille_p">'+weapon.degats_p+'</span>'+
                       '<span class="arme_degats taille_m">'+weapon.degats_m+'</span>'+
                       '<span class="arme_critique">'+weapon.critique+'</span>'+
                       '<span class="arme_fact_portee">'+weapon.fact_portee+'</span>'+
                       '<span class="arme_poids">'+weapon.poids+'</span>'+
                       '<span class="arme_type">'+weapon.type+'</span>'+
                       '<span class="arme_special">'+weapon.special+'</span>'+
                       '</div>';
            $('.arme_choice').append(line);
        }
    });
    
    $('#races .radio_image input').css('content', function() {
        return 'url("/images/races/'+this.value+'.png")';
    });
    $('#classes .radio_image input').css('content', function() {
        return 'url("/images/classes/'+this.value+'.jpg")';
    });



    var rolled_dice = 0;
    $('#diceroller').on('click', function() {
        if(rolled_dice >= 6) return false;
        rolled_dice++;
        var num = 0,
            dice,
            total,
            results = [];
        $('#diceresults').empty();
        for(var i = 0 ; i < 4 ; i++) {
            dice = Math.floor(Math.random() * 6) + 1;
            results[i] = dice;
            $('#diceresults').append(' <span id="dice'+i+'" class="dice">'+dice+'</span>');
            if(results[i] < results[num]) num = i;
        }
        $('#dice'+num).prop('class', 'dicemin');
        total = results[0] + results[1] + results[2] + results[3] - results[num];
        $('#dicetotal').val(total);
        $('#alldice').append(' '+total);
    });


    $('#for .modif').on('change', function() {
        adjustCaract('for');
    });
    $('#dex .modif').on('change', function() {
        adjustCaract('dex');
    });
    $('#con .modif').on('change', function() {
        adjustCaract('con');
    });
    $('#int .modif').on('change', function() {
        adjustCaract('int');
        adjustPtComp();
        var intel  = $('.mod_int').val() ? parseInt($('.mod_int').val(), 10) : 0;
        $('#nb_lang').empty().append(intel > 0 ? intel : '0');
    });
    $('#sag .modif').on('change', function() {
        adjustCaract('sag');
    });
    $('#cha .modif').on('change', function() {
        adjustCaract('cha');
    });

    $('input[name="race"]').on('change', function() {
        var race = $('input[name="race"]:checked').val();
        if(race == 'demi_elfe' || race == 'demi_orque' || race == 'humain') { //+2 a une caract
            $('#caract .carac_race').prop('disabled', false)
                                    .val('').change()
                                    .prop('placeholder', '+2');
        } else if(race == 'elfe') { //+2dex/int, -2con
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#dex .carac_race').val('+2').change();
            $('#int .carac_race').val('+2').change();
            $('#con .carac_race').val('-2').change();
        } else if(race == 'gnome') { //+2con/cha, -2for
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#con .carac_race').val('+2').change();
            $('#cha .carac_race').val('+2').change();
            $('#for .carac_race').val('-2').change();
        } else if(race == 'halfelin') { //+2dex/cha, -2for
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#dex .carac_race').val('+2').change();
            $('#cha .carac_race').val('+2').change();
            $('#for .carac_race').val('-2').change();
        } else if(race == 'nain') { //+2con/sag, -2cha
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#con .carac_race').val('+2').change();
            $('#sag .carac_race').val('+2').change();
            $('#cha .carac_race').val('-2').change();
        }

        var classe = $('input[name="classe"]:checked').val() ? $('input[name="classe"]:checked').val() : '',
            testDruide = (classe == 'druide'),
            lang;
        $('#langues input').prop('disabled', true).prop('checked', false);
        $('input[value="langue_druide"]').prop('checked', testDruide);
        for(var key in arrayRace[race].langbase) {
            lang = arrayLang[arrayRace[race].langbase[key]];
            $('input[value="langue_'+lang+'"]').prop('checked', true);
        }
        for(var key in arrayRace[race].langsupp) {
            lang = arrayLang[arrayRace[race].langsupp[key]];
            $('input[value="langue_'+lang+'"]').prop('disabled', false);
        }
    });

    $('input[name="classe"]').on('change', function() {
        adjustPtComp();
        var classe = $('input[name="classe"]:checked').val(),
            comp;
        $('input[value="langue_druide"]').prop('checked', classe == 'druide');
        $('.comp_rang').prop('disabled', true).val('');
        for(var key in arrayClass[classe].comp) {
            comp = arrayComp[arrayClass[classe].comp[key]];
            $('#'+comp+' .comp_rang').prop('disabled', false);
        }
    });

    $('#competences input').on('change', function() {
        var comp = $(this).parent('td').parent('tr').prop('id'),
            carac = $('#'+comp+' .comp_carac').val() ? parseInt($('#'+comp+' .comp_carac').val(), 10) : 0,
            rang = $('#'+comp+' .comp_rang').val() ? parseInt($('#'+comp+' .comp_rang').val(), 10) : 0,
            modif = $('#'+comp+' .comp_modif').val() ? parseInt($('#'+comp+' .comp_modif').val(), 10) : 0,
            total = carac + modif + rang * 4;
        $('#'+comp+' .comp_total').val(total);
    });

    $('.arme_select').on('click', function(){
        var armeID = $(this).parent().prop('id');
        socket.emit('debug', armeID);
        var choice = $(this).parent().find('.arme_choice');
        choice.css('display', choice.css('display') == 'none' ? 'inline-block' : 'none');
    });
    

    $('#charform').submit(function(event) {
        event.preventDefault();
        var errors = false,
            typeError = '',
            carac = {},
            comp_rang = {},
            comp_modif = {},
            comp_martiales = {},
            langues = {},
            armes = {},
            armures = {},
            sac1 = $('#bag1').val(),
            sac2 = $('#bag2').val(),
            dons = $('#don textarea').val(),
            background = {
                nom         : '',
                sexe        : $('#genderchar select').val(),
                race        : '',
                classe      : '',
                align       : $('#alignchar select').val(),
                niveau      : '1',
                age         : $('#agechar input').val(),
                poids       : $('#weightchar input').val(),
                taille      : $('#sizechar input').val(),
                yeux        : $('#eyeschar input').val(),
                cheveux     : $('#hairchar input').val(),
                peau        : $('#skinchar input').val(),
                religion    : $('#relchar input').val(),
                nation      : $('#nationchar input').val()
            },
            compteur = 0;
        //races
        if(!$('input[name="race"]:checked').val()) {
            errors = true;
            typeError += '\n-Race';
        }
        else background.race = $('input[name="race"]:checked').val();
        //classes
        if(!$('input[name="classe"]:checked').val()) {
            errors = true;
            typeError += '\n-Classe';
        }
        else background.classe = $('input[name="classe"]:checked').val();
        //caractéristiques
        $('.carac_des').each(function() {
            if($(this).val() == '') {
                errors = true;
                typeError += '\n-Caractéristiques';
            }
            else carac[$(this).parent('td').parent('tr').prop('id')] = $(this).parent('td').parent('tr').find('.carac_total').val();
        });
        if(background.race == 'humain' || background.race == 'demi_elfe' || background.race == 'demi_orque') {
            $('.carac_race').each(function() {
                if($(this).val().match(/[\+]?[2]/)) compteur++;
            });
            if(compteur != 1) {
                errors = true;
                typeError += '\n-Caractéristiques';
            }
        }
        //competences
        compteur = 0;
        if(background.classe) {
            var intel  = $('.mod_int').val() ? parseInt($('.mod_int').val(), 10) : 0,
                ptcomp = arrayClass[background.classe].ptcomp + intel;
            if(ptcomp < 0) ptcomp = 0;
        }
        $('#competences .comp_rang').each(function() {
            if($(this).val().match(/[1]/)) compteur++;
            else if($(this).val().match(/[2-9]/)) compteur = ptcomp+1;
        });
        if(compteur != ptcomp) {
            errors = true;
            typeError += '\n-Compétences';
        } else {
            var namecomp;
            $('#competences .comp_rang').each(function() {
                namecomp = $(this).parent('td').parent('tr').prop('id');
                comp_rang[namecomp] = $(this).val() ? parseInt($(this).val(), 10) : 0;
                comp_modif[namecomp] = $('#'+namecomp+' .comp_modif').val() ? parseInt($('#'+namecomp+' .comp_modif').val(), 10) : 0;
            });
        }
        //competences martiales
        $('#comp_martiales input').each(function() {
            comp_martiales[$(this).prop('value')] = $(this).prop('checked');
        });
        $('#comp_martiales textarea').each(function() {
            comp_martiales[$(this).prop('id')] = $(this).val();
        });
        //langues
        $('#langues input').each(function() {
            langues[$(this).prop('value')] = $(this).prop('checked');
        });
        //armes
        var numarme;
        $('#armes input').each(function() {
            numarme = $(this).parent('td').parent('tr').prop('id');
            if(!armes[numarme]) armes[numarme] = {};
            armes[numarme][$(this).prop('class')] = $(this).val();
        });
        armes['infos_sup'] = $('#armes textarea').val();
        //armures
        armures.armure = {};
        $('#armure input').each(function() {
            armures.armure[$(this).prop('class')] = $(this).val();
        });
        armures.bouclier = {};
        $('#bouclier input').each(function() {
            armures.bouclier[$(this).prop('class')] = $(this).val();
        });
        //background
        if($('#namechar input').val() == '') {
            errors = true;
            typeError += '\n-Background';
        } else background.nom = $('#namechar input').val();

        socket.emit('debug', comp_rang['acrobaties']);

        if(!errors) {
            socket.emit('NEW_CHAR', {
                carac           : carac,
                comp_rang       : comp_rang,
                comp_modif      : comp_modif,
                comp_martiales  : comp_martiales,
                langues         : langues,
                armes           : armes,
                armures         : armures,
                sac1            : sac1,
                sac2            : sac2,
                dons            : dons,
                background      : background 
            }, arrayComp, arrayClass);
        }
        else {
            alert('Veuillez verifier les champs : \n\n'+typeError);
        }
    });

    function adjustCaract(carac) {
        var race = $('#'+carac+' .carac_race').val() ? parseInt($('#'+carac+' .carac_race').val(), 10) : 0,
            des = $('#'+carac+' .carac_des').val() ? parseInt($('#'+carac+' .carac_des').val(), 10) : 0,
            mod = Math.floor((race + des - 10) / 2);
        if(mod > 0) mod = '+'+mod;
        $('#'+carac+' .carac_total').val(race + des);
        $('.mod_'+carac).val(mod).change();
    };

    function adjustPtComp() {
        var classe = $('input[name="classe"]:checked').val();
        if(classe) {
            var intel  = $('.mod_int').val() ? parseInt($('.mod_int').val(), 10) : 0,
                ptcomp = arrayClass[classe].ptcomp + intel;
            $('#pts_comp').empty().append(ptcomp > 0 ? ptcomp : '0');
        }
    };

});