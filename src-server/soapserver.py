# -*- coding: utf-8 -*-

import SOAPpy
import uuid
from Session import Session
from xml.dom.minidom import parseString


class Server:
	def __init__(self):
		self.__server__ = SOAPpy.ThreadingSOAPServer(("0.0.0.0",5151))
		self.session = {}


	def askSession(self):
		sessID = str(uuid.uuid4())
		self.session[sessID] = Session()
		return sessID

	def processProject(self,sessID, xml):
		if sessID not in self.session.keys():
			return "Session inexistante"
		if self.parseXML(xml) == None:
			return "Programme non construit"
		self.session[sessID].id = sessID
		self.session[sessID].xml = xml
		self.session[sessID].dom = self.parseXML(xml)
		self.session[sessID].code = self.prepocessProject(sessID, self.session[sessID].dom)
		self.session[sessID].start()
		return self.session[sessID].code

	def getResults(self,sessID):
		if sessID not in self.session.keys():
			return "Session inexistante"
		self.session[sessID].join()
		data = self.session[sessID].data
		del self.session[sessID]
		return data


	''' Server methods '''
	def prepocessProject(self, sessID, dom):
		parsedText = ""
		nbOcc = 1
		stock = 0
		
		files = dom.getElementsByTagName("file")
		if len(files) > 1:
			self.session[sessID].fonctions = True
		for i in xrange(0,len(files)):
			if files[i].firstChild.nodeValue.split("\n")[0].startswith("PROGRAMME"):
				stock = i
				self.session[sessID].tabFile.append([1,files[i].attributes['name'].nodeValue])
				parsedText += files[i].firstChild.nodeValue.split("\n")[0] + "\n"
				if not files[i].firstChild.nodeValue.split("\n")[1].startswith("{"):
					self.session[sessID].fonctions = True
				break
		for i in xrange(0,len(files)):		
			if i != stock : 
				try :
					parsedText += files[i].firstChild.nodeValue + "\n"
					nbOcc += files[i].firstChild.nodeValue.count("\n") + 1
					self.session[sessID].tabFile.append([nbOcc, files[i].attributes['name'].nodeValue])
				except:	
					pass
		parsedText += "\n".join(files[stock].firstChild.nodeValue.split("\n")[1:]) + "\n"
		nbOcc += files[stock].firstChild.nodeValue.count("\n")
		self.session[sessID].tabFile.append([nbOcc, files[stock].attributes['name'].nodeValue])
		print parsedText
		return parsedText
						

	def parseXML(self, xml):
		try:
			dom = parseString(xml)
			return dom
		except:
			return None

	def __addFunction__(self, func):
		self.__server__.registerFunction(func)

	def runSOAPServ(self,ip="0.0.0.0",port=5151):
		self.__addFunction__(self.askSession)
		self.__addFunction__(self.processProject)
		self.__addFunction__(self.getResults)
		self.__server__.serve_forever()


if __name__ == '__main__':
	serv = Server()
	serv.runSOAPServ()




