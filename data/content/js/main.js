// Initialistion du TabManager
TabManager.init();

// Initialisation du WorkspaceManagere
WorkspaceManager.init();

// Initialisation des Config
RunConfig.init();


//TODO : charger les derniers paramètres ou afficher accueil
addEventListener("ready", function(){
	TabManager.loadConfig();
	RunConfig.loadConfig();
});

// Utilisation des menus lancant des events
//Nouveau Projet
addEventListener('lucaside-new-project', function(e){
	var fs   = window.require('fs');
	WorkspaceManager.openModal("projet", "/");
});

//Enregistrer fichier courant
addEventListener('lucaside-savefile', function(e){
	TabManager.saveCurrentFile();
});

//Enregistrer tous les fichiers
addEventListener('lucaside-saveall', function(e){
	TabManager.saveAllFiles(); 
});

//Annuler
addEventListener('lucaside-undo', function(e){
	var fs   = window.require('fs');
	TabManager.editors[TabManager.currentIndexName].undo();
});

//Refaire
addEventListener('lucaside-redo', function(e){
	var fs   = window.require('fs');
	TabManager.editors[TabManager.currentIndexName].redo();
});

//Tout sélectionner
addEventListener('lucaside-selectall', function(e){
 var fs = window.require('fs');
 TabManager.editors[TabManager.currentIndexName].selectAll();
});

//Rechercher //TODO
addEventListener('lucaside-find', function(e){
	var fs   = window.require('fs');
});

//Remplacer //TODO
addEventListener('lucaside-replace', function(e){
	var fs   = window.require('fs');
});

//Exécuter
addEventListener('lucaside-run-representation', function(e){
		wantRepresentation = true;
		window.dispatchEvent(new window.Event('lucaside-saveall'));
		if(RunConfig.firstLaunch){
				$( "#dialog-launch-config" ).dialog( "open" );
		}
		else{
				window.dispatchEvent(new window.Event('lucaside-representation-view'));
				sendRequest();
		}
});

addEventListener('lucaside-run-terminal', function(e){
		wantRepresentation = false;
		window.dispatchEvent(new window.Event('lucaside-saveall'));
		if(RunConfig.firstLaunch){
				$( "#dialog-launch-config" ).dialog( "open" );
		}
		else{
				window.dispatchEvent(new window.Event('lucaside-terminal-view'));
				sendRequest();
		}
});
 
 
function sendRequest() {
		var sys = window.require('sys');
		var fs = window.require('fs');
		var exec = window.require('child_process').exec;
		exec("soapclient.exe " + RunConfig.serverAddress + " askSession", function(error, stdout, stderr) {
						if (!RunConfig.isLocal && stderr != ""){
							$.gritter.add({
								title: 'Erreur !',
								text: 'Impossible de se connecter au serveur de compilation.',
							});
						}
						fs.writeFileSync("data.tmp", WorkspaceManager.getProject(TabManager.currentIndexName));
						sessID = stdout.replace("\n","")
						if (stderr != "" && RunConfig.isLocal && !RunConfig.alreadyLaunched) {
							exec("soapserver.exe", function(error, stdout, stderr) {
										console.log(stderr);
										console.log(stdout);

							});
							var start = new Date().getTime();
							for (var i = 0; i < 1e7; i++) {
							    if ((new Date().getTime() - start) > 2000){
							      break;
							    }
							}
							RunConfig.alreadyLaunched = true;
							sendRequest();
						}
						else {
							exec("soapclient.exe " + RunConfig.serverAddress + " processProject " + sessID + " data.tmp", function(error, stdout, stderr) {
									console.log(stderr);
									launcheditor.setValue(stdout);
									launcheditor.clearSelection();
									exec("soapclient.exe " + RunConfig.serverAddress + " getResults " + sessID, function(error, stdout, stderr) {
											console.log(stderr);
											var parseResult = parse(parser.parseFromString(stdout, "application/xml").firstChild);
											$(document).trigger("compilationReady" , parseResult );
									});
							});
						}
		});
}

//Options d'exécution //TODO
addEventListener('lucaside-runsettings', function(e){
	$( "#dialog-launch-config" ).dialog( "open" );
});

//Option changer de theme
addEventListener('lucaside-theme-change', function(e){
	$( "#dialog-theme-change" ).dialog( "open" );
});

//Changement de view
addEventListener('lucaside-edit-view', function(e){
	$('#edit-view').css ( 'visibility' , 'visible');
	$('#launch-view').css ( 'visibility' , 'hidden');
});

addEventListener('lucaside-representation-view', function(e){
	$('#edit-view').css ( 'visibility' , 'hidden');
	$('#launch-view').css ( 'visibility' , 'visible');
	$('#memoryDiv').css('display', 'block');
	$('#represDiv').css('display', 'block');
	$('#stackDiv').css('display', 'block');
	$('#codeDiv').css('display', 'block');
	$('#terminalDiv').css('height', '25%');	
	$('#terminalDiv').css('width', 'auto');
	$('#left').css('display', 'block');
	$('#right').css('width', '50%');
});

addEventListener('lucaside-terminal-view', function(e){
	$('#edit-view').css ( 'visibility' , 'hidden');
	$('#launch-view').css ( 'visibility' , 'visible');
	$('#memoryDiv').css('display', 'none');
	$('#represDiv').css('display', 'none');
	$('#stackDiv').css('display', 'none');
	$('#codeDiv').css('display', 'none');
	$('#terminalDiv').css('height', '100%');
	$('#left').css('display', 'none');
	$('#right').css('width', '100%');
	$('#terminalDiv').css('width', '100%');
});

//Gestion des raccourcis non définis par défaut
function F12(e){ return e.keyIdentifier === 'F12' }
function F10(e){ return e.keyIdentifier === 'F10' }
function F5(e){ return e.keyIdentifier === 'F5' }
function CtrlF5(e){ return e.ctrlKey && e.keyIdentifier === 'F5'}
function F6(e){ return e.keyIdentifier === 'F6' }
function CtrlF6(e){ return e.ctrlKey && e.keyIdentifier === 'F6'}
function CtrlAltF6(e){ return e.ctrlKey && e.altKey && e.keyIdentifier === 'F6'}
function CtrlN(e){ return e.ctrlKey && e.keyIdentifier === 'U+004E'}
function CtrlS(e){ return e.ctrlKey && e.keyIdentifier === 'U+0053'}
function CtrlShiftS(e){ return e.ctrlKey && e.shiftKey && e.keyIdentifier === 'U+0053'}
function CtrlF(e){ return e.ctrlKey && e.keyIdentifier === 'U+0046'}
function CtrlR(e){ return e.ctrlKey && e.keyIdentifier === 'U+0052'}


window.addEventListener('keydown', function(e){
//Mettre les combinaisons de touches( Ctrl+... ) avant les touches seules, sinon conflit.
	if (F12(e)) {
			window.frame.openDevTools();
		}
	else if (F10(e)) {
			window.frame.fullscreen();
		}
	else if (CtrlAltF6(e)) {
		window.dispatchEvent(new Event("lucaside-terminal-view"));
	}
	else if (CtrlF6(e)) {
		window.dispatchEvent(new Event("lucaside-representation-view"));
	}
	else if (F6(e)) {
			window.dispatchEvent(new Event("lucaside-edit-view"));
		}
	else if (CtrlF5(e)) {
		window.dispatchEvent(new Event("lucaside-run-terminal"));
	}
	else if (F5(e)) {
			window.dispatchEvent(new Event("lucaside-run-representation"));
	}
	else if (CtrlN(e)) {
		window.dispatchEvent(new Event("lucaside-new-project"));
	}	
	else if (CtrlShiftS(e)) {
			window.dispatchEvent(new Event("lucaside-saveall"));
	}
	else if (CtrlS(e)) {
			window.dispatchEvent(new Event("lucaside-savefile"));
		}
	else if (CtrlF(e)) {
			window.alert('Rechercher');
		}
	else if (CtrlR(e)) {
			window.alert('Remplacer');
		}	
});

// Initialisation du MemoryManager
var wantRepresentation;
var MMM = new MemoryManagerModel();
var MMV = new MemoryManagerView( document.getElementById("memory") , MMM );

var AM = new AnimationManager(document.getElementById("canvas"));

var parser = new DOMParser();

function parse( xmlData ) {
	if(xmlData.tagName == undefined){
		return document.createTextNode(xmlData.data);
	}else{
		var elem = document.createElement(xmlData.tagName);
		for( var i = 0 ; i < xmlData.attributes.length ; i++ ){
			elem.setAttribute( xmlData.attributes[i].name, xmlData.attributes[i].value )
		}
		for( var i = 0 ; i < xmlData.childNodes.length ; i++ ){
			elem.appendChild( parse( xmlData.childNodes[i] ) );
		}
		return elem;
	}
}

function terminal(string, input) {
	  var newLine = document.createElement("div");
	  var content = document.createElement("span");
	  var prompt = document.createElement("span");
	  var promptText = (input ? "LucasIDE > " :"LucasIDE < ");
	  prompt.appendChild(document.createTextNode(promptText));
	  content.appendChild(document.createTextNode(string));
	  $(content).attr("class", "line");
	  newLine.appendChild(prompt);
	  newLine.appendChild(content);
	  document.getElementById("terminal").appendChild(newLine);
	  $('#terminal').animate({scrollTop: $("#terminal")[0].scrollHeight}, 20);
}

function stackOut() {
  var element = document.getElementById("stack").childNodes[0];
  $(element).remove();
}

function clearTerminal() {
	document.getElementById("terminal").innerHTML = "<span class='line'>Welcome to LucasIDE's shell</span>";
}

function stackIn(elementName) {
  var oldHTML = document.getElementById("stack").innerHTML;
  document.getElementById("stack").innerHTML = "<div class='element lastElement'></div>" + oldHTML;
  
  $(".lastElement").append(elementName).hide().slideDown(400, function() {
	$(this).removeClass('lastElement');
  });
}

function clearStack() {
	document.getElementById("stack").innerHTML = "";
}

function clearCanvas() {
	document.getElementById("represDiv").innerHTML = "<div id='canvas'><div id='currentLine'></div><div id='movElem'></div></div></div>";
}