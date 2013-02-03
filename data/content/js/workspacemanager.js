var WorkspaceManager = {

	init : function() {

		// Verification de la conformité du workspace
		addEventListener('ready', function() {
			WorkspaceManager.testWorkspaceAndResetIfNeeded();
		});


	
		// Initialisation du File Tree
		addEventListener('ready', function() {
			$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
								TabManager.openFile(file, WorkspaceManager.open(file));
			});

		});
		
		// Initialisation des menus contextuels
		addEventListener('ready', function() {
				
				$(function(){
					$.contextMenu({
						selector: '.context-menu-workspace', 
						callback: function(key, options) {
							switch (key) {
							 case "nouvprojet" :
								WorkspaceManager.openModal("projet", "/");
								break;
							} 
						},
						items: {
							"nouvprojet": {name: "Nouv. Projet", icon: "edit"},
						}
					});
				});
				
				$(function(){
					$.contextMenu({
						selector: '.context-menu-projet', 
						callback: function(key, options) {
							var itemValue = options.$trigger[0].firstChild.attributes.getNamedItem("rel").nodeValue;
							switch (key) {
							 case "nouvfichier" :
								WorkspaceManager.openModal("fichier", itemValue);
								break;
							 case "nouvdossier":
								WorkspaceManager.openModal("dossier", itemValue);
								break;
							 case "supprimer":
								WorkspaceManager.remove(itemValue);
								break;
							} 
						},
						items: {
							"nouvfichier": {name: "Nouv. Fichier", icon: "edit"},
							"nouvdossier": {name: "Nouv. Dossier", icon: "edit"},
							"supprimer": {name: "Supprimer", icon: "delete"},
						}
					});
				});
			
				$(function(){
					$.contextMenu({
						selector: '.context-menu-fichier', 
						callback: function(key, options) {
							var itemValue = options.$trigger[0].firstChild.attributes.getNamedItem("rel").nodeValue;
							switch (key) {
							 case "ouvrir":
								TabManager.openFile(itemValue, WorkspaceManager.open(itemValue));
								break;
							 case "supprimer":
								WorkspaceManager.remove(itemValue);
								break;
							} 
						},
						items: {
							"ouvrir": {name: "Ouvrir", icon: "edit"},
							"supprimer": {name: "Supprimer", icon: "delete"},
						}
					});
				});
				
				$(function(){
					$.contextMenu({
						selector: '.context-menu-dossier', 
						callback: function(key, options) {
							var itemValue = options.$trigger[0].firstChild.attributes.getNamedItem("rel").nodeValue;
							switch (key) {
							 case "nouvfichier" :
								WorkspaceManager.openModal("fichier", itemValue);
								break;
							 case "nouvdossier":
								WorkspaceManager.openModal("dossier", itemValue);
								break;
							 case "supprimer":
								WorkspaceManager.remove(itemValue);
								break;
							} 
						},
						items: {
							"nouvfichier": {name: "Nouv. Fichier", icon: "edit"},
							"nouvdossier": {name: "Nouv. Dossier", icon: "edit"},
							"supprimer": {name: "Supprimer", icon: "delete"},
						}
					});
				});
				
			$("#dialog-workspace-form").bind("keypress", function(e) {
				if (e.keyCode == 13) {
					return false;
				}
			});
		});

	
	},
	
	exportFileTree : function(dir)  {

	
		var fs = window.require("fs");
		
		var res = "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		if (dir == "/") {
			var filesystems = workspaceDoc.getElementsByTagName("fs");
			for ( i = 0; i < filesystems.length; i++) {
				var arbo = filesystems[i].childNodes;
				for (j = 0 ; j < arbo.length ; j += 1) {
					res += "<li class=\"directory collapsed context-menu-projet\"><a href=\"#\" rel=\""+ arbo.item(j).attributes.getNamedItem("name").value+"\">"+arbo.item(j).attributes.getNamedItem("name").value.replace(/\//g,"")+"</a></li>" ; 
				}
			}
		}
		else {
			var filesystems = workspaceDoc.getElementsByName(dir);
			for ( i = 0; i < filesystems.length; i++) {
				var arbo = filesystems[i].childNodes;
				for (j = 0 ; j < arbo.length ; j += 1) {
					var nom = arbo.item(j).attributes.getNamedItem("name").value.split("/");
					if (arbo.item(j).tagName == "folder"){
						res += "<li class=\"directory collapsed context-menu-dossier\"><a href=\"#\" rel=\""+ arbo.item(j).attributes.getNamedItem("name").value+"\">"+nom[nom.length - 2]+"</a></li>" ; 
					}
					else {
						res += "<li class=\"file ext_txt context-menu-fichier\"><a href=\"#\" rel=\""+ arbo.item(j).attributes.getNamedItem("name").value+"\">"+nom[nom.length -1]+"</a></li>" ; 
					}
				}
			}
		}
		
		return res;
	},
	
	open : function(name){
			
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		var file = workspaceDoc.getElementsByName(name);
		
		content = file[0].textContent;
		
		return content;
	
	},
	
	save : function(name, content){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc = parser.parseFromString(XMLFile,"text/xml");
		
		file = workspaceDoc.getElementsByName(name);
		
		file[0].textContent = content;

		var xmlString = new XMLSerializer().serializeToString( workspaceDoc );
		
		fs.writeFileSync("workspace.xml", xmlString);
		
		$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
			TabManager.openFile(file, WorkspaceManager.open(file));
		});
		
	},
	
	remove : function(name){
		
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		var file = workspaceDoc.getElementsByName(name);
		
		if(file[0].tagName == "file"){
			TabManager.removeFile(name);
			file[0].parentNode.removeChild(file[0]);
		}else if(file[0].tagName == "folder" && this.isProject(file[0].attributes.getNamedItem("name").nodeValue)){
			TabManager.removeProject(name);
			project = file[0].parentNode.parentNode;
			project.parentNode.removeChild(project);
		}else if(file[0].tagName == "folder"){
			TabManager.removeFolder(name);
			file[0].parentNode.removeChild(file[0]);
		}


		var xmlString = new XMLSerializer().serializeToString( workspaceDoc );
		
		fs.writeFileSync("workspace.xml", xmlString);

		$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
				TabManager.openFile(file, WorkspaceManager.open(file));
		});
	},
	
	addFile : function(name){
	
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		if(typeof workspaceDoc.getElementsByName(name)[0] == 'undefined'){
			
			elements = name.split("/");
			var nameFolder = "";
			for(i=1; i<elements.length - 1; i++){
				nameFolder += "/" + elements[i];
			}
			
			nameFolder += "/";
			
			var file = workspaceDoc.getElementsByName(nameFolder);
			var newFile = document.createElement('file');
			newFile.setAttribute('name', name);
			file[0].appendChild(newFile);
			
			var xmlString = new XMLSerializer().serializeToString( workspaceDoc );
			
			fs.writeFileSync("workspace.xml", xmlString);
			TabManager.openFile(name, '');
			$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
				TabManager.openFile(file, WorkspaceManager.open(file));
			});	
		
		}
		else
			window.alert("Ce fichier existe déjà !");
	},
	
	addFolder : function(name){
	
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		if(typeof workspaceDoc.getElementsByName(name)[0] == 'undefined'){
		
			elements = name.split("/");
			var nameFolder = "";
			for(i=1; i < elements.length - 2; i++){
				nameFolder += "/" + elements[i];
			}
			
			nameFolder += "/";
			var file = workspaceDoc.getElementsByName(nameFolder);
			
			var newFolder = document.createElement('folder');
			newFolder.setAttribute('name', name);
			file[0].appendChild(newFolder);
			
			var xmlString = new XMLSerializer().serializeToString( workspaceDoc );
			
			fs.writeFileSync("workspace.xml", xmlString);
			
			$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
				TabManager.openFile(file, WorkspaceManager.open(file));
			});
		}
		
		else
			window.alert("Ce dossier existe déjà !");
	},
	
		
	addProject : function(name){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		if(typeof workspaceDoc.getElementsByName(name)[0] == 'undefined'){
		
			var projects = workspaceDoc.getElementsByTagName('projects')[0];
			var project = document.createElement('project');
			var toto = document.createElement('fs');
			var newProject = document.createElement('folder');
			newProject.setAttribute('name', name);
			toto.appendChild(newProject);
			project.appendChild(toto);
			projects.appendChild(project);
			
			
			var xmlString = new XMLSerializer().serializeToString( workspaceDoc );

			fs.writeFileSync("workspace.xml", xmlString);
			
			$('#workspace-list').fileTree({ root:'/',script: 'connectors/workspaceFileTreeParser.js', folderEvent: 'click', expandSpeed: 750, collapseSpeed: 750, expandEasing: 'easeOutBounce', collapseEasing: 'easeOutBounce', loadMessage: '' }, function(file) { 
				TabManager.openFile(file, WorkspaceManager.open(file));
			});
			
		}
		
		else
			window.alert("Ce projet existe déjà !");
	},
	
	openModal : function(type, fileName) {
		$( "#dialog-workspace-form" ).dialog({
			  autoOpen: false,
			  height: 200,
			  width: 550,
			  modal: true,
			  buttons: {
				"Valider": function() {
					console.log(fileName+$("#fileName").val());
					switch (type) {
						case "fichier":
							WorkspaceManager.addFile(fileName+$("#fileName").val());
							break;
						case "dossier":
							WorkspaceManager.addFolder(fileName+$("#fileName").val()+"/");
							break;
						case "projet":
							WorkspaceManager.addProject(fileName+$("#fileName").val()+"/");
							break;
					}
					$( this ).dialog( "close" );
				},
				"Annuler" : function() {
				  $( this ).dialog( "close" );
				}
			  },
			  close : function() {},
			  open: function( event, ui ) {
				$("#fileName").val("");
				if (type == "dossier" || type == "projet") {
					$( "#namelabelBegin" ).html(fileName);
					$( "#namelabelEnd" ).html("/");
				}
				else if(type == "fichier") {
					$( "#namelabelBegin" ).html(fileName);
					$( "#namelabelEnd" ).html("");
				}
			  },
		});

		$( "#dialog-workspace-form" ).dialog( "open" );
	},
	
	getProject : function(name) {
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		

		elements = name.split("/");
		var nameFolder = "";
		for(i=1; i < 2; i++){
			nameFolder += "/" + elements[i];
		}
		
		nameFolder += "/";
		
		return new XMLSerializer().serializeToString(workspaceDoc.getElementsByName(nameFolder)[0]);
	},
	
	getConfig : function(){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		return workspaceDoc.getElementsByTagName("editor")[0];
	},
	
	getRunConfig : function(){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		return workspaceDoc.getElementsByTagName("server")[0];
	},
	
	getLastRun : function(){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		return workspaceDoc.getElementsByTagName("lastrun")[0];
	},
	
	
	setConfig : function(elem){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		var file = workspaceDoc.getElementsByTagName("editor");
		file[0].parentNode.removeChild(file[0]);
		
		workspaceDoc.getElementsByTagName("config")[0].appendChild(elem);
		
		var xmlString = new XMLSerializer().serializeToString( workspaceDoc );
		
		fs.writeFileSync("workspace.xml", xmlString);
	},
	
	setRunConfig : function(elem){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		var file = workspaceDoc.getElementsByTagName("server");
		file[0].parentNode.removeChild(file[0]);
		
		workspaceDoc.getElementsByTagName("config")[0].appendChild(elem);
		
		xmlString = new XMLSerializer().serializeToString( workspaceDoc );
		
		fs.writeFileSync("workspace.xml", xmlString);
	},

	setLastRun : function(elem){
		var fs = window.require("fs");
		
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		
		var file = workspaceDoc.getElementsByTagName("lastrun");
		file[0].parentNode.removeChild(file[0]);
		
		workspaceDoc.getElementsByTagName("config")[0].appendChild(elem);
		
		xmlString = new XMLSerializer().serializeToString( workspaceDoc );
		
		fs.writeFileSync("workspace.xml", xmlString);
	},

	isProject : function(name){

		var level = name.split("/");
		if (level.length == 3)
			return true;
		return false;

	},

	testWorkspaceAndResetIfNeeded : function(){
		var fs = window.require("fs");
		var XMLFile = fs.readFileSync('workspace.xml','utf8');
		var parser=new DOMParser();
		var workspaceDoc=parser.parseFromString(XMLFile,"text/xml");
		if (workspaceDoc.getElementsByTagName("parsererror")[0] !== undefined){
			var xmlString = '<?xml version="1.0" encoding="UTF-8"?><workspace><config><editor></editor><server></server><lastrun></lastrun></config><projects></projects></workspace>';
			fs.writeFileSync("workspace.xml", xmlString);
		}
	}
}