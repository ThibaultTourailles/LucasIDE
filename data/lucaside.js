var app = module.exports = require('appjs');

app.serveFilesFrom(__dirname + '/content');

//Début du menu		  
var menubar = app.createMenu([
//Menu Fichier
{
  label:'Fichier',
  submenu:[
	//Menu Nouveau
	{
      label:'Nouveau Projet			Ctrl+N',
	  action: function(){
			window.dispatchEvent(new window.Event('lucaside-new-project'));
		}	  
    },
	//Menu Enregistrer
	{
      label:'Enregistrer',
	  submenu:[
		{
			label:'Fichier courant			Ctrl+S',
			action: function(){
			window.dispatchEvent(new window.Event('lucaside-savefile'));
			}
		},
		{
			label:'Tous les fichiers			Ctrl+Shift+S',
			action: function(){
			window.dispatchEvent(new window.Event('lucaside-saveall'));
			}
		}
	  ]
    },{
      label:''//separator
    },
	//Quitter
	{
      label:'Quitter			Alt+F4',
      action: function(){
        window.close();
      }
    }
  ]
},
//Menu Edition
{
  label:'Edition',
  submenu:[
	{
      label:'Annuler		Ctrl+Z',  
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-undo'));
      }
    },
	{
      label:'Refaire		Ctrl+Shift+Z',  
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-redo'));
      }
    },{
      label:''//separator
    },
	{
      label:'Tout sélectionner		Ctrl+A', 
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-selectall'));
      }	  
    },{
      label:''//separator
    },
	{
	 label:'Rechercher		Ctrl+F', 
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-find'));
      }
	},
	{
	 label:'Remplacer		Ctrl+R', 
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-replace'));
      }
	}
	]
},
//Menu Fenêtre
{
  label:'Fenêtre',
  submenu:[
    {
      label:'Plein écran		F10',
      action:function() {
        window.frame.fullscreen();
      }
    },
    {
      label:'Réduire',
      action:function(){
        window.frame.minimize();
      }
    },
    {
      label:'Agrandir',
      action:function(){
        window.frame.maximize();
      }
    },{
      label:''//separator
    },{
      label:'Restorer',
      action:function(){
        window.frame.restore();
      }
    }
  ]
},
//Menu Exécuter
{
	label:'Exécuter',
	submenu:[
	{
	  label:'Lancer',
	  submenu:[
		{
			label:'Avec représentation			F5',
			action:function(){
			window.dispatchEvent(new window.Event('lucaside-run-representation'));
			}
		},
		{
			label:'Terminal			Ctrl+F5',
			 action:function(){
			window.dispatchEvent(new window.Event('lucaside-run-terminal'));
			}
		}
		]
	},
	{
	  label:'Configuration de lancement',
	  action:function(){
        window.dispatchEvent(new window.Event('lucaside-runsettings'));
      }
	}
	]
},
//Menu Option
{
  label:'Options',
  submenu:[
  {
    label:'Changer de thème',
    action:function(){
        window.dispatchEvent(new window.Event('lucaside-theme-change'));
      }   
  },
  {
    label:'Changer de vue',
	submenu:[
		{
			label:'Editeur			F6',
			action: function(){
			window.dispatchEvent(new window.Event('lucaside-edit-view'));
			}
		},
		{
			label:'Représentation 			Ctrl+F6',
			action: function(){
			window.dispatchEvent(new window.Event('lucaside-representation-view'));
			}
		},
		{
			label:'Terminal		Ctrl+Alt+F6',
			action: function(){
			window.dispatchEvent(new window.Event('lucaside-terminal-view'));
			}
		}
	  ]   
  }
  ]
}
]);
//Fin du menu

var window = app.createWindow({
  width  : 1024,
  height : 768,
  icons  : __dirname + '/content/icons'
});

window.on('create', function(){
  window.frame.show();
  window.frame.center();
  window.frame.setMenuBar(menubar);
  window.frame.maximize();
});

window.on('ready', function(){
  window.process = process;
  window.module = module;
  window.require = require;
  window.dispatchEvent(new window.Event('ready'));
});

