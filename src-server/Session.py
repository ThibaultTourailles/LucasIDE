# -*- coding: utf-8 -*-

import threading
import time
from PLY import LucasLex, LucasYacc, LucasYacc_fonction

class Session(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.id = None
		self.xml = None
		self.dom = None
		self.code = None
		self.data = ""
		self.tabFile = []
		self.fonctions = False

	def run(self):
		try:
			lexer = LucasLex.getLex()
			if self.fonctions:
				yaccer = LucasYacc_fonction.getYacc()
				res = yaccer.parse(self.code.encode("utf-8"), lexer=lexer)
				self.data = res.executer()
			else:
				yaccer = LucasYacc.getYacc()
				res = yaccer.parse(self.code.encode("utf-8"), lexer=lexer)
				self.data = res.executer("PROGRAMME")
		except Exception as e:
			self.data = "<erreur>%s</erreur>" % e
		finally:
			print self.data

if __name__ == "__main__":
	import sys

	session = Session()
	session.code = file("PLY/test.txt").read()
	session.fonctions = True
	session.start()
	session.join()