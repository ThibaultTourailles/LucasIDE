var RunConfig = {

	firstLaunch : true,		
	isLocal :  false,
	serverAddress : "127.0.0.1",
	alreadyLaunched : false,			

	init : function(){
		$( "#dialog-launch-config" ).dialog({
				  autoOpen: false,
				  height: 300,
				  width: 450,
				  modal: true,
				  buttons: {
					"Valider": function() {
						RunConfig.isLocal = $("input[name='server']:checked").val() == 'local' ? true : false;
						if(RunConfig.isLocal)
							RunConfig.serverAddress = "127.0.0.1";
						else
							RunConfig.serverAddress = $("#address").val() ;
						RunConfig.firstLaunch = false ;
						RunConfig.saveConfig();
						window.dispatchEvent(new window.Event('lucaside-run-representation'));
						$( this ).dialog( "close" );
					  },
					  "Annuler": function() {
						$( this ).dialog( "close" );
					  }
				  }
		});
	},
	
	saveConfig : function() {
		var server = document.createElement("server");

		var islocal = document.createElement("islocal");
		islocal.innerHTML = this.isLocal;
		server.appendChild(islocal);
		
		var serveraddress = document.createElement("serveraddress");
		serveraddress.innerHTML = this.serverAddress;
		server.appendChild(serveraddress);
		
		var firstlaunch = document.createElement("firstlaunch");
		firstlaunch.innerHTML = this.firstLaunch;
		server.appendChild(firstlaunch);
		
		WorkspaceManager.setRunConfig( server );
	},
		
	loadConfig : function(){
 		var conf = WorkspaceManager.getRunConfig();
 		if(conf == undefined || conf.getElementsByTagName("islocal")[0] == undefined || conf.getElementsByTagName("serveraddress")[0] == undefined){
 			RunConfig.isLocal = false;
			RunConfig.serverAddress = "0.0.0.0";
			RunConfig.firstLaunch = true;
	 	}else{
			RunConfig.isLocal = (conf.getElementsByTagName("islocal")[0].firstChild.nodeValue == "true" ) ? true : false; 
			RunConfig.serverAddress = conf.getElementsByTagName("serveraddress")[0].firstChild.nodeValue;	
			RunConfig.firstLaunch = (conf.getElementsByTagName("firstlaunch")[0].firstChild.nodeValue == "true" ) ? true : false; 
		}	
			if(RunConfig.isLocal)
				$("#local").prop('checked', true);
			else
				$("#distant").prop('checked', true);	
			document.getElementById("address").value = RunConfig.serverAddress;
	 	
 	}
}