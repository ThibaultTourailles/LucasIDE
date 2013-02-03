# -*- coding:utf-8 -*-

from LucasNatifs import *
class PoolVariable:
	def __init__(self):
		self.profondeur = 0
#		Chaque clé est un nom de variable qui permet de recupérer un tuple (valeur, profondeur)
		self.variables = list()
		self.variables.append(None)
		self.ajouterProfondeur()
#		Chaque clé est un nom de variable qui permet de recupérer un tuple (type, profondeur) d'une variable qui a été supprimé
		self.variablesSupp = {}
		
# retourne la profondeur
	def getProfondeur(self):
		return self.profondeur()
		
# retourne une variable
	def getVariable(self, nom):
		for i in range(1, len(self.variables)):
			if nom in self.variables[i].keys():
				return self.variables[i][nom]
		raise Exception("La variable %s n'existe pas." % nom)
		
# retourne la liste de clefs des variables
	def getClefsVariables(self):
		clefs = list()
		for i in range(1, len(self.variables)):
			clefs += list(self.variables[i].keys())	
		return clefs
		
# Ajoute une variable au pool. Le nom correspond à la clef associée à la valeur et la profondeur
	def ajouter(self, nom, valeur, profondeur):
		if nom in self.getClefsVariables():
			raise Exception('variable %s deja existante' % nom)
		else:
			self.variables[profondeur][nom] = valeur
				
# Supprime une variable et l'ajoute au dictionnaire de variable supprimé. Le nom correspond à la clef associée au type et la profondeur	
	def supprimer(self, nom):
		if nom in self.variables[self.profondeur].keys():
			self.variablesSupp[nom] = (self.variables[self.profondeur][nom].typeObj, self.profondeur)
			del self.variables[self.profondeur][nom]
		
# Modifie une variable grace au nom		
	def modifier(self, nom, valeur):
		if nom in self.getClefsVariables() and isinstance(valeur, self.getVariable(nom).__class__):
			self.getVariable(nom).val = valeur.val
			
#Ajoute une à plusieurs profondeur			
	def ajouterProfondeur(self):
		self.variables.append({})
		self.profondeur += 1
	
#Supprime la derniere profondeur	
	def supprimerProfondeur(self):
		if len(self.variables) > 0:
			for clef in self.variables[self.profondeur].keys():
				self.supprimer(clef)
			self.profondeur -= 1
					
if __name__ == "__main__":
	pool = PoolVariable()
	pool.ajouter("var1", Entier(10), 1)
	pool.ajouter("var2", Booleen(True), 1)
	pool.ajouter("var3", Flottant(2.05), 2)
	pool.ajouter("var4", Chc("manger"), 2)
	pool.ajouter("var5", Car('l'), 3)
	pool.ajouter("var6", Entier(6), 3)
	pool.ajouter("var7", Entier(98), 3)
	print pool.variables;
	print "--------------------------------------"
	print pool.variablesSupp
	print "--------------------------------------"
	pool.supprimer("var3")
	print pool.variables;
	print "--------------------------------------"
	print pool.variablesSupp
	print "--------------------------------------"
	pool.supprimerProfondeur()
	print pool.variables;
	print "--------------------------------------"
	print pool.variablesSupp
	print pool.getVariable("var1")
				