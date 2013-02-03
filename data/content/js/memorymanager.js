//String 2 Binary
function string2Bin(s) {
	var b = "";
	var last = s.length;
	for (var i = 0; i < last; i++) {
		b += char2Bin(s.charCodeAt(i));
	}
	return b;
}

//Char to binary
function char2Bin(d) {
	var b = '';
	for (var i = 0; i < 8; i++) {
		b = (d%2) + b;
		d = Math.floor(d/2);
	}
	return b + "\n";
}

function valueToBinary( value ){
	var res = "";
	switch ( typeof(value) ){
		case "string":
			res = string2Bin(value);
			break;
		case "number":
			res = value.toString(2);
			break;
		case "boolean":
			res = value ? "00000001" : "00000000";
			break;
		default:
			res = "00000000";
			break;
	}
	return res;
}

// Classe resprésentant une variable
var CustomVariable = Class.create({

	className : "CustomVariable",

	name : "",
	type : "",
	value : undefined,
	binValue : undefined,

	initialize : function ( name , type , value ){
		this.name = name;
		this.type = type;
		
		if(this.type == "Entier"){
			value = parseInt(value);
		}else if(this.type == "Flottant"){
			value = parseFloat(value)
		}else if(this.type == "Booleen"){
			value = value == "VRAI" ? true : false;
		}

		this.value = value;
		this.binValue = valueToBinary(this.value);
	},

	setValue : function ( value ){

		if(this.type == "Entier"){
			value = parseInt(value);
		}else if(this.type == "Flottant"){
			value = parseFloat(value)
		}else if(this.type == "Booleen"){
			value = value == "VRAI" ? true : false;
		}

		this.value = value;
		this.binValue = valueToBinary(this.value);
		$(this).trigger("onChange");
	},

	getValue : function () {
		return this.value;
	},

	setType : function ( type ){
		this.type = type;
		$(this).trigger("onChange");
	},

	getType : function (){
		return this.type;
	},

	getBinValue : function () {
		return this.binValue;
	}
});

var MemoryManagerModel = Class.create({

	className : "MemoryManagerModel",
	
	currentAddr : 0,
	memoryHole : new Array(),
	varArr : new Array(),
	progName : "",

	initialize : function ( progName ) {
		if(progName){
			this.progName = progName;
		}else{
			this.progName = "Default Programme Name";
		}
	},

	addVar : function ( variable ){
		if( variable.className == "CustomVariable" ){
			if( this.memoryHole.length > 0 ){
				this.varArr[this.memoryHole[0]] = variable;
				this.memoryHole[0] = undefined;
				this.memoryHole.sort();
				this.memoryHole.length--;
			}else{
				this.varArr[this.currentAddr++] = variable;
			}
			obj = this
			$(variable).on("onChange", function(){
				$(obj).trigger("onChange");
			});
		}else{
			console.error("L'object n'est pas de type CustomVariable, ajout impossible");
		}
		$(this).trigger("onChange");
	},

	rmVar : function ( varName ) {
		for( var i = 0 ; i < this.varArr.length ; i++ ){
			if(this.varArr[i]){
				if( this.varArr[i].name == varName ){
					console.log("ok");
					this.varArr[i] = undefined;
					this.memoryHole[this.memoryHole.length] = i;
				}
			}
		}
		$(this).trigger("onChange");
	},

	getVar : function ( varName ){
		for( var i = 0 ; i < this.varArr.length ; i++ ){
			if( this.varArr[i].name == varName ){
				return this.varArr[i];
			}
		}
	},

	clear : function () {
		this.varArr = [];
		this.currentAddr = 0;
		this.memoryHole = [];
		$(this).trigger("onChange");
	},

});

var MemoryManagerView = Class.create({

	className : "MemoryManagerView",

	domElement : undefined,
	memoryManagerModel : undefined,
	lineSize : 10,

	initialize : function ( domElement, memoryManagerModel ) {
		if( domElement.tagName == "TABLE" ){
			this.domElement = domElement;
		}else{
			console.error("L'élement constructeur doit être un élément <table>");
		}
		if( memoryManagerModel.className == "MemoryManagerModel" ){
			this.memoryManagerModel = memoryManagerModel;
			var temp = this;
			$(this.memoryManagerModel).on("onChange", function () {
				temp.updateView();
			});
		}else{
			console.error("Le 2ème paramètre du constructeur doit être un object MemoryManagerModel")
		}
	},

	updateView : function () {
		$(this.domElement).html("");
		var elem = document.createElement("tr");
		var tab = this.memoryManagerModel.varArr;
		for ( var i = 0 ; i < tab.length + (this.lineSize - (tab.length % this.lineSize) ) ; i++ ){

			if(!(i % this.lineSize)){
				this.domElement.appendChild(elem);
				elem = document.createElement("tr");
			}

			if(tab[i] == undefined ){
				var newTd = document.createElement("td");
				newTd.appendChild(document.createTextNode("Vide"));
				newTd.title = "Cette case mémoire n'est pas encore allouée."
			}else{
				var newTd = document.createElement("td");
				newTd.id = tab[i].name;
				switch (tab[i].getType()){
					case "Flottant":
						newTd.toggleHighlight = "#3E6EDE";
						break;
					case "Entier":
						newTd.toggleHighlight = "#D62222";
						break;
					case "Chc":
						newTd.toggleHighlight = "pink";
						break;
					case "Car":
						newTd.toggleHighlight = "#F0D62E";
						break;
					default:
						newTd.toggleHighlight = "#BABABA";
						break;
				}
				newTd.title = "Valeur : " + tab[i].getValue() + 
							  "<br> Addresse memoire : " + "0x" + i.toString(16) +
							  "<br> Valeur binaire : " + tab[i].getBinValue()+
							  "<br> Type : " + tab[i].getType();
				newTd.appendChild(document.createTextNode(tab[i].name));
			}

			elem.appendChild(newTd);

		}

		this.domElement.appendChild(elem);
		$(this.domElement).tooltip();

		$('#memory td').mouseover(function(){
		   $(this).css("background-color", this.toggleHighlight );
		});

		$('#memory td').mouseout(function(){
		   $(this).css("background-color", "white" );
		});
	}
});