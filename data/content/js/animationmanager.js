var AnimationManager = Class.create({
	className : "AnimationManager",

	domElem : undefined,
	movElem : document.getElementById("movElem"),
	animTime : 800,
	stateTab : [],
	currentStatInd : 0,
	isAnimating : false,
	continuous : true,

	initialize : function ( domElem ){
		this.domElem = domElem;
		$(this.movElem).css("position" , "relative");
		
		thisse = this;
		$(document).on("compilationReady", function( e , data ){
			thisse.representerProgramme(data);
		});
	},

	registerState : function ( state ){
		this.stateTab[this.stateTab.length] = state;
	},

	clearStates : function (){
		stateTab = [];
	},

	play : function (){
		if( this.stateTab[this.currentStatInd] && ! this.isAnimating ){
			this.isAnimating = true;
			this.representerBloc( this.stateTab[this.currentStatInd] );
			this.currentStatInd++;
		}
	},	

	representerProgramme : function ( xmlData ){

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
		MMM.clear();
		this.stateTab = [];
		this.currentStatInd = 0;
		clearStack();
		clearTerminal();
		$(this.movElem).clearQueue();
		$(this.movElem).hide();
		this.isAnimating = false;
		$("#currentLine").html("");
// ------------------------------------------------------------------------------------------------------------------------------------------------------------

		var nodeTab = undefined	
	
		if(xmlData.tagName == "SORTIES"){
			nodeTab = xmlData
			wantRepresentation = false;
		}else if(xmlData.tagName == "ERREUR"){
			$("#currentLine").html(xmlData);
			nodeTab = xmlData
		}else{
			nodeTab = xmlData.firstChild.childNodes
			for( var i = 0 ; i < nodeTab.length ; i++ ){
				this.registerState( nodeTab[i] )
			}
		}

		$(this).on("animationFinished", function(){
			if(this.continuous){
				this.play();
			}
		});

		if(wantRepresentation){
			this.play();
		}else{
			$(xmlData).find("sortie").each(function(){
				terminal( AM.chooseResult(this.firstChild) , true);
			});
		}

	},

	representerBloc : function( xmlData ){

		var clone = $(xmlData).clone()[0];
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			$("#currentLine").html("").append(clone);
		});

		switch( xmlData.tagName ){
			case "DECLARATION":
				this.representerDeclaration( clone );
				break;
			case "OPERATION":
				this.animeOperation( clone );
				break;
			case "AFFECTATION":
				this.animeAffectation( clone );
				break;
			case "SAS":
				this.animeSas( clone );
				break;
			case "ENSEMBLE":
				this.zapEnsemble( clone );
				break;
			case "TANTQUE":
				this.animeTantque( clone );
				break;
			case "FAIRETANTQUE":
				this.animeFaireTantque( clone );
				break;
			case "SORTIE":
				this.animeSortie( clone );
				break;
			default:
				console.log( clone );
				break;
		}

		objcrt = this;
		$(this.movElem).animate( { "background-color" : "white"} , this.animTime , function() {
			objcrt.isAnimating = false;
			$(objcrt).trigger("animationFinished");
		});
	},

	animeSortie : function ( xmlData ){
		val = this.chooseAnimation(xmlData.firstChild);
		$(xmlData).html("ecrire ( ").append(document.createTextNode(val)).append(document.createTextNode(" )"));
		objcrt = this;
		$(this.movElem).animate( { "background-color" : "white"} , this.animTime , function() {
			terminal(objcrt.chooseAnimation(xmlData.childNodes[1]), true);
		});
	},

	animeFaireTantque : function ( xmlData ){
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			$("#currentLine").html("");
			stackIn($(xmlData.firstChild.firstChild).clone().html("FAIRE TANTQUE " + $(xmlData.firstChild.firstChild).html()));
		});
		for( var i = 0 ; i < xmlData.childNodes.length ; i++ ){
			this.animeCondition(xmlData.childNodes[i]);
		}
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			stackOut();
		});
	},

	animeTantque : function ( xmlData ){
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			$("#currentLine").html("");
			stackIn($(xmlData.firstChild.firstChild).clone().html("TANTQUE " + $(xmlData.firstChild.firstChild).html()));
		});
		for( var i = 0 ; i < xmlData.childNodes.length ; i++ ){
			this.animeCondition(xmlData.childNodes[i]);
		}
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			stackOut();
		});
	},

	animeCondition : function ( xmlData ){
		$(this.movElem).animate( { "background-color" : "white"} , this.animTime , function() {
			$("#currentLine").html("").append(xmlData.firstChild);
		});
		var res = this.chooseAnimation(xmlData.firstChild);
		for( var i = 1 ; i < xmlData.childNodes.length ; i++ ){
			this.representerBloc(xmlData.childNodes[i]);
		}
	},

	animeSi : function ( xmlData ){
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			stackIn($(xmlData.firstChild.firstChild).clone().html("SI " + $(xmlData.firstChild.firstChild).html()));
		});
		this.animeCondition(xmlData.firstChild);
		$(this.movElem).animate( { "background-color" : "white"} , 1 , function() {
			stackOut();
		});
	},

	animeSas : function ( xmlData ){
		for( var i = 0 ; i < xmlData.childNodes.length ; i++ ){
			this.animeSi(xmlData.childNodes[i]);
		}
	},

	representerDeclaration : function( xmlData ){
		valNode = xmlData.firstChild.firstChild;
		val = undefined;
		if(valNode.tagName == undefined){
			val = xmlData.firstChild.firstChild.data
		}else if(valNode.tagName == "VARIABLE"){
			val = $(valNode).attr("valeur")
		}else{
			this.animeOperation(valNode);
			val = $(valNode).attr("res");
		}
		$(xmlData).html(  $(xmlData).attr("type") + " " + $(xmlData).attr("nom") + "(" + val + ")" );
		MMM.addVar( new CustomVariable( $(xmlData).attr("nom") , $(xmlData).attr("type") , val ) );
	},

	animeAffectation : function ( xmlData ){
		var valueNode = xmlData.firstChild;
		var val = "";

		val = this.chooseAnimation( valueNode );
		if(valueNode.tagName == undefined){
			$(xmlData).html($(xmlData).attr("nom") + "=").append(document.createTextNode(val));
		}else{
			$(xmlData).html($(xmlData).attr("nom") + "=").append(valueNode);
		}

		$(this.movElem).hide( 1 ,function(){
			if(valueNode.isVar){
				$(this).fadeOut()
						.animate({"top" : "2%" , "left" : "40%" }, 1, function(){
							$(this).html(xmlClone = $(valueNode).clone()[0]);
							$(xmlClone).addClass("var"); 
						})
						.fadeIn(this.animTime)
						.animate({"top" : "20%" , "left" : "40%" }, this.animTime)
						.fadeOut(this.animTime , function(){
								$("#" + $(valueNode).attr("nom")).animate({"background-color" : "#3E6EDE"}, this.animTime);
								$(xmlClone).animate({"background-color" : "#3E6EDE" }, this.animTime)
													.fadeOut(this.animTime/2)
													.html(val)
													.removeClass("var")
													.addClass("tempValue")
													.fadeIn(this.animTime/2);
							}).fadeIn(this.animTime)
									.animate({"top" : "2%" , "left" : "40%" }, this.animTime);
			}
		}).delay(this.animTime).fadeOut(this.animTime , function(){
			$("#" + $(valueNode).attr("nom")).animate({"background-color" : "#3E6EDE"})
			MMM.getVar( $(xmlData).attr("nom") ).setValue(val);
			res = document.createElement("variable");
			res.setAttribute("nom" , $(xmlData).attr("nom"));
			res.setAttribute("valeur" , $(xmlData).attr("valeur"));
			$(res).html($(xmlData).attr("nom"));
			$(xmlData).html(res);
		}).fadeOut();
	},

	animeOperation : function ( xmlData ){

		var exp ="", opg ="", op ="", opd ="";

		var leftNode = xmlData.childNodes[0].firstChild;
		var rightNode = xmlData.childNodes[2].firstChild

		exp += opg = this.chooseAnimation( leftNode );

		exp += op = xmlData.children[1].firstChild.data;
		
		exp += opd = this.chooseAnimation ( rightNode );

		var objcrt = this;

		 $(this.movElem).hide()
						.animate({"top" : "2%" , "left" : "40%" }, 1, function(){
							$(this).html(xmlClone = $(xmlData).clone()[0]);
							$(xmlData.children).css("background-color", "#19B32D");
							if( ! leftNode.isVar ){ 
								$(xmlClone.children[0]).addClass("tempValue"); 
							}else{
								$(xmlClone.children[0]).addClass("var"); 
							}
							if( ! rightNode.isVar ){ 
								$(xmlClone.children[2]).addClass("tempValue"); 
							}else{ 
								$(xmlClone.children[2]).addClass("var");
							}

						})
						.fadeIn(this.animTime)
						.animate({"top" : "20%" , "left" : "40%" }, this.animTime);
						
						if( leftNode.isVar ){
							$(this.movElem).fadeOut(this.animTime/2, function(){
								$("#" + $(leftNode).attr("nom")).animate({"background-color" : "#3E6EDE"}, this.animTime);
								$(xmlClone.children[0]).animate({"background-color" : "#3E6EDE" }, this.animTime)
													.fadeOut(this.animTime/2)
													.html(opg)
													.removeClass("var")
													.addClass("tempValue")
													.fadeIn(this.animTime/2);
							}).fadeIn();
						}

						if( rightNode.isVar ){
							$(this.movElem).fadeOut(this.animTime/2, function(){
									$("#" + $(rightNode).attr("nom")).animate({"background-color" : "#FF00FF"}, this.animTime);
									$(xmlClone.children[2]).animate({"background-color" : "#FF00FF" }, this.animTime)
														.fadeOut(this.animTime/2)
														.html(opd)
														.removeClass("var")
														.addClass("tempValue")
														.fadeIn(this.animTime/2);
								}).fadeIn();
						}

		 $(this.movElem).fadeOut(this.animTime , function(){
							$(this).html( $(xmlData).attr("res") );
							$(this).addClass("tempValue");
						})
						.fadeIn(this.animTime)
						.animate({"top" : "2%" , "left" : "40%" }, this.animTime)
						.fadeOut(this.animTime, function(){
							if( leftNode.isVar ){
								$("#" + $(leftNode).attr("nom")).animate({"background-color" : "#FFFFFF"});
							}
							if( rightNode.isVar ){
								$("#" + $(rightNode).attr("nom")).animate({"background-color" : "#FFFFFF"});
							}
							$(this).removeClass("tempValue");
							$(xmlData).replaceWith( $(xmlData).attr("res") );
						});
	},

	zapEnsemble : function ( xmlData ){
		for( var i = 0 ; i < xmlData.childNodes.length ; i++ ){
			this.representerBloc(xmlData.childNodes[i]);
		}
	},

	chooseAnimation : function ( node ){
		var res = "";

		if( node.tagName == "OPERATION" ){
			node.isVar = false;
			res = $(node).attr("res");
			this.animeOperation( node );
		}else if(node.tagName == "VARIABLE"){
			node.isVar = true;
			res = $(node).attr("valeur");
			$(node).html($(node).attr("nom"));
		}else if (node.tagName == "AFFECTATION"){
			node.isVar = true;
			res = node.firstChild.data;
			this.animeAffectation(node);
		}else{
			node.isVar = false;
			res = node.data;
		}

		return res;
	},

	chooseResult : function ( node ) {
		var res = "";

		if( node.tagName == "OPERATION" ){
			node.isVar = false;
			res = $(node).attr("res");
		}else if(node.tagName == "VARIABLE"){
			node.isVar = true;
			res = $(node).attr("valeur");
			$(node).html($(node).attr("nom"));
		}else if (node.tagName == "AFFECTATION"){
			node.isVar = true;
			res = node.firstChild;
		}else{
			node.isVar = false;
			res = node.data;
		}

		return res;
	},

});