(function() {
    var _this;
    
    /*
     * Constructor
     */
    Asdf = function() {
        // Reference to root
        _this = this;
        
        // Get dom elements
        var buttons = this.getButtons();
       
        this.dom = {};
        this.dom.body = document.getElementsByTagName('body')[0];
        this.dom.wrapper = document.getElementsByClassName('wrapper')[0];
        this.dom.controls = this.getId('controls');
        this.dom.spacebar = this.getId('space');
        this.dom.esc = this.getId('esc');
        this.dom.one = this.getId('one');
        this.dom.two = this.getId('two');
        this.dom.three = this.getId('three');
        this.dom.up = this.getId('up');
        this.dom.down = this.getId('down');
        this.dom.message = this.getId('message');
        this.dom.status = this.getId('status');
        this.dom.score = this.getId('score');
        this.dom.level = this.getId('level');
        this.dom.tweet = this.getId('tweet');
        this.dom.tweetlink = this.getId('tweet-link');
        this.dom.noclick = this.getId('noclick');
        this.dom.info = this.getId('info');
        this.dom.mode = this.getId('mode');
        this.dom.modetext = this.getId('mode-text');
        
        // Options
        this.o = {};
        this.o.elements = {};
        this.o.elements['a'] = buttons[0];
        this.o.elements['s'] = buttons[1];
        this.o.elements['d'] = buttons[2];
        this.o.elements['f'] = buttons[3];
        this.o.types = ['a', 's', 'd', 'f'];
        
        // Audio
        this.o.audio = [];
        this.o.volume = .15;
        this.o.wave = [];
        this.o.data = [];
        this.o.data['a'] = [];
        this.o.data['s'] = [];
        this.o.data['d'] = [];
        this.o.data['f'] = [];
        
        // Game
        this.o.list = [];
        this.o.count = 0;
        this.o.started = false;
        
        // Register listener
        this.dom.body.onkeydown = this.keyboard.receive;
        this.dom.body.onkeyup = this.keyboard.receive;
        this.dom.body.onclick = this.clickizr;
        
        // Button clicked stuff
        Events.subscribe('a', this.dong);
        Events.subscribe('s', this.dong);
        Events.subscribe('d', this.dong);
        Events.subscribe('f', this.dong);
        
        // Game listener
        Events.subscribe('a-triggered', this.listener);
        Events.subscribe('s-triggered', this.listener);
        Events.subscribe('d-triggered', this.listener);
        Events.subscribe('f-triggered', this.listener);
        
        // Game mode
        Events.subscribe('mode', this.mode.change);
        
        // Init audio
        _this.audio.init();
        
        // Get focus
        this.dom.body.focus();
    }
        
    Asdf.prototype.getId = function(id) {
        return document.getElementById(id);
    }
 
    Asdf.prototype.mode = {
        number : 1,
 
        change : function() {
            _this.mode.number = arguments[0];

            // Restart game if running
            if (_this.o.started) {
                _this.o.started = false;
                _this.game.live = false;
                _this.gogogo();
            }
    
            // normal
            if (_this.mode.number == 1) {
                _this.mode.switchMode('normal');
                
                // status: true
                _this.dom.status.style.display = 'block';
                
                for (i = 0; i < _this.o.types.length; i++) {
                    var type = _this.o.types[i];
                    
                    // button text : true
                    _this.o.elements[type].style.color = '';
                    _this.o.elements[type].style.textShadow = '';
                }
            }
                
            // not easy
            if (_this.mode.number == 2) {
                _this.mode.switchMode('not easy');
                
                // status: true
                _this.dom.status.style.display = 'block';
                
                for (i = 0; i < _this.o.types.length; i++) {
                    var type = _this.o.types[i];
                    
                    // button text : true
                    _this.o.elements[type].style.color = '';
                    _this.o.elements[type].style.textShadow = '';
                }
            }

            // hell
            if (_this.mode.number == 3) {
                _this.mode.switchMode('hell');
                
                // status: false
                _this.dom.status.style.display = 'none';
                
                for (i = 0; i < _this.o.types.length; i++) {
                    var type = _this.o.types[i];
                    
                    // button text : false
                    _this.o.elements[type].style.color = 'transparent';
                    _this.o.elements[type].style.textShadow = 'none';
                }
            }
        },
            
       getMode : function() {
            switch (_this.mode.number) {
                case 1 : return 'normal';
                break;
            
                case 2 : return 'not easy';
                break;
                    
                case 3 : return 'hell';
                break;
                    
                default:; 
            }
       },
            
        switchMode : function(text) {
            _this.dom.modetext.innerHTML = text;   
            _this.dom.modetext.className = 'active';    

            _this.dom.body.className = text.split(' ').join('');
            setTimeout(function() {
                _this.dom.modetext.className = '';
            }, 250);
        },
            
        getLevel : function() {
            var listLength = _this.o.list.length;
            
            switch (_this.mode.number) {
                case 2 : listLength = listLength / 2;
                break;
                    
                case 3 : listLength = listLength / 2;
                break;
                    
                default:; 
            }
 
            return listLength;
        },
            
        getScore : function() {
            var score = parseInt(_this.dom.score.innerHTML) + (_this.o.list.length * _this.o.list.length);

            switch (_this.mode.number) {
                case 2 : score = parseInt(score * 1.5);
                break;
                    
                case 3 : score = parseInt(score * 3);
                break;
                    
                default:; 
            }
 
            return score;
            
        }
    }
       
    /*
     * Display messages
     */       
    Asdf.prototype.message = {
        show : function(o) {
           _this.message.hide();
    
           // Predefined message: game over
           if (o.type == 'lose') {
               _this.dom.message.className += ' lose';
               _this.dom.controls.className += ' inactive';
               _this.dom.wrapper.className += ' inactive';
               _this.dom.body.className += ' inactive';
               
               var type = _this.o.list[_this.o.count],
                   level = (parseInt(_this.dom.level.innerHTML) - 1);
               
               _this.dom.message.innerHTML = 
                   '<div class="container">'+
                   '<h2>GAME OVER</h2>'+
                   '<p>' + 
                     '<b>score</b> <span class="info-style">' + _this.dom.score.innerHTML + '</span> '+
                     '<b>level</b> <span class="info-style">' + level + '</span>'+
                   
                     '<b>mode</b> <span class="info-style">' + _this.mode.getMode() + '</span>'+
                   '</p>'+
                   '<hr>'+
                   '<p>'+
                     '<a id="tweet-link" href="http://twitter.com/share?text=Can+you+beat+my+score+'+_this.dom.score.innerHTML+'+on+level+' + level + '+(' + _this.mode.getMode() + ')?&via=js13kgames&hashtags=asdf&url=http://js13kgames.com/entries/asdf" target="_blank"><button id="tweet" class="key">t</button> Tweet your score</a>'+
                   '</p>'+
                   '<hr class="small">'+
                   '<p>'+
                     '<button class="key '+type+'">'+type+'</button> was the next key,'+
                   '</p>'+
                   '<p>'+
                   'but you pushed <button class="key '+o.key+'"">'+o.key+'</button> <b class="smiley">D:</b>'+
                   '</p>'+
                   '</div>';
           }
    
           // Predefined message: level completed
           if (o.type == 'win') {
               _this.dom.message.className += ' win';
               _this.dom.message.innerHTML = '<div class="container"><h1>LEVEL COMPLETED</h1></div>';
           }

            if (o.type == 'levelmode') {
                _this.dom.message.className += ' levelmode';
                _this.dom.message.innerHTML = '<div class="container"><h1>' + o.text + '</h1></div>';
            }
        
           // Show message
           _this.dom.message.className += ' active';
        },
        hide : function() {
           _this.dom.message.className = '';
           _this.dom.controls.className = '';
           _this.dom.body.className = _this.dom.body.className.replace('inactive', '');
           _this.dom.wrapper.className = 'wrapper';     
        }
    }
    
    /*
     * Handle audio
     */            
    Asdf.prototype.audio = {
        
        init : function() {
            var i = 5000;
            while (i<15000) { 
                _this.o.data['a'][i++] = 64+Math.round(32*(Math.cos(i*i/2000)+Math.sin(i*i/4000)));
                _this.o.data['a'][i++] = 64+Math.round(32*(Math.cos(i*i/2000)+Math.sin(i*i/4000)));
                //_this.o.data['a'][i++] = 128+Math.round(97*Math.sin(i/90)); // left speaker
                //_this.o.data['a'][i++] = 88+Math.round(87*Math.cos(i/60)); // right speaker
            }
    
            i = 10000;
            while (i<20000) { 
                _this.o.data['s'][i++] = Math.round(Math.cos(i % 100) * 5);
                _this.o.data['s'][i++] = Math.round(Math.cos(i % 100) * 5);
            }
    
            i = 1000;
            while (i<15000) { 
                _this.o.data['d'][i++] = 228+Math.round(87*Math.cos(i/20));
                _this.o.data['d'][i++] = 128+Math.round(97*Math.cos(i/80)); 
            }
    
            i = 8000;
            while (i<20000) { 
                /*_this.o.data['f'][i++] = 88+Math.round(87*Math.cos(i/20));
                _this.o.data['f'][i++] = 88+Math.round(87*Math.cos(i/60)); */
                _this.o.data['f'][i++] = Math.abs(250 - (i % 180));
                _this.o.data['f'][i++] = Math.abs(250 - (i % 180));
            }
    
            for (var x = 0; x < _this.o.types.length; x++) {
                var type = _this.o.types[x];
                
                _this.o.wave[type] = new RIFFWAVE();
                _this.o.wave[type].header.sampleRate = 44100;
                _this.o.wave[type].header.numChannels = 2;
                _this.o.wave[type].Make(_this.o.data[type]); 
                
                _this.o.audio[type] = new Audio();
                _this.o.audio[type].volume = _this.o.volume;
                _this.o.audio[type].src = _this.o.wave[type].dataURI; // set audio source
            }
    
        },
            
        play : function(type) {
            if (_this.o.volume > 0) {
                _this.o.audio[type].currentTime = 0;
                _this.o.audio[type].play();    
            }
        },
            
        volumeUp : function() {
            if (_this.o.volume < .92) {
                _this.o.volume += .05;
                _this.audio.changeVolume();
            }
        },
            
        volumeDown : function() {
            if (_this.o.volume > 0) {
                _this.o.volume -= .05;

                if (_this.o.volume <= 0) {
                    _this.o.volume = 0;
                }

                _this.audio.changeVolume();
            }
        }, 
                
        changeVolume : function() {
            for (var x = 0; x < _this.o.types.length; x++) {
                var type = _this.o.types[x];
                _this.o.audio[type].volume = _this.o.volume;
            }
        }
    }
                
    /*
     * Handle keyboard interactions
     */    
    Asdf.prototype.keyboard = {
                
        receive : function(e) {
          
            // spacebar
            if (e.keyCode == 32) {
                e.preventDefault();
                
                if (e.type == 'keydown') {
                   _this.gogogo();
                }
                _this.keyboard.pushState(e, _this.dom.spacebar);
            }
                    
            // esc
            if (e.keyCode == 27) {
                if (e.type == 'keydown') {
                    _this.game.reset();
                    _this.game.live = false;
                }
                _this.keyboard.pushState(e, _this.dom.esc);
            }
                
            // left
            if (e.keyCode == 37) {
                if (e.type == 'keydown') {
                  _this.audio.volumeDown();
                }
                _this.keyboard.pushState(e, _this.dom.up);
            }
                
            // right
            if (e.keyCode == 39) {
                if (e.type == 'keydown') {
                    
                    _this.audio.volumeUp();
                }
                _this.keyboard.pushState(e, _this.dom.down);
            }
                
            // 1 - mode: normal
            if (e.keyCode == 49) {
                if (_this.dom.mode.mode[0].checked) {
                    Events.publish('mode', [1]);
                }
                _this.dom.mode.mode[0].checked = true;
                _this.keyboard.pushState(e,  _this.dom.one);
            }

            // 2 - mode: expert
            if (e.keyCode == 50) {
                if (_this.dom.mode.mode[1].checked) {
                    Events.publish('mode', [2]);
                }
                _this.dom.mode.mode[1].checked = true;
                _this.keyboard.pushState(e,  _this.dom.two);
            }

            // 3 - mode: hell
            if (e.keyCode == 51) {
                if (_this.dom.mode.mode[2].checked) {
                    Events.publish('mode', [3]);
                }
                _this.dom.mode.mode[2].checked = true;
                _this.keyboard.pushState(e,  _this.dom.three);
            }
            
            // a
            if (e.keyCode == 97 || e.keyCode == 65) {
                Events.publish('a', ['a', e.type]);
            }
            
            // s
            if (e.keyCode == 115 || e.keyCode == 83) {
                Events.publish('s', ['s', e.type]);
            }
            
            // d
            if (e.keyCode == 100 || e.keyCode == 68) {
                Events.publish('d', ['d', e.type]);
            }
            
            // f
            if (e.keyCode == 102 || e.keyCode == 70) {
                Events.publish('f', ['f', e.type]);
            }
            
            // t
            if (e.keyCode == 84) {
                if (e.type == 'keydown') {
                    _this.dom.tweetlink = _this.getId('tweet-link');
                    
                    if (_this.dom.tweetlink != undefined) {
                        window.open(_this.dom.tweetlink.href, 'asdf-tweet-your-score');
                    }
                }
            }            
        },
                
        pushState : function(e, element) {
          if (e.type == 'keydown') {
              element.className = element.className.replace('active', '');
              element.className += ' active';
          } else {
              element.className = element.className.replace('active', '');
          }
       }
    }
    
    // @TODO: Create some awesome stuff :D                
    Asdf.prototype.clickizr = function(e) {
    }
                
    Asdf.prototype.getButtons = function(id) {
        return document.getElementById('gaming-buttons').getElementsByTagName('button');
    }

    /*
     * Handle the button active/inactive state and events
     */    
    Asdf.prototype.dong = function() {
        var type = arguments[0],
            event = arguments[1];
        
        // Handle css stuff
        if (event == 'keyup') {
            _this.o.elements[type].className = '';
        } else {
            _this.o.elements[type].className = 'active';
            
            // Playback riff sounds
            _this.audio.play(type);
            
            // Fire game stuff
            Events.publish(type + '-triggered', [type, _this.o.count]);
        }
    }
        
    Asdf.prototype.gogogo = function() {
        // Game is not started/finished
        if (!_this.game.live) {
            _this.game.live = true;
        
            _this.game.reset();
            
            _this.dom.info.className = 'active';
        
            // Trigger the game
            _this.game.next();
        }
    }
            
    Asdf.prototype.addElement = function() {
        if (_this.mode.number >= 2) {
            _this.o.list.push(_this.o.types[(Math.floor(Math.random() * _this.o.types.length))]);
        }
            
        _this.o.list.push(_this.o.types[(Math.floor(Math.random() * _this.o.types.length))]);
    }
    
    // Handle game stuff        
    Asdf.prototype.game = {
        count : 0,
        
        live : false,
        
        reset : function() {
            count = 0;
       
            // Reset the game
            _this.o.started = false;

            // Reset level list
            _this.o.list = [];

            // Hide info (score/level)
            _this.dom.info.className = '';

            // Reset score
            _this.game.updateScore();

            // Reset level count
            _this.dom.level.innerHTML = 0;

            // Hide message
            _this.message.hide();

            // Hide status
            _this.game.status.hide();
        },
        
        next : function() {
            count = 0;
        
            // Next element
            _this.addElement();

            // Show message
            _this.message.show({type : 'levelmode', text : 'LEVEL ' + _this.mode.getLevel() + ' <span class="info-style-2">' + _this.mode.getMode() + '</span>'});

            // Update level
            _this.game.updateLevel();

            // Trigger the game
            setTimeout(function() {
                _this.trigger(_this.o.list, count);
            }, 350);
        },
        
        won : function() {
            _this.o.started = false;

            // Update score
            _this.game.updateScore();

            // Hide status
            _this.game.status.hide();
                    
            _this.o.count = 0;
           
            _this.message.show({type : 'win'});

            setTimeout(function() {
                _this.game.next();
            }, 750);
        },
            
        lose : function(wrongtype) {
            _this.message.show({type : 'lose', key : wrongtype});

            _this.game.live = false;
            _this.o.started = false;
            _this.o.count = 0;
        },
            
        updateScore : function() {
            var width = 8,
                score = _this.mode.getScore();
              
            if (_this.o.list.length == 0) {
                score = 0;                
            }
            
            width -= score.toString().length;

            // Fill with zero
            if (width > 0) {
                score = new Array( width + (/\./.test( score ) ? 2 : 1) ).join( '0' ) + score;
            }

            // Change text
            _this.dom.score.innerHTML = score + "";

            // Update effect
            _this.dom.score.className = 'active';
            setTimeout(function() {
                    _this.dom.score.className = '';
            }, 250);
        },
            
        updateLevel : function() {
            _this.dom.level.innerHTML = _this.mode.getLevel();

            // Update effect
            if (_this.o.list.length > 0) {
                _this.dom.level.className = 'active';
                setTimeout(function() {
                    _this.dom.level.className = '';
                }, 250);
            }
        },
            
        status : {
            show : function(options) {
                _this.dom.status.innerHTML = options.text;

               // if (_this.dom.status.className.search('active'
                _this.dom.status.className = _this.dom.status.className.replace('active', '');
                _this.dom.status.className += ' active';
            },
            
            hide : function() {
                _this.dom.status.className = _this.dom.status.className.replace('active', '');

            }
        }
    }
        
    Asdf.prototype.trigger = function(list, count) {
        var type = list[count];
        
        setTimeout(function() {
            Events.publish(type, [type, 'keydown']);
            
            // Listen ultra fast
            if (list[count + 1] == undefined) {
              _this.o.started = true;
              
              // Hide message
              _this.message.hide();
               
              // Show process
              _this.game.status.show({ text : _this.o.count + '/' + _this.o.list.length});
              
              setTimeout(function() {
                Events.publish(type, [type, 'keyup']);
              }, 250);
            } else {
    
            setTimeout(function() {
                Events.publish(type, [type, 'keyup']);
                
                if (list[count++] != undefined) {
                    setTimeout(function() {
                        _this.trigger(list, count);
                    }, 50);
                } else {
                    _this.o.started = true;
                    
                   // Hide message
                   _this.message.hide();
                    
                   // Show process
                   _this.game.status.show({ text : _this.o.count + '/' + _this.o.list.length});
                }
            }, 200);
            }
        }, 150);
    }
        
    Asdf.prototype.listener = function(type, count) {
        var type = arguments[0],
            count = arguments[1];
    
        // Don't start until the show is over
        if (_this.o.started) {
                // Playing
                if (type == _this.o.list[count]) {
                    _this.o.count++;
                    
                    // Show process
                    _this.game.status.show({ text : _this.o.count + '/' + _this.o.list.length});
                    
                    // Game won
                    if (_this.o.list[count + 1] == undefined) {
                      _this.game.won();                        
                    }
                } else {
                    _this.game.lose(type);
                }
        }
    }
        
   
    function domLoaded() {
      if (document.readyState === 'complete') {
          /* A new game */
          var Game = new Asdf();
      } else {
          setTimeout(function() {
              domLoaded();
          }, 25);
      }
    }

    // DOM loaded
    domLoaded();

}).call(this);