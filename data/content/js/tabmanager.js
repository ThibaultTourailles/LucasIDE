var TabManager = {

	currentIndexName : "", 				// Nom du tab en court
	currentIndexInt : 0,				// Index courant
	size : 0, 							// Nombre d'onglets ouvert
	anchorMaxWidth : 150, 				// Largeur maximum pour un onglet
	editors : new Object(),				// Tableau contenant les editors { "nomDuTab" : instance editor associée }
	editDivs : new Object(),			// div respectif des editors
	tabs : $("#tabs").tabs(),			// Object Tabs JQuery UI
	fadeTime : 400,						// Temps de fadeIn et fadeOut des onglets
	theme : "ace/theme/tomorrow_night", // Theme par défault				

	init : function(){
		// Click sur la croix pour fermer un onglet
		// .on() ne marche pas WTF
		$( "#tabs span.ui-icon-close" ).live( "click", function() {
			TabManager.closeTab( $( this ).closest( "li" ).find("a").attr("href").substring(1) ) ;
		});

		// Au changement de Tab
		$("#tabs").on( "tabsactivate", function( event, ui ) { 
		   var identifier = ui.newPanel[0].id;
		   TabManager.openTab(identifier);
		});

		// Resize de la page
		$(window).on("resize" , function () { 
			TabManager.resizeTabs(); 
		});

		//Event de changement de theme
		$( "#dialog-theme-change" ).dialog({
		  autoOpen: false,
		  height: 300,
		  width: 350,
		  modal: true,
		  buttons: {
		    "Changer le thème": function() {
		    	TabManager.changeTheme("ace/theme/" + $("#themeChooser").val());
		        $( this ).dialog( "close" );
		      },
			  "Annuler": function() {
			    $( this ).dialog( "close" );
			  }
		  },
		  close: function() {
		    $("#themeChooser").val( TabManager.theme );
		  }
		});
	},

	setProperties : function(editor) {
		editor.setTheme(TabManager.theme);
		editor.setShowPrintMargin(false);
		editor.getSession().setMode("ace/mode/lucas");
		editor.getSession().setTabSize(4);
		editor.getSession().setUseSoftTabs(true);

		//Contrôle de changements
		editor.hasChanged = false;
		editor.on("change", function(e){
			if(!editor.hasChanged){
				editor.hasChanged = true;
				TabManager.updateNames();
			}
		});
	},

	changeTheme : function ( themeName ){
		if(themeName != this.theme){
			for ( var propName in TabManager.editors) {
				this.editors[propName].setTheme(themeName);
			} 
			this.theme = themeName;
			this.saveConfig();
			launcheditor.setTheme(themeName);
		}
	},

	/*
	 * Ajoute un fichier avec son contenu,
	 * si le fichier existe déjà, retourne undefined,
	 * sinon retourne le div du fichier.
	 * Le nom doit correspondre a la regex suivante : ^(\/[a-zA-Z_\-0-9]+)+(\.luk)*$
	 * Retourne le div contenant l'editor
	 */
	addFile : function( fileAbsName , content ){
		if(fileAbsName.match(/^(\/[a-zA-Z_\-0-9]+)+(\.luk)*$/)){
			if(this.editors[fileAbsName] === undefined){
				if(content == undefined){
					content = "";
				}

				console.log("Ajout du fichier : " + fileAbsName);
				console.log("Contenu : " + content);

				var tempDiv = document.createElement("div");
				tempDiv.appendChild(document.createTextNode(content)); 
				this.editors[fileAbsName] = ace.edit(tempDiv); 	// objet ace
				this.editDivs[fileAbsName] = tempDiv;			// objet div 
		    	this.setProperties(this.editors[fileAbsName]);
				return tempDiv;
			}else{
				console.error("Le fichier existe déjà vous devez le supprimer, ou utiliser updateFile(nomDuFicher , Contenu)");
				return;
			}
		}else{
			console.error("Nom de fichier invalide. Le nom doit correspondre a la regex suivante : ^(\/[a-zA-Z_\-0-9]+)+(\.luk)*$");
			return;
		}
	},

	/*
	 * Supprime un fichier s'il existe sinon ne fait rien.
	 */
	removeFile : function( fileAbsName ){
		if(this.editors[fileAbsName] != undefined){
			this.editors[fileAbsName] = undefined;
			this.editDivs[fileAbsName] = undefined;
			this.closeTab(fileAbsName);
			console.log("Suppression du fichier : " + fileAbsName);
		}
		this.saveConfig();
	},

	/*
	 * Met à jour le contenu d'un fichier.
	 */
	updateFile: function ( fileAbsName , content ){
		if( this.editors[fileAbsName] != undefined ){
			TabManager.editors[fileAbsName].getSession().getDocument().setValue(content);
			TabManager.editors[fileAbsName].hasChanged = false;
		}
	},

	/*
	 * Renomme le fichier param1 en param2 
	 * correspond à un déplacement.
	 */
	renameFile : function( fileAbsName, newFileAbsName ){
		if(this.editors[newFileAbsName] != undefined){
			console.error("Le fichier existe déjà.");
		}else{
			this.editors[newFileAbsName] = this.editors[fileAbsName];
			this.editDivs[newFileAbsName] = this.editDivs[fileAbsName];
			this.openTab(newFileAbsName);
			this.removeFile(fileAbsName);
			console.log("Renommage du fichier : " + fileAbsName + " en : "+ newFileAbsName);
		}
	},

	/*
	 * Ferme le tab identifié par fileAbsName.
	 * S'il n'est pas ouvert ne fait rien.
	 */
	closeTab : function( fileAbsName ){

		console.log("taille : " + this.size);
		if(this.size == 1 ){ // cas de la taille à 0
			TabManager.addTab("Welcome", document.getElementById("welcome").cloneNode(true));
			//TODO : afficher page de présentation
		}

		// cas de la modification non sauvegardée
		if(this.editors[fileAbsName] != undefined && this.editors[fileAbsName].hasChanged){
			var fileName = this.currentIndexName;
			var fileContent = this.getFileContent(this.currentIndexName);
			$( "#dialog-confirm-save" ).dialog({
		      resizable: false,
		      title: "Sauvegarde",
		      height: 300,
		      width: 400,
		      modal: true,
		      buttons: {
		        "oui": function() {
		        	WorkspaceManager.save( fileName, fileContent );
		        	$( this ).dialog( "close" );
		        },
		        "non": function() {
		        	TabManager.updateFile( fileName, WorkspaceManager.open( fileName ) );
		        	$( this ).dialog( "close" );
		        }
		      }
		    });
		    TabManager.editors[fileAbsName].hasChanged = false;
		    this.updateNames();
		}

		if(this.size > 1){
			var ind = this.findTabIndex(fileAbsName);
			if(ind != -1){
				console.log("Fermeture de l'onglet : " + fileAbsName);
				$($("#menu li")[ind]).remove();
				document.getElementById("tabs").removeChild(document.getElementById(fileAbsName));
				this.size--;
				this.tabs.tabs( "refresh" );
				if(ind - 1 < 0){
					ind = 0;
				}
				if(ind != TabManager.currentIndexInt )
					$("#tabs").tabs( "option", "active" , TabManager.currentIndexInt);
				else
					$("#tabs").tabs( "option", "active" , ind-1);
			}
		}

		this.saveConfig();

		this.resizeTabs();
	},

	/*
	 * Ouvre un tab avec l'editor fileAbsName.
	 * S'il est déjà ouvert, ouvre l'onglet.
	 * Le nom ne doit pas contenir d'espaces !!!!!!
	 */
	openTab : function ( fileAbsName ){
		if(fileAbsName.match(/^(\/[a-zA-Z_\-0-9]+)+(\.luk)*$/)){
			if(this.editDivs[fileAbsName] != undefined){
				var ind = this.findTabIndex(fileAbsName);
				if(ind == -1){
						this.addTab( fileAbsName , this.editDivs[fileAbsName] );
				}else{
					this.tabs.tabs( "refresh" );
					this.tabs.tabs( "option", "active" , ind);
				}
				this.editors[fileAbsName].resize(true);
				this.editors[fileAbsName].focus();
				
				this.currentIndexName = fileAbsName;
				this.currentIndexInt = ind;
				this.resizeTabs();
				this.tabs.tabs( "refresh" );

				this.updateNames();
			}else{
				console.error("Le fichier n'existe pas.");
				return;
			}
		}

		this.saveConfig();
	},

	/*
	 * Renvoi l'index du tab identifié par name sinon -1
	 */
	findTabIndex : function ( name ){
		var ind = -1;
		var counter = 0;
		var lis = $("#menu li");
		lis.each( function(){
			if( $(this).find("a").attr("href").substring(1) ==  name ){
				ind = counter;
			}
			counter++;
		} );
		return ind;
	},

	addTab : function( name , divContent ) {
		if(this.size == 15 ){ // cas de la taille à 24
			window.alert("Trop d'onglets sont ouverts en même temps.")
			return; // on quitte la fonction
		}

		console.log("Ouverture de l'onglet nommé : " + name);

		if (name == undefined){
			name = "/Random/Op/Name";
		}

		if(divContent == undefined){
			divContent = this.addFile(name , "");
		}

		var menu = document.getElementById("menu");
		var newLi = document.createElement("li");
		var newA = document.createElement("a");
		var newSpan = document.createElement("span");
		newSpan.className = "ui-icon ui-icon-close";
		newSpan.appendChild(document.createTextNode("Remove tab"));

		//mise à jour de la taille
		this.size++;

		/* -------- PARTIE HYPSTER ------ */
		newA.href = "#"+name; // id du div à faire apparaitre
		newA.appendChild(document.createTextNode(name));
		newLi.appendChild(newA);
		newLi.appendChild(newSpan);
		menu.appendChild(newLi);

	    var tabs = document.getElementById("tabs");
	    var div = document.createElement("div");
	    div.id = name;
	    var el = divContent;
	    div.appendChild(el);
	    tabs.appendChild(div);
	    /* ------- FIN PARTIE HYPSTER ------- */

	    TabManager.tabs.tabs( "refresh" );
	    $("#tabs").tabs( "select", this.size-1 );
	    this.resizeTabs();

	    $(newLi).hide(); // on cache l'objet
	    $(newLi).fadeIn(this.fadeTime); // on le réaffiche avec un fadeIn , ste classe..!
	},

	/*
	 * Mets a jour les noms s'il y a ou non des similitudes
	 */
	updateNames : function(){
		$("#menu li a").each(function (){
			var name = "";
			var anchorName = $(this).attr("href").substring(1);
			if(TabManager.editors[anchorName] != undefined && TabManager.editors[anchorName].hasChanged){
				name += "*"
			}
			splitStr = anchorName.split("\/");
			$(this).html(name + splitStr[splitStr.length-1]);
		});
	},

	//Resize tabs 
	// TODO : gérer la croix 
	resizeTabs : function (){

		this.updateNames();

		var maxWidth = parseInt($("#menu").css("width"));
		var totalWidth = 0;
	    $("#menu li").each(function (){
	    	width = $(this).css("margin" , "0")
	    					.css("width", "auto")
	    					.find("a") // On passe au a de chaque <li>
	    					.css("padding", "10")
	    					.css("width","auto");
	    	totalWidth += parseInt($(this).css("width"));
	    });
	    totalWidth+=75;
	    if(totalWidth > maxWidth){
	    	$("#menu li").each(function (){
	    		var width = parseInt($(this).css("width")) - ( (totalWidth - maxWidth) / TabManager.size );
	    		$(this).css("width" , width).find('a').css("width", width - 40);
	    	});
	    }
	},

	openFile : function( fileAbsName , content ){
		if(this.editors[fileAbsName] == undefined){
			this.addFile(fileAbsName, content);
		}
		this.openTab(fileAbsName);
	},

	getFileContent : function ( fileName ) {
		return this.editors[fileName].getValue();
	},

	saveFile : function ( fileName ) {
		if(this.editors[fileName] != undefined && this.editors[fileName].hasChanged){
			WorkspaceManager.save( fileName , this.getFileContent(fileName) );
			this.editors[fileName].hasChanged = false;
		}
		this.updateNames();
	},

	saveCurrentFile : function (){
		this.saveFile(this.currentIndexName);
	},

	saveAllFiles : function(){
		$("#menu li a").each(function (){
			TabManager.saveFile($(this).attr("href").substring(1));
		});
	},

	fileNameAtIndex : function( ind ){
		return $($("#menu li")[ind]).find("a").attr("href").substring(1);
	},

	saveConfig : function() {
		var editor = document.createElement("editor");

		var openTabs = document.createElement("openTabs");
		for (var i = 0 ; i < this.size ; i++ ){
			var tab = document.createElement("tab");
			tab.innerHTML = this.fileNameAtIndex(i);
			openTabs.appendChild(tab);
		}
		editor.appendChild(openTabs);

		var theme = document.createElement("theme");
		theme.innerHTML = this.theme;

		editor.appendChild(theme);
		WorkspaceManager.setConfig( editor );
	},
 
 	loadConfig : function(){
 		var conf = WorkspaceManager.getConfig();
 		if(conf == undefined || conf.getElementsByTagName("opentabs")[0] == undefined){
 			TabManager.addTab("Welcome", document.getElementById("welcome").cloneNode(true));
	 	}else{
	 		this.changeTheme($(conf.getElementsByTagName("theme")[0]).html());
			var mytheme = TabManager.theme.substr(10);
			$('#themeChooser option[value='+mytheme+']').attr("selected","selected");
	 		$(conf.getElementsByTagName("opentabs")[0].getElementsByTagName("tab")).each(function () {
	 			var name = $(this).html();
	 			if(name != "Welcome"){
	 				TabManager.openFile(name, WorkspaceManager.open(name));
	 			}else if(name == "Welcome"){
 					TabManager.addTab("Welcome", document.getElementById("welcome").cloneNode(true));
	 			}
	 		} );
	 	}
 	},

 	removeFolder : function ( folderName ) {
		for ( var fileName in TabManager.editors ) {
			if( fileName.match( folderName ) ){
				this.removeFile( fileName );
			}
		}
 	},
	
	removeProject : function ( projectName ) {
		for ( var fileName in TabManager.editors ) {
			if( fileName.match( projectName ) ){
				this.removeFolder( fileName );
			}
		}
 	}
}