$('#genderchar select').val('h').change();
$('#racechar select').val('demi_elfe').change();
$('#classchar select').val('barbare').change();
$('#alignchar select').val('lb').change();

$('#racechar select').on('change', function() {
    var race = this.value,
        categ,
        mod;
    if(race == 'demi_elfe' || race == 'demi_orque' || race == 'elfe' || race == 'humain' || race == 'nain') categ = 'M';
    else categ = 'P';
    mod = categ == 'P' ? '+1' : '0';
    $('#categ_sizechar input').val(categ);
    $('.taille').val(mod).change();
    if(mod == '+1') mod = '-1';
    $('.inverse_taille').val(mod).change();
});
$('#classchar select').on('change', function() {
    var classe = this.value;
    if(!$('#levelchar input').val())  $('#levelchar input').val(1).change();
    if(classe == 'barbare') {
        adjustClass(barbare);
    } else if(classe == 'barde') {
        adjustClass(barde);
    } else if(classe == 'druide') {
        adjustClass(druide);
    } else if(classe == 'ensorceleur') {
        adjustClass(ensorceleur);
    } else if(classe == 'guerrier') {
        adjustClass(guerrier);
    } else if(classe == 'magicien') {
        adjustClass(magicien);
    } else if(classe == 'moine') {
        adjustClass(moine);
    } else if(classe == 'paladin') {
        adjustClass(paladin);
    } else if(classe == 'pretre') {
        adjustClass(pretre);
    } else if(classe == 'rodeur') {
        adjustClass(rodeur);
    } else if(classe == 'roublard') {
        adjustClass(roublard);
    }
});

$('.for').on('change', function() {
	adjustCaract('for');
});
$('.dex').on('change', function() {
	adjustCaract('dex');
});
$('.con').on('change', function() {
	adjustCaract('con');
});
$('.int').on('change', function() {
	adjustCaract('int');
});
$('.sag').on('change', function() {
	adjustCaract('sag');
});
$('.cha').on('change', function() {
	adjustCaract('cha');
});

$('#refl input').on('change', function() {
    adjustSave('refl');
});
$('#vig input').on('change', function() {
    adjustSave('vig');
});
$('#vol input').on('change', function() {
    adjustSave('vol');
});

$('#cac input').on('change', function() {
    adjustCombat('cac');
});
$('#dist input').on('change', function() {
    adjustCombat('dist');
});
$('#bmo input').on('change', function() {
    adjustCombat('bmo');
});

$('.combat_armure input').on('change', function() {
    var armure = $('.combat_armure #armure').val() ? parseInt($('.combat_armure #armure').val(), 10) : 0,
        bouclier = $('.combat_armure #bouclier').val() ? parseInt($('.combat_armure #bouclier').val(), 10) : 0,
        natur = $('.combat_armure #natur').val() ? parseInt($('.combat_armure #natur').val(), 10) : 0,
        dex = $('.combat_armure .mod_dex').val() ? parseInt($('.combat_armure .mod_dex').val(), 10) : 0,
        esquive = $('.combat_armure #esquive').val() ? parseInt($('.combat_armure #esquive').val(), 10) : 0,
        chance = $('.combat_armure #chance').val() ? parseInt($('.combat_armure #chance').val(), 10) : 0,
        taille = $('.combat_armure .taille').val() ? parseInt($('.combat_armure .taille').val(), 10) : 0,
        parade = $('.combat_armure #parade').val() ? parseInt($('.combat_armure #parade').val(), 10) : 0,
        moral = $('.combat_armure #moral').val() ? parseInt($('.combat_armure #moral').val(), 10) : 0,
        circons = $('.combat_armure #circons').val() ? parseInt($('.combat_armure #circons').val(), 10) : 0,
        malfais = $('.combat_armure #malfais').val() ? parseInt($('.combat_armure #malfais').val(), 10) : 0,
        intuit = $('.combat_armure #intuit').val() ? parseInt($('.combat_armure #intuit').val(), 10) : 0,
        saint = $('.combat_armure #saint').val() ? parseInt($('.combat_armure #saint').val(), 10) : 0,
        sag = $('.combat_armure #armure_sag').val() ? parseInt($('.combat_armure #armure_sag').val(), 10) : 0,
        a = armure + bouclier + natur,
        b = dex + esquive,
        ca = 10 + a + b + chance + taille + parade + moral + circons + malfais + intuit + saint + sag;
    $('.combat #ca').val(ca);
    $('.combat #contact').val(ca - a);
    $('.combat #surpris').val(ca - b);
});

$('#dmd input').on('change', function() {
    var bba = $('#dmd .bba').val() ? parseInt($('#dmd .bba').val(), 10) : 0,
        force = $('#dmd .mod_for').val() ? parseInt($('#dmd .mod_for').val(), 10) : 0,
        dex = $('#dmd .mod_dex').val() ? parseInt($('#dmd .mod_dex').val(), 10) : 0,
        taille = $('#dmd .inverse_taille').val() ? parseInt($('#dmd .inverse_taille').val(), 10) : 0,
        divers = $('#dmd #dmd_divers').val() ? parseInt($('#dmd #dmd_divers').val(), 10) : 0,
        spc = $('#dmd #dmd_spc').val() ? parseInt($('#dmd #dmd_spc').val(), 10) : 0,
        result = 10 + bba + force + dex + taille + divers + spc;
        $('#dmd .total').val(result);
});

$('#init input').on('change', function() {
    var dex = $('#init .mod_dex').val() ? parseInt($('#init .mod_dex').val(), 10) : 0,
        spc = $('#init #dmd_spc').val() ? parseInt($('#init #dmd_spc').val(), 10) : 0,
        result = dex + spc;
    if(result > 0) result = '+'+result;
    $('#init .total').val(result);
})

function adjustCaract(caract) {
	var base = $('#'+caract+'_base').val() ? parseInt($('#'+caract+'_base').val(), 10) : 0,
		intr = $('#'+caract+'_intr').val() ? parseInt($('#'+caract+'_intr').val(), 10) : 0,
		alter = $('#'+caract+'_alter').val() ? parseInt($('#'+caract+'_alter').val(), 10) : 0,
		result = base + intr + alter,
        mod = Math.floor((result - 10) / 2);
    if(mod > 0) mod = '+'+mod;
	$('#'+caract+'_val').val(result);
    $('#'+caract+'_mod').val(mod);
    $('.mod_'+caract).val(mod).change();
};
function adjustSave(caract) {
    var base = $('#'+caract+' .base').val() ? parseInt($('#'+caract+' .base').val(), 10) : 0,
        carac = $('#'+caract+' .carac').val() ? parseInt($('#'+caract+' .carac').val(), 10) : 0,
        magie = $('#'+caract+' .magie').val() ? parseInt($('#'+caract+' .magie').val(), 10) : 0,
        divers = $('#'+caract+' .divers').val() ? parseInt($('#'+caract+' .divers').val(), 10) : 0,
        result = base + carac + magie + divers;
    if(result > 0) result = '+'+result;
    $('#'+caract+' .total').val(result);
};
function adjustCombat(caract) {
    var bba = $('#'+caract+' .bba').val() ? parseInt($('#'+caract+' .bba').val(), 10) : 0,
        carac = $('#'+caract+' .carac').val() ? parseInt($('#'+caract+' .carac').val(), 10) : 0,
        taille = $('#'+caract+' .taille').val() ? parseInt($('#'+caract+' .taille').val(), 10) : ($('#'+caract+' .inverse_taille').val() ? parseInt($('#'+caract+' .inverse_taille').val(), 10) : 0),
        spc = $('#'+caract+' .spc').val() ? parseInt($('#'+caract+' .spc').val(), 10) : 0,
        result = bba + carac + taille + spc;
    if(result > 0) result = '+'+result;
    $('#'+caract+' .bonus').val(result);
};
function adjustClass(classe) {
    $('#refl .base').val(classe.refl[$('#levelchar input').val() - 1]).change();
    $('#vig .base').val(classe.vig[$('#levelchar input').val() - 1]).change();
    $('#vol .base').val(classe.vol[$('#levelchar input').val() - 1]).change();
    $('.bba').val(classe.bba[$('#levelchar input').val() - 1]).change();
};