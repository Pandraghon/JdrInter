$(function(){
    
    var socket = io.connect('25.185.224.141:8080');
    var arrayWeapon = {};

    socket.emit('SERVER_GETWEAPONS');
    socket.on('CHARCREATE_SETWEAPONS', function(array){
        arrayWeapon = array;
        var categ = '',
            sous_categ = '';
        for(var key in arrayWeapon){
            var weapon = arrayWeapon[key];
            if(weapon == null){
                var line = '<div id="0" class="arme_one_choice">'+
                           '<span class="arme_nom">(Vide)</span>'+
                           '<span class="arme_prix"></span>'+
                           '<span class="arme_degats taille_p" style="display:none;"></span>'+
                           '<span class="arme_degats taille_m"></span>'+
                           '<span class="arme_critique"></span>'+
                           '<span class="arme_fact_portee"></span>'+
                           '<span class="arme_poids"></span>'+
                           '<span class="arme_type"></span>'+
                           '<span class="arme_special"></span>'+
                           '</div>';
            }else{
                var prix = conversionPO(weapon.prix),
                    masse = conversionKG(weapon.poids);

                if(categ != weapon.categ){
                    categ = weapon.categ;
                    sous_categ = weapon.sous_categ;
                    $('.arme_all_choice').append('<div class="arme_categ">'+conversionCateg(categ)+'</div>'+
                                                '<div class="arme_sous_categ">'+conversionCateg(sous_categ)+'</div>');
                }else if(sous_categ != weapon.sous_categ){
                    sous_categ = weapon.sous_categ;
                    $('.arme_all_choice').append('<div class="arme_sous_categ">'+conversionCateg(sous_categ)+'</div>');
                }

                var line = '<div id="'+weapon.id+'" class="arme_one_choice">'+
                           '<span class="arme_nom">'+weapon.nom+'</span>'+
                           '<span class="arme_prix">'+prix+'</span>'+
                           '<span class="arme_degats taille_p" style="display:none;">'+weapon.degats_p+'</span>'+
                           '<span class="arme_degats taille_m">'+weapon.degats_m+'</span>'+
                           '<span class="arme_critique">'+weapon.critique+'</span>'+
                           '<span class="arme_fact_portee">'+weapon.fact_portee+'</span>'+
                           '<span class="arme_poids">'+masse+'</span>'+
                           '<span class="arme_type">'+weapon.type+'</span>'+
                           '<span class="arme_special">'+weapon.special+'</span>'+
                           '</div>';
            }
            $('.arme_all_choice').append(line);
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
        var typeTaille = 'M';
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
            typeTaille = 'P';
        } else if(race == 'halfelin') { //+2dex/cha, -2for
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#dex .carac_race').val('+2').change();
            $('#cha .carac_race').val('+2').change();
            $('#for .carac_race').val('-2').change();
            typeTaille = 'P';
        } else if(race == 'nain') { //+2con/sag, -2cha
            $('#caract .carac_race').prop('disabled', true)
                                    .val('').change()
                                    .prop('placeholder', '');
            $('#con .carac_race').val('+2').change();
            $('#sag .carac_race').val('+2').change();
            $('#cha .carac_race').val('-2').change();
        }

        if(typeTaille == 'P'){
            $('.taille_p').css('display', 'inline-block');
            $('.taille_m').css('display', 'none');
        }else{
            $('.taille_m').css('display', 'inline-block');
            $('.taille_p').css('display', 'none');
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
        var choice = $(this).parent().find('.arme_choice'),
            display = choice.css('display') == 'none' ? 'inline-block' : 'none';
        $('.arme_choice').css('display', 'none');
        choice.css('display', display);
    });
    $(document).on('click', '.arme_one_choice', function(){
        var currentWeapon = arrayWeapon[$(this).prop('id')],
            armeSelector = $(this).parent().parent().parent(),
            armeInfos = armeSelector.find('.arme_infos');
        if(currentWeapon == null){
            var nom = '',
                dgts = '',
                crit = '';
        }else{
            var nom = currentWeapon.nom,
                dgts = $('.taille_m').css('display') == 'inline-block' ? currentWeapon.degats_m : currentWeapon.degats_p,
                crit = currentWeapon.critique;
        }
        socket.emit('debug', 'arme : '+nom);
        armeInfos.text(nom+' '+dgts+' '+crit);
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

    function conversionPO(value){
        value = value != null ? parseInt(value, 10) : 0;
        if(value >= 100){
            value = (value / 100)+'po';
        }else if(value >= 10){
            value = (value / 10)+'pa';
        }else{
            value += 'pc';
        }
        return value;
    };

    function conversionKG(value){
        value = value != null ? parseInt(value, 10) : 0;
        if(value >= 1000){
            value = (value / 1000)+'kg';
        }else{
            value += 'g';
        }
        return value;
    }

    function conversionCateg(name){
        if(name == "arme_courante")
            return "Armes courantes";
        else if(name == "arme_guerre")
            return "Armes de guerre";
        else if(name == "arme_exotique")
            return "Armes exotiques";
        else if(name == "mains_nues")
            return "Combat à mains nues";
        else if(name == "cac_legere")
            return "Armes de corps à corps légères";
        else if(name == "cac_1m")
            return "Armes de corps à corps à une main";
        else if(name == "cac_2m")
            return "Armes de corps à corps à deux mains";
        else if(name == "distance")
            return "Armes à distance";
        else
            return "Error name";
    }

});