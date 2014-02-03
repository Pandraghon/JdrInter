var express = require('express'),
	app = express(),
	mysql = require('mysql'),
	crypto = require('crypto'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server).set('log level', 2),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs'),
    async = require('async'),
    shasum = crypto.createHash('sha1'),
    port = /*process.env.PORT || */8080;

shasum.update("utf8");

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res){
  	res.sendfile(__dirname + '/public/html/page.html');
});

var users = {};
users['0'] = {
	login	: 'Iamnobody',
	userid	: '0'
};
var arrayWeapon = {};
arrayWeapon['0'] = null;

var map = {
	height	: 22,
	width	: 33,
	size	: 27,
	image	: 'url(\'images/map1.jpg\')'
};
var connection = mysql.createConnection({
	host	: 'mysql1.alwaysdata.com',
	user	: 'jdrinter',
	password: '*Jdrinter1994',
	database: 'jdrinter_web'
});

connection.query('SELECT * FROM weapons', function(err, results){
	if(err) throw err;
	else {
		for(var key in results){
			var weapon = results[key];
			arrayWeapon[key] = {
				nom			: weapon.nom,
				prix		: weapon.prix,
				degats_p	: weapon.degats_p,
				degats_m	: weapon.degats_m,
				critique	: weapon.critique,
				fact_portee	: weapon.fact_portee,
				poids		: weapon.poids,
				type		: weapon.type,
				special		: weapon.special,
				categ		: weapon.categ,
				sous_categ	: weapon.sous_categ
			};
		}
		console.log('Weapons loaded successfully !');
	}
});

io.sockets.on('connection', function(socket){

	socket.emit('PAGE_LOGIN');

	console.log('->>New user<<-');
	var current = {
			me : false,
			chars : {}
		};

	for(var k in users){
		socket.emit('newusr', users[k]);
	}

	socket.on('debug', function(data){
		console.log(data);
	});

	socket.on('login', function(data){
		var hash = crypto.createHash('sha1').update(data.pass).digest("hex");
		//connection.connect();
		connection.query('SELECT id_user FROM users WHERE name_user = ? AND pwd_user = ?', [data.pseudo, hash], function(err, rows) {
			if(err) throw err;
			if(rows.length == 1) {
				if(rows[0].id_user in users){
					socket.emit('LOGIN_ALREADYCONNECTED');
				} else {
					current.me = {
						login	: data.pseudo,
						userid	: rows[0].id_user
					};
					users[current.me.userid] = current.me;
					async.series({
							one: function(callback){
								socket.emit('PAGE_CHOICE');
								callback(null, true);
							},
							two: function(callback){
								connection.query('SELECT * FROM chars WHERE id_user = ?', [current.me.userid], function(err, rows, cols) {
									if(err) throw err;
									chars = {};
									for(var key in rows) {
										val = rows[key];
										chars[val.id_char] = {
											name 	: val.name_char,
											level 	: val.level_char
										};
									}
									socket.emit('CHOICE_SENDCHARS', chars);
									callback(null, chars);
								});
							},
							three: function(callback){
								console.log('New User: login: '+current.me.login);
								socket.emit('CHAT_LOGIN', users, current.me);
								socket.broadcast.emit('CHAT_NEWUSER', current.me);
								callback(null, true);
							}
						},
						function(err, results){
							if(err) throw err;
							current.chars = results.two;
						}
					);
				}
			} else {
				console.log('ErrMdP : login: '+data.pseudo);
				socket.emit('wronglogin');
			}
			//connection.end();
		});
	});
	socket.on('signup', function(data){
		//connection.connect();
		connection.query('SELECT COUNT(*) AS result FROM users WHERE name_user = ?', [data.pseudo], function(err, rows, cols) {
			if(err) throw err;
			//connection.end();
			if(rows[0].result > 0) {
				socket.emit('alreadypseudo');
			} else {
				//connection.connect();
				connection.query('SELECT COUNT(*) AS result FROM users WHERE mail_user = ?', [data.mail], function(err, rows, cols) {
					if(err) throw err;
					//connection.end();
					if(rows[0].result > 0) {
						socket.emit('alreadymail');
					} else {
						if(data.pass != data.verif) {
							socket.emit('wrongsignup');
						} else {
							var hash = crypto.createHash('sha1').update(data.pass).digest("hex");
							//connection.connect();
							connection.query('INSERT INTO users (name_user, mail_user, pwd_user) VALUES ("'+data.pseudo+'", "'+data.mail+'", "'+hash+'")', function(err, rows, cols) {
								if(err) throw err;
								else socket.emit('signed', {
									pseudo 	: data.pseudo,
									pass 	: data.pass
								});
								//connection.end();
							});
						}
					}
				});
			}
		});
	});

	socket.on('disconnect', function(){
		if(!current.me){
			return false;
		}
		delete users[current.me.userid];
		io.sockets.emit('CHAT_LOGOUT', current.me);
	});

	socket.on('SERVER_MESSAGEOUT', function(data){
		var datetime = new Date().getTime();
		var querySQL = ', '+connection.escape(current.me.userid)+', '+connection.escape(data.dest)+', '+connection.escape(data.message)+', '+connection.escape(datetime);
		connection.query('INSERT INTO chats VALUES (NULL'+querySQL+')', function(err, result){
			if(err) throw err;
			console.log('Message sent to BdD');
			socket.broadcast.emit('CHAT_MESSAGEIN', {
				author 	: current.me,
				message : data,
				time 	: datetime
			});
		});
	});

	socket.on('getchars', function() {
		socket.emit('givechars', current.chars);
	})

	socket.on('CLIENT_CREATECHAR', function() {
		socket.emit('PAGE_CREATECHAR');
	});
	socket.on('SERVER_GETWEAPONS', function(){
		socket.emit('CHARCREATE_SETWEAPONS', arrayWeapon);
	});

	socket.on('charchosen', function() {
		console.log('Heeeeeeeeeeeeere !');
	});
	socket.on('NEW_CHAR', function(data, arrayComp, arrayClass) {
		console.log('**NEW_CHAR**');
		console.log('user : '+current.me.userid);
		for(var key in data.background) {
			console.log(key+' : '+data.background[key]);
		}
		for(var key in data.carac) {
			console.log(key+' : '+data.carac[key]);
		}
		console.log('competences : ');
		for(var key in data.comp_rang) {
			if(data.comp_rang[key] == '1')
				console.log(' '+key);
		}
		console.log('bouclier : ');
		for(var key in data.armures.bouclier) {
			console.log(' '+key+' : '+data.armures.bouclier[key]);
		}


		var querySQL1 = '', querySQL2 = '';
		for(var key in arrayComp) {
			querySQL1 += ', '+connection.escape(data.comp_rang[arrayComp[key]]);
			querySQL2 += ', '+connection.escape(data.comp_modif[arrayComp[key]]);
		}
		var querySQL3 = '';
		for(var key in data.comp_martiales) {
			querySQL3 += ', '+connection.escape(data.comp_martiales[key]);
		}
		var querySQL4 = '';
		for(var key in data.langues) {
			querySQL4 += ', '+connection.escape(data.langues[key]);
		}
		var querySQL5 = '', querySQL6 = '', querySQL7 = '', querySQL8 = '', querySQL9 = '';
		for(var key in data.armes.arme1) {
			querySQL5 += ', '+connection.escape(data.armes.arme1[key]);
			querySQL6 += ', '+connection.escape(data.armes.arme2[key]);
			querySQL7 += ', '+connection.escape(data.armes.arme3[key]);
			querySQL8 += ', '+connection.escape(data.armes.arme4[key]);
			querySQL9 += ', '+connection.escape(data.armes.arme5[key]);
		}
		var querySQL10 = '', querySQL11 = '';
		for(var key in data.armures.armure) {
			querySQL10 += ', '+connection.escape(data.armures.armure[key]);
			querySQL11 += ', '+connection.escape(data.armures.bouclier[key]);
		}
		async.series({
				caracID: function(callback){
					connection.query('INSERT INTO caracs VALUES (NULL, ?, ?, ?, ?, ?, ?)', [data.carac.for, data.carac.dex, data.carac.con, data.carac.int, data.carac.sag, data.carac.cha], function(err, result) {
						if(err) throw err;
						else {
							caracID = result.insertId;
							console.log('CaractOK : '+caracID);
							callback(null, caracID);
						}
					});
				},
				comp_rangID: function(callback){
					connection.query('INSERT INTO comps VALUES (NULL'+querySQL1+')', function(err, result) {
						if(err) throw err;
						else {
							comp_rangID = result.insertId;
							console.log('Comp_rangOK : '+comp_rangID);
							callback(null, comp_rangID);
						}
					});
				},
				comp_modifID: function(callback){
					connection.query('INSERT INTO comps VALUES (NULL'+querySQL2+')', function(err, result) {
						if(err) throw err;
						else {
							comp_modifID = result.insertId;
							console.log('Comp_modifOK : '+comp_modifID);
							callback(null, comp_modifID);
						}
					});
				},
				comp_martialesID: function(callback){
					connection.query('INSERT INTO comp_martiales VALUES (NULL'+querySQL3+')', function(err, result) {
						if(err) throw err;
						else {
							comp_martialesID = result.insertId;
							console.log('Comp_martialesOK : '+comp_martialesID);
							callback(null, comp_martialesID);
						}
					});
				},
				languesID: function(callback){
					connection.query('INSERT INTO langues VALUES (NULL'+querySQL4+')', function(err, result) {
						if(err) throw err;
						else {
							languesID = result.insertId;
							console.log('LanguesOK : '+languesID);
							callback(null, languesID);
						}
					});
				},
				arme1ID: function(callback){
					connection.query('INSERT INTO armes VALUES (NULL'+querySQL5+')', function(err, result) {
						if(err) throw err;
						else {
							arme1ID = result.insertId;
							console.log('Arme1OK : '+arme1ID);
							callback(null, arme1ID);
						}
					});
				},
				arme2ID: function(callback){
					connection.query('INSERT INTO armes VALUES (NULL'+querySQL6+')', function(err, result) {
						if(err) throw err;
						else {
							arme2ID = result.insertId;
							console.log('Arme2OK : '+arme2ID);
							callback(null, arme2ID);
						}
					});
				},
				arme3ID: function(callback){
					connection.query('INSERT INTO armes VALUES (NULL'+querySQL7+')', function(err, result) {
						if(err) throw err;
						else {
							arme3ID = result.insertId;
							console.log('Arme3OK : '+arme3ID);
							callback(null, arme3ID);
						}
					});
				},
				arme4ID: function(callback){
					connection.query('INSERT INTO armes VALUES (NULL'+querySQL8+')', function(err, result) {
						if(err) throw err;
						else {
							arme4ID = result.insertId;
							console.log('Arme4OK : '+arme4ID);
							callback(null, arme4ID);
						}
					}); 
				},
				arme5ID: function(callback){
					connection.query('INSERT INTO armes VALUES (NULL'+querySQL9+')', function(err, result) {
						if(err) throw err;
						else {
							arme5ID = result.insertId;
							console.log('Arme5OK : '+arme5ID);
							callback(null, arme5ID);
						}
					});
				},
				armureID: function(callback){
					connection.query('INSERT INTO armures VALUES (NULL'+querySQL10+')', function(err, result) {
						if(err) throw err;
						else {
							armureID = result.insertId;
							console.log('ArmureOK : '+armureID);
							callback(null, armureID);
						}
					});
				},
				bouclierID: function(callback){
					connection.query('INSERT INTO armures VALUES (NULL'+querySQL11+')', function(err, result) {
						if(err) throw err;
						else {
							bouclierID = result.insertId;
							console.log('BouclierOK : '+bouclierID);
							callback(null, bouclierID);
						}
					});
				}
			},
			function(err, results){
				if(err) throw err;
				var querySQL = ', '+connection.escape(current.me.userid);
				for(var key in data.background) {
					querySQL += ', '+connection.escape(data.background[key]);
				}
				console.log(results.caracID);
				querySQL += ', '+results.caracID+', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+connection.escape(arrayClass[data.background.classe].hpbase + (data.carac.con - 10) / 2)+', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+connection.escape(data.armures.armure.ca)+', '+connection.escape(data.armures.bouclier.ca)+', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+results.comp_rangID+', '+results.comp_modifID+', '+results.comp_martialesID+', '+results.languesID+', '+results.arme1ID+', '+results.arme2ID+', '+results.arme3ID+', '+results.arme4ID+', '+results.arme5ID+', '+connection.escape(data.armes.infos_sup)+', '+results.armureID+', '+results.bouclierID+', '+connection.escape(data.sac1)+', '+connection.escape(data.sac2)+', '+connection.escape(data.dons);
				console.log(querySQL);
				var backgroundID;
				connection.query('INSERT INTO chars VALUES (NULL'+querySQL+')', function(err, result) {
					if(err) throw err;
					else {
						backgroundID = result.insertId;
						console.log('BackgroundOK : '+backgroundID);
					}
				});
				

				socket.emit('PAGE_CHOICE');
			}
		);
	});

	socket.on('newmsgsent', function(data){
		fs.appendFile('public/chat.htm', '<p class="content font' + data.font + '"><strong class="pseudochat">' + current.me.login + '</strong> ' + data.message + '</p><br />', function(err){
			if(err) throw err;
		});
		io.sockets.emit('newmsg');
	});

	socket.on('changeSize', function(size){
		map.size = size;
		io.sockets.emit('changeMap', map);
	});
	socket.on('changeWidth', function(width){
		map.width = width;
		io.sockets.emit('changeMap', map);
	});
	socket.on('changeHeight', function(height){
		map.height = height;
		io.sockets.emit('changeMap', map);
	});
	socket.on('changeImage', function(image){
		map.image = image;
		console.log(image);
		io.sockets.emit('changeMap', map);
	});

});

server.listen(port);